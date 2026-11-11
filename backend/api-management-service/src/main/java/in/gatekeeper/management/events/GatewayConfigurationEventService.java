package in.gatekeeper.management.events;

import in.gatekeeper.management.dto.responseDto.RouteResponse;
import in.gatekeeper.management.entity.ApiRoute;
import in.gatekeeper.management.enums.ConfigurationChangeType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GatewayConfigurationEventService {

    private final ApplicationEventPublisher eventPublisher;

    public void publish(ConfigurationChangeType changeType, UUID organizationId, ApiRoute route){
        RouteResponse routePayload = null;
        Long configurationVersion = null;
        String routeId = null;

        if (route != null){
            routePayload = RouteResponse.from(route);
            configurationVersion = routePayload.configurationVersion();
            routeId = routePayload.routeId();
        }

        eventPublisher.publishEvent(
                GatewayConfigurationChangeEvent.builder()
                        .eventId(UUID.randomUUID())
                        .eventType("GATEWAY_CONFIGURATION_CHANGE")
                        .changeType(changeType)
                        .organizationId(organizationId)
                        .routeId(routeId)
                        .configurationVersion(configurationVersion)
                        .routePayload(routePayload)
                        .occurredAt(Instant.now())
                        .build()
        );
    }
}
