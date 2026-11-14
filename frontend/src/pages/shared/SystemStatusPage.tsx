import { useState, useEffect } from 'react';
import { 
  Activity, Server, RefreshCw, CheckCircle2, 
  XCircle, AlertTriangle, Clock,
} from 'lucide-react';

interface ServiceHealthState {
  name: string;
  role: string;
  envKey: string;
  baseUrl: string;
  status: 'UP' | 'DOWN' | 'LOADING' | 'ERROR';
  latencyMs: number | null;
  details: Record<string, any>;
  errorMsg?: string;
}

export default function SystemStatusPage() {
  const gatewayUrl = import.meta.env.VITE_GATEWAY_URL;
  const managementUrl = import.meta.env.VITE_API_BASE_URL;
  const analyticsUrl = import.meta.env.VITE_ANALYTICS_URL;

  const [services, setServices] = useState<ServiceHealthState[]>([
    {
      name: 'Gateway Service',
      role: 'Reactive Edge Proxy & Redis Rate Limiting',
      envKey: 'VITE_GATEWAY_URL',
      baseUrl: gatewayUrl,
      status: 'LOADING',
      latencyMs: null,
      details: {},
    },
    {
      name: 'Management API',
      role: 'Control Plane & PostgreSQL Storage',
      envKey: 'VITE_API_BASE_URL',
      baseUrl: managementUrl,
      status: 'LOADING',
      latencyMs: null,
      details: {},
    },
    {
      name: 'Analytics Service',
      role: 'Telemetry Ingestion & MongoDB Storage',
      envKey: 'VITE_ANALYTICS_URL',
      baseUrl: analyticsUrl,
      status: 'LOADING',
      latencyMs: null,
      details: {},
    },
  ]);

  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkServiceHealth = async (index: number) => {
    const service = services[index];
    const startTime = performance.now();
    const actuatorUrl = `${service.baseUrl.replace(/\/+$/, '')}/actuator/health`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(actuatorUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const overallStatus = data.status === 'UP' ? 'UP' : 'DOWN';

      setServices((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          status: overallStatus,
          latencyMs: latency,
          details: data.components || {},
          errorMsg: undefined,
        };
        return next;
      });
    } catch (err: any) {
      const endTime = performance.now();
      setServices((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          status: 'DOWN',
          latencyMs: Math.round(endTime - startTime),
          details: {},
          errorMsg: err.message || 'Connection refused or CORS blocked',
        };
        return next;
      });
    }
  };

  const runAllChecks = async () => {
    setIsCheckingAll(true);
    setLastChecked(new Date().toLocaleTimeString());
    await Promise.all(services.map((_, idx) => checkServiceHealth(idx)));
    setIsCheckingAll(false);
  };

  useEffect(() => {
    runAllChecks();
  }, []);

  const allOperational = services.every((s) => s.status === 'UP');
  const someDown = services.some((s) => s.status === 'DOWN');

  return (
    <div className="flex-1 flex flex-col bg-[#030712] text-slate-100">
      {/* Hero Header */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-[#080f1e] to-[#030712] px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-4">
              <Activity size={13} /> Live System Telemetry & Uptime
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Gate<span className="text-emerald-500">Keeper</span> Operational Status
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Real-time health check pings sent directly to Spring Boot actuators across your microservices mesh.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={runAllChecks}
              disabled={isCheckingAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isCheckingAll ? 'animate-spin' : ''} />
              <span>{isCheckingAll ? 'Pinging Services...' : 'Refresh Status'}</span>
            </button>
            {lastChecked && (
              <span className="text-[11px] font-mono text-slate-400">
                Last checked at {lastChecked}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Overall System Banner */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
          allOperational 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : someDown 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-xl border ${
              allOperational ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
            }`}>
              {allOperational ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">
                {allOperational ? 'All Systems Operational' : 'Some Services Experiencing Issues'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {allOperational 
                  ? 'All Spring Boot actuators and connected databases (PostgreSQL, MongoDB, Redis) are responding normally.' 
                  : 'Check individual service status below. Ensure backend servers and CORS rules are running.'}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
            <span className={`w-2.5 h-2.5 rounded-full ${allOperational ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span>{allOperational ? '100% Uptime' : 'Degraded'}</span>
          </div>
        </div>

        {/* Services Health Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Microservices & Datastore Heartbeat
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {services.map((service) => {
              const isUp = service.status === 'UP';
              const isLoading = service.status === 'LOADING';

              return (
                <div 
                  key={service.name}
                  className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 transition-all space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl border mt-0.5 ${
                        isLoading 
                          ? 'bg-slate-800 border-slate-700 text-slate-400 animate-pulse' 
                          : isUp 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        <Server size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-bold text-base text-white">{service.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                            {service.envKey}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{service.role}</p>
                        <span className="text-[11px] font-mono text-slate-500 block mt-1">
                          Endpoint: <code className="text-slate-300">{service.baseUrl}/actuator/health</code>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {service.latencyMs !== null && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                          <Clock size={13} className="text-emerald-400" />
                          <span>{service.latencyMs} ms</span>
                        </div>
                      )}

                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                        isLoading 
                          ? 'bg-slate-800 border-slate-700 text-slate-400' 
                          : isUp 
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                          : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                      }`}>
                        {isLoading ? (
                          <span>Pinging...</span>
                        ) : isUp ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>UP</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            <span>DOWN</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Component Details (DB, Redis, Mongo, DiskSpace) */}
                  {service.errorMsg ? (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-300 flex items-center gap-2">
                      <XCircle size={14} className="shrink-0" />
                      <span>Error: {service.errorMsg} (Make sure Spring Boot is running and CORS allows actuator requests)</span>
                    </div>
                  ) : Object.keys(service.details).length > 0 && (
                    <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      {Object.entries(service.details).map(([key, comp]: [string, any]) => {
                        const compUp = comp.status === 'UP';
                        return (
                          <div key={key} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 uppercase text-[10px]">{key}</span>
                              <span className={`w-2 h-2 rounded-full ${compUp ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                            </div>
                            <span className={`font-bold text-xs ${compUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {comp.status || 'UNKNOWN'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}