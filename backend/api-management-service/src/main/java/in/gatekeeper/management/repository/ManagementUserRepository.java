package in.gatekeeper.management.repository;

import in.gatekeeper.management.entity.ManagementUser;
import in.gatekeeper.management.entity.Organization;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ManagementUserRepository extends JpaRepository<ManagementUser, UUID> {
    Optional<ManagementUser> findByUsername(String username);

    boolean existsByUsername(String username);

    Page<ManagementUser> findAllByOrganization(Organization organization, Pageable pageable);

    Page<ManagementUser> findAllByOrganizationAndUsernameContainingIgnoreCase(Organization organization, String search, Pageable pageable);
}
