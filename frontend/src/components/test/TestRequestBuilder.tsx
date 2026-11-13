import React, { useState, useEffect } from 'react';
import type { RouteResponse } from '../../services/routeService';
import { Play, Plus, Trash2, Code, Sliders, KeyRound, Globe, Sparkles } from 'lucide-react';

interface Props {
  route: RouteResponse;
  gatewayUrl: string;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  queryParams: Array<{ key: string; value: string }>;
  onQueryParamsChange: (params: Array<{ key: string; value: string }>) => void;
  headers: Array<{ key: string; value: string }>;
  onHeadersChange: (headers: Array<{ key: string; value: string }>) => void;
  requestBody: string;
  onRequestBodyChange: (body: string) => void;
  onExecute: (customUrl: string) => void;
  isExecuting: boolean;
}

export const TestRequestBuilder: React.FC<Props> = ({
  route,
  gatewayUrl,
  selectedMethod,
  onMethodChange,
  queryParams,
  onQueryParamsChange,
  headers,
  onHeadersChange,
  requestBody,
  onRequestBodyChange,
  onExecute,
  isExecuting,
}) => {
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params');
  const [editableUrl, setEditableUrl] = useState<string>('');

  useEffect(() => {
    if (gatewayUrl) {
      setEditableUrl(gatewayUrl);
    }
  }, [gatewayUrl]);

  useEffect(() => {
    if (headers.length === 0) {
      const defaultHeaders: Array<{ key: string; value: string }> = [
        { key: 'X-Correlation-ID', value: crypto.randomUUID() }
      ];

      if (route.idempotencyEnabled){
        defaultHeaders.push({ key: 'X-Idempotency-Key', value: crypto.randomUUID() });
      }

      onHeadersChange(defaultHeaders);
    }
  }, []);

  const allowedMethods = route.allowedMethods || ['GET', 'POST'];
  const showBody = ['POST', 'PUT', 'PATCH'].includes(selectedMethod);

  const addQueryParam = () => onQueryParamsChange([...queryParams, { key: '', value: '' }]);
  const updateQueryParam = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...queryParams];
    updated[index][field] = val;
    onQueryParamsChange(updated);
  };
  const removeQueryParam = (index: number) => {
    onQueryParamsChange(queryParams.filter((_, i) => i !== index));
  };

  const addHeader = () => onHeadersChange([...headers, { key: '', value: '' }]);
  const updateHeader = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...headers];
    updated[index][field] = val;
    onHeadersChange(updated);
  };
  const removeHeader = (index: number) => {
    onHeadersChange(headers.filter((_, i) => i !== index));
  };

  const regenerateCorrelationId = () => {
    const updated = headers.map(h => 
      h.key.toLowerCase() === 'x-correlation-id' ? { ...h, value: crypto.randomUUID() } : h
    );
    if (!updated.some(h => h.key.toLowerCase() === 'x-correlation-id')) {
      updated.push({ key: 'X-Correlation-ID', value: crypto.randomUUID() });
    }
    onHeadersChange(updated);
  };

  const gatewayBaseUrl = import.meta.env.VITE_GATEWAY_URL;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 space-y-6">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">Request Builder</h2>
            <p className="text-[11px] text-gray-400 font-mono">Configure payload, headers & query parameters</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-gray-900 text-white px-2.5 py-1 rounded-lg font-semibold uppercase">{route.routeId}</span>
      </div>

      {/* URL & Method Execution Bar */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-medium text-gray-700 block">Endpoint Request URL (Fully Editable)</label>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/25 focus-within:border-emerald-500 transition-all">
          
          {/* Method Selector */}
          <select
            value={selectedMethod}
            onChange={(e) => onMethodChange(e.target.value)}
            className="px-3 py-2.5 bg-gray-900 text-white font-mono text-xs font-bold rounded-xl focus:outline-none cursor-pointer shrink-0 shadow-xs"
          >
            {allowedMethods.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Editable URL Input */}
          <input
            type="text"
            value={editableUrl}
            onChange={(e) => setEditableUrl(e.target.value)}
            placeholder={`${gatewayBaseUrl}/api/endpoint`}
            className="w-full px-3 py-2 text-xs bg-transparent font-mono text-gray-900 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="button"
            disabled={isExecuting}
            onClick={() => onExecute(editableUrl)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
        <p className="text-[10px] font-mono text-gray-400">
          You can freely edit the URL above (e.g. remove <code className="bg-gray-100 text-emerald-700 px-1 py-0.5 rounded">/**</code> or add a specific ID like <code className="bg-gray-100 text-emerald-700 px-1 py-0.5 rounded">/1</code>).
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 flex gap-6 text-xs font-mono font-semibold pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('params')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'params' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> Query Params ({queryParams.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'headers' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" /> Headers ({headers.length})
        </button>
        {showBody && (
          <button
            type="button"
            onClick={() => setActiveTab('body')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'body' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Request Body (JSON)
          </button>
        )}
      </div>

      {/* Query Params */}
      {activeTab === 'params' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 font-medium">URL Query Parameters</span>
            <button
              type="button"
              onClick={addQueryParam}
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100"
            >
              <Plus className="w-3.5 h-3.5" /> Add Param
            </button>
          </div>
          {queryParams.length === 0 ? (
            <p className="text-xs text-gray-400 font-mono italic py-8 text-center bg-gray-50/50 rounded-2xl border border-gray-100">No query parameters added.</p>
          ) : (
            <div className="space-y-2">
              {queryParams.map((param, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeQueryParam(index)}
                    className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Headers */}
      {activeTab === 'headers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 font-medium">Custom Request Headers</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={regenerateCorrelationId}
                className="inline-flex items-center gap-1 text-[11px] text-gray-600 hover:text-gray-900 font-mono bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Generate new UUID for correlation tracking"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" /> New Correlation ID
              </button>
              <button
                type="button"
                onClick={addHeader}
                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100"
              >
                <Plus className="w-3.5 h-3.5" /> Add Header
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Header Name (e.g. Idempotency-Key)"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => removeHeader(index)}
                  className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Body */}
      {activeTab === 'body' && showBody && (
        <div className="space-y-2">
          <span className="text-xs font-mono text-gray-500 font-medium block">JSON Payload Body</span>
          <textarea
            rows={8}
            value={requestBody}
            onChange={(e) => onRequestBodyChange(e.target.value)}
            placeholder="{}"
            className="w-full p-4 text-xs bg-gray-900 text-emerald-400 rounded-2xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner"
          />
        </div>
      )}

    </div>
  );
};