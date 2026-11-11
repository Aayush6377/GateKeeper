CREATE UNIQUE INDEX uk_api_routes_org_path_pattern
    ON api_routes (organization_id, path_pattern)
    WHERE status <> 'DELETED';