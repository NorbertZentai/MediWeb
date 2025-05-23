package hu.project.MediTrack.modules.user.dto;

import hu.project.MediTrack.modules.user.entity.User;
import lombok.Builder;
import lombok.Data;

import java.util.Base64;

@Data
@Builder
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String phone_number;
    private String imageUrl;

    public static UserDTO from(User user) {
        if (user == null) {
            return null;
        }

        String imageUrl = null;

        if (user.getProfile_picture() != null && user.getProfile_picture().length > 0) {
            imageUrl = "data:image/jpeg;base64," +
                    Base64.getEncoder().encodeToString(user.getProfile_picture());
        }

        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone_number(user.getPhone_number())
                .imageUrl(imageUrl)
                .build();
    }
}