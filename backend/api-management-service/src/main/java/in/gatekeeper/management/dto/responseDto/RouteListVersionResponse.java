package in.gatekeeper.management.dto.responseDto;

import lombok.Builder;

@Builder
public record RouteListVersionResponse(
        String routeId,
        PageResponse<RouteVersionResponse> versions
) { }
