package in.gatekeeper.management.dto.requestDto;

import in.gatekeeper.management.enums.HeaderAction;
import in.gatekeeper.management.enums.HeaderDirection;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record HeaderRuleRequest(
        @NotNull
        HeaderDirection direction,

        @NotNull
        HeaderAction action,

        @NotBlank
        @Size(max = 200)
        String headerName,

        @Size(max = 2000)
        String headerValue
) { }
