// hu.project.MediTrack.modules.search.util.FilterOptionExtractor.java
package hu.project.MediTrack.modules.search.util;

import hu.project.MediTrack.modules.search.dto.FilterOptionName;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.ArrayList;
import java.util.List;

public class FilterOptionExtractor {

    public static List<FilterOptionName> extractOptions(Document doc, String selectName) {
        List<FilterOptionName> options = new ArrayList<>();

        Element selectElement = doc.selectFirst("select[name=" + selectName + "]");
        if (selectElement == null){
            System.out.println("Nincs <select> elem ilyen névvel: " + selectName);
            return options;
        }

        for (Element option : selectElement.select("option")) {
            int value = Integer.parseInt(option.attr("value").trim());
            String label = option.text().trim();
            if (!label.isEmpty()) {
                options.add(new FilterOptionName(value, label));
            }
        }
        return options;
    }
}
