'use client';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { CheckCircle2, Clock, AlertTriangle, BarChart3, MapPin, TrendingUp, Calendar, Activity } from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  'Planned':          { bg: 'bg-orange-50',  text: 'text-orange-700', bar: 'bg-orange-400' },
  'In Progress':      { bg: 'bg-blue-50',    text: 'text-blue-700',   bar: 'bg-blue-500'   },
  'Completed':        { bg: 'bg-green-50',   text: 'text-green-700',  bar: 'bg-green-500'  },
  'Delayed':          { bg: 'bg-red-50',     text: 'text-red-700',    bar: 'bg-red-500'    },
  'On Hold':          { bg: 'bg-gray-50',    text: 'text-gray-600',   bar: 'bg-gray-400'   },
  'Waiting Approval': { bg: 'bg-purple-50',  text: 'text-purple-700', bar: 'bg-purple-500' },
};

const LOC_COLORS: Record<string, string> = {
  'Mangaluru':      'bg-sky-500',
  'Shivamogga':     'bg-emerald-500',
  'Hassan':         'bg-violet-500',
  'Chikkamagaluru': 'bg-amber-500',
  'All Locations':  'bg-slate-500',
};

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: () => tasksApi.stats().then(r => r.data) });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => tasksApi.list().then(r => r.data) });

  const totalPct = tasks.length ? Math.round(tasks.reduce((s, t) => s + t.completionPct, 0) / tasks.length) : 0;
  const overallStatus = totalPct === 100 ? 'All Done' : totalPct >= 70 ? 'On Track' : totalPct >= 40 ? 'In Progress' : 'Early Stage';

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">NGI IT Infrastructure & CCTV Project 2026</p>
        </div>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks"    value={stats?.total ?? 0}    icon={<BarChart3  className="w-5 h-5 text-white" />} color="bg-brand-500" />
        <StatCard label="Due This Week"  value={stats?.upcoming ?? 0} icon={<Calendar   className="w-5 h-5 text-white" />} color="bg-orange-500" />
        <StatCard label="Delayed"        value={stats?.delayed ?? 0}  icon={<AlertTriangle className="w-5 h-5 text-white" />} color="bg-red-500" />
        <StatCard label="Overall Progress" value={`${totalPct}%`} sub={overallStatus} icon={<TrendingUp className="w-5 h-5 text-white" />} color="bg-green-500" />
      </div>

      {/* Overall progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Project Completion</p>
          <span className="text-sm font-bold text-brand-600">{totalPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-brand-500 h-3 rounded-full transition-all duration-500" style={{ width: `${totalPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* By Status */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-gray-700">Status Breakdown</h2>
          </div>
          <div className="space-y-3">
            {stats && Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              const c = STATUS_COLORS[status] || { bg: 'bg-gray-50', text: 'text-gray-600', bar: 'bg-gray-400' };
              return (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs font-medium ${c.text}`}>{status}</span>
                    <span className="text-xs text-gray-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`${c.bar} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Location */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-gray-700">Tasks by Location</h2>
          </div>
          <div className="space-y-3">
            {stats && Object.entries(stats.byLocation).sort((a, b) => b[1] - a[1]).map(([loc, count]) => {
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              const bar = LOC_COLORS[loc] || 'bg-slate-400';
              return (
                <div key={loc}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{loc || 'Unknown'}</span>
                    <span className="text-xs text-gray-400">{count} tasks</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`${bar} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-brand-500" />
          <h2 className="text-sm font-semibold text-gray-700">Recently Updated Tasks</h2>
        </div>
        <div className="space-y-2">
          {tasks.slice(0, 8).map(t => (
            <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6">#{t.id}</span>
                <span className="text-sm text-gray-700">{t.taskName}</span>
                {t.location && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{t.location}</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-brand-400 h-1.5 rounded-full" style={{ width: `${t.completionPct}%` }} />
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status]?.bg || 'bg-gray-100'} ${STATUS_COLORS[t.status]?.text || 'text-gray-600'}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
