package in.gatekeeper.management.service;

import in.gatekeeper.management.entity.ManagementUser;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.enums.OrganizationStatus;
import in.gatekeeper.management.repository.ManagementUserRepository;
import in.gatekeeper.management.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.AccessDeniedException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TenantContext {

    private final OrganizationRepository organizationRepository;
    private final ManagementUserRepository managementUserRepository;

    private JwtAuthenticationToken getAuthentication() throws AccessDeniedException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwtAuth) || !authentication.isAuthenticated()){
            throw new AccessDeniedException("User is not authenticated");
        }

        return jwtAuth;
    }

    public UUID getUserId() throws AccessDeniedException {
        String userId = getAuthentication().getToken().getClaimAsString("userId");

        if (userId == null || userId.isBlank()){
            throw new BadCredentialsException("User ID is missing");
        }

        try{
            return UUID.fromString(userId);
        } catch (IllegalArgumentException ex){
            throw new BadCredentialsException("Invalid User ID", ex);
        }
    }

    public UUID getOrganizationId() throws AccessDeniedException {
        String organizationId = getAuthentication().getToken().getClaimAsString("organizationId");

        if (organizationId == null || organizationId.isBlank()) {
            throw new AccessDeniedException("Organization ID is missing");
        }

        try {
            return UUID.fromString(organizationId);
        } catch (IllegalArgumentException ex) {
            throw new BadCredentialsException("Invalid Organization ID", ex);
        }
    }

    public Organization getOrganization() {
        try {
            UUID organizationId = getOrganizationId();
            Organization organization = organizationRepository.findById(organizationId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization Not Found"));

            if (organization.getStatus() != OrganizationStatus.ACTIVE){
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "The organization is not active");
            }

            return organization;

        } catch (ResponseStatusException e){
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage());
        }
    }

    public ManagementUser getManagementUser(){
        try {
            UUID userId = getUserId();
            return managementUserRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not Found"));

        } catch (ResponseStatusException e){
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage());
        }
    }
}
