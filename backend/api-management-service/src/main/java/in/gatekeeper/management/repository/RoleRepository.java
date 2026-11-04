package in.gatekeeper.management.repository;

import in.gatekeeper.management.entity.Role;
import in.gatekeeper.management.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(RoleName roleName);
}
