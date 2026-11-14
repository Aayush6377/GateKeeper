import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, RefreshCw, Cpu, Lock, Globe } from 'lucide-react';

export const LivePolicySimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ratelimit' | 'idempotency' | 'cors' | 'timeout'>('ratelimit');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const policies = {
    ratelimit: {
      name: 'Distributed Rate Limiting',
      badge: 'Redis Token Bucket',
      icon: Zap,
      desc: 'Controls incoming request velocity per route. Throttles excessive traffic with custom HTTP 429 responses and retry headers.',
      payload: { 'X-RateLimit-Limit': '800 RPM', 'Current-Usage': '142 requests', 'Status': 'Allowed (200 OK)' }
    },
    idempotency: {
      name: 'Idempotency Protection',
      badge: 'Zero Double-Charges',
      icon: Lock,
      desc: 'Caches responses for POST/PATCH calls using client-supplied keys to safely handle network retries.',
      payload: { 'X-Idempotency-Key': 'uuid-9f82-a1e4', 'Cache-Hit': 'true', 'Replayed-At': '12ms' }
    },
    cors: {
      name: 'Edge CORS Filtering',
      badge: 'Browser Security',
      icon: Globe,
      desc: 'Injects Access-Control headers at the gateway level without modifying downstream Spring Boot services.',
      payload: { 'Access-Control-Allow-Origin': 'https://app.fastfood.io', 'Methods': 'GET, POST, PUT', 'Status': 'Passed' }
    },
    timeout: {
      name: 'Upstream SLA Timeouts',
      badge: 'Thread Exhaustion Guard',
      icon: Cpu,
      desc: 'Terminates hanging upstream connections instantly if response time exceeds configured threshold limits.',
      payload: { 'Timeout-Limit': '3500ms', 'Actual-Latency': '142ms', 'Circuit-Breaker': 'CLOSED' }
    }
  };

  const current = policies[activeTab];
  const Icon = current.icon;

  const runTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTestResult(current.payload);
      setTesting(false);
    }, 600);
  };

  return (
    <section id="simulator" className="py-24 bg-slate-900/30 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            Interactive Gateway Engine
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Test Gateway Policies in Real-Time
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            Select an edge guard policy below to preview how GateKeeper inspects and transforms HTTP traffic streams before reaching your microservices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Policy Selectors */}
          <div className="lg:col-span-5 space-y-3">
            {Object.entries(policies).map(([key, item]) => {
              const ItemIcon = item.icon;
              const isActive = activeTab === key;
              return (
                <div
                  key={key}
                  onClick={() => { setActiveTab(key as any); setTestResult(null); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl border ${isActive ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                      <ItemIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <span className="text-[11px] font-mono text-slate-500">{item.badge}</span>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full border ${isActive ? 'bg-emerald-400 border-emerald-300 animate-pulse' : 'border-slate-700'}`} />
                </div>
              );
            })}
          </div>

          {/* Interactive Simulation Window */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{current.name}</h3>
                  <span className="text-xs text-slate-400">{current.badge}</span>
                </div>
              </div>

              <button
                onClick={runTest}
                disabled={testing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
                <span>{testing ? 'Simulating...' : 'Test Packet'}</span>
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {current.desc}
            </p>

            {/* Simulation Console Output */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-2">
              <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-2 flex items-center justify-between">
                <span>Edge Proxy Packet Inspection</span>
                <span className="text-emerald-400">Gateway Status: ACTIVE</span>
              </div>

              {testing ? (
                <div className="py-8 text-center text-slate-500 animate-pulse">
                  Routing packet through Redis & Kafka middleware...
                </div>
              ) : testResult ? (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                  {Object.entries(testResult).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-emerald-400 font-semibold">{String(v)}</span>
                    </div>
                  ))}
                  <div className="pt-2 text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 size={14} /> Packet successfully processed and proxied.
                  </div>
                </motion.div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  Click <strong className="text-slate-300">"Test Packet"</strong> to run a live simulation on this policy.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};