package in.gatekeeper.management.dto.projectionDto;

import in.gatekeeper.management.enums.HeaderAction;
import in.gatekeeper.management.enums.HeaderDirection;

public interface GatewayHeaderRuleProjection {
    HeaderDirection getDirection();

    HeaderAction getAction();

    String getHeaderName();

    String getHeaderValue();
}
