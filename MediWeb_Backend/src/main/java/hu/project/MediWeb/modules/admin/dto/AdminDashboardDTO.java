package hu.project.MediWeb.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {
    private long totalUsers;
    private long activeUsers;
    private long totalMedications;
    private long totalReviews;
    private long uncheckedReviews;
    private long reportedReviews;
}
