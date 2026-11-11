package in.gatekeeper.management.validation;

import in.gatekeeper.management.dto.requestDto.HeaderRuleRequest;
import in.gatekeeper.management.dto.requestDto.RouteRequest;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.enums.HeaderAction;
import in.gatekeeper.management.enums.RouteStatus;
import in.gatekeeper.management.repository.ApiRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.pattern.PathPatternParser;
import org.springframework.web.util.pattern.PatternParseException;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RouteRequestValidator {

    private final PathPatternParser pathPatternParser = new PathPatternParser();
    private final ApiRouteRepository apiRouteRepository;

    private static final Set<String> RESTRICTED_HEADERS = Set.of(
            "connection",
            "keep-alive",
            "proxy-authenticate",
            "proxy-authorization",
            "te",
            "trailer",
            "transfer-encoding",
            "upgrade",
            "host",
            "content-length"
    );

    public void validate(RouteRequest request) {

        validatePathPattern(request.pathPattern());

        validateTargetBaseUrl(request.targetBaseUrl());

        validateTargetPathPrefix(request.targetPathPrefix());

        validateHeaderRules(request.headerRules());
    }

    public void validateUniquePathPattern(String pathPattern, UUID organizationId) {
        boolean exists = apiRouteRepository.existsByOrganizationIdAndPathPatternAndStatusNot(
                organizationId,
                pathPattern,
                RouteStatus.DELETED
        );

        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A route with this path pattern already exists");
        }
    }

    public void validateUniquePathPattern(String pathPattern, UUID organizationId, UUID routeId) {
        boolean exists = apiRouteRepository.existsByOrganizationIdAndPathPatternAndStatusNotAndIdNot(
                organizationId,
                pathPattern,
                RouteStatus.DELETED,
                routeId
        );

        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Another route with this path pattern already exists");
        }
    }

    private void validatePathPattern(String pathPattern) {

        if (!pathPattern.startsWith("/")
                || pathPattern.contains("//")
                || pathPattern.contains("\\")
                || pathPattern.contains("?")
                || pathPattern.contains("#")
                || pathPattern.contains("%2f")
                || pathPattern.contains("%2F")
                || pathPattern.contains("%5c")
                || pathPattern.contains("%5C")) {

            badRequest("Invalid pathPattern");
        }

        if (containsDotSegment(pathPattern)) {
            badRequest("Path pattern cannot contain '.' or '..' path segments");
        }

        try {
            pathPatternParser.parse(pathPattern);
        } catch (PatternParseException e) {
            badRequest("Invalid path pattern: " + pathPattern);
        }
    }

    private void validateTargetBaseUrl(String targetBaseUrl) {

        try {
            URI uri = URI.create(targetBaseUrl);

            String scheme = uri.getScheme();

            if (!uri.isAbsolute()
                    || scheme == null
                    || (!scheme.equalsIgnoreCase("http")
                    && !scheme.equalsIgnoreCase("https"))
                    || uri.getHost() == null
                    || uri.getHost().isBlank()
                    || uri.getUserInfo() != null
                    || uri.getQuery() != null
                    || uri.getFragment() != null
                    || (uri.getPort() != -1
                    && (uri.getPort() < 1 || uri.getPort() > 65535))) {

                badRequest("targetBaseUrl must be a valid absolute HTTP or HTTPS URL without credentials, query parameters, or fragments");
            }

            String path = uri.getPath();

            if (path != null && !path.isEmpty() && !path.equals("/")) {
                badRequest("targetBaseUrl must not contain a path. Use targetPathPrefix instead.");
            }

        } catch (IllegalArgumentException e) {
            badRequest("targetBaseUrl must be a valid HTTP or HTTPS URL");
        }
    }

    private void validateTargetPathPrefix(String prefix) {

        if (prefix == null || prefix.isEmpty()) {
            return;
        }

        if (!prefix.startsWith("/")
                || prefix.startsWith("//")
                || prefix.contains("\\")
                || prefix.contains("?")
                || prefix.contains("#")
                || prefix.contains("%2f")
                || prefix.contains("%2F")
                || prefix.contains("%5c")
                || prefix.contains("%5C")
                || containsDotSegment(prefix)) {

            badRequest("Invalid targetPathPrefix");
        }

        try {
            URI uri = URI.create(prefix);

            if (uri.isAbsolute()
                    || uri.getRawAuthority() != null
                    || uri.getRawQuery() != null
                    || uri.getRawFragment() != null) {

                badRequest("targetPathPrefix must contain only a path");
            }

        } catch (IllegalArgumentException e) {
            badRequest("Invalid targetPathPrefix");
        }
    }

    private void validateHeaderRules(List<HeaderRuleRequest> rules) {

        for (HeaderRuleRequest rule : rules) {

            validateHeaderName(rule.headerName());

            validateHeaderValue(rule);

            validateHeaderAction(rule);
        }
    }

    private void validateHeaderName(String headerName) {

        if (headerName == null
                || !headerName.matches(
                "^[!#$%&'*+.^_`|~0-9a-zA-Z-]+$"
        )) {

            badRequest("Invalid HTTP header name: " + headerName);
        }

        String normalizedName = headerName.toLowerCase(Locale.ROOT);

        if (RESTRICTED_HEADERS.contains(normalizedName)) {
            badRequest("This HTTP header cannot be modified: " + headerName);
        }
    }

    private void validateHeaderValue(HeaderRuleRequest rule) {

        String value = rule.headerValue();

        if (value != null && (value.contains("\r") || value.contains("\n"))) {
            badRequest("HTTP header values cannot contain CR or LF characters");
        }

        if (value != null && value.length() > 2000) {
            badRequest("HTTP header value exceeds the maximum length");
        }
    }

    private void validateHeaderAction(HeaderRuleRequest rule) {

        if (rule.action() == HeaderAction.REMOVE) {

            if (rule.headerValue() != null) {
                badRequest("headerValue must be null when action is REMOVE");
            }

        } else if (rule.action() == HeaderAction.ADD || rule.action() == HeaderAction.SET) {

            if (rule.headerValue() == null) {
                badRequest("headerValue is required for ADD and SET actions");
            }
        }
    }

    private boolean containsDotSegment(String path) {

        String[] segments = path.split("/");

        for (String segment : segments) {
            if (segment.equals(".") || segment.equals("..")) {
                return true;
            }
        }

        return false;
    }

    private void badRequest(String message) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}