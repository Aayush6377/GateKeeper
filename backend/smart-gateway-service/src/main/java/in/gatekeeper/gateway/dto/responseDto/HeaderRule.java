package in.gatekeeper.gateway.dto.responseDto;

import in.gatekeeper.gateway.enums.HeaderAction;
import in.gatekeeper.gateway.enums.HeaderDirection;

public record HeaderRule(
        HeaderDirection direction,
        HeaderAction action,
        String headerName,
        String headerValue
) { }
