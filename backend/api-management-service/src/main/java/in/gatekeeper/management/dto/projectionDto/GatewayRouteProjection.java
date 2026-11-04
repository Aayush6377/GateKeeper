package in.gatekeeper.management.dto.projectionDto;

import in.gatekeeper.management.enums.HttpMethod;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface GatewayRouteProjection {

    UUID getId();

    String getRouteId();

    String getPathPattern();

    String getTargetBaseUrl();

    String getTargetPathPrefix();

    Integer getRequestsPerMinute();

    Integer getResponseTimeoutMs();

    boolean isIdempotencyEnabled();

    Long getConfigurationVersion();

    Set<HttpMethod> getAllowedMethods();

    List<GatewayHeaderRuleProjection> getHeaderRules();
}
