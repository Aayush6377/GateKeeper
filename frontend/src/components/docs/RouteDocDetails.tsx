import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { RouteResponse } from '../../services/routeService';
import { Globe, Edit3, Play } from 'lucide-react';

interface Props {
  route: RouteResponse;
}

export const RouteDocDetails: React.FC<Props> = ({ route }) => {
  const navigate = useNavigate();
  const isPublicCros = !route.allowedOrigins || route.allowedOrigins.length === 0 || route.allowedOrigins.includes('*');

  const gatewayBaseUrl = import.meta.env.VITE_GATEWAY_URL;
  let gatewayPathPattern = route.pathPattern;

  if (!gatewayBaseUrl) {
    throw new Error('Missing gateway base URL');
  }

  if (!gatewayPathPattern.startsWith('/')) {
      gatewayPathPattern = `/${gatewayPathPattern}`;
  }

  const gatewayUrl = `${gatewayBaseUrl}${gatewayPathPattern}`;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono px-2.5 py-1 bg-gray-900 text-white rounded-md font-bold uppercase">
              {route.routeId}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
              route.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {route.status}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">{route.name}</h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(`/tenant/routes/${route.id}/edit`)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Route
          </button>
          <button
            type="button"
            onClick={() => navigate(`/tenant/playground/${route.id}/test`)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Live Test Console
          </button>
        </div>
      </div>

      {/* Gateway Entrypoint URL Box */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider block">Gateway Entrypoint URL</label>
        <div className="bg-gray-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl flex items-center justify-between shadow-inner">
          <span className="break-all">{gatewayUrl}</span>
          <span className="text-[10px] bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg border border-gray-700 shrink-0 ml-2">Proxy Target</span>
        </div>
      </div>

      {/* Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">Upstream Target Base URL</span>
          <span className="text-xs font-mono font-bold text-gray-800 break-all flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {route.targetBaseUrl}
          </span>
        </div>
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">Target Path Prefix</span>
          <span className="text-xs font-mono font-bold text-gray-800">
            {route.targetPathPrefix || <span className="text-gray-400 italic">None</span>}
          </span>
        </div>
      </div>

      {/* Traffic Specs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/60 text-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono mb-1">Rate Limit</span>
          <span className="font-bold text-gray-900 text-sm font-mono">{route.requestsPerMinute || 60} RPM</span>
        </div>
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/60 text-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono mb-1">Timeout</span>
          <span className="font-bold text-gray-900 text-sm font-mono">{route.responseTimeoutMs || 30000}ms</span>
        </div>
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/60 text-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono mb-1">Idempotency</span>
          <span className={`font-bold text-xs px-2 py-0.5 rounded font-mono inline-block ${route.idempotencyEnabled ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
            {route.idempotencyEnabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>
      </div>

      {/* Methods & CORS Origins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">Allowed HTTP Methods</span>
          <div className="flex flex-wrap gap-1.5">
            {route.allowedMethods?.map(m => (
              <span key={m} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-900 font-mono font-bold rounded-lg text-xs">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">CORS Allowed Origins</span>
          <div className="flex flex-wrap gap-1.5">
            {isPublicCros ? (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-medium rounded-lg text-xs">
                No restriction (*)
              </span>
            ) : (
              route.allowedOrigins.map(origin => (
                <span key={origin} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-medium rounded-lg text-xs truncate max-w-full">
                  {origin}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Header Rules */}
      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/60 space-y-3">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">Header Rules & Injections</span>
        {(!route.headerRules || route.headerRules.length === 0) ? (
          <p className="text-xs text-gray-400 font-mono italic">No custom header transformation rules configured for this route.</p>
        ) : (
          <div className="space-y-2">
            {route.headerRules.map((rule, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 font-bold rounded text-[10px] text-gray-700">{rule.direction}</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">{rule.action}</span>
                  <span className="font-bold text-gray-900">{rule.headerName}</span>
                </div>
                {rule.headerValue && <span className="text-gray-500 text-[11px]">= {rule.headerValue}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};