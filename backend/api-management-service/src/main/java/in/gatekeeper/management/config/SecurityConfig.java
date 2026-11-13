package in.gatekeeper.management.config;

import in.gatekeeper.management.enums.RoleName;
import in.gatekeeper.management.service.ManagementUserDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Configuration
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigin;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity, DaoAuthenticationProvider authenticationProvider){
        httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider)
                .authorizeHttpRequests(
                authorize -> authorize
                        .requestMatchers(HttpMethod.GET, "/health").permitAll()
                        .requestMatchers("/actuator/**").hasRole(RoleName.PLATFORM_ADMIN.name())
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/audit/**").hasAnyRole(RoleName.PLATFORM_ADMIN.name(), RoleName.TENANT_ADMIN.name())
                        .requestMatchers("/api/v1/platform/**").hasRole(RoleName.PLATFORM_ADMIN.name())
                        .requestMatchers("/api/v1/tenant/**").hasRole(RoleName.TENANT_ADMIN.name())
                        .requestMatchers("/api/v1/gateway/**").hasRole(RoleName.GATEWAY_SERVICE.name())
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth ->
                        oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return httpSecurity.build();
    }

    @Bean
    public SecretKey secretKey(@Value("${security.jwt.secret-key}") String jwtSecretKey){
        return new SecretKeySpec(
                jwtSecretKey.getBytes(StandardCharsets.UTF_8),
                MacAlgorithm.HS256.getName()
        );
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtEncoder jwtEncoder(SecretKey secretKey){
        return NimbusJwtEncoder
                .withSecretKey(secretKey)
                .algorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public JwtDecoder jwtDecoder(SecretKey secretKey){
        return NimbusJwtDecoder
                .withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(
            ManagementUserDetailsService managementUserDetailsService,
            PasswordEncoder passwordEncoder
    ){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(managementUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    @Bean
    public ProviderManager providerManager(DaoAuthenticationProvider daoAuthenticationProvider){
        return new ProviderManager(daoAuthenticationProvider);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(allowedOrigin));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/health", configuration);
        source.registerCorsConfiguration("/api/v1/**", configuration);
        source.registerCorsConfiguration("/actuator/**", configuration);
        return source;
    }

    private Converter<Jwt,AbstractAuthenticationToken> jwtAuthenticationConverter() {
        return jwt -> {
            String role = jwt.getClaimAsString("role");

            if (role == null || role.isBlank()){
                throw new BadCredentialsException("Missing role claim");
            }

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

            return new JwtAuthenticationToken(
                    jwt,
                    Collections.singletonList(authority),
                    Objects.requireNonNull(jwt.getSubject())
            );
        };
    }
}
