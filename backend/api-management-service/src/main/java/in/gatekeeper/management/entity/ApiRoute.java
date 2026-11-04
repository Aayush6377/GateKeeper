package in.gatekeeper.management.entity;

import in.gatekeeper.management.enums.HttpMethod;
import in.gatekeeper.management.enums.RouteStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "api_routes")
@Getter
@Setter
@NoArgsConstructor
public class ApiRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false, length = 100)
    private String routeId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 500)
    private String pathPattern;

    @Column(nullable = false, length = 1000)
    private String targetBaseUrl;

    @Column(nullable = false, length = 500)
    private String targetPathPrefix = "";

    private Integer requestsPerMinute;

    @Column(nullable = false)
    private Integer responseTimeoutMs = 30000;

    @Column(nullable = false)
    private boolean idempotencyEnabled = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RouteStatus status = RouteStatus.INACTIVE;

    @Column(nullable = false)
    private Long configurationVersion = 1L;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    private Instant deletedAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "route_allowed_methods",
            joinColumns = @JoinColumn(name = "route_pk")
    )
    @Column(name = "http_method", nullable = false)
    @Enumerated(EnumType.STRING)
    private Set<HttpMethod> allowedMethods = new HashSet<>();

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RouteHeaderRule> headerRules = new ArrayList<>();

    public void addHeaderRule(RouteHeaderRule rule){
        headerRules.add(rule);
        rule.setRoute(this);
    }

    public void removeHeaderRule(RouteHeaderRule rule){
        headerRules.remove(rule);
        rule.setRoute(null);
    }

    public void addAllowedMethod(HttpMethod method){
        allowedMethods.add(method);
    }

    public void removeAllowedMethod(HttpMethod method){
        allowedMethods.remove(method);
    }

    public void setHeaderRules(List<RouteHeaderRule> rules) {
        this.headerRules.clear();

        if (rules != null) {
            rules.forEach(this::addHeaderRule);
        }
    }
}
