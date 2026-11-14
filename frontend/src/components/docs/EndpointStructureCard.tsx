import React from 'react';
import { Globe } from 'lucide-react';
import { gatewayUrl } from './apiDocsData';

export const EndpointStructureCard: React.FC = () => (
  <section className="space-y-4">
    <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider font-semibold">
      <Globe size={15} />
      <span>01. Gateway Endpoint Structure</span>
    </div>
    <h2 className="text-2xl font-bold text-white">How Requests Are Routed</h2>
    <p className="text-sm text-slate-400 max-w-3xl">
      Every route registered in GateKeeper is namespaced under your organization’s unique{' '}
      <code className="text-emerald-400 font-mono">slug</code>. When a request hits the gateway, GateKeeper validates policies and forwards the path to your configured upstream URI.
    </p>

    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 font-mono text-xs sm:text-sm overflow-x-auto">
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300">
          {gatewayUrl}
        </span>
        <span className="text-slate-600">/</span>
        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
          {'{organization-slug}'}
        </span>
        <span className="text-slate-600">/</span>
        <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/40 text-purple-300 font-bold">
          {'{route-path}'}
        </span>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-mono text-emerald-400 uppercase block mb-1">
            Incoming Gateway URL
          </span>
          <code className="text-slate-200 font-mono">
            POST {gatewayUrl}/fast-food/orders/create
          </code>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-mono text-purple-400 uppercase block mb-1">
            Proxied Upstream Target (With Prefix Rewrite)
          </span>
          <code className="text-slate-200 font-mono">
            POST https://api.fastfood.com/v1/orders/create
          </code>
        </div>
      </div>
    </div>
  </section>
);