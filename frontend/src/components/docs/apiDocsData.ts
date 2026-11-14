export type LanguageKey = 'curl' | 'node' | 'nextjs' | 'python' | 'java' | 'springboot' | 'go' | 'php';

export interface CodeExample {
  label: string;
  filename: string;
  code: string;
}

export const gatewayUrl = import.meta.env.VITE_GATEWAY_URL;

export const CODE_EXAMPLES: Record<LanguageKey, CodeExample> = {
  curl: {
    label: 'cURL',
    filename: 'terminal.sh',
    code: `curl -X POST "${gatewayUrl}/fast-food/orders" \\
  -H "Content-Type: application/json" \\
  -H "Origin: https://app.fastfood.com" \\
  -H "X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \\
  -d '{
    "itemId": "burger-combo-01",
    "quantity": 2,
    "amount": 24.50
  }'`,
  },
  node: {
    label: 'Node.js (Axios)',
    filename: 'orderClient.js',
    code: `import axios from 'axios';
import { randomUUID } from 'crypto';

const GATEWAY_URL = '${gatewayUrl}';

async function createOrder(orderPayload) {
  try {
    const response = await axios.post(
      \`\${GATEWAY_URL}/fast-food/orders\`,
      orderPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': randomUUID(), // Prevents duplicate charges on retries
        },
        timeout: 10000,
      }
    );

    console.log('Rate Limit Remaining:', response.headers['x-ratelimit-remaining']);
    console.log('Replayed from Cache:', response.headers['x-idempotency-replayed'] || false);
    return response.data;
  } catch (err) {
    if (err.response?.status === 429) {
      console.error('Rate limit exceeded! Slow down request velocity.');
    }
    throw err;
  }
}`,
  },
  nextjs: {
    label: 'Next.js (App Router)',
    filename: 'app/api/checkout/route.ts',
    code: `import { NextResponse } from 'next/server';

const GATEWAY_URL = '${gatewayUrl}';

export async function POST(request: Request) {
  const body = await request.json();
  const idempotencyKey = request.headers.get('x-idempotency-key') ?? crypto.randomUUID();

  const gatewayRes = await fetch(\`\${GATEWAY_URL}/fast-food/orders\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (gatewayRes.status === 429) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  const data = await gatewayRes.json();
  return NextResponse.json(data, { status: gatewayRes.status });
}`,
  },
  python: {
    label: 'Python (Requests)',
    filename: 'gateway_client.py',
    code: `import uuid
import requests

GATEWAY_URL = "${gatewayUrl}"
ORG_SLUG = "fast-food"

def submit_order(payload: dict):
    url = f"{GATEWAY_URL}/{ORG_SLUG}/orders"
    headers = {
        "Content-Type": "application/json",
        "X-Idempotency-Key": str(uuid.uuid4()),
    }

    response = requests.post(url, json=payload, headers=headers, timeout=10)

    if response.status_code == 429:
        raise RuntimeError("GateKeeper Rate Limit Exceeded (HTTP 429)")
    if response.status_code == 504:
        raise TimeoutError("Upstream Microservice Timed Out at Gateway (HTTP 504)")

    response.raise_for_status()
    return response.json()`,
  },
  java: {
    label: 'Java 21 (HttpClient)',
    filename: 'GateKeeperClient.java',
    code: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

public class GateKeeperClient {
    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    private static final String GATEWAY_URL = "${gatewayUrl}";

    public static String postOrder(String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GATEWAY_URL + "/fast-food/orders"))
                .header("Content-Type", "application/json")
                .header("X-Idempotency-Key", UUID.randomUUID().toString())
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 429) {
            throw new IllegalStateException("GateKeeper rate limit exceeded!");
        }
        return response.body();
    }
}`,
  },
  springboot: {
    label: 'Spring Boot (RestClient)',
    filename: 'OrderGatewayService.java',
    code: `import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.UUID;

@Service
public class OrderGatewayService {

    private final RestClient restClient;

    public OrderGatewayService(RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl("${gatewayUrl}/fast-food")
                .build();
    }

    public OrderResponse createOrder(OrderRequest payload) {
        return restClient.post()
                .uri("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Idempotency-Key", UUID.randomUUID().toString())
                .body(payload)
                .retrieve()
                .body(OrderResponse.class);
    }
}`,
  },
  go: {
    label: 'Go (net/http)',
    filename: 'client.go',
    code: `package main

import (
	"bytes"
	"net/http"
	"time"
)

func SendOrder(jsonBody []byte) (*http.Response, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("POST", "${gatewayUrl}/fast-food/orders", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Idempotency-Key", "uuid-v4-random-key")

	return client.Do(req)
}`,
  },
  php: {
    label: 'PHP (Guzzle)',
    filename: 'gateway.php',
    code: `<?php
use GuzzleHttp\\Client;

$client = new Client(['base_uri' => '${gatewayUrl}']);

$response = $client->post('/fast-food/orders', [
    'headers' => [
        'Content-Type' => 'application/json',
        'X-Idempotency-Key' => Uuid::uuid4()->toString(),
    ],
    'json' => [
        'itemId' => 'burger-combo-01',
        'quantity' => 2
    ]
]);
`,
  },
};

export const REQUEST_HEADERS = [
  {
    name: 'X-Idempotency-Key',
    required: 'Recommended (POST/PATCH)',
    type: 'UUID v4 / String',
    desc: 'Unique mutation key cached in Redis. Prevents double-writes and duplicate charges on network retries.',
  },
  {
    name: 'Origin',
    required: 'Browser Requests',
    type: 'URL String',
    desc: 'Validated against route CORS allowed origins list at the gateway edge.',
  },
  {
    name: 'Authorization',
    required: 'Optional',
    type: 'Bearer <token>',
    desc: 'Forwarded transparently to the upstream microservice for backend validation.',
  },
  {
    name: 'Content-Type',
    required: 'Required for Body',
    type: 'application/json',
    desc: 'Standard payload media type preservation.',
  },
];

export const RESPONSE_HEADERS = [
  {
    name: 'X-RateLimit-Limit',
    example: '800',
    desc: 'Configured maximum requests per minute (RPM) allowed for this tenant route.',
  },
  {
    name: 'X-RateLimit-Remaining',
    example: '742',
    desc: 'Remaining request tokens left in the current sliding Redis window.',
  },
  {
    name: 'X-Idempotency-Replayed',
    example: 'true',
    desc: 'Injected when a response is served instantly from the Redis cache rather than upstream.',
  },
];

export const STATUS_CODES = [
  {
    code: '200 / 201',
    title: 'Proxied Success',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    desc: 'Request passed CORS, rate limit, and idempotency checks and returned cleanly from the upstream service.',
  },
  {
    code: '403 Forbidden',
    title: 'CORS or Method Blocked',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    desc: 'Origin or HTTP method is not permitted in this route’s edge security policy.',
  },
  {
    code: '429 Too Many Requests',
    title: 'Redis Rate Limit Exceeded',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    desc: 'Traffic exceeded the route RPM threshold. Downstream microservices remain fully shielded.',
  },
  {
    code: '504 Gateway Timeout',
    title: 'Upstream SLA Deadline Exceeded',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    desc: 'The target microservice took longer than the route configured timeout limit to respond.',
  },
];