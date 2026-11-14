import React from 'react';
import { BookOpen } from 'lucide-react';

export const ApiDocsHeader: React.FC = () => (
  <div className="border-b border-slate-800/80 bg-gradient-to-b from-[#080f1e] to-[#030712] px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
    <div className="max-w-6xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-4">
        <BookOpen size={13} /> Developer Integration Guide
      </div>
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
        Gate<span className="text-emerald-500">Keeper</span> API Documentation
      </h1>
      <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
        Everything you need to route client traffic through GateKeeper, leverage edge idempotency and rate-limiting headers, and integrate across any backend or frontend stack.
      </p>
    </div>
  </div>
);