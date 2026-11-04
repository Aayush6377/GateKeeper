import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';
import type { RouteFormValues } from '../../schemas/routeSchema';

const HEADER_DIRECTIONS = ['REQUEST', 'RESPONSE'] as const;
const HEADER_ACTIONS = ['ADD', 'SET', 'REMOVE'] as const;

interface HeaderRuleItem {
  direction: 'REQUEST' | 'RESPONSE';
  action: 'ADD' | 'SET' | 'REMOVE';
  headerName: string;
  headerValue?: string;
}

interface Props {
  rules: HeaderRuleItem[];
  onChange: (rules: HeaderRuleItem[]) => void;
  errors?: FieldErrors<RouteFormValues>['headerRules'];
  isSubmitted?: boolean;
}

export const RouteHeaderRulesSection: React.FC<Props> = ({ rules, onChange, errors, isSubmitted }) => {
  const addRule = () => {
    onChange([...rules, { direction: 'REQUEST', action: 'ADD', headerName: '', headerValue: '' }]);
  };

  const updateRule = (index: number, key: string, val: any) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [key]: val };
    
    if (key === 'action' && val === 'REMOVE') {
      updated[index].headerValue = '';
    }
    onChange(updated);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
            Header Transformation Rules
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Restricted headers (Host, Connection, etc.) are blocked automatically.</p>
        </div>
        <button
          type="button"
          onClick={addRule}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <p className="text-xs text-gray-400 font-mono text-center py-6">
          No header transformation rules configured.
        </p>
      ) : (
        <div className="space-y-4">
          {rules.map((rule, index) => {
            const isRemove = rule.action === 'REMOVE';
            const ruleError = errors?.[index] as any;

            return (
              <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 space-y-2">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  
                  <select
                    value={rule.direction}
                    onChange={e => updateRule(index, 'direction', e.target.value)}
                    className="w-full md:w-36 px-3 py-2 text-xs font-mono bg-white border border-gray-200 rounded-lg text-gray-800 outline-none cursor-pointer"
                  >
                    {HEADER_DIRECTIONS.map(dir => <option key={dir} value={dir}>{dir}</option>)}
                  </select>

                  <select
                    value={rule.action}
                    onChange={e => updateRule(index, 'action', e.target.value)}
                    className="w-full md:w-32 px-3 py-2 text-xs font-mono bg-white border border-gray-200 rounded-lg text-gray-800 outline-none cursor-pointer"
                  >
                    {HEADER_ACTIONS.map(act => <option key={act} value={act}>{act}</option>)}
                  </select>

                  <div className="w-full md:flex-1">
                    <input
                      type="text"
                      placeholder="Header Name"
                      value={rule.headerName}
                      onChange={e => updateRule(index, 'headerName', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="w-full md:flex-1">
                    {isRemove ? (
                      <div className="w-full px-3.5 py-2 text-xs font-mono bg-gray-200/60 text-gray-400 rounded-lg border border-dashed border-gray-300 flex items-center italic">
                        Value omitted for REMOVE action
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Header Value *"
                        value={rule.headerValue || ''}
                        onChange={e => updateRule(index, 'headerValue', e.target.value)}
                        className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-end md:self-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isSubmitted && (ruleError?.headerName || ruleError?.headerValue) && (
                  <div className="text-[11px] font-mono text-rose-600 space-y-0.5 px-1">
                    {ruleError?.headerName && <p>• Header Name: {ruleError.headerName.message}</p>}
                    {ruleError?.headerValue && <p>• Header Value: {ruleError.headerValue.message}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};