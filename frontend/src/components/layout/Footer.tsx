import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Server, Cpu, Database, Layers, Radio, Globe, Leaf } from 'lucide-react';
import { Logo } from '../common/Logo';
import { SOCIAL_LINKS } from '../../assets/links';
import { useAuth } from '../../context/AuthContext';

export const Footer: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const dashboardPath = role === 'PLATFORM_ADMIN' ? '/platform/dashboard' : '/tenant/dashboard';

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 px-6 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-2 py-1 rounded-xl">
              <Logo size="md" />
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            GateKeeper is a multi-tenant API Gateway & Security Infrastructure control plane engineered for high-throughput enterprise microservices.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <a 
              href={SOCIAL_LINKS.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-emerald-600 transition-colors shadow-sm"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>

            <a 
              href={SOCIAL_LINKS.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-emerald-600 transition-colors shadow-sm"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a 
              href={SOCIAL_LINKS.portfolio} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-emerald-600 transition-colors shadow-sm"
              aria-label="Portfolio"
            >
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Platform & Features */}
        <div>
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
            Platform
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to={isAuthenticated ? dashboardPath : '/login'} className="hover:text-emerald-400 transition-colors">Control Center</Link></li>
            <li><a href="/#features" className="hover:text-emerald-400 transition-colors">Capabilities Matrix</a></li>
            <li><a href="/#pipeline" className="hover:text-emerald-400 transition-colors">Request Pipeline</a></li>
            <li><a href="/#simulator" className="hover:text-emerald-400 transition-colors">Live Simulator</a></li>
          </ul>
        </div>

        {/* Architecture & Docs */}
        <div>
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
            Engineering
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/architecture" className="hover:text-emerald-400 transition-colors">System Architecture</Link></li>
            <li><Link to="/docs" className="hover:text-emerald-400 transition-colors">API Documentation</Link></li>
            <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Developer</Link></li>
            <li><Link to="/status" className="hover:text-emerald-400 transition-colors">System Status</Link></li>
          </ul>
        </div>

        {/* Built With Stack */}
        <div>
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
            Built With
          </h4>
          <div className="space-y-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spring Boot 4.1.2</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>React & Vite</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>PostgreSQL</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5 text-emerald-500" />
              <span>MongoDB</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-rose-400" />
              <span>Redis Cache</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Apache Kafka</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Subfooter */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>GateKeeper Enterprise Security Core</span>
        </div>
        <div>
          <span>© {new Date().getFullYear()} Aayush Kukreja • All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};