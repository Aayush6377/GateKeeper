package in.gatekeeper.management.controller;

import in.gatekeeper.management.dto.requestDto.PaginationRequest;
import in.gatekeeper.management.dto.responseDto.AuditRecordResponse;
import in.gatekeeper.management.dto.responseDto.PageResponse;
import in.gatekeeper.management.service.audit.AuditQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {
    private final AuditQueryService auditQueryService;

    @GetMapping
    public ResponseEntity<PageResponse<AuditRecordResponse>> getAllAudits(@Valid @ModelAttribute PaginationRequest request){
        var response = auditQueryService.getAuditRecords(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditRecordResponse> getAudit(@PathVariable UUID id){
        var response = auditQueryService.getAuditRecordById(id);
        return ResponseEntity.ok(response);
    }
}
