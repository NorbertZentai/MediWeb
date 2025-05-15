package hu.project.MediTrack.modules.search.util;

import hu.project.MediTrack.modules.search.dto.MedicationSearchResult;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.Optional;

public class MedicationParser {

    public static Optional<MedicationSearchResult> parseRow(Element row) {
        Elements cols = row.select("div.cell");
        if (cols.size() < 5) return Optional.empty();

        String name = cols.get(0).text();
        String substance = cols.get(1).text();
        String atc = cols.get(2).text();
        String company = cols.get(3).text();
        String status = cols.get(4).text();

        Element linkElement = cols.get(0).selectFirst("a[href]");
        String link = linkElement != null ? linkElement.attr("href").replace("&amp;", "&") : "";

        MedicationSearchResult result = MedicationSearchResult.builder()
                .name(name)
                .substance(substance)
                .atc(atc)
                .company(company)
                .status(status)
                .link(link)
                .build();

        return Optional.of(result);
    }
}
