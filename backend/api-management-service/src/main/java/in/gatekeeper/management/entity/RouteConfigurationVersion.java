package in.gatekeeper.management.entity;

import in.gatekeeper.management.enums.RouteChangeType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "route_configuration_versions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_route_versions_route_version",
                        columnNames = {"api_route_id", "version_number"}
                )
        },
        check = {
                @CheckConstraint(
                        name = "chk_route_versions_number",
                        constraint = "version_number > 0"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class RouteConfigurationVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "api_route_id", nullable = false)
    private ApiRoute route;

    @Column(nullable = false)
    private Long versionNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RouteChangeType changeType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String configurationSnapshot;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
