import React from 'react';
import { REQUEST_HEADERS, RESPONSE_HEADERS } from './apiDocsData';
import { Layers } from 'lucide-react';

export const HeadersReference: React.FC = () => (
  <section className="space-y-6">
    <div>
      <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider font-semibold">
        <Layers size={15} />
        <span>03. Protocol Headers</span>
      </div>
      <h2 className="text-2xl font-bold text-white mt-1">What to Send & What GateKeeper Returns</h2>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Client Request Headers
        </h3>
        <div className="space-y-3">
          {REQUEST_HEADERS.map((h) => (
            <div key={h.name} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold text-emerald-400">{h.name}</code>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                  {h.required}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          Gateway Injected Response Headers
        </h3>
        <div className="space-y-3">
          {RESPONSE_HEADERS.map((h) => (
            <div key={h.name} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold text-purple-400">{h.name}</code>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  e.g. {h.example}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);