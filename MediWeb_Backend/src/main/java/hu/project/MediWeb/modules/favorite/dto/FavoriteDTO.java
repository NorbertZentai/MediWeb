package hu.project.MediWeb.modules.favorite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteDTO {
    private Long id;
    private Long userId;
    private Long medicationId;
    private String medicationName;
}
