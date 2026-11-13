import React from 'react';
import { type AnalyticsSummary } from '../../services/analyticsService';
import { Activity, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  summary: AnalyticsSummary | null;
}

export const TenantStatsGrid: React.FC<Props> = ({ summary }) => {
  const successRate = summary?.successRate ?? 0;
  const isHealthy = successRate >= 95;

  const cards = [
    {
      title: 'Total Requests',
      value: (summary?.totalRequests ?? 0).toLocaleString(),
      subtext: 'All gateway traffic',
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      subtext: `${(summary?.successCount ?? 0).toLocaleString()} successful calls`,
      icon: CheckCircle2,
      color: isHealthy ? 'text-emerald-600' : 'text-amber-600',
      bg: isHealthy ? 'bg-emerald-50' : 'bg-amber-50',
      border: isHealthy ? 'border-emerald-100' : 'border-amber-100',
    },
    {
      title: 'Error Count',
      value: (summary?.errorCount ?? 0).toLocaleString(),
      subtext: '4xx & 5xx responses',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
    {
      title: 'Avg Latency',
      value: `${Math.round(summary?.avgLatencyMs ?? 0)} ms`,
      subtext: 'End-to-end proxy time',
      icon: Clock,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl border ${card.bg} ${card.color} ${card.border}`}>
                <Icon size={20} strokeWidth={2.2} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};