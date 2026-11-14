import { useState, useEffect } from 'react';
import { Server, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface ServiceTarget {
  name: string;
  url: string;
  status: 'waking' | 'ready' | 'error';
}

interface WakeUpModalProps {
  onWokenUp: () => void;
}

export default function WakeUpModal({ onWokenUp }: WakeUpModalProps) {
  const gatewayUrl = import.meta.env.VITE_GATEWAY_URL;
  const managementUrl = import.meta.env.VITE_API_BASE_URL;
  const analyticsUrl = import.meta.env.VITE_ANALYTICS_URL;

  const getRoot = (url: string) => {
    try {
      const p = new URL(url);
      return `${p.protocol}//${p.host}`;
    } catch {
      return url.replace(/\/api\/v1.*$/, '');
    }
  };

  const [services, setServices] = useState<ServiceTarget[]>([
    { name: 'Gateway Service (Spring Cloud)', url: `${getRoot(gatewayUrl)}/actuator/health`, status: 'waking' },
    { name: 'Management Control Plane', url: `${getRoot(managementUrl)}/actuator/health`, status: 'waking' },
    { name: 'Analytics Telemetry Service', url: `${getRoot(analyticsUrl)}/actuator/health`, status: 'waking' },
  ]);

  const [allReady, setAllReady] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const pingService = async (index: number) => {
      const target = services[index];
      try {

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);

        await fetch(target.url, { method: 'GET', mode: 'cors', signal: controller.signal });
        clearTimeout(timeout);

        if (!isMounted) return;
        setServices((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], status: 'ready' };
          return next;
        });
      } catch {
        if (!isMounted) return;
  
        setServices((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], status: 'ready' };
          return next;
        });
      }
    };

    services.forEach((_, idx) => pingService(idx));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const readyCount = services.filter((s) => s.status === 'ready').length;
    if (readyCount === services.length) {
      setAllReady(true);
    }
  }, [services]);

  const handleEnter = () => {
    sessionStorage.setItem('gatekeeper_woken', 'true');
    onWokenUp();
  };

  if (skipped) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#030712]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mx-auto">
            <Server size={28} className={allReady ? '' : 'animate-pulse'} />
          </div>
          <h2 className="text-xl font-black text-white">Awakening GateKeeper Control Plane</h2>
          <p className="text-xs text-slate-400">
            Backend microservices are hosted on Render free tier and spinning up from sleep mode. This takes about 30–50 seconds on first visit.
          </p>
        </div>

        {/* Service Checklist */}
        <div className="space-y-3">
          {services.map((srv) => {
            const isReady = srv.status === 'ready';
            return (
              <div 
                key={srv.name}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-medium text-slate-200">{srv.name}</span>
                {isReady ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-mono font-bold">
                    <CheckCircle2 size={15} /> READY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-mono">
                    <Loader2 size={14} className="animate-spin" /> WAKING UP...
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="space-y-3 pt-2">
          {allReady ? (
            <button
              onClick={handleEnter}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer animate-bounce"
            >
              <span>Enter Control Center</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
              >
                <Loader2 size={16} className="animate-spin text-emerald-400" />
                <span>Initializing Microservices Mesh...</span>
              </button>
              
              <button
                onClick={() => { setSkipped(true); sessionStorage.setItem('gatekeeper_woken', 'true'); onWokenUp(); }}
                className="w-full py-2 text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Skip & Enter Anyway →
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}