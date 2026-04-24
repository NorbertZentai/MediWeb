package hu.project.MediWeb.modules.admin.dto;

import hu.project.MediWeb.modules.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Boolean isActive;
    private LocalDateTime registrationDate;
    private LocalDateTime lastLogin;

    public static AdminUserDTO from(User user) {
        return AdminUserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .isActive(user.getIs_active())
                .registrationDate(user.getRegistration_date())
                .lastLogin(user.getLast_login())
                .build();
    }
}
