package hu.project.MediWeb.modules.medication.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hu.project.MediWeb.modules.medication.entity.Medication;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MedicationDetailsMapper {

    private static final ObjectMapper mapper = new ObjectMapper();
    private static final String EMPTY_LIST_JSON = "[]";
    private static final String NULL_JSON = "null";

    private static <T> List<T> safeReadList(String json, TypeReference<List<T>> typeRef) {
        if (json == null || json.isBlank() || NULL_JSON.equals(json)) {
            return Collections.emptyList();
        }
        try {
            List<T> result = mapper.readValue(json, typeRef);
            return result != null ? result : Collections.emptyList();
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private static <T> T safeReadObject(String json, TypeReference<T> typeRef) {
        if (json == null || json.isBlank() || NULL_JSON.equals(json)) {
            return null;
        }
        try {
            return mapper.readValue(json, typeRef);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    public static Medication toEntity(Long id, MedicationDetailsResponse dto) {
        try {
            return Medication.builder()
                    .id(id)
                    .name(dto.getName())
                    .imageUrl(dto.getImageUrl())
                    .registrationNumber(dto.getRegistrationNumber())
                    .substance(dto.getSubstance())
                    .atcCode(dto.getAtcCode())
                    .company(dto.getCompany())
                    .legalBasis(dto.getLegalBasis())
                    .status(dto.getStatus())
                    .active(dto.isActive())
                    .authorizationDate(dto.getAuthorizationDate())
                    .narcotic(dto.getNarcotic())
                    .patientInfoUrl(dto.getPatientInfoUrl())
                    .smpcUrl(dto.getSmpcUrl())
                    .labelUrl(dto.getLabelUrl())
                    .containsLactose(dto.isContainsLactose())
                    .containsGluten(dto.isContainsGluten())
                    .containsBenzoate(dto.isContainsBenzoate())
                    .fokozottFelugyelet(dto.isFokozottFelugyelet())
                    .packagesJson(mapper
                            .writeValueAsString(dto.getPackages() != null ? dto.getPackages() : new ArrayList<>()))
                    .substitutesJson(mapper.writeValueAsString(
                            dto.getSubstitutes() != null ? dto.getSubstitutes() : new ArrayList<>()))
                    .finalSamplesJson(mapper.writeValueAsString(
                            dto.getFinalSamples() != null ? dto.getFinalSamples() : new ArrayList<>()))
                    .defectiveFormsJson(mapper.writeValueAsString(
                            dto.getDefectiveForms() != null ? dto.getDefectiveForms() : new ArrayList<>()))
                    .hazipatikaJson(mapper.writeValueAsString(dto.getHazipatikaInfo()))
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Hiba DTO-ból Entity konvertálás közben", e);
        }
    }

    public static MedicationDetailsResponse toDto(Medication e) {
        return MedicationDetailsResponse.builder()
                .name(e.getName())
                .imageUrl(e.getImageUrl())
                .registrationNumber(e.getRegistrationNumber())
                .substance(e.getSubstance())
                .atcCode(e.getAtcCode())
                .company(e.getCompany())
                .legalBasis(e.getLegalBasis())
                .status(e.getStatus())
                .authorizationDate(e.getAuthorizationDate())
                .narcotic(e.getNarcotic())
                .patientInfoUrl(e.getPatientInfoUrl())
                .smpcUrl(e.getSmpcUrl())
                .labelUrl(e.getLabelUrl())
                .containsLactose(e.isContainsLactose())
                .containsGluten(e.isContainsGluten())
                .containsBenzoate(e.isContainsBenzoate())
                .fokozottFelugyelet(e.isFokozottFelugyelet())
                .packages(safeReadList(e.getPackagesJson(), new TypeReference<>() {}))
                .substitutes(safeReadList(e.getSubstitutesJson(), new TypeReference<>() {}))
                .finalSamples(safeReadList(e.getFinalSamplesJson(), new TypeReference<>() {}))
                .defectiveForms(safeReadList(e.getDefectiveFormsJson(), new TypeReference<>() {}))
                .hazipatikaInfo(safeReadObject(e.getHazipatikaJson(), new TypeReference<>() {}))
                .active(e.isActive())
                .build();
    }
}