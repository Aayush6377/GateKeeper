import React, { useState } from 'react';
import { Terminal, Clock } from 'lucide-react';

interface Props {
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    durationMs: number;
  } | null;
  isExecuting: boolean;
}

export const TestResponseViewer: React.FC<Props> = ({ response, isExecuting }) => {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-mono font-bold text-xs">{status} {response?.statusText}</span>;
    } else if (status >= 400 && status < 500) {
      return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-mono font-bold text-xs">{status} {response?.statusText}</span>;
    } else {
      return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-mono font-bold text-xs">{status} {response?.statusText}</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">Gateway Response Output</h2>
        {response && (
          <div className="flex items-center gap-3">
            {getStatusBadge(response.status)}
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
              <Clock className="w-3 h-3" /> {response.durationMs}ms
            </span>
          </div>
        )}
      </div>

      {isExecuting ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-gray-500">Proxying request through gateway engine...</p>
        </div>
      ) : !response ? (
        <div className="py-20 text-center space-y-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Terminal className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-xs font-mono text-gray-400">Configure parameters and click <span className="text-gray-700 font-bold">"Send"</span> to test endpoint.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Response Sub-tabs */}
          <div className="border-b border-gray-200 flex gap-6 text-xs font-mono font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('body')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'body' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Response Body
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('headers')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'headers' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Response Headers ({Object.keys(response.headers).length})
            </button>
          </div>

          {activeTab === 'body' && (
            <div className="relative">
              <pre className="p-4 bg-gray-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto max-h-[400px] shadow-inner">
                {typeof response.body === 'object' 
                  ? JSON.stringify(response.body, null, 2) 
                  : String(response.body)}
              </pre>
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 max-h-[400px] overflow-y-auto space-y-2 font-mono text-xs">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-200/60 pb-1.5">
                  <span className="font-bold text-gray-700">{key}:</span>
                  <span className="text-gray-600 break-all text-right">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};