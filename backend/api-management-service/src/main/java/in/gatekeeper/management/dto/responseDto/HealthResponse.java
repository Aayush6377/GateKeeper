package in.gatekeeper.management.dto.responseDto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record HealthResponse (
        String serviceName,
        String serviceDescription,
        String appStatus,
        String databaseStatus,
        LocalDateTime timestamp
){ }
