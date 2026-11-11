package in.gatekeeper.gateway.service;

import in.gatekeeper.gateway.dto.responseDto.HeaderRule;
import in.gatekeeper.gateway.enums.HeaderAction;
import in.gatekeeper.gateway.enums.HeaderDirection;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class HeaderTransformationService {

    private static final Set<String> RESTRICTED_HEADERS = Set.of(
            "host", "connection", "content-length", "transfer-encoding", "upgrade", "keep-alive"
    );

    public void applyRules(HttpHeaders headers, List<HeaderRule> rules, HeaderDirection targetDirection){
        if (rules == null || rules.isEmpty()){
            return;
        }

        for (HeaderRule rule: rules){
            if (rule.direction() != targetDirection) continue;

            String headerName = rule.headerName();
            if (headerName == null || RESTRICTED_HEADERS.contains(headerName)){
                continue;
            }

            HeaderAction action = rule.action();
            String headerValue = rule.headerValue();

            switch (action){
                case ADD -> {
                    if (headerValue != null){
                        headers.add(headerName, headerValue);
                    }
                }

                case SET -> {
                    if (headerValue != null){
                        headers.set(headerName, headerValue);
                    }
                }

                case REMOVE -> headers.remove(headerName);
            }
        }
    }
}
