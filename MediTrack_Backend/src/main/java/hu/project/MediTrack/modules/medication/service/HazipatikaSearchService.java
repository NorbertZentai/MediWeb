package hu.project.MediTrack.modules.medication.service;

import hu.project.MediTrack.modules.medication.dto.HazipatikaResponse;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class HazipatikaSearchService {

    public HazipatikaResponse searchMedication(String query) {
        String currentQuery = query.trim();

        while (!currentQuery.isEmpty()) {
            try {
                String searchUrl = "https://www.hazipatika.com/gyogyszerkereso/kereses?holkeres=nevben&search=" + currentQuery;
                Document searchDoc = Jsoup.connect(searchUrl).get();

                Elements items = searchDoc.select("ul.m-list.-medicines li a.m-list__anchor");

                List<ResultItem> results = items.stream()
                        .map(el -> new ResultItem(el.text(), el.absUrl("href")))
                        .toList();

                if (!results.isEmpty()) {
                    ResultItem bestMatch = results.stream()
                            .max(Comparator.comparingInt(item -> matchScore(query, item.title)))
                            .orElse(null);

                    if (bestMatch != null) {
                        Document detailDoc = Jsoup.connect(bestMatch.url).get();

                        // Betegtájékoztató részek feldolgozása
                        Element contentDiv = detailDoc.selectFirst("div.o-article__paragraph.-medicines");
                        List<HazipatikaResponse.Section> sections = contentDiv != null
                                ? parseSections(contentDiv)
                                : new ArrayList<>();

                        // Támogatás és gyártó információk
                        Element supportRoot = detailDoc.selectFirst("ul.m-list.-support");
                        String licenseHolder = "";
                        String substance = "";
                        String atc = "";

                        boolean normativeTbSupport = false;
                        boolean prescriptionRequired = false;
                        boolean publicHealthSupport = false;
                        boolean outsidePharmacy = false;
                        boolean euSupportable = false;
                        boolean euPrioritySupport = false;
                        boolean accidentCoverage = false;

                        if (supportRoot != null) {
                            Element firstLi = supportRoot.selectFirst("li.m-list__item.-first");
                            if (firstLi != null) licenseHolder = firstLi.ownText().trim();

                            Elements wrappers = supportRoot.select("ul.m-list.-wrapper");
                            if (!wrappers.isEmpty()) {
                                for (Element li : wrappers.get(0).select("li.m-list__item")) {
                                    String label = li.selectFirst("b").text().replace(":", "").trim();
                                    String value = li.ownText().trim();
                                    if (label.equalsIgnoreCase("Hatóanyag")) substance = value;
                                    if (label.equalsIgnoreCase("ATC")) atc = value;
                                }

                                for (Element wrapper : wrappers) {
                                    for (Element li : wrapper.select("li.m-list__item")) {
                                        String label = li.selectFirst("b").text().replace(":", "").trim();
                                        Element icon = li.selectFirst("i.m-list__icon");
                                        boolean checked = icon != null && icon.classNames().contains("-checked");

                                        switch (label) {
                                            case "Normatív TB támogatás" -> normativeTbSupport = checked;
                                            case "Vényköteles" -> prescriptionRequired = checked;
                                            case "Közgyógyellátásra adható" -> publicHealthSupport = checked;
                                            case "Patikán kívül vásárolható" -> outsidePharmacy = checked;
                                            case "EÜ támogatásra adható" -> euSupportable = checked;
                                            case "EÜ Kiemelt támogatás" -> euPrioritySupport = checked;
                                        }
                                    }
                                }
                            }

                            Element lastLi = supportRoot.selectFirst("li.m-list__item.-last");
                            if (lastLi != null) {
                                String label = lastLi.selectFirst("b").text().replace(":", "").trim();
                                Element icon = lastLi.selectFirst("i.m-list__icon");
                                boolean checked = icon != null && icon.classNames().contains("-checked");
                                if (label.equalsIgnoreCase("Üzemi baleset jogcím")) accidentCoverage = checked;
                            }
                        }

                        return new HazipatikaResponse(
                                bestMatch.title,
                                bestMatch.url,
                                sections,
                                licenseHolder,
                                substance,
                                atc,
                                normativeTbSupport,
                                prescriptionRequired,
                                publicHealthSupport,
                                outsidePharmacy,
                                euSupportable,
                                euPrioritySupport,
                                accidentCoverage
                        );
                    }
                }

                int lastSpace = currentQuery.lastIndexOf(" ");
                if (lastSpace == -1) break;
                currentQuery = currentQuery.substring(0, lastSpace).trim();

            } catch (Exception e) {
                log.error("❌ Hiba a keresés során: {}", e.getMessage());
                return null;
            }
        }

        return null;
    }

    private List<HazipatikaResponse.Section> parseSections(Element contentDiv) {
        List<HazipatikaResponse.Section> sections = new ArrayList<>();

        String[] rawSections = contentDiv.html().split("(?=<b>\\d+\\.)");

        for (String raw : rawSections) {
            Document fragment = Jsoup.parseBodyFragment(raw);
            Element bTag = fragment.selectFirst("b");

            if (bTag != null) {
                String heading = bTag.text().trim();
                bTag.remove();

                String contentHtml = cleanHtml(fragment.body().html());
                sections.add(new HazipatikaResponse.Section(heading, contentHtml));
            }
        }

        return sections;
    }

    public static String cleanHtml(String rawHtml) {
        if (rawHtml == null) return "";

        return rawHtml
                .replaceAll("(?i)<br\\s*/?>\\s*<br\\s*/?>\\s*", "<br><br>")
                .replaceAll("(?i)(<br\\s*/?>\\s*){3,}", "<br><br>")
                .replaceAll("(?i)\\s*<br\\s*/?>\\s*", "<br>")
                .replaceAll("^(\\s*<br\\s*/?>\\s*)+", "")
                .replaceAll("(\\s*<br\\s*/?>\\s*)+$", "")
                .replaceAll("&nbsp;", " ")
                .replaceAll(">\\s+<", "><")
                .trim();
    }

    private int matchScore(String query, String title) {
        String[] queryWords = query.toLowerCase().split("\\s+");
        String titleLower = title.toLowerCase();
        int score = 0;
        for (String word : queryWords) {
            if (titleLower.contains(word)) {
                score++;
            }
        }
        return score;
    }

    private record ResultItem(String title, String url) {}
}
