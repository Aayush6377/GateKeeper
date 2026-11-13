import React from 'react';

interface Props {
  tenantSlug: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  isLoading?: boolean;
}

export const RoutePathPatternInput: React.FC<Props> = ({ tenantSlug, value, onChange, error, isLoading }) => {
  const prefix = tenantSlug ? `/${tenantSlug}` : '';
  
  const getRelativePath = () => {
    if (!value) return '';
    let clean = value.trim();
    if (prefix && clean.startsWith(prefix)) {
      clean = clean.slice(prefix.length);
    }
    return clean.replace(/^\/+/, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.trim().replace(/^\/+/, '');
    const relativePath = rawValue ? `/${rawValue}` : '/';
    onChange(relativePath);
  };

  return (
    <div>
      <label className="block text-xs font-mono text-gray-600 mb-1.5 font-medium">Path Pattern (AntMatcher) *</label>
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/25 focus-within:border-emerald-500">
        {isLoading || !tenantSlug ? (
          <div className="bg-gray-100 text-transparent font-mono text-xs px-6 py-2.5 border-r border-gray-200 select-none animate-pulse">
            /loading...
          </div>
        ) : (
          <span className="bg-gray-100 text-gray-600 font-mono text-xs px-3.5 py-2.5 border-r border-gray-200 select-none whitespace-nowrap shrink-0">
            {prefix}/
          </span>
        )}
        <input
          type="text"
          value={getRelativePath()}
          onChange={handleInputChange}
          placeholder={isLoading ? 'Loading tenant context...' : 'e.g. posts/**'}
          disabled={isLoading || !tenantSlug}
          className="w-full px-3 py-2.5 text-sm bg-transparent font-mono text-gray-900 focus:outline-none disabled:opacity-50"
        />
      </div>
      <span className="text-[10px] font-mono text-gray-400 mt-1 block">
        {tenantSlug ? (
          <>Route matches relative path under tenant prefix <code className="text-emerald-600 font-semibold">{prefix}/</code>. (Saved as relative path in DB)</>
        ) : (
          'Loading security path prefix rules...'
        )}
      </span>
      {error && <span className="text-[11px] font-mono text-rose-600 mt-1 block">{error}</span>}
    </div>
  );
};