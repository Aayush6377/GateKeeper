import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { routeService, type RouteResponse } from '../../services/routeService';
import { GatewayLoader } from '../../components/common/GatewayLoader';
import { Terminal, BookOpen, ArrowRight } from 'lucide-react';
import { RouteDocSidebar } from '../../components/docs/RouteDocSidebar';
import { RouteDocDetails } from '../../components/docs/RouteDocDetails';

export default function RoutePlaygroundPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const limit = 10;

  const { data: routePage, isLoading } = useQuery({
    queryKey: ['routes', 'documentation', page, limit, searchTerm],
    queryFn: () => routeService.findAllActive({ 
      page, 
      limit, 
      search: searchTerm, 
      sortBy: 'createdAt', 
      direction: 'DESC' 
    }),
  });

  const routes = routePage?.content || [];
  const totalPages = routePage?.totalPages || 1;

  const activeRoute: RouteResponse | undefined = 
    routes.find(r => r.id === selectedRouteId) || routes[0];

  if (isLoading && page === 0 && !searchTerm) {
    return <GatewayLoader text="Loading Developer Portal..." subtext="Compiling gateway API specifications" />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gray-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-3 py-1 rounded-full">
            <BookOpen className="w-3.5 h-3.5" /> Interactive Developer Docs
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Gateway API Reference
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Explore your organization's proxied endpoints, inspect wildcard path mappings, review CORS security rules, and launch live console requests.
          </p>
        </div>
      </div>

      {routes.length === 0 && !searchTerm ? (
        <div className="bg-white p-16 rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
          <Terminal className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">No Endpoints Registered</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">You haven't configured any API routes yet. Register your first route to view generated developer documentation.</p>
          <button
            type="button"
            onClick={() => navigate('/tenant/routes/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Create New Route <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4">
            <RouteDocSidebar
              routes={routes}
              selectedId={activeRoute?.id}
              onSelect={setSelectedRouteId}
              searchTerm={searchTerm}
              onSearchChange={(val: any) => { setSearchTerm(val); setPage(0); }}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>

          <div className="lg:col-span-8">
            {activeRoute ? (
              <RouteDocDetails route={activeRoute} />
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center">
                <p className="text-sm text-gray-400 font-mono">Select an endpoint from the sidebar to inspect specifications.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}