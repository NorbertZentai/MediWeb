package hu.project.MediTrack.modules.search.service;

import hu.project.MediTrack.modules.search.dto.MedicationSearchRequest;
import hu.project.MediTrack.modules.search.dto.MedicationSearchResult;
import hu.project.MediTrack.modules.search.util.MedicationParser;
import hu.project.MediTrack.modules.search.util.OgyeiRequestHelper;
import hu.project.MediTrack.modules.search.util.SearchUrlBuilder;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
public class SearchService {

    private static final int MAX_RESULTS = 100;
    private static final int PAGE_SIZE = 20;

    public List<MedicationSearchResult> searchMedications(MedicationSearchRequest params) {
        try {
            Map<String, String> sessionData = OgyeiRequestHelper.fetchSessionAndCsrfToken();
            String phpsessid = sessionData.get("PHPSESSID");
            String csrft = sessionData.get("csrft");

            List<MedicationSearchResult> allResults = new ArrayList<>();

            for (int offset = 0; offset < MAX_RESULTS; offset += PAGE_SIZE) {
                String url = SearchUrlBuilder.buildSearchUrl(csrft, params, offset);
                Document doc = OgyeiRequestHelper.fetchSearchResultPage(url, phpsessid);

                Elements rows = doc.select("div.table__line.line");
                if (rows.isEmpty()) break;

                for (Element row : rows) {
                    Optional<MedicationSearchResult> result = MedicationParser.parseRow(row);
                    result.ifPresent(allResults::add);

                    if (allResults.size() >= MAX_RESULTS) {
                        return allResults;
                    }
                }
            }

            return allResults;

        } catch (IOException e) {
            throw new RuntimeException("Nem sikerült lekérni az adatokat", e);
        }
    }
}
