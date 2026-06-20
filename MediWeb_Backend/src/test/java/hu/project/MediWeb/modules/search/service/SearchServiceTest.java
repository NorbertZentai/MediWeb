package hu.project.MediWeb.modules.search.service;

import hu.project.MediWeb.modules.search.dto.MedicationSearchRequest;
import hu.project.MediWeb.modules.search.dto.MedicationSearchResult;
import hu.project.MediWeb.modules.search.util.MedicationParser;
import hu.project.MediWeb.modules.search.util.OgyeiRequestHelper;
import hu.project.MediWeb.modules.search.util.SearchUrlBuilder;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;

/**
 * Unit tesztek a {@link SearchService#searchMedications} keresési logikájához.
 * A service statikus utility-osztályokkal (OGYÉI session, oldal-lekérés, sor-parse) és
 * hálózati I/O-val dolgozik — ezeket {@code mockStatic}-kal helyettesítjük, így hálózat
 * nélkül, determinisztikusan teszteljük a lapozást, a felső korlátot és a hibakezelést.
 */
class SearchServiceTest {

    private SearchService searchService;
    private MedicationSearchRequest request;

    @BeforeEach
    void setUp() {
        searchService = new SearchService();
        request = MedicationSearchRequest.builder().freetext("aspirin").build();
    }

    /** N darab OGYÉI találati sort tartalmazó Jsoup dokumentumot épít. */
    private Document pageWithRows(int rowCount) {
        String html = "<div class=\"table__line line\"></div>".repeat(rowCount);
        return Jsoup.parse(html);
    }

    private Map<String, String> validSession() {
        return Map.of("PHPSESSID", "sid-123", "csrft", "token-abc");
    }

    @Test
    @DisplayName("searchMedications: összegyűjti a találatokat, és üres oldalnál megáll")
    void searchMedications_collectsResults_andStopsOnEmptyPage() {
        Document firstPage = pageWithRows(2);
        Document emptyPage = pageWithRows(0);
        MedicationSearchResult parsed = MedicationSearchResult.builder()
                .name("Aspirin").link("?item=123").build();

        try (MockedStatic<OgyeiRequestHelper> ogyei = mockStatic(OgyeiRequestHelper.class);
             MockedStatic<SearchUrlBuilder> urls = mockStatic(SearchUrlBuilder.class);
             MockedStatic<MedicationParser> parser = mockStatic(MedicationParser.class)) {

            ogyei.when(OgyeiRequestHelper::fetchSessionAndCsrfToken).thenReturn(validSession());
            urls.when(() -> SearchUrlBuilder.buildSearchUrl(any(), any(), anyInt())).thenReturn("http://ogyei/test");
            // 1. oldal: 2 sor, 2. oldal: üres -> a ciklus megáll
            ogyei.when(() -> OgyeiRequestHelper.fetchSearchResultPage(any(), any()))
                    .thenReturn(firstPage, emptyPage);
            parser.when(() -> MedicationParser.parseRow(any(Element.class)))
                    .thenReturn(Optional.of(parsed));

            List<MedicationSearchResult> results = searchService.searchMedications(request);

            assertThat(results).hasSize(2);
            assertThat(results).allMatch(r -> r.getLink().equals("?item=123"));
            // pontosan 2 oldalt kért le: a teli oldalt + az üreset (ami megállítja)
            ogyei.verify(() -> OgyeiRequestHelper.fetchSearchResultPage(any(), any()), times(2));
        }
    }

    @Test
    @DisplayName("searchMedications: a MAX_RESULTS (100) felső korlátnál megáll")
    void searchMedications_stopsAtMaxResults() {
        Document fullPage = pageWithRows(20); // PAGE_SIZE = 20
        MedicationSearchResult parsed = MedicationSearchResult.builder()
                .name("Med").link("?item=1").build();

        try (MockedStatic<OgyeiRequestHelper> ogyei = mockStatic(OgyeiRequestHelper.class);
             MockedStatic<SearchUrlBuilder> urls = mockStatic(SearchUrlBuilder.class);
             MockedStatic<MedicationParser> parser = mockStatic(MedicationParser.class)) {

            ogyei.when(OgyeiRequestHelper::fetchSessionAndCsrfToken).thenReturn(validSession());
            urls.when(() -> SearchUrlBuilder.buildSearchUrl(any(), any(), anyInt())).thenReturn("http://ogyei/test");
            ogyei.when(() -> OgyeiRequestHelper.fetchSearchResultPage(any(), any())).thenReturn(fullPage);
            parser.when(() -> MedicationParser.parseRow(any(Element.class)))
                    .thenReturn(Optional.of(parsed));

            List<MedicationSearchResult> results = searchService.searchMedications(request);

            assertThat(results).hasSize(100);
            // 100 / 20 = 5 oldal lekérése után eléri a korlátot
            ogyei.verify(() -> OgyeiRequestHelper.fetchSearchResultPage(any(), any()), times(5));
        }
    }

    @Test
    @DisplayName("searchMedications: a session-lekérés IOException-jét RuntimeException-be csomagolja")
    void searchMedications_wrapsIOException() {
        try (MockedStatic<OgyeiRequestHelper> ogyei = mockStatic(OgyeiRequestHelper.class)) {
            ogyei.when(OgyeiRequestHelper::fetchSessionAndCsrfToken)
                    .thenThrow(new IOException("OGYÉI elérhetetlen"));

            assertThatThrownBy(() -> searchService.searchMedications(request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Nem sikerült lekérni az adatokat")
                    .hasCauseInstanceOf(IOException.class);
        }
    }
}
