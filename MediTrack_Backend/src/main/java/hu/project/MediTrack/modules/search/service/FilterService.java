package hu.project.MediTrack.modules.search.service;

import hu.project.MediTrack.modules.search.dto.FilterOptionName;
import hu.project.MediTrack.modules.search.util.FilterOptionExtractor;
import hu.project.MediTrack.modules.search.util.OgyeiRequestHelper;
import hu.project.MediTrack.modules.search.util.SearchUrlBuilder;

import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class FilterService {

    public List<FilterOptionName> getFilterOptions(String selectName) {
        try {
            Map<String, String> sessionData = OgyeiRequestHelper.fetchSessionAndCsrfToken();
            String phpsessid = sessionData.get("PHPSESSID");
            String csrft = sessionData.get("csrft");

            String filterPageUrl = SearchUrlBuilder.buildFilterPageUrl(csrft);
            Document doc = OgyeiRequestHelper.fetchSearchResultPage(filterPageUrl, phpsessid);

            return FilterOptionExtractor.extractOptions(doc, selectName);
        } catch (IOException e) {
            throw new RuntimeException("Nem sikerült lekérni a(z) " + selectName + " opciókat", e);
        }
    }
}
