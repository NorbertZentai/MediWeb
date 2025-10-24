package hu.project.MediWeb.modules.user.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.entity.UserDataRequest;
import hu.project.MediWeb.modules.user.enums.UserDataRequestType;
import hu.project.MediWeb.modules.user.repository.UserDataRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDataRequestService {

    private final UserDataRequestRepository requestRepository;
    private final ObjectMapper objectMapper;

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
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize metadata payload for user data request", e);
            return null;
        }
    }
}
