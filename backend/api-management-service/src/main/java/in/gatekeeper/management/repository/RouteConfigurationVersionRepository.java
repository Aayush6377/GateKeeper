package in.gatekeeper.management.repository;

import in.gatekeeper.management.entity.ApiRoute;
import in.gatekeeper.management.entity.RouteConfigurationVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RouteConfigurationVersionRepository extends JpaRepository<RouteConfigurationVersion, UUID> {
    @Modifying
    @Query("""
    DELETE FROM RouteConfigurationVersion v
        WHERE v.route.id IN :routeIds
    """)
    void deleteAllByRouteIds(@Param("routeIds") Collection<UUID> routeIds);

    @Query("""
    SELECT v FROM RouteConfigurationVersion v WHERE v.route = :route AND
    (:search IS NULL OR :search = '' OR
    LOWER(CAST(v.changeType AS string)) LIKE LOWER(CONCAT('%', :search, '%')) OR
    CAST(v.versionNumber AS string) LIKE LOWER(CONCAT('%', :search, '%')) OR
    LOWER(v.configurationSnapshot) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<RouteConfigurationVersion> findByRouteAndSearch(
            @Param("route") ApiRoute route,
            @Param("search") String search,
            Pageable pageable
    );
}
