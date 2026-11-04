package in.gatekeeper.management.dto.responseDto;

import in.gatekeeper.management.entity.RouteHeaderRule;
import in.gatekeeper.management.enums.HeaderAction;
import in.gatekeeper.management.enums.HeaderDirection;
import lombok.Builder;

@Builder
public record RouteHeaderRuleResponse(
        HeaderDirection direction,
        HeaderAction action,
        String headerName,
        String headerValue
) {
    public static RouteHeaderRuleResponse from(RouteHeaderRule headerRule){
        return RouteHeaderRuleResponse.builder()
                .direction(headerRule.getDirection())
                .action(headerRule.getAction())
                .headerName(headerRule.getHeaderName())
                .headerValue(headerRule.getHeaderValue())
                .build();
    }
}
