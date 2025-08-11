package hu.project.MediWeb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MediWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(MediWebApplication.class, args);
	}

}
