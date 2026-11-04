package in.gatekeeper.management.service.audit;

import in.gatekeeper.management.dto.requestDto.PaginationRequest;
import in.gatekeeper.management.dto.responseDto.AuditRecordResponse;
import in.gatekeeper.management.dto.responseDto.PageResponse;
import in.gatekeeper.management.entity.AuditRecord;
import in.gatekeeper.management.entity.ManagementUser;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.enums.RoleName;
import in.gatekeeper.management.repository.AuditRecordRepository;
import in.gatekeeper.management.service.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class AuditQueryService {
    private final AuditRecordRepository recordRepository;
    private final TenantContext tenantContext;

    @Transactional(readOnly = true)
    public PageResponse<AuditRecordResponse> getAuditRecords(PaginationRequest request){
        Pageable pageable = request.toPageable();
        ManagementUser user = tenantContext.getManagementUser();

        Organization organization = null;

        if (user.getRole().getName() == RoleName.TENANT_ADMIN) {
            organization = user.getOrganization();
        }

        Page<AuditRecord> records = recordRepository.queryAuditRecords(organization, request.search(), pageable);

        return PageResponse.from(records, AuditRecordResponse::from);
    }

    @Transactional(readOnly = true)
    public AuditRecordResponse getAuditRecordById(UUID id){
        ManagementUser user = tenantContext.getManagementUser();

        Optional<AuditRecord> optionalAuditRecord;

        if (user.getRole().getName() == RoleName.PLATFORM_ADMIN){
            optionalAuditRecord = recordRepository.findById(id);
        }
        else {
            optionalAuditRecord = recordRepository.findByIdAndOrganization(id, user.getOrganization());
        }

        AuditRecord record = optionalAuditRecord.orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Audit record with ID " + id + " not found"));

        return AuditRecordResponse.from(record);
    }
}
