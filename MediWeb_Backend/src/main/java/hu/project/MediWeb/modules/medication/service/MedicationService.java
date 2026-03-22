package hu.project.MediWeb.modules.medication.service;

import hu.project.MediWeb.modules.GoogleImage.service.GoogleImageService;
import hu.project.MediWeb.modules.GoogleImage.service.WebImageSearchService;
import hu.project.MediWeb.modules.medication.dto.*;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.medication.repository.MedicationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.HttpURLConnection;
import java.net.URI;
import java.time.DateTimeException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationService {

    private static final Pattern OGYEI_DATE_PATTERN = Pattern.compile("(\\d{4})\\.\\s*(\\d{1,2})\\.\\s*(\\d{1,2})");

    private static final String DEFAULT_MEDICATION_IMAGE = "https://ocdn.eu/pulscms/MDA_/56afcbe194915d96d2cfa645286513b2.jpg";

    private final GoogleImageService googleImageService;
    private final WebImageSearchService webImageSearchService;
    private final AsyncHttpClientService asyncHttpClient;
    private final MedicationRepository medicationRepository;
    private final HazipatikaSearchService hazipatikaSearchService;

    @Value("${medication.image.refresh-days:30}")
    private int imageRefreshDays;

    public record MedicationRefreshResult(Medication entity, MedicationDetailsResponse response) {
    }

    public MedicationDetailsResponse getMedicationDetails(Long itemId) throws Exception {
        return getMedicationDetailsInternal(itemId, false);
    }

    public MedicationDetailsResponse refreshMedication(Long itemId) throws Exception {
        MedicationRefreshResult result = refreshMedicationSnapshot(itemId);
        persistMedicationSnapshot(result.entity());
        return result.response();
    }

    public MedicationRefreshResult refreshMedicationSnapshot(Long itemId) throws Exception {
        Medication existing = medicationRepository.findById(itemId).orElse(null);
        return refreshMedicationSnapshot(itemId, existing);
    }

    public MedicationRefreshResult refreshMedicationSnapshot(Long itemId, Medication existing) throws Exception {
        MedicationDetailsResponse response = scrapeMedication(itemId, existing);
        Medication entity = buildMedicationSnapshot(itemId, response, existing);
        return new MedicationRefreshResult(entity, response);
    }

    public boolean wasUpdatedWithin(Long itemId, Duration window) {
        if (itemId == null || window == null || window.isZero() || window.isNegative()) {
            return false;
        }

        Optional<Medication> optional = medicationRepository.findById(itemId);
        if (optional.isEmpty()) {
            return false;
        }

        return wasReviewedWithin(optional.get(), window);
    }

    public boolean wasReviewedWithin(Medication medication, Duration window) {
        if (medication == null || window == null || window.isZero() || window.isNegative()) {
            return false;
        }

        LocalDateTime reference = medication.getLastReviewedAt();
        if (reference == null) {
            reference = medication.getLastUpdated();
        }

        if (reference == null) {
            return false;
        }

        LocalDateTime threshold = LocalDateTime.now().minus(window);
        return reference.isAfter(threshold);
    }

    @Transactional
    public void updateActiveStatuses(Set<Long> processedIds) {
        if (processedIds == null || processedIds.isEmpty()) {
            log.info("No medications discovered during sync run; deactivating all entries");
            medicationRepository.deactivateAll();
            return;
        }

        log.info("Marking {} medications as active and deactivating missing entries", processedIds.size());
        medicationRepository.activateExisting(processedIds);
        medicationRepository.deactivateMissing(processedIds);
    }

    public Set<Long> fetchExistingMedicationIds() {
        return new HashSet<>(medicationRepository.findAllIds());
    }

    public Set<Long> findIdsWithoutImage() {
        return new HashSet<>(medicationRepository.findIdsWithoutImage());
    }

    public List<Medication> findMedicationsWithoutImage() {
        return medicationRepository.findMedicationsWithoutImage();
    }

    public List<Medication> findAllActiveMedicationsWithName() {
        return medicationRepository.findAllActiveMedicationsWithName();
    }

    /**
     * Validates all active medication image URLs via HEAD requests.
     * Clears broken URLs so the image sync can re-fetch them.
     * Returns the number of broken URLs cleared.
     *
     * Uses a lightweight projection (id + imageUrl only) to release the DB
     * connection immediately, then does HEAD requests without holding any
     * database resources.
     *
     * @param progressCallback optional callback receiving int[]{checked, total, brokenSoFar}
     */
    public int cleanupBrokenImageUrls(Consumer<int[]> progressCallback) {
        // Lightweight query — only id + imageUrl, releases DB connection immediately
        List<Object[]> pairs = medicationRepository.findActiveImageUrlPairs();
        if (pairs.isEmpty()) {
            log.info("[IMAGE-CLEANUP] No medications with image URLs found");
            if (progressCallback != null) progressCallback.accept(new int[]{0, 0, 0});
            return 0;
        }

        // Copy into simple records so JPA entities are fully detached
        record IdUrl(Long id, String url) {}
        List<IdUrl> items = new ArrayList<>(pairs.size());
        for (Object[] row : pairs) {
            items.add(new IdUrl((Long) row[0], (String) row[1]));
        }
        pairs.clear(); // free JPA result

        int total = items.size();
        log.info("[IMAGE-CLEANUP] Validating {} image URLs...", total);

        // Report initial count so caller can set up progress tracking
        if (progressCallback != null) {
            progressCallback.accept(new int[]{0, total, 0});
        }

        List<Long> brokenIds = Collections.synchronizedList(new ArrayList<>());
        AtomicInteger checked = new AtomicInteger(0);
        ExecutorService executor = Executors.newFixedThreadPool(10);

        try {
            List<CompletableFuture<Void>> futures = new ArrayList<>();
            for (IdUrl item : items) {
                futures.add(CompletableFuture.runAsync(() -> {
                    boolean valid = isImageUrlReachable(item.url());
                    int count = checked.incrementAndGet();
                    if (!valid) {
                        brokenIds.add(item.id());
                    }
                    if (progressCallback != null && (count % 50 == 0 || count == total)) {
                        progressCallback.accept(new int[]{count, total, brokenIds.size()});
                    }
                    if (count % 500 == 0) {
                        log.info("[IMAGE-CLEANUP] Checked {}/{} URLs (broken: {})...", count, total, brokenIds.size());
                    }
                }, executor));
            }
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        } finally {
            executor.shutdown();
            try { executor.awaitTermination(10, TimeUnit.MINUTES); } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        // Final progress report
        if (progressCallback != null) {
            progressCallback.accept(new int[]{total, total, brokenIds.size()});
        }

        if (brokenIds.isEmpty()) {
            log.info("[IMAGE-CLEANUP] All {} image URLs are valid", total);
            return 0;
        }

        log.info("[IMAGE-CLEANUP] Found {} broken image URLs out of {}, clearing...", brokenIds.size(), total);
        clearBrokenImageUrls(brokenIds);
        return brokenIds.size();
    }

    public int cleanupBrokenImageUrls() {
        return cleanupBrokenImageUrls(null);
    }

    @Transactional
    public void clearBrokenImageUrls(List<Long> ids) {
        // Batch in chunks of 500 to avoid huge IN clauses
        for (int i = 0; i < ids.size(); i += 500) {
            List<Long> chunk = ids.subList(i, Math.min(i + 500, ids.size()));
            medicationRepository.clearImageUrls(chunk);
        }
    }

    private boolean isImageUrlReachable(String url) {
        if (url == null || url.isBlank()) return false;
        
        // Known bad patterns (placeholders, generic icons)
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.contains("no-image") || lowerUrl.contains("placeholder") || 
            lowerUrl.contains("default-pill") || lowerUrl.contains("generic-med")) {
            log.debug("[IMAGE-VALIDATION] Rejected placeholder-like URL: {}", url);
            return false;
        }

        try {
            HttpURLConnection conn = (HttpURLConnection) URI.create(url).toURL().openConnection();
            conn.setRequestMethod("HEAD");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setInstanceFollowRedirects(true);
            conn.setRequestProperty("User-Agent", "MediWeb/1.0 image-validator");
            
            int code = conn.getResponseCode();
            if (code < 200 || code >= 400) {
                conn.disconnect();
                return false;
            }

            // Check content type
            String contentType = conn.getContentType();
            if (contentType != null && !contentType.toLowerCase().startsWith("image/")) {
                log.debug("[IMAGE-VALIDATION] Rejected non-image Content-Type ({}): {}", contentType, url);
                conn.disconnect();
                return false;
            }

            // Check content length (avoid tiny icons/placeholders which are often < 2KB)
            long contentLength = conn.getContentLengthLong();
            if (contentLength > 0 && contentLength < 2048) {
                log.debug("[IMAGE-VALIDATION] Rejected tiny image ({} bytes): {}", contentLength, url);
                conn.disconnect();
                return false;
            }

            conn.disconnect();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Fetches an image for an existing medication from web search (no OGYEI scraping).
     * Returns true if a new image was found and saved, false otherwise.
     * NOTE: No @Transactional here — the HTTP call to Bing/Google can take seconds,
     * and holding a DB connection during that time exhausts the connection pool.
     * Only the actual save is transactional (via saveImageUrl).
     */
    public boolean fetchImageForMedication(Medication medication) {
        return fetchImageForMedication(medication, false);
    }

    public boolean fetchImageForMedication(Medication medication, boolean force) {
        if (medication == null || !StringUtils.hasText(medication.getName())) {
            return false;
        }

        if (!force && StringUtils.hasText(medication.getImageUrl())) {
            log.debug("[IMAGE-SYNC] Skipping '{}' (id={}) — already has image", medication.getName(), medication.getId());
            return false;
        }

        log.info("[IMAGE-SYNC] Searching image for '{}' (id={}){}",
                medication.getName(), medication.getId(), force ? " [FORCE]" : "");
        try {
            // Clear existing URL so resolveImageUrl doesn't use the cache
            Medication lookup = force ? null : medication;
            String imageUrl = resolveImageUrl(medication.getName(), lookup);

            if (StringUtils.hasText(imageUrl)) {
                saveImageUrl(medication.getId(), imageUrl);
                log.info("[IMAGE-SYNC] Saved image for '{}' (id={})", medication.getName(), medication.getId());
                return true;
            } else {
                log.info("[IMAGE-SYNC] No image found for '{}' (id={})", medication.getName(), medication.getId());
                return false;
            }
        } catch (Exception ex) {
            log.warn("[IMAGE-SYNC] Error fetching image for '{}' (id={}): {} [{}]",
                    medication.getName(), medication.getId(), ex.getMessage(), ex.getClass().getSimpleName());
            return false;
        }
    }

    @Transactional
    public void saveImageUrl(Long medicationId, String imageUrl) {
        medicationRepository.findById(medicationId).ifPresent(med -> {
            med.setImageUrl(imageUrl);
            med.setLastUpdated(LocalDateTime.now());
            medicationRepository.save(med);
        });
    }

    public Optional<Medication> findMedicationById(Long itemId) {
        if (itemId == null) {
            return Optional.empty();
        }
        return medicationRepository.findById(itemId);
    }

    public int countStoredMedications() {
        return Math.toIntExact(medicationRepository.count());
    }

    @Transactional
    public void updateLastReviewed(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        medicationRepository.updateLastReviewedAt(ids, LocalDateTime.now());
    }

    private MedicationDetailsResponse getMedicationDetailsInternal(Long itemId, boolean forceRefresh) throws Exception {
        log.debug("🔍 [MEDICATION] Starting getMedicationDetails for ID: {}", itemId);
        Optional<Medication> optional = medicationRepository.findById(itemId);

        // If we have cached data, return it immediately unless force refresh is
        // requested
        if (optional.isPresent() && !forceRefresh) {
            log.debug("✅ [MEDICATION] Returning cached medication data for id={}", itemId);
            return MedicationDetailsMapper.toDto(optional.get());
        }

        // If we have cached data but need to refresh, try OGYEI but fallback to cache
        // on error
        if (optional.isPresent() && forceRefresh) {
            try {
                MedicationRefreshResult result = refreshMedicationSnapshot(itemId);
                persistMedicationSnapshot(result.entity());
                log.debug("✅ [MEDICATION] Successfully refreshed from OGYEI for id={}", itemId);
                return result.response();
            } catch (Exception e) {
                log.warn("⚠️ [MEDICATION] OGYEI unavailable for ID: {}, returning cached data. Error: {}", itemId,
                        e.getMessage());
                return MedicationDetailsMapper.toDto(optional.get());
            }
        }

        // No cached data, must fetch from OGYEI
        try {
            MedicationRefreshResult result = refreshMedicationSnapshot(itemId);
            persistMedicationSnapshot(result.entity());
            log.debug("✅ [MEDICATION] Successfully fetched new medication from OGYEI for id={}", itemId);
            return result.response();
        } catch (Exception e) {
            log.error("❌ [MEDICATION] Failed to fetch medication from OGYEI and no cache available for ID: {}", itemId);
            throw new RuntimeException("A gyógyszer adatai nem érhetők el. Az OGYEI szerver jelenleg nem elérhető.", e);
        }
    }

    private boolean shouldReturnCached(Medication medication, boolean forceRefresh) {
        if (forceRefresh) {
            return false;
        }
        if (!medication.isActive()) {
            return true;
        }
        LocalDateTime lastUpdated = medication.getLastUpdated();
        return lastUpdated != null && lastUpdated.isAfter(LocalDateTime.now().minusDays(7));
    }

    /**
     * Async OGYÉI scraping — only fetches OGYÉI data (no Hazipatika, no images).
     * Used by the batch processor for fast parallel scraping.
     */
    public CompletableFuture<MedicationDetailsResponse> scrapeOgyeiOnlyAsync(Long itemId) {
        String url = "https://ogyei.gov.hu/gyogyszeradatbazis?action=show_details&item=" + itemId;
        return asyncHttpClient.fetchWithRetry(url, 2).thenApply(html -> {
            Document doc = Jsoup.parse(html, "https://ogyei.gov.hu/");
            return parseOgyeiDocument(doc, itemId);
        });
    }

    /**
     * Full scrape: OGYÉI + Hazipatika + Image (for new/changed medications).
     */
    public CompletableFuture<MedicationDetailsResponse> scrapeFullAsync(Long itemId, Medication existing) {
        String url = "https://ogyei.gov.hu/gyogyszeradatbazis?action=show_details&item=" + itemId;
        return asyncHttpClient.fetchWithRetry(url, 2).thenApply(html -> {
            Document doc = Jsoup.parse(html, "https://ogyei.gov.hu/");
            MedicationDetailsResponse ogyeiData = parseOgyeiDocument(doc, itemId);

            String imageUrl = resolveImageUrl(ogyeiData.getName(), existing);
            HazipatikaResponse hazipatikaInfo = hazipatikaSearchService.searchMedication(ogyeiData.getName());

            return MedicationDetailsResponse.builder()
                    .name(ogyeiData.getName())
                    .imageUrl(imageUrl)
                    .registrationNumber(ogyeiData.getRegistrationNumber())
                    .substance(ogyeiData.getSubstance())
                    .atcCode(ogyeiData.getAtcCode())
                    .company(ogyeiData.getCompany())
                    .legalBasis(ogyeiData.getLegalBasis())
                    .status(ogyeiData.getStatus())
                    .authorizationDate(ogyeiData.getAuthorizationDate())
                    .narcotic(ogyeiData.getNarcotic())
                    .patientInfoUrl(ogyeiData.getPatientInfoUrl())
                    .smpcUrl(ogyeiData.getSmpcUrl())
                    .labelUrl(ogyeiData.getLabelUrl())
                    .substitutes(ogyeiData.getSubstitutes())
                    .packages(ogyeiData.getPackages())
                    .containsLactose(ogyeiData.isContainsLactose())
                    .containsGluten(ogyeiData.isContainsGluten())
                    .containsBenzoate(ogyeiData.isContainsBenzoate())
                    .fokozottFelugyelet(ogyeiData.isFokozottFelugyelet())
                    .finalSamples(ogyeiData.getFinalSamples())
                    .defectiveForms(ogyeiData.getDefectiveForms())
                    .hazipatikaInfo(hazipatikaInfo)
                    .active(true)
                    .build();
        });
    }

    private MedicationDetailsResponse parseOgyeiDocument(Document doc, Long itemId) {
        Element titleElement = doc.selectFirst("h3.gy-content__title");
        if (titleElement == null) {
            throw new IllegalStateException("Nem található gyógyszernév az OGYEI oldalon (id=" + itemId + ")");
        }

        Element topTable = doc.selectFirst(".gy-content__top-table");
        if (topTable == null) {
            throw new IllegalStateException("Nem található részletező táblázat az OGYEI oldalon (id=" + itemId + ")");
        }

        String name = titleElement.text();
        String regNum = textFromTitle(topTable, "Nyilvántartási szám");
        String substance = textFromTitle(topTable, "Hatóanyag");
        String atc = textFromTitle(topTable, "ATC kód 1/ATC kód 2");
        String company = textFromTitle(topTable, "Forgalomba hozatali engedély jogosultja");
        String basis = textFromTitle(topTable, "Jogalap");
        String status = textFromTitle(topTable, "Státusz");
        String date = textFromTitle(topTable, "Készítmény engedélyezésének dátuma");
        LocalDate authorizationDate = parseAuthorizationDate(date, itemId);
        String narcotic = textFromTitle(topTable, "Kábítószer / pszichotróp anyagokat tartalmaz");
        String patientInfoUrl = getDocUrl(topTable, "betegtájékoztató");
        String smpcUrl = getDocUrl(topTable, "alkalmazási előírás");
        String labelUrl = getDocUrl(topTable, "cimkeszöveg");

        List<SubstituteMedication> substitutes = extractSubstitutes(doc);
        List<PackageInfo> packages = extractPackages(doc);

        Element datasheetTable = doc.selectFirst(".gy-content__datasheet");
        Boolean containsLactose = parseBooleanFromLine(datasheetTable, "Laktóz");
        Boolean containsStarch = parseBooleanFromLine(datasheetTable, "Búzakeményítő");
        Boolean containsBenzoate = parseBooleanFromLine(datasheetTable, "Benzoát");

        String fokozottText = textFromTitle(topTable, "Fokozott felügyelet");
        boolean fokozottFelugyelet = fokozottText != null && fokozottText.toLowerCase().contains("igen");

        List<FinalSampleApproval> finalSamples = extractFinalSampleApprovals(doc);
        List<DefectiveFormApproval> defectiveForms = extractDefectiveForms(doc);

        return MedicationDetailsResponse.builder()
                .name(name)
                .registrationNumber(regNum)
                .substance(substance)
                .atcCode(atc)
                .company(company)
                .legalBasis(basis)
                .status(status)
                .authorizationDate(authorizationDate)
                .narcotic(narcotic)
                .patientInfoUrl(patientInfoUrl)
                .smpcUrl(smpcUrl)
                .labelUrl(labelUrl)
                .substitutes(substitutes)
                .packages(packages)
                .containsLactose(Boolean.TRUE.equals(containsLactose))
                .containsGluten(Boolean.TRUE.equals(containsStarch))
                .containsBenzoate(Boolean.TRUE.equals(containsBenzoate))
                .fokozottFelugyelet(fokozottFelugyelet)
                .finalSamples(finalSamples)
                .defectiveForms(defectiveForms)
                .active(true)
                .build();
    }

    private MedicationDetailsResponse scrapeMedication(Long itemId, Medication existing) throws Exception {
        // Delegate to async and block — used by single-item refresh endpoints
        return scrapeFullAsync(itemId, existing).join();
    }

    @Transactional
    protected void persistMedicationSnapshot(Medication medication) {
        medicationRepository.save(medication);
    }

    @Transactional
    public void saveMedicationsBulk(Collection<Medication> medications) {
        if (medications == null || medications.isEmpty()) {
            return;
        }
        medicationRepository.saveAll(medications);
    }

    private Medication buildMedicationSnapshot(Long itemId, MedicationDetailsResponse response, Medication existing) {
        Medication entity = MedicationDetailsMapper.toEntity(itemId, response);
        entity.setLastUpdated(LocalDateTime.now());
        entity.setLastReviewedAt(LocalDateTime.now());
        if (existing != null && !StringUtils.hasText(entity.getImageUrl())) {
            entity.setImageUrl(existing.getImageUrl());
        }
        entity.setActive(response.isActive());
        return entity;
    }

    public boolean hasMeaningfulChanges(Medication existing, MedicationDetailsResponse response) {
        if (existing == null) {
            return true;
        }
        try {
            MedicationDetailsResponse current = MedicationDetailsMapper.toDto(existing);
            return !Objects.equals(current, response);
        } catch (RuntimeException ex) {
            log.warn("Failed to compare medication snapshot for id {}", existing.getId(), ex);
            return true;
        }
    }

    private String resolveImageUrl(String medicationName, Medication existing) {
        boolean shouldRefresh = shouldRefreshImage(existing);
        if (!shouldRefresh) {
            log.debug("[IMAGE-CACHE] Cache hit for: {} (last updated: {})",
                medicationName, existing != null ? existing.getLastUpdated() : "N/A");
            return existing != null ? existing.getImageUrl() : null;
        }

        // Priority 1: Bing web image scraping (free, unlimited)
        try {
            String bingResult = webImageSearchService.searchImage(medicationName);
            if (StringUtils.hasText(bingResult) && isSafeImageUrl(bingResult)) {
                log.debug("[IMAGE-FETCH] Found image via web search for: {}", medicationName);
                return bingResult;
            }
        } catch (Exception ex) {
            log.debug("[IMAGE-FETCH] Web image search failed for {}: {}", medicationName, ex.getMessage());
        }

        // Priority 2: Google API (optional fallback, if configured)
        try {
            String googleResult = googleImageService
                    .searchImages(medicationName)
                    .map(result -> result != null ? result.link() : null)
                    .blockOptional()
                    .orElse(null);
            if (StringUtils.hasText(googleResult) && isSafeImageUrl(googleResult)) {
                log.debug("[IMAGE-FETCH] Found image via Google API for: {}", medicationName);
                return googleResult;
            }
        } catch (RuntimeException ex) {
            if (ex.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            log.debug("[IMAGE-FETCH] Google API failed for {}: {}", medicationName, ex.getMessage());
        }

        // Fallback: keep existing image if available
        if (existing != null && StringUtils.hasText(existing.getImageUrl())) {
            return existing.getImageUrl();
        }
        return DEFAULT_MEDICATION_IMAGE;
    }

    private boolean isSafeImageUrl(String url) {
        if (url == null || url.isBlank()) return false;
        String lower = url.toLowerCase().trim();
        // Only allow http/https schemes
        if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
            log.warn("[IMAGE-SSRF] Rejected non-HTTP URL: {}", url);
            return false;
        }
        // Block internal/loopback addresses
        String afterScheme = lower.replaceFirst("https?://", "");
        if (afterScheme.startsWith("localhost") || afterScheme.startsWith("127.") ||
                afterScheme.startsWith("10.") || afterScheme.startsWith("192.168.") ||
                afterScheme.startsWith("0.") || afterScheme.startsWith("[::1]")) {
            log.warn("[IMAGE-SSRF] Rejected internal URL: {}", url);
            return false;
        }
        return true;
    }

    private boolean shouldRefreshImage(Medication existing) {
        if (existing == null) {
            log.debug("🔍 [IMAGE-REFRESH] New medication, will fetch image");
            return true;
        }
        if (!StringUtils.hasText(existing.getImageUrl())) {
            log.debug("🔍 [IMAGE-REFRESH] No existing image for medication id={}, will fetch", existing.getId());
            return true;
        }
        if (imageRefreshDays <= 0) {
            log.debug("🔍 [IMAGE-REFRESH] Image refresh disabled (refresh-days={}), will fetch", imageRefreshDays);
            return true;
        }

        LocalDateTime lastUpdated = existing.getLastUpdated();
        if (lastUpdated == null) {
            log.debug("🔍 [IMAGE-REFRESH] No lastUpdated timestamp for medication id={}, will fetch", existing.getId());
            return true;
        }

        LocalDateTime threshold = LocalDateTime.now().minusDays(imageRefreshDays);
        boolean isOld = lastUpdated.isBefore(threshold);
        if (isOld) {
            log.debug("🔍 [IMAGE-REFRESH] Image older than {} days for medication id={}, will refresh", imageRefreshDays, existing.getId());
        } else {
            log.debug("⏭️ [IMAGE-SKIP] Image is fresh (updated: {}), skipping refresh for medication id={}", lastUpdated, existing.getId());
        }
        return isOld;
    }

    private LocalDate parseAuthorizationDate(String date, Long itemId) {
        if (!StringUtils.hasText(date)) {
            return null;
        }

        Matcher matcher = OGYEI_DATE_PATTERN.matcher(date);
        if (!matcher.find()) {
            log.debug("Unable to parse authorization date '{}' for medication {}", date, itemId);
            return null;
        }

        try {
            int year = Integer.parseInt(matcher.group(1));
            int month = Integer.parseInt(matcher.group(2));
            int day = Integer.parseInt(matcher.group(3));
            return LocalDate.of(year, month, day);
        } catch (DateTimeException | IllegalArgumentException ex) {
            log.debug("Invalid authorization date '{}' for medication {}", date, itemId, ex);
            return null;
        }
    }

    private String textFromTitle(Element table, String title) {
        if (table == null) {
            return "";
        }
        Element row = table.selectFirst(".line:has(.line__title:contains(" + title + "))");
        if (row == null) return "";
        Element desc = row.selectFirst(".line__desc");
        return desc != null ? desc.text() : "";
    }

    private String getDocUrl(Element table, String keyword) {
        if (table == null) {
            return "";
        }
        Element link = table.select("a").stream()
                .filter(el -> el.text().toLowerCase().contains(keyword.toLowerCase()))
                .findFirst().orElse(null);
        return link != null ? link.absUrl("href") : "";
    }

    private Boolean parseBooleanFromLine(Element table, String label) {
        if (table == null) {
            return null;
        }
        Element line = table.select(".line:has(.cell:containsOwn(" + label + "))").first();
        if (line == null) {
            return null;
        }
        List<Element> cells = line.select(".cell");
        if (cells.size() < 2) {
            return null;
        }
        return cells.get(1).text().toLowerCase().contains("van");
    }

    private List<FinalSampleApproval> extractFinalSampleApprovals(Document doc) {
        List<FinalSampleApproval> list = new ArrayList<>();
        for (Element section : doc.select(".gy-content__datasheet")) {
            Element title = section.selectFirst(".datasheet__title");
            if (title != null && title.text().toLowerCase().contains("véglegminta engedély")) {
                Element table = section.selectFirst(".table");
                if (table != null) {
                    for (Element row : table.select(".table__line.line")) {
                        List<Element> cells = row.select(".cell");
                        if (cells.size() >= 4) {
                            list.add(new FinalSampleApproval(
                                    cells.get(0).text(),
                                    cells.get(1).text(),
                                    cells.get(2).text(),
                                    cells.get(3).text()));
                        }
                    }
                }
            }
        }
        return list;
    }

    private List<DefectiveFormApproval> extractDefectiveForms(Document doc) {
        List<DefectiveFormApproval> list = new ArrayList<>();
        for (Element section : doc.select(".gy-content__datasheet")) {
            Element title = section.selectFirst(".datasheet__title");
            if (title != null && title.text().toLowerCase().contains("alaki hiba engedély")) {
                Element table = section.selectFirst(".table");
                if (table != null) {
                    for (Element row : table.select(".table__line.line")) {
                        List<Element> cells = row.select(".cell");
                        if (cells.size() >= 5) {
                            list.add(new DefectiveFormApproval(
                                    cells.get(0).text(),
                                    cells.get(1).text(),
                                    cells.get(2).text(),
                                    cells.get(3).text(),
                                    cells.get(4).text()));
                        }
                    }
                }
            }
        }
        return list;
    }

    private List<SubstituteMedication> extractSubstitutes(Document doc) {
        List<SubstituteMedication> substitutes = new ArrayList<>();
        for (Element line : doc.select("#substitution .table__line.line")) {
            try {
                List<Element> cells = line.select("div.cell");
                if (cells.size() < 2) {
                    continue;
                }
                String substituteMedicationName = cells.get(0).text();
                String substituteMedicationRegNum = cells.get(1).ownText();
                Element link = line.selectFirst("a[href*=item=]");
                int id = 0;
                if (link != null) {
                    String href = link.attr("href");
                    String substituteMedicationItemId = href.replaceAll(".*item=(\\d+).*", "$1");
                    id = Integer.parseInt(substituteMedicationItemId);
                }
                substitutes.add(new SubstituteMedication(substituteMedicationName, substituteMedicationRegNum, id));
            } catch (Exception ex) {
                log.warn("Failed to parse substitute medication row", ex);
            }
        }
        return substitutes;
    }

    private List<PackageInfo> extractPackages(Document doc) {
        List<PackageInfo> packages = new ArrayList<>();
        for (Element line : doc.select("#packsizes .table__line.line")) {
            try {
                List<Element> cells = line.select(".cell");
                if (cells.size() < 5) {
                    continue;
                }
                packages.add(new PackageInfo(
                        cells.get(0).text(),
                        cells.get(1).text(),
                        cells.get(2).text(),
                        cells.get(3).text(),
                        cells.get(4).text()));
            } catch (Exception ex) {
                log.warn("Failed to parse package row", ex);
            }
        }
        return packages;
    }
}