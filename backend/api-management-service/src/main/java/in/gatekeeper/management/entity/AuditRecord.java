package in.gatekeeper.management.entity;

import in.gatekeeper.management.enums.AuditResult;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "control_plane_audit_records",
        indexes = {
                @Index(
                        name = "idx_audit_organization_created",
                        columnList = "organization_id, created_at"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class AuditRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Column(nullable = false, length = 100)
    private String actor;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(nullable = false, length = 100)
    private String resourceType;

    @Column(nullable = false, length = 100)
    private String resourceId;

    @Column(length = 100)
    private String correlationId;

    @Column(nullable = false)
    private Long durationMs = 0L;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditResult result;

    @Column(length = 2000)
    private String details;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
