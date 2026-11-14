import React from 'react';
import {
  GitBranch,
  Gauge,
  Fingerprint,
  Globe,
  Timer,
  History,
} from 'lucide-react';

const FEATURES = [
  {
    title: 'Dynamic Route Management',
    description:
      'Create, update, and archive path-based proxy routes with prefix stripping, HTTP method filtering, and instant cluster-wide propagation via Kafka.',
    badge: 'Routing Engine',
    icon: GitBranch,
  },
  {
    title: 'Distributed Rate Limiting',
    description:
      'Protect upstream microservices from traffic spikes and abuse with per-route RPM throttling backed by high-speed Redis counters.',
    badge: 'Traffic Guard',
    icon: Gauge,
  },
  {
    title: 'Idempotency Key Enforcement',
    description:
      'Prevent duplicate mutations and double-charges on POST/PATCH requests by caching responses against client-supplied idempotency keys.',
    badge: 'Data Integrity',
    icon: Fingerprint,
  },
  {
    title: 'Granular CORS Policies',
    description:
      'Configure allowed origins, methods, and headers per tenant route directly at the gateway edge without modifying downstream service code.',
    badge: 'Browser Security',
    icon: Globe,
  },
  {
    title: 'Configurable Response Timeouts',
    description:
      'Enforce strict upstream SLA deadlines in milliseconds to prevent cascading thread exhaustion when downstream services degrade.',
    badge: 'Resilience',
    icon: Timer,
  },
  {
    title: 'Route Versioning & Playground',
    description:
      'Inspect complete configuration snapshots, roll back bad changes in one click, and test live endpoints inside the built-in API Playground.',
    badge: 'Developer DX',
    icon: History,
  },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section id="features" className="py-20 lg:py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            Enterprise Gateway Capabilities
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything You Need to Govern API Traffic
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            Every policy is configured per-tenant in the Control Plane and enforced at the edge without restarting gateway nodes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};