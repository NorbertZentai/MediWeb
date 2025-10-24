package hu.project.MediWeb.modules.user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import hu.project.MediWeb.modules.user.dto.UserPreferencesDto;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.entity.UserPreferences;
import hu.project.MediWeb.modules.user.repository.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserPreferencesRepository preferencesRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public UserPreferencesDto getPreferencesFor(User user) {
        return preferencesRepository.findByUser(user)
                .map(this::deserializePayload)
                .orElseGet(UserPreferencesDto::defaultPreferences)
                .withDefaults();
    }

    @Transactional
    public UserPreferencesDto updatePreferences(User user, UserPreferencesDto incoming) {
        UserPreferencesDto safePreferences = incoming == null
                ? UserPreferencesDto.defaultPreferences()
                : incoming.withDefaults();

        String payload = serializePayload(safePreferences);

        UserPreferences entity = preferencesRepository.findByUser(user)
                .map(existing -> {
                    existing.setPreferencesPayload(payload);
                    return existing;
                })
                .orElseGet(() -> UserPreferences.builder()
                        .user(user)
                        .userId(user.getId())
                        .preferencesPayload(payload)
                        .build());

        preferencesRepository.save(entity);
        return safePreferences;
    }

    private UserPreferencesDto deserializePayload(UserPreferences entity) {
        try {
            UserPreferencesDto dto = objectMapper.readValue(entity.getPreferencesPayload(), UserPreferencesDto.class);
            return dto == null ? UserPreferencesDto.defaultPreferences() : dto.withDefaults();
        } catch (IOException e) {
            log.warn("Failed to parse preferences for user {}. Using defaults instead.", entity.getUserId(), e);
            return UserPreferencesDto.defaultPreferences();
        }
    }

    private String serializePayload(UserPreferencesDto preferences) {
        try {
            return objectMapper.writeValueAsString(preferences.withDefaults());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to serialize user preferences", e);
        }
    }
}
