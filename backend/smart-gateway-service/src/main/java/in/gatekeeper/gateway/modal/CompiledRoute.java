package in.gatekeeper.gateway.modal;

import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import lombok.Builder;
import org.springframework.web.util.pattern.PathPattern;

@Builder
public record CompiledRoute(
        GatewayRoute gatewayRoute,
        PathPattern pathPattern,
        String sourcePathPrefix
) { }
