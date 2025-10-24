package hu.project.MediWeb.modules.medication.dto;

public record MedicationSearchCriteria(
        String query,
        String atcCode,
        Boolean lactoseFree,
        Boolean glutenFree,
        Boolean benzoateFree,
        Boolean narcoticOnly
) {
}
