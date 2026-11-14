import { useAuth } from '../../context/AuthContext';
import { STATUS_CODES } from './apiDocsData';
import { AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export function StatusCodesGrid() {
  const { isAuthenticated, role } = useAuth();

  let playgroundUrl = isAuthenticated ? '/tenant/playground' : '/login';
  if (isAuthenticated && role === 'PLATFORM_ADMIN') {
    playgroundUrl = '/platform/dashboard';
  }

  return (
      <section className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider font-semibold">
          <AlertTriangle size={15} />
          <span>04. Edge Response Codes</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Handling Gateway Status Responses</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STATUS_CODES.map((s) => (
          <div key={s.code} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${s.badgeClass}`}>
                {s.code}
              </span>
              <span className="text-xs font-semibold text-white">{s.title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-purple-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <ShieldCheck size={14} /> Interactive Route Testing
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Want to test your live routes directly from the browser?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in as a Tenant Admin to use the built-in API Docs & Playground console.
          </p>
        </div>
        <a
          href={playgroundUrl}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg"
        >
          <span>Open Playground</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </section>
  )
};