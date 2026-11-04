package in.gatekeeper.management.service;

import in.gatekeeper.management.entity.ManagementUser;
import in.gatekeeper.management.entity.Organization;
import in.gatekeeper.management.enums.OrganizationStatus;
import in.gatekeeper.management.repository.ManagementUserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ManagementUserDetailsService implements UserDetailsService {
    private final ManagementUserRepository managementUserRepository;


    @Override
    public UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        ManagementUser user = managementUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));

        Organization organization = user.getOrganization();

        if (organization != null && organization.getStatus() != OrganizationStatus.ACTIVE) {
            throw new DisabledException("Organization is not active");
        }

        return User.withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().getName().name())
                .disabled(!user.isEnabled())
                .build();
    }
}
