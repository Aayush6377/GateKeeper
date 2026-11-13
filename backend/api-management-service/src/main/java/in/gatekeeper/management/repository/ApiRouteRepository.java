package in.gatekeeper.management.repository;

import in.gatekeeper.management.entity.ApiRoute;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.enums.OrganizationStatus;
import in.gatekeeper.management.enums.RouteStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApiRouteRepository extends JpaRepository<ApiRoute, UUID> {

    @Query("""
    SELECT COUNT(r) > 0
    FROM ApiRoute r
    WHERE r.organization.id = :organizationId
      AND r.routeId = :routeId
      AND r.status <> in.gatekeeper.management.enums.RouteStatus.DELETED
    """)
    boolean existsNonDeletedRouteWithId(UUID organizationId, String routeId);

    @Query("""
    SELECT r FROM ApiRoute r WHERE r.organization = :org AND r.status <> :deletedStatus AND
    (:search IS NULL OR :search = '' OR
    LOWER(r.routeId) LIKE LOWER(CONCAT('%', :search, '%')) OR
    LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
    LOWER(r.pathPattern) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<ApiRoute> findByOrganizationAndSearch(
            @Param("org") Organization organization,
            @Param("deletedStatus") RouteStatus deletedStatus,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
    SELECT r FROM ApiRoute r WHERE r.organization = :org AND r.status = :status AND
    (:search IS NULL OR :search = '' OR
    LOWER(r.routeId) LIKE LOWER(CONCAT('%', :search, '%')) OR
    LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
    LOWER(r.pathPattern) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<ApiRoute> findByOrganizationAndStatus(
            @Param("org") Organization organization,
            @Param("status") RouteStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
    SELECT r FROM ApiRoute r
        WHERE r.id = :id
        AND r.organization.id = :organizationId
        AND r.status <> in.gatekeeper.management.enums.RouteStatus.DELETED
    """)
    Optional<ApiRoute> findApiRoute(
            @Param("id") UUID id,
            @Param("organizationId") UUID organizationId
    );

    List<ApiRoute> findAllByStatusAndOrganization_Status(RouteStatus status, OrganizationStatus organizationStatus);

    List<ApiRoute> findAllByStatusAndOrganization(RouteStatus routeStatus, Organization organization);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT r FROM ApiRoute r
    WHERE r.id = :id
    AND r.organization.id = :organizationId
    AND r.status = in.gatekeeper.management.enums.RouteStatus.DELETED
    """)
    Optional<ApiRoute> findDeletedApiRoute(
            @Param("id") UUID id,
            @Param("organizationId") UUID organizationId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT r FROM ApiRoute r
    WHERE r.status = in.gatekeeper.management.enums.RouteStatus.DELETED
    AND r.deletedAt <= :cutoff
    ORDER BY r.deletedAt ASC
    """)
    List<ApiRoute> findExpiredRoutes(
            @Param("cutoff") Instant cutoff,
            Pageable pageable
    );

    boolean existsByOrganizationIdAndPathPatternAndStatusNot(
            UUID organizationId,
            String pathPattern,
            RouteStatus status
    );

    boolean existsByOrganizationIdAndPathPatternAndStatusNotAndIdNot(
            UUID organizationId,
            String pathPattern,
            RouteStatus status,
            UUID id
    );

    List<ApiRoute> findAllByOrganization(Organization organization);
}
