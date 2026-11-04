import React, { useState } from 'react';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { RouteFormValues } from '../../schemas/routeSchema';

interface Props {
  register: UseFormRegister<RouteFormValues>;
  control: Control<RouteFormValues>;
  errors: FieldErrors<RouteFormValues>;
}

type TimeUnit = 'ms' | 's' | 'm';

export const RouteTrafficSection: React.FC<Props> = ({ register, control, errors }) => {
  const [unit, setUnit] = useState<TimeUnit>('ms');

  const convertFromMs = (ms: number, targetUnit: TimeUnit) => {
    if (!ms) return 0;
    if (targetUnit === 's') return Number((ms / 1000).toFixed(2));
    if (targetUnit === 'm') return Number((ms / 60000).toFixed(2));
    return ms;
  };

  const convertToMs = (val: number, currentUnit: TimeUnit) => {
    if (!val) return 0;
    if (currentUnit === 's') return Math.round(val * 1000);
    if (currentUnit === 'm') return Math.round(val * 60000);
    return Math.round(val);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-5">
      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
        Traffic Throttling & Resilience
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-gray-600 mb-1.5 font-medium">Requests Per Minute (RPM)</label>
          <input
            type="number"
            {...register('requestsPerMinute', { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {errors.requestsPerMinute && <span className="text-[11px] font-mono text-rose-600 mt-1 block">{errors.requestsPerMinute.message}</span>}
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-600 mb-1.5 font-medium">Response Timeout</label>
          
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/25 focus-within:border-emerald-500">
            <Controller
              name="responseTimeoutMs"
              control={control}
              render={({ field }) => {
                const displayVal = convertFromMs(field.value, unit);
                return (
                  <input
                    type="number"
                    step="any"
                    min={1}
                    value={isNaN(displayVal) ? '' : displayVal}
                    onChange={e => {
                      const rawNum = parseFloat(e.target.value) || 0;
                      field.onChange(convertToMs(rawNum, unit));
                    }}
                    placeholder="5000"
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent font-mono text-gray-900 focus:outline-none"
                  />
                );
              }}
            />
            
            <div className="flex items-center bg-gray-100 border-l border-gray-200 p-1 shrink-0 gap-0.5 font-mono text-[11px]">
              {(['ms', 's', 'm'] as TimeUnit[]).map(u => (
                <button
                  type="button"
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    unit === u ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {errors.responseTimeoutMs && <span className="text-[11px] font-mono text-rose-600 mt-1 block">{errors.responseTimeoutMs.message}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="idempotencyEnabled"
          {...register('idempotencyEnabled')}
          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
        />
        <label htmlFor="idempotencyEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
          Enable Idempotency Guard (Prevents duplicate write requests via Redis key tracking)
        </label>
      </div>
    </div>
  );
};