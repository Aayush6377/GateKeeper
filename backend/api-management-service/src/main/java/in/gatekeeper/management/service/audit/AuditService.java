package in.gatekeeper.management.service.audit;

import in.gatekeeper.management.entity.AuditRecord;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.enums.AuditResult;
import in.gatekeeper.management.repository.AuditRecordRepository;
import in.gatekeeper.management.repository.OrganizationRepository;
import in.gatekeeper.management.service.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.file.AccessDeniedException;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditPersistenceService auditPersistenceService;
    private final OrganizationRepository organizationRepository;
    private final TenantContext tenantContext;

    @Builder
    public record AuditRecordInput(
            UUID organizationId,
            String action,
            String resourceType,
            String resourceId,
            long startedAt,
            AuditResult result,
            String details
    ){};

    public void record(AuditRecordInput input){
        AuditRecord record = buildAuditRecord(input);

        if (input.result() == AuditResult.SUCCESS) {
            auditPersistenceService.saveSuccess(record);
        }
        else {
           auditPersistenceService.saveFailure(record);
        }
    }

    private AuditRecord buildAuditRecord(AuditRecordInput input){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String actor = authentication == null ? "system" : authentication.getName();

        Organization organization = getOrganization(input.organizationId());

        AuditRecord record = new AuditRecord();

        record.setOrganization(organization);
        record.setActor(actor);
        record.setAction(input.action());
        record.setResourceType(input.resourceType());
        record.setResourceId(input.resourceId());
        record.setCorrelationId(getCorrelationId());
        record.setDurationMs((System.nanoTime() - input.startedAt()) / 1000000);
        record.setResult(input.result());
        record.setDetails(input.details());
        record.setCreatedAt(Instant.now());

        return record;
    }

    private Organization getOrganization(UUID organizationId) {
        if (organizationId == null){
            try{
                organizationId = tenantContext.getOrganizationId();
            } catch (AccessDeniedException e) {
                return null;
            }
        }

        return organizationRepository.findById(organizationId).orElse(null);
    }

    private String getCorrelationId() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes servletRequestAttributes)){
            return null;
        }

        HttpServletRequest request = servletRequestAttributes.getRequest();

        return request.getHeader("X-Correlation-ID");
    }
}
