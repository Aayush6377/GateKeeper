package in.gatekeeper.management.dto.responseDto;

import in.gatekeeper.management.entity.AuditRecord;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.enums.AuditResult;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

public record AuditRecordResponse(
        UUID id,
        AuditOrganization organization,
        String actor,
        String action,
        String resourceType,
        String resourceId,
        String correlationId,
        Long durationMs,
        AuditResult result,
        String details,
        Instant createdAt
) {

    public record AuditOrganization(
            UUID id,
            String name
    ){
        public static AuditOrganization from(Organization organization){
            return new AuditOrganization(
                    organization.getId(),
                    organization.getName()
            );
        }
    }

    public static AuditRecordResponse from(AuditRecord record) {
        return new AuditRecordResponse(
                record.getId(),
                record.getOrganization() == null ? null : AuditOrganization.from(record.getOrganization()),
                record.getActor(),
                record.getAction(),
                record.getResourceType(),
                record.getResourceId(),
                record.getCorrelationId(),
                record.getDurationMs(),
                record.getResult(),
                record.getDetails(),
                record.getCreatedAt()
        );
    }
}
