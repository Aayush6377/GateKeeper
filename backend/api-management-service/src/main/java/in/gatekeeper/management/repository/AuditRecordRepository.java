package in.gatekeeper.management.repository;

import in.gatekeeper.management.entity.AuditRecord;
import in.gatekeeper.management.entity.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AuditRecordRepository extends JpaRepository<AuditRecord, UUID> {
    @Query("""
            SELECT r FROM AuditRecord r WHERE 
            (:org IS NULL OR r.organization = :org) AND 
            (:search IS NULL OR :search = '' OR
            LOWER(r.actor) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(r.action) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(r.resourceType) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<AuditRecord> queryAuditRecords(
            @Param("org") Organization organization,
            @Param("search") String search,
            Pageable pageable
    );

    Optional<AuditRecord> findByIdAndOrganization(UUID id, Organization organization);
}
