import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import type { TimeSeriesPoint, AnalyticsSummary } from '../../services/analyticsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  data: TimeSeriesPoint[];
  summary: AnalyticsSummary | null;
}

export const TenantCharts: React.FC<Props> = ({ data, summary }) => {
  const labels = data.map((d) =>
    new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const commonLineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 12, family: 'inherit' },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
        boxPadding: 6,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 6, 
          color: '#64748b',
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
        },
      },
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 6,
        hitRadius: 12, 
      },
    },
  };

  const trafficData = {
    labels,
    datasets: [
      {
        label: 'Success',
        data: data.map((d) => d.successCount),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
      },
      {
        label: 'Errors',
        data: data.map((d) => d.errorCount),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.12)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const latencyData = {
    labels,
    datasets: [
      {
        label: 'Avg Latency (ms)',
        data: data.map((d) => Number(d.avgLatencyMs.toFixed(1))),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const totalSuccess = summary?.successCount ?? 0;
  const totalError = summary?.errorCount ?? 0;
  const hasTraffic = totalSuccess > 0 || totalError > 0;

  const distributionData = {
    labels: ['Successful (2xx/3xx)', 'Errors (4xx/5xx)'],
    datasets: [
      {
        data: hasTraffic ? [totalSuccess, totalError] : [1, 0],
        backgroundColor: hasTraffic ? ['#10b981', '#f43f5e'] : ['#e2e8f0', '#f1f5f9'],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 12 },
          color: '#475569',
        },
      },
      tooltip: {
        enabled: hasTraffic,
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 10,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      {/* Traffic Volume Chart */}
      <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="mb-3">
          <h4 className="text-base font-bold text-slate-900">Traffic Volume</h4>
          <p className="text-xs text-slate-500">Hourly successful vs. failed requests</p>
        </div>
        <div className="relative h-64 sm:h-72 w-full">
          <Line data={trafficData} options={commonLineOptions} />
        </div>
      </div>

      {/* Traffic Health Distribution */}
      <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
        <div className="mb-3">
          <h4 className="text-base font-bold text-slate-900">Traffic Health</h4>
          <p className="text-xs text-slate-500">Overall request outcome split</p>
        </div>
        <div className="relative h-64 sm:h-72 w-full flex items-center justify-center">
          <Doughnut data={distributionData} options={doughnutOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-2xl font-bold text-slate-900">
              {hasTraffic ? `${(summary?.successRate ?? 0).toFixed(0)}%` : '—'}
            </span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Healthy
            </span>
          </div>
        </div>
      </div>

      {/* Latency Trend Chart */}
      <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="mb-3">
          <h4 className="text-base font-bold text-slate-900">Latency Trend</h4>
          <p className="text-xs text-slate-500">Average gateway response latency in milliseconds</p>
        </div>
        <div className="relative h-60 sm:h-68 w-full">
          <Line data={latencyData} options={commonLineOptions} />
        </div>
      </div>
    </div>
  );
};