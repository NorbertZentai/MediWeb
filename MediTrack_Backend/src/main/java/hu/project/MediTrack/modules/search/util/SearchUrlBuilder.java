package hu.project.MediTrack.modules.search.util;

import hu.project.MediTrack.modules.search.dto.MedicationSearchRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
public class SearchUrlBuilder {

    public static String buildSearchUrl(String csrft, MedicationSearchRequest params, int offset) {
        return "https://ogyei.gov.hu/index.php?" +
                "csrft=" + csrft +
                "&url=gyogyszeradatbazis" +
                "&action=process" +
                "&ordering=name_str" +
                "&freetext=" + encode(params.getFreetext()) +
                "&dosage_form=" + defaultInt(params.getDosageForm()) +
                "&atc_code=" + encode(params.getAtcCode()) +
                "&active_substance=" + defaultInt(params.getActiveSubstance()) +
                "&marketing_authorisation=" + defaultInt(params.getMarketingAuthorisation()) +
                "&dic_prescription=" + defaultInt(params.getDicPrescription()) +
                "&registration_number=" + encode(params.getRegistrationNumber()) +
                "&authorisation_date_from=" + encode(params.getAuthorisationDateFrom()) +
                "&authorisation_date_to=" + encode(params.getAuthorisationDateTo()) +
                "&revoke_date_from=" + encode(params.getRevokeDateFrom()) +
                "&revoke_date_to=" + encode(params.getRevokeDateTo()) +
                booleanParam("lactose", params.getLactose()) +
                booleanParam("gluten", params.getGluten()) +
                booleanParam("benzoate", params.getBenzoate()) +
                booleanParam("has_final_sample", params.getHasFinalSample()) +
                booleanParam("has_defected_form", params.getHasDefectedForm()) +
                booleanParam("fokozott_felugyelet", params.getFokozottFelugyelet()) +
                booleanParam("kp_besorolas", params.getKpBesorolas()) +
                "&from=" + offset;
    }

    private static String encode(String input) {
        return input != null ? URLEncoder.encode(input, StandardCharsets.UTF_8) : "";
    }

    private static String booleanParam(String key, Boolean value) {
        return value != null && value ? "&" + key + "=1" : "";
    }

    private static String defaultInt(Integer value) {
        return value != null ? String.valueOf(value) : "0";
    }

    public static String buildFilterPageUrl(String csrft) {
        return "https://ogyei.gov.hu/index.php?" +
                "csrft=" + csrft +
                "&url=gyogyszeradatbazis";
    }
}
