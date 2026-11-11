package in.gatekeeper.gateway.event;

import in.gatekeeper.gateway.client.ManagementApiClient;
import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import in.gatekeeper.gateway.service.RouteRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ConfigurationEventConsumer {

    private final RouteRegistry routeRegistry;
    private final ManagementApiClient apiClient;
    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = "${gateway-kafka-configuration-topic}",
            groupId = "${gateway-kafka-configuration-group}"
    )
    public void configurationChanged(String event, Acknowledgment acknowledgment){
        GatewayConfigurationChangeEvent changeEvent;
        try {
            changeEvent = objectMapper.readValue(event, GatewayConfigurationChangeEvent.class);
        } catch (JacksonException e) {
            log.error("Unable to parse the configuration event payload: {}", event, e);
            acknowledgment.acknowledge();
            return;
        }

        try{
            log.info("Processing gateway configuration event: Type={}, OrgId={}, RouteId={}",
                    changeEvent.changeType(), changeEvent.organizationId(), changeEvent.routeId());

            switch (changeEvent.changeType()){
                case ROUTE_CREATED, ROUTE_UPDATED, ROUTE_ACTIVATED, ROUTE_VERSION_RESTORED -> {
                    if (changeEvent.routePayload() != null){
                        routeRegistry.upsert(changeEvent.routePayload());
                        log.info("Upserted route: {}", changeEvent.routeId());
                    }
                }

                case ROUTE_DELETED, ROUTE_DEACTIVATED -> {
                    if (changeEvent.routeId() != null){
                        routeRegistry.remove(changeEvent.routeId());
                        log.info("Removed route: {}", changeEvent.routeId());
                    }
                }

                case ORGANIZATION_DELETED, ORGANIZATION_DEACTIVATED -> {
                    if (changeEvent.organizationId() != null){
                        routeRegistry.removeRoutesByOrganization(changeEvent.organizationId());
                        log.info("Purged all routes for deactivated/deleted organization: {}", changeEvent.organizationId());
                    }
                }

                case ORGANIZATION_UPDATED, ORGANIZATION_ACTIVATED, ORGANIZATION_RESTORED -> {
                    if (changeEvent.organizationId() != null){
                        try {
                            List<GatewayRoute> orgRoutes = apiClient.fetchOrganizationRoute(changeEvent.organizationId());
                            routeRegistry.upsertAll(orgRoutes);
                            log.info("Successfully synced {} routes for organization: {}", orgRoutes.size(), changeEvent.organizationId());
                        } catch (Exception e) {
                            log.error("Failed to fetch routes for organizationId: {}", changeEvent.organizationId(), e);
                        }
                    }
                }

                default -> log.warn("Unhandled configuration change type: {}", changeEvent.changeType());
            }

        } catch (Exception e) {
            log.error("Failed to apply configuration change event to registry", e);
        } finally {
            acknowledgment.acknowledge();
        }
    }
}
