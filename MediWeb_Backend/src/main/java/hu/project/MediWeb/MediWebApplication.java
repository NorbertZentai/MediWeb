package hu.project.MediWeb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import hu.project.MediWeb.modules.notification.config.EmailNotificationProperties;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(EmailNotificationProperties.class)
public class MediWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(MediWebApplication.class, args);
	}

}
