CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT uk_organizations_name UNIQUE (name),
    CONSTRAINT uk_organizations_slug UNIQUE (slug),
    CONSTRAINT chk_organizations_status CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'))
);


CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,

    CONSTRAINT uk_roles_name UNIQUE (name)
);

CREATE TABLE management_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    role_id UUID NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_management_users_username UNIQUE (username),
    CONSTRAINT fk_management_users_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_management_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX idx_management_users_organization ON management_users(organization_id);

CREATE TABLE api_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    route_id VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    path_pattern VARCHAR(500) NOT NULL,
    target_base_url VARCHAR(1000) NOT NULL,
    target_path_prefix VARCHAR(500) NOT NULL DEFAULT '',
    requests_per_minute INTEGER,
    response_timeout_ms INTEGER NOT NULL DEFAULT 30000,
    idempotency_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
    configuration_version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_api_routes_tenant_route UNIQUE (organization_id, route_id),
    CONSTRAINT fk_api_routes_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT chk_api_routes_rpm CHECK (requests_per_minute IS NULL OR requests_per_minute > 0),
    CONSTRAINT chk_api_routes_timeout CHECK (response_timeout_ms > 0),
    CONSTRAINT chk_api_routes_version CHECK (configuration_version > 0),
    CONSTRAINT chk_api_route_status CHECK (status IN ('INACTIVE', 'ACTIVE', 'DELETED'))
);

CREATE INDEX idx_api_routes_organization ON api_routes(organization_id);

CREATE TABLE route_allowed_methods (
    route_pk UUID NOT NULL,
    http_method VARCHAR(10) NOT NULL,

    CONSTRAINT pk_route_allowed_methods PRIMARY KEY (route_pk, http_method),
    CONSTRAINT fk_route_allowed_methods_route FOREIGN KEY (route_pk) REFERENCES api_routes(id) ON DELETE CASCADE,
    CONSTRAINT chk_route_allowed_methods_method CHECK (http_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE'))
);

CREATE TABLE route_header_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_pk UUID NOT NULL,
    direction VARCHAR(20) NOT NULL,
    action VARCHAR(20) NOT NULL,
    header_name VARCHAR(200) NOT NULL,
    header_value VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_route_header_rules_route FOREIGN KEY (route_pk) REFERENCES api_routes(id) ON DELETE CASCADE,
    CONSTRAINT chk_route_header_direction CHECK (direction IN ('REQUEST', 'RESPONSE')),
    CONSTRAINT chk_route_header_action CHECK (action IN ('ADD', 'SET', 'REMOVE'))
);

CREATE INDEX idx_route_header_rules_route ON route_header_rules(route_pk);

CREATE TABLE route_configuration_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_route_id UUID NOT NULL,
    version_number BIGINT NOT NULL,
    change_type VARCHAR(30) NOT NULL,
    configuration_snapshot TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_route_versions_route_version UNIQUE (api_route_id, version_number),
    CONSTRAINT fk_route_versions_route FOREIGN KEY (api_route_id) REFERENCES api_routes(id) ON DELETE RESTRICT,
    CONSTRAINT chk_route_versions_number CHECK (version_number > 0)
);

CREATE TABLE control_plane_audit_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    correlation_id VARCHAR(100),
    duration_ms BIGINT NOT NULL DEFAULT 0,
    result VARCHAR(20) NOT NULL,
    details VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT chk_audit_duration CHECK (duration_ms >= 0),
    CONSTRAINT chk_audit_result CHECK (result IN ('SUCCESS', 'FAILURE'))
);

CREATE INDEX idx_audit_organization_created ON control_plane_audit_records(organization_id, created_at DESC);

CREATE INDEX idx_route_versions_route ON route_configuration_versions(api_route_id, version_number DESC);
