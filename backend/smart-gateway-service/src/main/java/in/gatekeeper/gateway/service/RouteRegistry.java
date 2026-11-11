package in.gatekeeper.gateway.service;

import in.gatekeeper.gateway.modal.CompiledRoute;
import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import org.springframework.http.server.PathContainer;
import org.springframework.stereotype.Service;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class RouteRegistry {

    private final PathPatternParser parser = new PathPatternParser();
    private final ConcurrentHashMap<String, CompiledRoute> routeMap = new ConcurrentHashMap<>();
    private final AtomicReference<List<CompiledRoute>> sortedRouteRef = new AtomicReference<>(Collections.emptyList());

    public void replaceAll(List<GatewayRoute> gatewayRoutes){
        routeMap.clear();
        upsertAll(gatewayRoutes);
    }

    public void upsert(GatewayRoute route){
        if (route == null || route.routeId() == null) return;

        PathPattern pathPattern = parser.parse(route.pathPattern());
        CompiledRoute compiledRoute = CompiledRoute.builder()
                .gatewayRoute(route)
                .pathPattern(pathPattern)
                .sourcePathPrefix(sourcePrefix(route.pathPattern()))
                .build();

        routeMap.put(route.routeId(), compiledRoute);
        rebuildSortedList();
    }

    public void remove(String routeId) {
        if (routeId == null) return;
        routeMap.remove(routeId);
        rebuildSortedList();
    }

    public void removeRoutesByOrganization(UUID organizationId){
        if (organizationId == null) return;

        routeMap.values().removeIf(compiledRoute ->
                organizationId.equals(compiledRoute.gatewayRoute().organizationId())
        );

        rebuildSortedList();
    }

    public void upsertAll(List<GatewayRoute> gatewayRoutes){
        if (gatewayRoutes == null) return;

        gatewayRoutes.forEach(route -> {
            PathPattern pathPattern = parser.parse(route.pathPattern());

            CompiledRoute compiledRoute = CompiledRoute.builder()
                    .gatewayRoute(route)
                    .pathPattern(pathPattern)
                    .sourcePathPrefix(sourcePrefix(route.pathPattern()))
                    .build();

            routeMap.put(route.routeId(), compiledRoute);
        });

        rebuildSortedList();
    }


    public Optional<CompiledRoute> find(String pathPattern){
        PathContainer pathContainer = PathContainer.parsePath(pathPattern);

        for (CompiledRoute route: sortedRouteRef.get()){
            if (route.pathPattern().matches(pathContainer)){
                return Optional.of(route);
            }
        }

        return Optional.empty();
    }

    private void rebuildSortedList() {
        List<CompiledRoute> compiledRoutes = new ArrayList<>(routeMap.values());

        compiledRoutes.sort((first, second) ->
                PathPattern.SPECIFICITY_COMPARATOR.compare(
                        first.pathPattern(),
                        second.pathPattern()
                )
        );

        sortedRouteRef.set(Collections.unmodifiableList(compiledRoutes));
    }

    private String sourcePrefix(String pathPattern) {
        if (pathPattern.endsWith("/**")){
            return pathPattern.substring(0, pathPattern.length() - 3);
        }

        return pathPattern;
    }
}
