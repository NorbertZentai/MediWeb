package hu.project.MediWeb.modules.medication.dto;

import java.time.LocalDate;

public record MedicationListItemResponse(
        Long id,
        String name,
        String substance,
        String atcCode,
        String company,
        String status,
        LocalDate authorizationDate,
        String imageUrl,
        boolean lactoseFree,
        boolean glutenFree,
        boolean benzoateFree,
        boolean narcotic,
        boolean active
) {
}
