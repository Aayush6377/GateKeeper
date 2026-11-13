package in.gatekeeper.management.dto.requestDto;

import in.gatekeeper.management.enums.RouteStatus;
import jakarta.validation.constraints.NotNull;

public record RouteStatusRequest(
        @NotNull RouteStatus status
) { }
