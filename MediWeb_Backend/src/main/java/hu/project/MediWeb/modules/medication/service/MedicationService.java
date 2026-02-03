package hu.project.MediWeb.modules.medication.service;

import hu.project.MediWeb.modules.GoogleImage.service.GoogleImageService;
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

import java.time.DateTimeException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationService {

    private static final Pattern OGYEI_DATE_PATTERN = Pattern.compile("(\\d{4})\\.\\s*(\\d{1,2})\\.\\s*(\\d{1,2})");

    private final GoogleImageService googleImageService;
    private final MedicationRepository medicationRepository;
    private final HazipatikaSearchService hazipatikaSearchService;

    @Value("${medication.image.refresh-days:30}")
    private int imageRefreshDays;

    public record MedicationRefreshResult(Medication entity, MedicationDetailsResponse response) {}

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
        Optional<Medication> optional = medicationRepository.findById(itemId);

        if (optional.isPresent() && shouldReturnCached(optional.get(), forceRefresh)) {
            log.debug("Returning cached medication data for id={} (force={})", itemId, forceRefresh);
            return MedicationDetailsMapper.toDto(optional.get());
        }

        MedicationRefreshResult result = refreshMedicationSnapshot(itemId);
        persistMedicationSnapshot(result.entity());
        return result.response();
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

    private MedicationDetailsResponse scrapeMedication(Long itemId, Medication existing) throws Exception {
        log.info("Fetching medication details from OGYEI for id={}", itemId);
        String url = "https://ogyei.gov.hu/gyogyszeradatbazis&action=show_details&item=" + itemId;
        Document doc = Jsoup.connect(url).get();

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

        List<FinalSampleApproval> finalSamples = extractFinalSampleApprovals(doc);
        List<DefectiveFormApproval> defectiveForms = extractDefectiveForms(doc);

        String imageUrl = resolveImageUrl(name, existing);

        HazipatikaResponse hazipatikaInfo = hazipatikaSearchService.searchMedication(name);

        return MedicationDetailsResponse.builder()
                .name(name)
                .imageUrl(imageUrl)
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
                .finalSamples(finalSamples)
                .defectiveForms(defectiveForms)
                .hazipatikaInfo(hazipatikaInfo)
                .active(true)
                .build();
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
            return existing != null ? existing.getImageUrl() : null;
        }

        try {
            String fetched = googleImageService
                    .searchImages(medicationName)
                    .map(result -> result != null ? result.link() : null)
                    .blockOptional()
                    .orElse(null);

            if (!StringUtils.hasText(fetched) && existing != null) {
                return existing.getImageUrl();
            }
            return fetched;
        } catch (RuntimeException ex) {
            boolean wasInterrupted = Thread.currentThread().isInterrupted();
            Throwable cause = ex.getCause();
            if (cause instanceof InterruptedException && !wasInterrupted) {
                Thread.currentThread().interrupt();
                wasInterrupted = true;
            }
            if (cause instanceof InterruptedException || wasInterrupted) {
                log.debug("Képkeresés megszakítva ({}): {}", medicationName, ex.getMessage());
            } else {
                log.warn("Nem sikerült képet keresni az OGYEI tételhez ({}): {}", medicationName, ex.getMessage());
            }
            return existing != null ? existing.getImageUrl() : null;
        }
    }

    private boolean shouldRefreshImage(Medication existing) {
        if (existing == null) {
            return true;
        }
        if (!StringUtils.hasText(existing.getImageUrl())) {
            return true;
        }
        if (imageRefreshDays <= 0) {
            return true;
        }

        LocalDateTime lastUpdated = existing.getLastUpdated();
        if (lastUpdated == null) {
            return true;
        }

        LocalDateTime threshold = LocalDateTime.now().minusDays(imageRefreshDays);
        return lastUpdated.isBefore(threshold);
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
        return row != null ? row.selectFirst(".line__desc").text() : "";
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
                                    cells.get(3).text()
                            ));
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
                                    cells.get(4).text()
                            ));
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
                        cells.get(4).text()
                ));
            } catch (Exception ex) {
                log.warn("Failed to parse package row", ex);
            }
        }
        return packages;
    }
}