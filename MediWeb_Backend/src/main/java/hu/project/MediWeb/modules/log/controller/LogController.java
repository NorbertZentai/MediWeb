package hu.project.MediWeb.modules.log.controller;

import hu.project.MediWeb.modules.log.dto.LogRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logs")
@Slf4j
public class LogController {

    @PostMapping
    public ResponseEntity<Void> receiveLog(@RequestBody LogRequest logRequest) {
        String baseMessage = "📱 [CLIENT LOG]";
        String level = logRequest.getLevel() != null ? logRequest.getLevel().toUpperCase() : "INFO";
        String message = logRequest.getMessage() != null ? logRequest.getMessage() : "No message provided";
        String deviceInfo = logRequest.getDeviceInfo() != null ? logRequest.getDeviceInfo() : "Unknown device";

        switch (level) {
            case "ERROR":
            case "FATAL":
                log.error("{} [ERROR] {} | Device: {}", baseMessage, message, deviceInfo);
                if (logRequest.getStackTrace() != null) {
                    log.error("{} StackTrace: \n{}", baseMessage, logRequest.getStackTrace());
                }
                break;
            case "WARN":
                log.warn("{} [WARN] {} | Device: {}", baseMessage, message, deviceInfo);
                break;
            default:
                log.info("{} [INFO] {} | Device: {}", baseMessage, message, deviceInfo);
        }

        if (logRequest.getAdditionalInfo() != null) {
            log.debug("{} Additional Info: {}", baseMessage, logRequest.getAdditionalInfo());
        }

        return ResponseEntity.ok().build();
    }
}
