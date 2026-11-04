package in.gatekeeper.analytics.dto.responseDto;

import lombok.Builder;

@Builder
public record HealthResponse (
        String serviceName,
        String serviceDescription,
        String appStatus
){}
