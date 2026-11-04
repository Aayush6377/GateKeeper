package in.gatekeeper.gateway.dto.responseDto;

import lombok.Builder;

@Builder
public record HealthResponse (
        String serviceName,
        String serviceDescription,
        String appStatus
){}
