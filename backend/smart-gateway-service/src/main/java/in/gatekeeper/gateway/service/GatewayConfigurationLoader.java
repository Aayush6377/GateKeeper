package in.gatekeeper.gateway.service;

import in.gatekeeper.gateway.client.ManagementApiClient;
import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GatewayConfigurationLoader implements ApplicationRunner {

    private final ManagementApiClient managementApiClient;
    private final RouteRegistry routeRegistry;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try{
            List<GatewayRoute> routes = managementApiClient.fetchActiveRoute();

            routeRegistry.replaceAll(routes);

            log.info("Successfully fetch and registered the routes");
        } catch (Exception e) {
            log.error("Error in registering the routes", e);
        }
    }
}
