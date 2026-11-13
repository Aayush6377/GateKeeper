import React, { useState } from 'react';
import { Plus, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Props {
  allowedOrigins: string[];
  onChange: (origins: string[]) => void;
  error?: string;
}

export const RouteOriginsSection: React.FC<Props> = ({ allowedOrigins = ['*'], onChange, error }) => {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const isPublic = allowedOrigins.includes('*');

  const handleModeToggle = (makePublic: boolean) => {
    if (makePublic) {
      onChange(['*']);
      setInputError(null);
    } else {
      onChange([]);
    }
  };

  const handleAddOrigin = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (trimmed !== '*') {
      try {
        const uri = new URL(trimmed);
        if (uri.protocol !== 'http:' && uri.protocol !== 'https:') {
          setInputError('Origin must start with http:// or https://');
          return;
        }
      } catch {
        setInputError('Please enter a valid URL (e.g., https://app.example.com)');
        return;
      }
    }

    let updated = isPublic ? [trimmed] : [...allowedOrigins, trimmed];
    
    updated = Array.from(new Set(updated));

    if (updated.includes('*') && updated.length > 1) {
      setInputError("Cannot combine wildcard '*' with specific origins.");
      return;
    }

    onChange(updated);
    setInputValue('');
    setInputError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOrigin();
    }
  };

  const handleRemoveOrigin = (originToRemove: string) => {
    const updated = allowedOrigins.filter(o => o !== originToRemove);
    onChange(updated.length === 0 ? ['*'] : updated);
  };

  const addPreset = (preset: string) => {
    if (isPublic) {
      onChange([preset]);
    } else if (!allowedOrigins.includes(preset)) {
      onChange([...allowedOrigins, preset]);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
           CORS Security & Allowed Origins
        </h2>
        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold ${
          isPublic ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {isPublic ? '🌐 Public Access (Any Origin)' : '🔒 Restricted Access'}
        </span>
      </div>

      {/* Mode Selector Toggle Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleModeToggle(true)}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
            isPublic 
              ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/2opath' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${isPublic ? 'text-emerald-600' : 'text-gray-400'}`} />
          <div>
            <span className="text-xs font-bold text-gray-900 block mb-0.5">Public API (Default)</span>
            <span className="text-[11px] text-gray-500 block">Allow requests from any browser origin (`*`). Ideal for public or open SDK endpoints.</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleModeToggle(false)}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
            !isPublic 
              ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/2opath' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <ShieldAlert className={`w-5 h-5 mt-0.5 shrink-0 {!isPublic ? 'text-emerald-600' : 'text-gray-400'}`} />
          <div>
            <span className="text-xs font-bold text-gray-900 block mb-0.5">Restricted Origins</span>
            <span className="text-[11px] text-gray-500 block">Lock down browser access to specific trusted domains and client apps only.</span>
          </div>
        </button>
      </div>

      {/* Origin Input Section (Only active when restricted) */}
      {!isPublic && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setInputError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="https://app.myclient.com"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddOrigin}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Origin
            </button>
          </div>

          {/* Quick presets for development */}
          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
            <span>Quick add:</span>
            <button type="button" onClick={() => addPreset('http://localhost:3000')} className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700 cursor-pointer">localhost:3000</button>
            <button type="button" onClick={() => addPreset('http://localhost:5173')} className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700 cursor-pointer">localhost:5173</button>
          </div>

          {inputError && <span className="text-[11px] font-mono text-rose-600 block">{inputError}</span>}

          {/* Configured Origin Badges */}
          {allowedOrigins.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {allowedOrigins.map((origin) => (
                <span
                  key={origin}
                  className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-mono font-medium shadow-2xs"
                >
                  {origin}
                  <button
                    type="button"
                    onClick={() => handleRemoveOrigin(origin)}
                    className="text-emerald-500 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <span className="text-[11px] font-mono text-rose-600 mt-1 block">{error}</span>}
    </div>
  );
};