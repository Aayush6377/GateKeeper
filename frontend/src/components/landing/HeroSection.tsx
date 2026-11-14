// src/components/landing/HeroSection.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, ShieldCheck, Activity, Terminal } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(role === 'PLATFORM_ADMIN' ? '/platform/dashboard' : '/tenant/dashboard');
  };

  return (
    <section className="relative overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-800/80">
      {/* Subtle Background Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Multi-Tenant API Gateway & Security Control Plane</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Route, Throttle & Protect Microservices at{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Edge Speed.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Configure dynamic proxy routes, enforce token-bucket rate limits, guarantee payment safety with idempotency keys, and stream real-time telemetry across isolated tenant workspaces.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handlePrimaryAction}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-xl shadow-emerald-500/15 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Launch Control Plane' : 'Sign In to Control Plane'}</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm rounded-xl transition-all"
              >
                Explore Capabilities
              </a>
            </div>

            {/* Quick Trust Metrics */}
            <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">&lt; 5ms</div>
                <div className="text-xs text-slate-500 mt-0.5">Proxy Overhead</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">Zero-Downtime</div>
                <div className="text-xs text-slate-500 mt-0.5">Kafka Route Sync</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">100%</div>
                <div className="text-xs text-slate-500 mt-0.5">Tenant Isolation</div>
              </div>
            </div>
          </div>

          {/* Right Column: Animated Live Gateway Policy Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xs relative">
              {/* Top Window Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Terminal size={13} className="text-emerald-400" /> route-policy.json
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  ACTIVE • v12
                </span>
              </div>

              {/* Simulated Live Route Config */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Path Pattern</span>
                  <span className="text-emerald-400 font-semibold">/fast-food/orders/**</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Rate Limit (Redis)</span>
                  <span className="text-amber-300">800 RPM • Burst 50</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Idempotency Guard</span>
                  <span className="text-indigo-300 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-400" /> X-Idempotency-Key
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Upstream Timeout</span>
                  <span className="text-slate-200">3500ms • CORS Enabled</span>
                </div>
              </div>

              {/* Animated Live Stream Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Activity size={13} className="text-emerald-400 animate-pulse" />
                  Kafka Telemetry Streaming
                </span>
                <span className="font-mono text-emerald-400">200 OK (14ms)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};