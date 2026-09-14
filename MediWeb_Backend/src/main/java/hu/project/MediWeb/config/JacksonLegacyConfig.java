package hu.project.MediWeb.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Boot 4 áttért a Jackson 3 (tools.jackson.*) alapértelmezett JSON stackre, így
 * a keretrendszer többé nem regisztrál automatikusan egy com.fasterxml.jackson.databind.ObjectMapper
 * beant. Néhány modul (pl. UserDataRequestService, UserPreferencesService) még explicit
 * konstruktor-injektálással ezt a Jackson 2 ObjectMapper-t várja, ezért itt biztosítjuk azt —
 * a jackson-databind függőség változatlanul a classpath-on van.
 */
@Configuration
public class JacksonLegacyConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
