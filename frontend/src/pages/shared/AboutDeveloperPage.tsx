import { 
  Globe, Shield, Terminal, Cpu, ArrowRight, Database, Layers, ExternalLink 
} from 'lucide-react';
import { SOCIAL_LINKS } from '../../assets/links';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AboutDeveloperPage() {
  const { isAuthenticated, role } = useAuth();

  let controlCenterUrl = isAuthenticated ? '/tenant/dashboard' : '/login';
  if (isAuthenticated && role === 'PLATFORM_ADMIN') {
    controlCenterUrl = '/platform/dashboard';
  }

  return (
    <div className="flex-1 flex flex-col bg-[#030712] text-slate-100">
      {/* Hero Header */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-[#080f1e] to-[#030712] px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          
          {/* Terminal Card */}
          <Link to={SOCIAL_LINKS.portfolio} className="relative group shrink-0">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-lg group-hover:opacity-50 transition-opacity" />
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-slate-900 border border-emerald-500/30 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 mb-3">
                <Terminal size={32} />
              </div>
              <span className="font-bold text-lg text-white">Aayush Kukreja</span>
              <span className="text-[11px] font-mono text-emerald-400 mt-0.5">Systems Architect</span>
            </div>
          </Link>

          {/* Intro Copy */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-4">
              <Shield size={13} /> GateKeeper Core Engineering
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Engineered for <span className="text-emerald-500">High-Throughput</span> Microservices.
            </h1>
            
            <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
              Passionate full-stack developer building scalable web applications using Spring Boot and React, with a strong interest in backend engineering, REST APIs, microservices, and distributed systems. Always eager to learn new technologies and build efficient, reliable software solutions.
            </p>

            {/* Social Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                GitHub Profile <ExternalLink size={12} className="text-slate-500" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                 LinkedIn <ExternalLink size={12} className="text-slate-500" />
              </a>
              <a
                href={controlCenterUrl}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-950/50"
              >
                <Globe size={16} /> Explore Control Center <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Philosophy & Stack Highlights */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 w-full">
        
        {/*  Architecture Vision */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/20 mb-4">
              <Cpu size={22} />
            </div>
            <h3 className="font-bold text-base text-white">Reactive Edge Proxy</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Built on Spring Boot reactive non-blocking I/O to guarantee minimal sub-5ms proxy routing overhead under peak enterprise traffic.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/20 mb-4">
              <Layers size={22} />
            </div>
            <h3 className="font-bold text-base text-white">Event-Driven Kafka Sync</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Eliminated cold starts and polling overhead by streaming route policies and organization updates instantly across all gateway instances.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/20 mb-4">
              <Database size={22} />
            </div>
            <h3 className="font-bold text-base text-white">Multi-Tenant Isolation</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Strict JWT claim verification and Redis token-bucket rate limiting ensuring complete data safety and abuse prevention per tenant.
            </p>
          </div>
        </div>

        {/* Full Stack Proficiency Table */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Technology Ecosystem
            </span>
            <h2 className="text-xl font-bold text-white mt-1">Core Tech Stack Powers GateKeeper</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">Backend Core</span>
              <span className="text-emerald-400 font-bold">Spring Boot 4.1.2</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">Frontend UI</span>
              <span className="text-emerald-400 font-bold">React + Vite + Tailwind</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">Diagramming Engine</span>
              <span className="text-emerald-400 font-bold">@xyflow/react</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">Relational DB</span>
              <span className="text-emerald-400 font-bold">PostgreSQL</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">Telemetry DB</span>
              <span className="text-emerald-400 font-bold">MongoDB</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">Rate Limiting</span>
              <span className="text-emerald-400 font-bold">Redis Cache</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">Event Broker</span>
              <span className="text-emerald-400 font-bold">Apache Kafka</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">Animations</span>
              <span className="text-emerald-400 font-bold">Framer Motion</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">Security</span>
              <span className="text-emerald-400 font-bold">JWT + RBAC + CORS</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}