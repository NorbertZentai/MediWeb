package hu.project.MediWeb.modules.medication.service;

import hu.project.MediWeb.modules.GoogleImage.service.GoogleImageService;
import hu.project.MediWeb.modules.medication.dto.*;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.medication.repository.MedicationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final GoogleImageService googleImageService;
    private final MedicationRepository medicationRepository;
    private final HazipatikaSearchService hazipatikaSearchService;

    public MedicationDetailsResponse getMedicationDetails(Long itemId) throws Exception {
        System.out.println("🔍 [MED-SERVICE] Starting getMedicationDetails for ID: " + itemId);
        
        try {
            System.out.println("📊 [MED-SERVICE] Checking database for existing medication with ID: " + itemId);
            Optional<Medication> optional = medicationRepository.findById(itemId);
            
            if (optional.isPresent()) {
                System.out.println("✅ [MED-SERVICE] Found existing medication in database for ID: " + itemId);
                Medication medication = optional.get();

                if (medication.getLastUpdated() != null && medication.getLastUpdated().isAfter(LocalDate.now().minusDays(7))) {
                    System.out.println("✅ [MED-SERVICE] Medication is fresh (< 7 days), returning cached data for ID: " + itemId);
                    return MedicationDetailsMapper.toDto(medication);
                }

                System.out.println("🗑️ [MED-SERVICE] Medication is stale (>= 7 days), deleting and re-fetching for ID: " + itemId);
                medicationRepository.deleteById(itemId);
            } else {
                System.out.println("❌ [MED-SERVICE] No existing medication found in database for ID: " + itemId);
            }

            System.out.println("🌐 [MED-SERVICE] Fetching fresh data from OGYEI website for ID: " + itemId);
            String url = "https://ogyei.gov.hu/gyogyszeradatbazis&action=show_details&item=" + itemId;
            System.out.println("🔗 [MED-SERVICE] URL: " + url);
            
            Document doc = Jsoup.connect(url).get();
            System.out.println("✅ [MED-SERVICE] Successfully fetched HTML from OGYEI for ID: " + itemId);

            String name = doc.selectFirst("h3.gy-content__title").text();
            System.out.println("📝 [MED-SERVICE] Extracted medication name: " + name + " for ID: " + itemId);

            Element topTable = doc.selectFirst(".gy-content__top-table");
            System.out.println("📋 [MED-SERVICE] Processing medication details table for ID: " + itemId);

        String regNum = textFromTitle(topTable, "Nyilvántartási szám");
        String substance = textFromTitle(topTable, "Hatóanyag");
        String atc = textFromTitle(topTable, "ATC kód 1/ATC kód 2");
        String company = textFromTitle(topTable, "Forgalomba hozatali engedély jogosultja");
        String basis = textFromTitle(topTable, "Jogalap");
        String status = textFromTitle(topTable, "Státusz");
        String date = textFromTitle(topTable, "Készítmény engedélyezésének dátuma");
        LocalDate authorizationDate = null;
        if (date != null && !date.isBlank()) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");
            authorizationDate = LocalDate.parse(date, formatter);
        }

        String narcotic = textFromTitle(topTable, "Kábítószer / pszichotróp anyagokat tartalmaz");
        String patientInfoUrl = getDocUrl(topTable, "betegtájékoztató");
        String smpcUrl = getDocUrl(topTable, "alkalmazási előírás");
        String labelUrl = getDocUrl(topTable, "cimkeszöveg");

        System.out.println("🔍 [MED-SERVICE] Processing substitutes section for ID: " + itemId);
        List<SubstituteMedication> substitutes = doc.select("#substitution .table__line.line").stream()
                .map(line -> {
                    try {
                        var cells = line.select("div.cell");
                        if (cells.size() < 2) {
                            System.out.println("⚠️ [MED-SERVICE] Not enough cells in substitute line, skipping");
                            return null;
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
                        return new SubstituteMedication(substituteMedicationName, substituteMedicationRegNum, id);
                    } catch (Exception e) {
                        System.err.println("❌ [MED-SERVICE] Error processing substitute line: " + e.getMessage());
                        return null;
                    }
                })
                .filter(substitute -> substitute != null)
                .toList();

        System.out.println("🔍 [MED-SERVICE] Processing packages section for ID: " + itemId);
        List<PackageInfo> packages = doc.select("#packsizes .table__line.line").stream()
                .map(line -> {
                    try {
                        List<Element> cells = line.select(".cell");
                        if (cells.size() < 5) {
                            System.out.println("⚠️ [MED-SERVICE] Not enough cells in package line, skipping");
                            return null;
                        }
                        return new PackageInfo(
                                cells.get(0).text(),
                                cells.get(1).text(),
                                cells.get(2).text(),
                                cells.get(3).text(),
                                cells.get(4).text()
                        );
                    } catch (Exception e) {
                        System.err.println("❌ [MED-SERVICE] Error processing package line: " + e.getMessage());
                        return null;
                    }
                })
                .filter(pkg -> pkg != null)
                .toList();

        Element datasheetTable = doc.select(".gy-content__datasheet").first();

        Boolean containsLactose = parseBooleanFromLine(datasheetTable, "Laktóz");
        Boolean containsStarch = parseBooleanFromLine(datasheetTable, "Búzakeményítő");
        Boolean containsBenzoate = parseBooleanFromLine(datasheetTable, "Benzoát");

        List<FinalSampleApproval> finalSamples = extractFinalSampleApprovals(doc);
        List<DefectiveFormApproval> defectiveForms = extractDefectiveForms(doc);

        String imageUrl = googleImageService
                .searchImages(name)
                .map(result -> result != null ? result.link() : null)
                .blockOptional()
                .orElse(null);

        HazipatikaResponse hazipatikaInfo = hazipatikaSearchService.searchMedication(name);

        MedicationDetailsResponse response = MedicationDetailsResponse.builder()
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
                .containsLactose(containsLactose)
                .containsGluten(containsStarch)
                .containsBenzoate(containsBenzoate)
                .finalSamples(finalSamples)
                .defectiveForms(defectiveForms)
                .hazipatikaInfo(hazipatikaInfo)
                .build();

        Medication entity = MedicationDetailsMapper.toEntity(itemId, response);
        System.out.println("💾 [MED-SERVICE] Attempting to save medication entity to database for ID: " + itemId);
        saveIfNotExists(entity);
        System.out.println("✅ [MED-SERVICE] Successfully completed getMedicationDetails for ID: " + itemId);

        return response;
    } catch (Exception e) {
        System.err.println("❌ [MED-SERVICE] Exception in getMedicationDetails for ID: " + itemId);
        System.err.println("❌ [MED-SERVICE] Exception type: " + e.getClass().getSimpleName());
        System.err.println("❌ [MED-SERVICE] Exception message: " + e.getMessage());
        e.printStackTrace();
        throw e;
    }
    }

    @Transactional
    public void saveIfNotExists(Medication medication) {
        System.out.println("💾 [MED-SERVICE] saveIfNotExists called for medication ID: " + medication.getId());
        try {
            if (!medicationRepository.existsById(medication.getId())) {
                System.out.println("💾 [MED-SERVICE] Medication does not exist, saving new record for ID: " + medication.getId());
                if (medication.getLastUpdated() == null) {
                    medication.setLastUpdated(LocalDate.now());
                }
                medicationRepository.save(medication);
                System.out.println("✅ [MED-SERVICE] Successfully saved medication to database for ID: " + medication.getId());
            } else {
                System.out.println("ℹ️ [MED-SERVICE] Medication already exists, skipping save for ID: " + medication.getId());
            }
        } catch (Exception e) {
            System.err.println("❌ [MED-SERVICE] Error saving medication for ID: " + medication.getId());
            System.err.println("❌ [MED-SERVICE] Save error type: " + e.getClass().getSimpleName());
            System.err.println("❌ [MED-SERVICE] Save error message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private String textFromTitle(Element table, String title) {
        Element row = table.selectFirst(".line:has(.line__title:contains(" + title + "))");
        return row != null ? row.selectFirst(".line__desc").text() : "";
    }

    private String getDocUrl(Element table, String keyword) {
        Element link = table.select("a").stream()
                .filter(el -> el.text().toLowerCase().contains(keyword.toLowerCase()))
                .findFirst().orElse(null);
        return link != null ? link.absUrl("href") : "";
    }

    private Boolean parseBooleanFromLine(Element table, String label) {
        Element line = table.select(".line:has(.cell:containsOwn(" + label + "))").first();
        if (line != null) {
            String value = line.select(".cell").get(1).text().toLowerCase();
            return value.contains("van");
        }
        return null;
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
}