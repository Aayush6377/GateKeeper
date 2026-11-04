package in.gatekeeper.management.repository;

import in.gatekeeper.management.dto.responseDto.OrganizationResponse;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.enums.OrganizationStatus;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlugIgnoreCase(String slug);

    Page<Organization> findAllByStatusNot(OrganizationStatus organizationStatus, Pageable pageable);

    Optional<Organization> findByIdAndStatusNot(UUID id, OrganizationStatus organizationStatus);

    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID currentId);

    boolean existsBySlugIgnoreCaseAndIdNot(String slug, UUID currentId);

    Page<Organization> findByStatusNotAndNameContainingIgnoreCase(OrganizationStatus organizationStatus, String search, Pageable pageable);

    Page<Organization> findAllByStatus(OrganizationStatus organizationStatus, Pageable pageable);

    Page<Organization> findAllByStatusAndNameContainingIgnoreCase(OrganizationStatus organizationStatus, String search, Pageable pageable);
}
