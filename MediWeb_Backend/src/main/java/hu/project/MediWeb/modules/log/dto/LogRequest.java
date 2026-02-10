package hu.project.MediWeb.modules.log.dto;

import lombok.Data;

@Data
public class LogRequest {
    private String level; // INFO, WARN, ERROR, FATAL
    private String message;
    private String stackTrace;
    private String additionalInfo;
    private String deviceInfo;
    private String timestamp;
}
