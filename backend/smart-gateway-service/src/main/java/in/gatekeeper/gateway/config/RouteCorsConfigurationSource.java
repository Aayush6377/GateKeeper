package in.gatekeeper.gateway.config;

import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import in.gatekeeper.gateway.modal.CompiledRoute;
import in.gatekeeper.gateway.service.RouteRegistry;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class RouteCorsConfigurationSource implements CorsConfigurationSource {

    private final RouteRegistry routeRegistry;

    @Value("${app.cors.allowed-origins}")
    private String globalFrontendUrl;

    @Override
    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        String requestUri = request.getRequestURI();

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));

        Optional<CompiledRoute> matchedRoute = routeRegistry.find(requestUri);

        List<String> allowedOriginsList = new ArrayList<>();

        if (globalFrontendUrl != null && !globalFrontendUrl.isBlank()) {
            for (String url : globalFrontendUrl.split(",")) {
                allowedOriginsList.add(url.trim());
            }
        }

        if (matchedRoute.isPresent()){
            GatewayRoute route = matchedRoute.get().gatewayRoute();

            if (route.allowedMethods() != null && !route.allowedMethods().isEmpty()){
                config.setAllowedMethods(
                        route.allowedMethods().stream()
                                .map(Enum::name)
                                .toList()
                );
            }
            else{
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
            }

            Set<String> routeOrigins = route.allowedOrigins();
            if (routeOrigins == null || routeOrigins.isEmpty() || routeOrigins.contains("*")){
                config.setAllowedOriginPatterns(List.of("*"));
                return config;
            }
            else {
                allowedOriginsList.addAll(routeOrigins);
            }
        }

        List<String> finalOrigins = allowedOriginsList.stream().distinct().toList();

        if (origin != null && finalOrigins.contains(origin)){
            config.setAllowedOriginPatterns(List.of(origin));
        }
        else if (finalOrigins.contains("*")){
            config.setAllowedOriginPatterns(List.of("*"));
        }
        else {
            config.setAllowedOriginPatterns(finalOrigins);
        }

        return config;
    }
}
