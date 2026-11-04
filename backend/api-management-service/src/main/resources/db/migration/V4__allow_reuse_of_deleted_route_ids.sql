-- Remove the existing unique constraint
ALTER TABLE api_routes
DROP CONSTRAINT IF EXISTS uk_api_routes_tenant_route;

-- Create a partial unique index
CREATE UNIQUE INDEX uk_api_routes_tenant_route
    ON api_routes (organization_id, route_id)
    WHERE status <> 'DELETED';