export type SimulationScenarioId =
  | 'proxy_success'
  | 'rate_limit'
  | 'idempotency_hit'
  | 'config_sync'
  | 'analytics_stream';

export interface NodeMetadata {
  id: string;
  label: string;
  sublabel: string;
  brand: 'react' | 'gateway' | 'management' | 'analytics' | 'postgres' | 'mongo' | 'redis' | 'kafka' | 'upstream';
  envVar?: string;
  docUrl: string;
  description: string;
}

export interface SimulationStep {
  edgeId: string;
  activeNodes: string[];
  packetColor: string;
  badgeText: string;
  logMessage: string;
  isError?: boolean;
}

export interface SimulationScenario {
  id: SimulationScenarioId;
  tabLabel: string;
  badge: string;
  summary: string;
  steps: SimulationStep[];
}

export const ARCHITECTURE_NODES_META: Record<string, NodeMetadata> = {
  frontend: {
    id: 'frontend',
    label: 'React + Vite UI',
    sublabel: 'Control Plane & Playground',
    brand: 'react',
    envVar: 'Port 5173',
    docUrl: 'https://react.dev/',
    description: 'Multi-tenant SPA dashboard for Platform & Tenant Admins. Connects to Gateway, Management, and Analytics APIs.',
  },
  gateway: {
    id: 'gateway',
    label: 'Gateway Service',
    sublabel: 'Spring Boot 4.1.2 Reactive Edge',
    brand: 'gateway',
    envVar: 'VITE_GATEWAY_URL',
    docUrl: 'https://spring.io/projects/spring-cloud-gateway',
    description: 'High-throughput edge router. Evaluates CORS, Redis rate limits, idempotency keys, and enforces upstream timeouts.',
  },
  management: {
    id: 'management',
    label: 'Management API',
    sublabel: 'Spring Boot 4.1.2 Control Plane',
    brand: 'management',
    envVar: 'VITE_API_BASE_URL',
    docUrl: 'https://spring.io/projects/spring-boot',
    description: 'Manages tenants, organization slugs, JWT auth, RBAC, and route versions. Publishes config updates to Kafka.',
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics Service',
    sublabel: 'Spring Boot 4.1.2 Telemetry',
    brand: 'analytics',
    envVar: 'VITE_ANALYTICS_URL',
    docUrl: 'https://spring.io/projects/spring-kafka',
    description: 'Consumes gateway traffic events from Kafka and serves aggregated time-series & tenant breakdown metrics.',
  },
  redis: {
    id: 'redis',
    label: 'Redis Cache',
    sublabel: 'Token Bucket & Idempotency',
    brand: 'redis',
    envVar: 'In-Memory Store',
    docUrl: 'https://redis.io/docs/latest/',
    description: 'Sub-millisecond atomic counters for per-route RPM throttling and cached response payloads for X-Idempotency-Key.',
  },
  kafka: {
    id: 'kafka',
    label: 'Apache Kafka',
    sublabel: 'Event-Driven Sync & Telemetry',
    brand: 'kafka',
    envVar: 'Event Backbone',
    docUrl: 'https://kafka.apache.org/documentation/',
    description: 'Decouples microservices via two topics: gateway-config-events (instant route sync) and gateway-telemetry-events.',
  },
  postgres: {
    id: 'postgres',
    label: 'PostgreSQL',
    sublabel: 'Relational Config & Auth Store',
    brand: 'postgres',
    envVar: 'Primary RDBMS',
    docUrl: 'https://www.postgresql.org/docs/',
    description: 'ACID-compliant storage for organizations, tenant admin credentials, route definitions, and audit logs.',
  },
  mongo: {
    id: 'mongo',
    label: 'MongoDB',
    sublabel: 'High-Volume Telemetry Store',
    brand: 'mongo',
    envVar: 'Time-Series Store',
    docUrl: 'https://www.mongodb.com/docs/',
    description: 'Document database optimized for high-throughput ingestion of gateway request logs, latencies, and error metrics.',
  },
  upstream: {
    id: 'upstream',
    label: 'Upstream Microservice',
    sublabel: 'Target Tenant Backend API',
    brand: 'upstream',
    envVar: 'Target URI',
    docUrl: 'https://spring.io/microservices',
    description: 'Your downstream service (e.g., FastFood Orders API) protected behind GateKeeper with prefix rewriting.',
  },
};

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'proxy_success',
    tabLabel: '1. Standard Proxy Cycle',
    badge: '200 OK',
    summary: 'Full round-trip request from client through Gateway edge filters, Upstream execution, and async Kafka telemetry.',
    steps: [
      {
        edgeId: 'e-frontend-gateway',
        activeNodes: ['frontend', 'gateway'],
        packetColor: '#10b981',
        badgeText: '1. HTTP POST /fast-food/orders',
        logMessage: 'Client sends API request to VITE_GATEWAY_URL with tenant slug prefix.',
      },
      {
        edgeId: 'e-gateway-redis',
        activeNodes: ['gateway', 'redis'],
        packetColor: '#38bdf8',
        badgeText: '2. Rate Limit & Idempotency Check',
        logMessage: 'Gateway checks Redis token bucket (Allowed) & verifies new Idempotency-Key.',
      },
      {
        edgeId: 'e-gateway-upstream',
        activeNodes: ['gateway', 'upstream'],
        packetColor: '#10b981',
        badgeText: '3. Proxy Forward (Timeout: 3500ms)',
        logMessage: 'Gateway strips prefix, injects CORS headers, and proxies to Upstream API.',
      },
      {
        edgeId: 'e-upstream-gateway',
        activeNodes: ['upstream', 'gateway'],
        packetColor: '#34d399',
        badgeText: '4. Upstream 200 OK (18ms)',
        logMessage: 'Upstream responds within SLA deadline; Gateway caches response in Redis.',
      },
      {
        edgeId: 'e-gateway-kafka',
        activeNodes: ['gateway', 'kafka'],
        packetColor: '#fbbf24',
        badgeText: '5. Async Telemetry Event',
        logMessage: 'Gateway fires non-blocking telemetry event to Apache Kafka topic.',
      },
      {
        edgeId: 'e-gateway-frontend',
        activeNodes: ['gateway', 'frontend'],
        packetColor: '#10b981',
        badgeText: '6. 200 OK Returned to Client',
        logMessage: 'Client receives response with X-RateLimit-Remaining headers.',
      },
    ],
  },
  {
    id: 'rate_limit',
    tabLabel: '2. Rate Limit Throttling',
    badge: '429 BLOCKED',
    summary: 'When traffic exceeds configured RPM, Redis triggers an immediate edge rejection without touching Upstream.',
    steps: [
      {
        edgeId: 'e-frontend-gateway',
        activeNodes: ['frontend', 'gateway'],
        packetColor: '#38bdf8',
        badgeText: '1. Burst Request #801',
        logMessage: 'Client exceeds 800 RPM threshold on /fast-food/orders.',
      },
      {
        edgeId: 'e-gateway-redis',
        activeNodes: ['gateway', 'redis'],
        packetColor: '#f43f5e',
        badgeText: '2. Redis Counter Exceeded!',
        logMessage: 'Redis atomic counter returns 0 remaining tokens in current window.',
        isError: true,
      },
      {
        edgeId: 'e-gateway-frontend',
        activeNodes: ['gateway', 'frontend'],
        packetColor: '#f43f5e',
        badgeText: '3. 429 Too Many Requests',
        logMessage: 'Gateway short-circuits request at edge; Upstream stays completely protected.',
        isError: true,
      },
    ],
  },
  {
    id: 'idempotency_hit',
    tabLabel: '3. Idempotency Replay',
    badge: 'CACHED REPLAY',
    summary: 'Duplicate POST requests with the same X-Idempotency-Key return the cached Redis response immediately.',
    steps: [
      {
        edgeId: 'e-frontend-gateway',
        activeNodes: ['frontend', 'gateway'],
        packetColor: '#818cf8',
        badgeText: '1. Retry POST (Same Key)',
        logMessage: 'Network retry sends duplicate POST with X-Idempotency-Key: uuid-9f82.',
      },
      {
        edgeId: 'e-gateway-redis',
        activeNodes: ['gateway', 'redis'],
        packetColor: '#a78bfa',
        badgeText: '2. Redis Key Hit!',
        logMessage: 'Redis finds existing completed response for uuid-9f82 (Prevents double charge).',
      },
      {
        edgeId: 'e-gateway-frontend',
        activeNodes: ['gateway', 'frontend'],
        packetColor: '#10b981',
        badgeText: '3. 200 OK (Replayed in 3ms)',
        logMessage: 'Gateway returns cached response with X-Idempotency-Replayed: true.',
      },
    ],
  },
  {
    id: 'config_sync',
    tabLabel: '4. Real-Time Kafka Route Sync',
    badge: 'ZERO-DOWNTIME',
    summary: 'Updating a route or org slug in Management API updates PostgreSQL and syncs Gateway nodes via Kafka.',
    steps: [
      {
        edgeId: 'e-frontend-management',
        activeNodes: ['frontend', 'management'],
        packetColor: '#38bdf8',
        badgeText: '1. PUT /routes/orders (800 -> 1200 RPM)',
        logMessage: 'Tenant Admin updates rate limit or organization slug in Control Plane.',
      },
      {
        edgeId: 'e-management-postgres',
        activeNodes: ['management', 'postgres'],
        packetColor: '#60a5fa',
        badgeText: '2. Commit Version v13',
        logMessage: 'Management API saves new route snapshot & audit log in PostgreSQL.',
      },
      {
        edgeId: 'e-management-kafka',
        activeNodes: ['management', 'kafka'],
        packetColor: '#fbbf24',
        badgeText: '3. Publish ConfigChangeEvent',
        logMessage: 'GatewayConfigurationChangeEvent published to Kafka config topic.',
      },
      {
        edgeId: 'e-kafka-gateway',
        activeNodes: ['kafka', 'gateway'],
        packetColor: '#10b981',
        badgeText: '4. Hot-Reload Route Registry',
        logMessage: 'All Gateway instances update in-memory routing table immediately.',
      },
    ],
  },
  {
    id: 'analytics_stream',
    tabLabel: '5. Telemetry & Analytics Cycle',
    badge: 'MONGODB STREAM',
    summary: 'Kafka streams gateway metrics into Analytics Service & MongoDB, powering live dashboard charts.',
    steps: [
      {
        edgeId: 'e-gateway-kafka',
        activeNodes: ['gateway', 'kafka'],
        packetColor: '#fbbf24',
        badgeText: '1. Emit RequestMetricEvent',
        logMessage: 'Gateway publishes latency, status code, routeId & orgId to Kafka.',
      },
      {
        edgeId: 'e-kafka-analytics',
        activeNodes: ['kafka', 'analytics'],
        packetColor: '#c084fc',
        badgeText: '2. Batch Consume Metrics',
        logMessage: 'Analytics Service consumes stream and computes success rates & latency.',
      },
      {
        edgeId: 'e-analytics-mongo',
        activeNodes: ['analytics', 'mongo'],
        packetColor: '#10b981',
        badgeText: '3. Persist Time-Series Docs',
        logMessage: 'Telemetry documents written to MongoDB collections.',
      },
      {
        edgeId: 'e-frontend-analytics',
        activeNodes: ['analytics', 'frontend'],
        packetColor: '#38bdf8',
        badgeText: '4. Query Dashboard Charts',
        logMessage: 'Frontend fetches aggregated metrics from VITE_ANALYTICS_URL.',
      },
    ],
  },
];