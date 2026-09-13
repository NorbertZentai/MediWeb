package hu.project.MediWeb.modules.user.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import hu.project.MediWeb.modules.user.enums.UserRole;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit teszt (issue #45): a User entitás password mezője semmilyen szerializált
 * válaszban nem jelenhet meg (@JsonIgnore vagy @JsonProperty(access = WRITE_ONLY)),
 * mert a bcrypt hash kikerülése a bejelentkezési adatok kompromittálódását jelentené.
 */
class UserSerializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void serializingUser_neverExposesPasswordField() throws Exception {
        User user = User.builder()
                .id(1L)
                .name("teszt")
                .email("teszt@test.com")
                .password("$2a$10$secretBcryptHashValue")
                .role(UserRole.USER)
                .build();

        String json = objectMapper.writeValueAsString(user);

        assertThat(json).doesNotContain("secretBcryptHashValue");
        assertThat(json).doesNotContain("\"password\"");
    }
}
