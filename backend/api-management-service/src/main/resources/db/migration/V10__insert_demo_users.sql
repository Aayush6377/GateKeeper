INSERT INTO organizations (
    id,
    name,
    slug,
    status,
    created_at,
    updated_at
)
VALUES (
           gen_random_uuid(),
           'Demo Enterprise Corp',
           'demo-corp',
           'ACTIVE',
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       )
ON CONFLICT (slug) DO NOTHING;


INSERT INTO management_users (
    organization_id,
    role_id,
    username,
    password_hash,
    enabled,
    created_at,
    updated_at
)
SELECT
    NULL,
    roles.id,
    'demo-platform-admin',
    '$2a$10$ioxTqwDWs4LhKqtzP3g17eTuIvqkmS14/B8AiIi/n1lXCMm7uvlui', -- hashed for 'demo1234'
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM roles
WHERE roles.name = 'PLATFORM_ADMIN'
ON CONFLICT (username) DO NOTHING;

INSERT INTO management_users (
    organization_id,
    role_id,
    username,
    password_hash,
    enabled,
    created_at,
    updated_at
)
SELECT
    org.id,
    roles.id,
    'demo-tenant-admin',
    '$2a$10$ioxTqwDWs4LhKqtzP3g17eTuIvqkmS14/B8AiIi/n1lXCMm7uvlui', -- hashed for 'demo1234'
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM roles
         CROSS JOIN organizations org
WHERE roles.name = 'TENANT_ADMIN'
AND org.slug = 'demo-corp'
ON CONFLICT (username) DO NOTHING;