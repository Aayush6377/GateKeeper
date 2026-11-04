package in.gatekeeper.management.entity;

import in.gatekeeper.management.enums.HeaderAction;
import in.gatekeeper.management.enums.HeaderDirection;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "route_header_rules",
        indexes = {@Index(name = "idx_route_header_rules_route", columnList = "route_pk")}
)
@Getter
@Setter
@NoArgsConstructor
public class RouteHeaderRule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_pk", nullable = false)
    private ApiRoute route;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HeaderDirection direction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HeaderAction action;

    @Column(nullable = false, length = 200)
    private String headerName;

    @Column(length = 2000)
    private String headerValue;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
