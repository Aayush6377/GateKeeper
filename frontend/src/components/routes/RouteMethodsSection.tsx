import React from 'react';
import type { HttpMethod } from '../../services/routeService';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE'];

interface Props {
  selectedMethods: HttpMethod[];
  onChange: (methods: HttpMethod[]) => void;
  error?: string;
}

export const RouteMethodsSection: React.FC<Props> = ({ selectedMethods, onChange, error }) => {
  const toggleMethod = (method: HttpMethod) => {
    if (selectedMethods.includes(method)) {
      onChange(selectedMethods.filter(m => m !== method));
    } else {
      onChange([...selectedMethods, method]);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
        Allowed HTTP Methods *
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {HTTP_METHODS.map(method => {
          const selected = selectedMethods.includes(method);
          return (
            <button
              type="button"
              key={method}
              onClick={() => toggleMethod(method)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                selected 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {method}
            </button>
          );
        })}
      </div>
      {error && <span className="text-[11px] font-mono text-rose-600 block">{error}</span>}
    </div>
  );
};