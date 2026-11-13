package in.gatekeeper.management.service;

import in.gatekeeper.management.annotations.Auditable;
import in.gatekeeper.management.dto.requestDto.*;
import in.gatekeeper.management.dto.responseDto.*;
import in.gatekeeper.management.entity.ApiRoute;
import in.gatekeeper.management.entity.ManagementUser;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.entity.Role;
import in.gatekeeper.management.enums.AuditResult;
import in.gatekeeper.management.enums.ConfigurationChangeType;
import in.gatekeeper.management.enums.OrganizationStatus;
import in.gatekeeper.management.enums.RoleName;
import in.gatekeeper.management.events.GatewayConfigurationEventService;
import in.gatekeeper.management.repository.ApiRouteRepository;
import in.gatekeeper.management.repository.ManagementUserRepository;
import in.gatekeeper.management.repository.OrganizationRepository;
import in.gatekeeper.management.repository.RoleRepository;
import in.gatekeeper.management.service.audit.AuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final ManagementUserRepository managementUserRepository;
    private final RoleRepository roleRepository;
    private final TenantContext tenantContext;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final GatewayConfigurationEventService configurationEventService;

    @Transactional
    @Auditable(
            action = "CREATE_ORGANIZATION",
            resourceType = "ORGANIZATION",
            organizationId = "#result.id",
            resourceId = "#result.id",
            details = "Organization created in PENDING status"
    )
    public OrganizationResponse create(OrganizationRequest request) {
        checkUnique(request.name(), request.slug(), null);

        Organization newOrganization = new Organization();
        newOrganization.setName(request.name());
        newOrganization.setSlug(request.slug());
        newOrganization.setStatus(OrganizationStatus.PENDING);

        Organization savedOrganization = organizationRepository.save(newOrganization);

        return OrganizationResponse.from(savedOrganization);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrganizationResponse> findAll(PaginationRequest request) {
        Pageable pageable = request.toPageable();
        Page<Organization> organizations;

        if (request.search().isBlank()) {
            organizations = organizationRepository.findAllByStatusNot(OrganizationStatus.DELETED, pageable);
        }
        else {
            organizations = organizationRepository.findByStatusNotAndNameContainingIgnoreCase(
                    OrganizationStatus.DELETED,
                    request.search(),
                    pageable
            );
        }

        return PageResponse.from(organizations, OrganizationResponse::from);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse findById(UUID id) {
        return OrganizationResponse.from(getOrganization(id));
    }

    @Transactional
    @Auditable(
            action = "UPDATE_ORGANIZATION",
            resourceType = "ORGANIZATION",
            organizationId = "#p0",
            resourceId = "#p0",
            details = "Organization name and slug updated"
    )
    public OrganizationResponse update(UUID id, OrganizationRequest request) {
        Organization organization = getOrganization(id);
        checkUnique(request.name(), request.slug(), id);

        boolean slugUpdated = !organization.getSlug().equals(request.slug());

        organization.setName(request.name());
        organization.setSlug(request.slug());

        if (slugUpdated){
            configurationEventService.publish(
                    ConfigurationChangeType.ORGANIZATION_UPDATED,
                    organization.getId(),
                    null
            );
        }

        return OrganizationResponse.from(organization);
    }

    @Transactional
    @Auditable(
            action = "CHANGE_ORGANIZATION_STATUS",
            resourceType = "ORGANIZATION",
            organizationId = "#p0",
            resourceId = "#p0",
            details = "Organization status changed"
    )
    public OrganizationResponse changeStatus(UUID id, OrganizationStatusRequest request) {
        Organization organization = getOrganization(id);

        if (request.status() == OrganizationStatus.DELETED){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "use DELETE endpoint for this operation");
        }

        organization.setStatus(request.status());

        ConfigurationChangeType configurationChangeType = organization.getStatus() == OrganizationStatus.ACTIVE ?
                ConfigurationChangeType.ORGANIZATION_ACTIVATED :
                ConfigurationChangeType.ORGANIZATION_DEACTIVATED;

        configurationEventService.publish(
                configurationChangeType,
                organization.getId(),
                null
        );

        return OrganizationResponse.from(organization);
    }

    @Transactional
    @Auditable(
            action = "DELETE_ORGANIZATION",
            resourceType = "ORGANIZATION",
            organizationId = "#p0",
            resourceId = "#p0",
            details = "Organization soft-deleted"
    )
    public void delete(UUID id) {
        Organization organization = getOrganization(id);
        organization.setStatus(OrganizationStatus.DELETED);
        organization.setDeletedAt(Instant.now());

        configurationEventService.publish(
                ConfigurationChangeType.ORGANIZATION_DELETED,
                organization.getId(),
                null
        );
    }

    @Transactional
    @Auditable(
            action = "RESTORE_ORGANIZATION",
            resourceType = "ORGANIZATION",
            organizationId = "#p0",
            resourceId = "#p0",
            details = "Organization restored from soft-deleted state"
    )
    public OrganizationResponse restore(UUID id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        organization.setStatus(OrganizationStatus.ACTIVE);
        organization.setDeletedAt(null);

        configurationEventService.publish(
                ConfigurationChangeType.ORGANIZATION_RESTORED,
                organization.getId(),
                null
        );

        return OrganizationResponse.from(organization);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrganizationResponse> findAllDeletedOrganization(PaginationRequest request) {
        Pageable pageable = request.toPageable();
        Page<Organization> organizations;

        if (request.search().isBlank()) {
            organizations = organizationRepository.findAllByStatus(OrganizationStatus.DELETED, pageable);
        }
        else {
            organizations = organizationRepository.findAllByStatusAndNameContainingIgnoreCase(
                    OrganizationStatus.DELETED,
                    request.search(),
                    pageable
            );
        }

        return PageResponse.from(organizations, OrganizationResponse::from);
    }

    @Transactional(readOnly = true)
    public List<OrganizationNameDto> getOrganizationNamesBatch(List<UUID> organizationIds) {
        if (organizationIds == null || organizationIds.isEmpty()){
            return List.of();
        }

        List<Organization> organizations = organizationRepository.findAllById(organizationIds);

        return organizations.stream()
                .map(OrganizationNameDto::from)
                .toList();
    }

    @Transactional
    @Auditable(
            action = "CREATE_TENANT_ADMIN",
            resourceType = "MANAGEMENT_USER",
            organizationId = "#p0",
            resourceId = "#result.id",
            details = "Tenant administrator created"
    )
    public TenantAdminResponse createTenantAdmin(UUID organizationId, TenantAdminRequest request) {
        Organization organization = getOrganization(organizationId);

        if (organization.getStatus() != OrganizationStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot create tenant admin for an inactive organization");
        }

        if (managementUserRepository.existsByUsername(request.username())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        Role role = roleRepository.findByName(RoleName.TENANT_ADMIN)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"));

        ManagementUser newTenantAdmin = new ManagementUser();
        newTenantAdmin.setUsername(request.username());
        newTenantAdmin.setPasswordHash(passwordEncoder.encode(request.password()));
        newTenantAdmin.setEnabled(true);
        newTenantAdmin.setRole(role);
        newTenantAdmin.setOrganization(organization);

        ManagementUser saved = managementUserRepository.save(newTenantAdmin);

        return TenantAdminResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public TenantAdminResponse getTenantAdmin(UUID userId) {
        return TenantAdminResponse.from(findTenantAdmin(userId));
    }

    @Transactional(readOnly = true)
    public TenantAdminListResponse getAllTenantAdmin(UUID organizationId, PaginationRequest request) {
        Organization organization = getOrganization(organizationId);
        Pageable pageable = request.toPageable();

        Page<ManagementUser> users;

        if (request.search().isBlank()) {
            users = managementUserRepository.findAllByOrganization(organization, pageable);
        }
        else {
            users = managementUserRepository.findAllByOrganizationAndUsernameContainingIgnoreCase(organization, request.search(), pageable);
        }

        return TenantAdminListResponse.from(organization, users);
    }

    @Transactional
    @Auditable(
            action = "UPDATE_TENANT_ADMIN",
            resourceType = "MANAGEMENT_USER",
            resourceId = "#p0",
            organizationId = "#result.organization.id",
            details = "Tenant administrator updated"
    )
    public TenantAdminResponse updateTenantAdmin(UUID userId, TenantAdminUpdateRequest request) {
        ManagementUser tenantAdmin = findTenantAdmin(userId);

        if (!tenantAdmin.getUsername().equals(request.username()) && managementUserRepository.existsByUsername(request.username())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        tenantAdmin.setUsername(request.username());

        if (request.password() != null && !request.password().isBlank()) {
            tenantAdmin.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        return TenantAdminResponse.from(tenantAdmin);
    }

    @Transactional
    public void deleteTenantAdmin(UUID userId) {
        long startedAt = System.nanoTime();

        ManagementUser tenantAdmin = findTenantAdmin(userId);
        managementUserRepository.delete(tenantAdmin);

        auditService.record(AuditService.AuditRecordInput.builder()
                .organizationId(tenantAdmin.getOrganization().getId())
                .action("DELETE_TENANT_ADMIN")
                .resourceType("MANAGEMENT_USER")
                .resourceId(userId.toString())
                .startedAt(startedAt)
                .result(AuditResult.SUCCESS)
                .details("Tenant Admin " + tenantAdmin.getUsername() + " is deleted")
                .build()
        );
    }

    @Transactional
    @Auditable(
            action = "UPDATE_OWN_ORGANIZATION",
            resourceType = "ORGANIZATION",
            organizationId = "#result.id",
            resourceId = "#result.id",
            details = "Tenant updated its organization name"
    )
    public OrganizationResponse updateOwnOrganization(TenantOrganizationRequest request) {
        Organization organization = tenantContext.getOrganization();

        if (organizationRepository.existsByNameIgnoreCaseAndIdNot(request.name(), organization.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Organization name already exists");
        }

        organization.setName(request.name());

        return OrganizationResponse.from(organization);
    }

    @Transactional
    @Auditable(
            action = "UPDATE_OWN_PROFILE",
            resourceType = "MANAGEMENT_USER",
            organizationId = "#result.organization.id",
            resourceId = "#result.id",
            details = "Tenant updated its name and password"
    )
    public TenantAdminResponse updateOwnProfile(TenantAdminUpdateRequest request) {
        ManagementUser user = tenantContext.getManagementUser();
        Optional<ManagementUser> existing = managementUserRepository.findByUsername(request.username());

        if (existing.isPresent() && !existing.get().getId().equals(user.getId())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        user.setUsername(request.username());

        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        return TenantAdminResponse.from(user);
    }

    @Transactional
    @Auditable(
            action = "UPDATE_MANAGEMENT_USER",
            resourceType = "MANAGEMENT_USER",
            organizationId = "#result.organization.id",
            resourceId = "#result.id",
            details = "Tenant admin enable status changed"
    )
    public TenantAdminResponse changeTenantAdminEnable(UUID userId, TenantAdminEnableRequest request) {
        ManagementUser tenantAdmin = findTenantAdmin(userId);

        tenantAdmin.setEnabled(request.enable());
        return TenantAdminResponse.from(tenantAdmin);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOwnOrganization() {
        Organization organization = tenantContext.getOrganization();
        return OrganizationResponse.from(organization);
    }

    private void checkUnique(String name, String slug, UUID currentId) {
        boolean nameExists = currentId == null
                ? organizationRepository.existsByNameIgnoreCase(name)
                : organizationRepository.existsByNameIgnoreCaseAndIdNot(name, currentId);

        if (nameExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Organization name already exists");
        }

        boolean slugExists = currentId == null
                ? organizationRepository.existsBySlugIgnoreCase(slug)
                : organizationRepository.existsBySlugIgnoreCaseAndIdNot(slug, currentId);

        if (slugExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Organization slug already exists");
        }
    }

    private Organization getOrganization(UUID id) {
        return organizationRepository.findByIdAndStatusNot(id, OrganizationStatus.DELETED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization with ID " + id + " not found"));
    }

    private ManagementUser findTenantAdmin(UUID userId) {
        return managementUserRepository.findById(userId)
                .filter(user -> user.getRole().getName() == RoleName.TENANT_ADMIN)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + userId + " not found"));
    }
}
