package hu.project.MediWeb.modules.user.service;

import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.entity.UserDataRequest;
import hu.project.MediWeb.modules.user.enums.UserDataRequestType;
import hu.project.MediWeb.modules.user.repository.UserDataRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDataRequestService {

    private final UserDataRequestRepository requestRepository;
    private final JsonMapper objectMapper;

    @Transactional
    public void submitRequest(User user, UserDataRequestType type, Object metadata) {
        UserDataRequest request = UserDataRequest.builder()
                .user(user)
                .type(type)
                .metadata(serializeMetadata(metadata))
                .build();

        requestRepository.save(request);
        log.info("Recorded {} request for user {}", type, user.getId());
    }

    private String serializeMetadata(Object metadata) {
        if (metadata == null) {
            return null;
        }
        if (metadata instanceof String str) {
            return str;
        }
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JacksonException e) {
            log.warn("Failed to serialize metadata payload for user data request", e);
            return null;
        }
    }
}
