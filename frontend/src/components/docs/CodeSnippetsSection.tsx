import React, { useState } from 'react';
import { CODE_EXAMPLES, type LanguageKey } from './apiDocsData';
import { Code2, Terminal, Copy, Check, ChevronDown } from 'lucide-react';

export const CodeSnippetsSection: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<LanguageKey>('curl');
  const [copied, setCopied] = useState(false);

  const activeSnippet = CODE_EXAMPLES[selectedLang];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider font-semibold">
        <Code2 size={15} />
        <span>02. Multi-Language SDK & Client Examples</span>
      </div>
      <h2 className="text-2xl font-bold text-white">Integrate in Your Stack</h2>
      <p className="text-sm text-slate-400">
        Select your framework or language from the dropdown below to view a production-ready snippet configured with idempotency keys and rate-limit handling.
      </p>

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="relative w-full sm:w-72">
            <div className="relative">
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value as LanguageKey);
                  setCopied(false);
                }}
                className="w-full appearance-none bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors pr-10 cursor-pointer"
              >
                {(Object.keys(CODE_EXAMPLES) as LanguageKey[]).map((lang) => (
                  <option key={lang} value={lang} className="bg-slate-900 text-white">
                    {CODE_EXAMPLES[lang].label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* File bar */}
        <div className="px-5 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <Terminal size={13} className="text-emerald-400" />
          <span>{activeSnippet.filename}</span>
        </div>

        {/* Code Content */}
        <pre className="p-5 sm:p-6 text-xs sm:text-[13px] font-mono text-slate-200 overflow-x-auto leading-relaxed bg-[#050914]">
          <code>{activeSnippet.code}</code>
        </pre>
      </div>
    </section>
  );
};