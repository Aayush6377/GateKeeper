package in.gatekeeper.gateway.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Getter
public class GatewayPolicyException extends ResponseStatusException {

    private final String outcome;

    public GatewayPolicyException(HttpStatus status, String message, String outcome) {
        super(status, message);
        this.outcome = outcome;
    }
}
