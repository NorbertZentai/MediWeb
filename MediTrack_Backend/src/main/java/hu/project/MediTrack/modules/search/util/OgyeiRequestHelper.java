package hu.project.MediTrack.modules.search.util;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class OgyeiRequestHelper {

    public static Map<String, String> fetchSessionAndCsrfToken() throws IOException {
        Connection.Response response = Jsoup.connect("https://ogyei.gov.hu/gyogyszeradatbazis")
                .method(Connection.Method.GET)
                .header("User-Agent", "Mozilla/5.0")
                .execute();

        Map<String, String> cookies = response.cookies();
        Document doc = response.parse();

        Element csrfInput = doc.selectFirst("input[name=csrft]");
        if (csrfInput == null) {
            throw new IOException("Nem található CSRFT token az oldalon");
        }

        Map<String, String> sessionData = new HashMap<>();
        sessionData.put("PHPSESSID", cookies.get("PHPSESSID"));
        sessionData.put("csrft", csrfInput.attr("value"));
        return sessionData;
    }

    public static String buildSearchUrl(String csrft, String encodedKeyword, int offset) {
        return "https://ogyei.gov.hu/index.php?" +
                "csrft=" + csrft + "&" +
                "url=gyogyszeradatbazis&" +
                "action=process&" +
                "ordering=name_str&" +
                "freetext=" + encodedKeyword + "&" +
                "product_name=&medicine_name=&dosage_form=0&atc_code=&active_substance=0" +
                "&marketing_authorisation=0&dic_prescription=0&registration_number=" +
                "&authorisation_date_from=&authorisation_date_to=" +
                "&revoke_date_from=&revoke_date_to=" +
                "&from=" + offset;
    }

    public static Document fetchSearchResultPage(String url, String phpsessid) throws IOException {
        return Jsoup.connect(url)
                .method(Connection.Method.GET)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("Referer", "https://ogyei.gov.hu/gyogyszeradatbazis")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "hu-HU,hu;q=0.9,en-US;q=0.8,en;q=0.7")
                .header("DNT", "1")
                .cookie("PHPSESSID", phpsessid)
                .cookie("cookieSetup", "true")
                .execute()
                .parse();
    }

    public static Document fetchFilterPageHtml() throws IOException {
        Connection.Response response = Jsoup.connect("https://ogyei.gov.hu/gyogyszeradatbazis")
                .method(Connection.Method.GET)
                .userAgent("Mozilla/5.0")
                .header("Referer", "https://nngyk.gov.hu/")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "hu-HU,hu;q=0.9")
                .cookie("cookieSetup", "true")
                .execute();

        return response.parse();
    }

}
