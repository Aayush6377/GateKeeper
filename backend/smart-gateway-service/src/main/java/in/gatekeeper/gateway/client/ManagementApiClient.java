package in.gatekeeper.gateway.client;

import in.gatekeeper.gateway.dto.requestDto.LoginRequest;
import in.gatekeeper.gateway.dto.requestDto.RefreshTokenRequest;
import in.gatekeeper.gateway.dto.responseDto.GatewayRoute;
import in.gatekeeper.gateway.dto.responseDto.LoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
public class ManagementApiClient {
    private final RestClient restClient;
    private final String username;
    private final String password;

    private String accessToken;
    private String refreshToken;
    private Instant expireAt;


    public ManagementApiClient(
            @Value("${management-api-base-url}") String baseUrl,
            @Value("${management-api-username}") String username,
            @Value("${management-api-password}") String password
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();

        this.username = username;
        this.password = password;
    }

    public List<GatewayRoute> fetchActiveRoute(){
        ensureToken();
        try{
            return requestRoutes("/api/v1/gateway/routes");
        } catch (HttpClientErrorException exception){
            if (exception.getStatusCode() != HttpStatus.UNAUTHORIZED){
                throw exception;
            }

            refreshOrAuthenticate();
            return requestRoutes("/api/v1/gateway/routes");
        }
    }

    public List<GatewayRoute> fetchOrganizationRoute(UUID organizationId){
        ensureToken();
        try{
            return requestRoutes("/api/v1/gateway/routes/" + organizationId);
        } catch (HttpClientErrorException exception){
            if (exception.getStatusCode() != HttpStatus.UNAUTHORIZED){
                throw exception;
            }

            refreshOrAuthenticate();
            return requestRoutes("/api/v1/gateway/routes/" + organizationId);
        }
    }

    private List<GatewayRoute> requestRoutes(String url) {
        return restClient.get()
                .uri(url)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    private synchronized void ensureToken() {
        if (accessToken == null) {
            authenticate();
            return;
        }

        if (expireAt == null || Instant.now().plusSeconds(30).isAfter(expireAt)) {
            refreshOrAuthenticate();
        }
    }

    private synchronized void refreshOrAuthenticate() {
        if (refreshToken == null) {
            authenticate();
            return;
        }
        try {
            refresh();
        } catch (HttpClientErrorException exception) {
            if (exception.getStatusCode() != HttpStatus.UNAUTHORIZED) {
                throw exception;
            }
            authenticate();
        }
    }

    private synchronized void authenticate() {
        LoginResponse response = restClient.post()
                .uri("/api/v1/auth/login")
                .body(new LoginRequest(username, password))
                .retrieve()
                .body(LoginResponse.class);

        if (response == null || response.accessToken() == null){
            throw new IllegalStateException("API Management did not return a access token");
        }

        this.accessToken = response.accessToken();
        this.refreshToken = response.refreshToken();
        this.expireAt = Instant.now().plusSeconds(response.expiresInSeconds());
    }

    private synchronized void refresh(){
        if (refreshToken == null){
            throw new RuntimeException("Refresh token not present");
        }

        LoginResponse response = restClient.post()
                .uri("/api/v1/auth/refresh")
                .body(new RefreshTokenRequest(refreshToken))
                .retrieve()
                .body(LoginResponse.class);

        if (response == null || response.accessToken() == null){
            throw new IllegalStateException("API Management did not return a access token");
        }

        this.accessToken = response.accessToken();
        this.refreshToken = response.refreshToken();
        this.expireAt = Instant.now().plusSeconds(response.expiresInSeconds());
    }
}
