package hu.project.MediWeb.modules.medication.dto;

import java.time.LocalDate;

public record MedicationSearchCriteria(
                String query,
                String atcCode,
                String registrationNumber,
                Boolean lactoseFree,
                Boolean glutenFree,
                Boolean benzoateFree,
                Boolean narcoticOnly,
                Boolean hasFinalSample,
                Boolean hasDefectedForm,
                Boolean fokozottFelugyelet,
                LocalDate authorisationDateFrom,
                LocalDate authorisationDateTo,
                LocalDate revokeDateFrom,
                LocalDate revokeDateTo) {
}
