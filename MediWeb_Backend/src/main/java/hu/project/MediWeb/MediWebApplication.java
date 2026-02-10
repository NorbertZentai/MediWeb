package hu.project.MediWeb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import hu.project.MediWeb.modules.notification.config.EmailNotificationProperties;

import org.springframework.data.web.config.EnableSpringDataWebSupport;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(EmailNotificationProperties.class)
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class MediWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(MediWebApplication.class, args);
	}

}
