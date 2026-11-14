import React from 'react';
import { ArrowRight, Shield, Server, BarChart3, Laptop } from 'lucide-react';

export const ArchitectureFlow: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Client Request',
      detail: 'Hits tenant slug path (/org/api/**)',
      icon: Laptop,
    },
    {
      step: '02',
      title: 'Edge Guard Filters',
      detail: 'CORS, Redis Rate Limit & Idempotency check',
      icon: Shield,
    },
    {
      step: '03',
      title: 'Upstream Proxy',
      detail: 'Forwarded with strict timeout enforcement',
      icon: Server,
    },
    {
      step: '04',
      title: 'Kafka Analytics',
      detail: 'Latency & status streamed to dashboards',
      icon: BarChart3,
    },
  ];

  return (
    <section id="pipeline" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            Execution Pipeline
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
            How GateKeeper Processes Every Request
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative flex flex-col">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 h-full hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      STEP {item.step}
                    </span>
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                      <Icon size={18} />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.detail}</p>
                </div>

                {/* Connector Arrow on Desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-emerald-500/60">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};