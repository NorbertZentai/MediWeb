package hu.project.MediTrack.modules.medication.service;

import hu.project.MediTrack.modules.GoogleImage.service.GoogleImageService;
import hu.project.MediTrack.modules.medication.dto.*;
import hu.project.MediTrack.modules.medication.entity.Medication;
import hu.project.MediTrack.modules.medication.repository.MedicationRepository;
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

    // 🌐 2️⃣ Ha nincs az adatbázisban, lekérjük az OGYÉI oldalról
    public MedicationDetailsResponse getMedicationDetails(Long itemId) throws Exception {
        // 1️⃣ Először megpróbáljuk az adatbázisból lekérni a gyógyszert
        Optional<Medication> optional = medicationRepository.findById(itemId);
        if (optional.isPresent()) {
            return MedicationDetailsMapper.toDto(optional.get());
        }

        String url = "https://ogyei.gov.hu/gyogyszeradatbazis&action=show_details&item=" + itemId;
        Document doc = Jsoup.connect(url).get();

        String name = doc.selectFirst("h3.gy-content__title").text();

        Element topTable = doc.selectFirst(".gy-content__top-table");

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

        List<SubstituteMedication> substitutes = doc.select("#substitution .table__line.line").stream()
                .map(line -> {
                    String substituteMedicationName = line.select("div.cell").get(0).text();
                    String substituteMedicationRegNum = line.select("div.cell").get(1).ownText();
                    Element link = line.selectFirst("a[href*=item=]");
                    int id = 0;
                    if (link != null) {
                        String href = link.attr("href");
                        String substituteMedicationItemId = href.replaceAll(".*item=(\\d+).*", "$1");
                        id = Integer.parseInt(substituteMedicationItemId);
                    }
                    return new SubstituteMedication(substituteMedicationName, substituteMedicationRegNum, id);
                }).toList();

        List<PackageInfo> packages = doc.select("#packsizes .table__line.line").stream()
                .map(line -> {
                    List<Element> cells = line.select(".cell");
                    return new PackageInfo(
                            cells.get(0).text(),
                            cells.get(1).text(),
                            cells.get(2).text(),
                            cells.get(3).text(),
                            cells.get(4).text()
                    );
                }).toList();

        Element datasheetTable = doc.select(".gy-content__datasheet").first();

        Boolean containsLactose = parseBooleanFromLine(datasheetTable, "Laktóz");
        Boolean containsStarch = parseBooleanFromLine(datasheetTable, "Búzakeményítő");
        Boolean containsBenzoate = parseBooleanFromLine(datasheetTable, "Benzoát");

        List<FinalSampleApproval> finalSamples = extractFinalSampleApprovals(doc);
        List<DefectiveFormApproval> defectiveForms = extractDefectiveForms(doc);

        String imageUrl = googleImageService
                .searchImages(name)
                .map(result -> result != null ? result.link() : null)
                .block();

        HazipatikaResponse hazipatikaInfo = hazipatikaSearchService.searchMedication(name);

        // DTO objektum összeállítása
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

        // Elmentjük az adatokat adatbázisba
        Medication entity = MedicationDetailsMapper.toEntity(itemId, response);
        medicationRepository.save(entity);

        return response;
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
