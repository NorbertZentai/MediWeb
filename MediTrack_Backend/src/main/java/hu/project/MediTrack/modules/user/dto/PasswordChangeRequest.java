package hu.project.MediTrack.modules.user.dto;

import lombok.Data;

@Data
public class PasswordChangeRequest {
    private String currentPassword;
    private String newPassword;
    private String reNewPassword;
}