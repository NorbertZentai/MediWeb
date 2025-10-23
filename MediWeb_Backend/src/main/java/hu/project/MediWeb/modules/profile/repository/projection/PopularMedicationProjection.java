package hu.project.MediWeb.modules.profile.repository.projection;

public interface PopularMedicationProjection {
    Long getMedicationId();
    String getName();
    Long getUsageCount();
}
