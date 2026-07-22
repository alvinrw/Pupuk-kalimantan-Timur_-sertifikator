import React from 'react';
import {
  AlertTriangle,
  FileCheck2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard({ stats }) {
  const statusPieData = [
    { name: 'Aktif (Valid)', value: stats.activeCount, color: '#10B981' },
    { name: 'Akan Expired (< 30hr)', value: stats.warningCount, color: '#F59E0B' },
    { name: 'Expired / Failure', value: stats.expiredCount, color: '#EF4444' },
  ];

  const plantBarData = [
    { name: 'Pabrik 1A', Aktif: 45, Warning: 8, Expired: 3 },
    { name: 'Pabrik 2', Aktif: 78, Warning: 12, Expired: 6 },
    { name: 'Pabrik 3', Aktif: 62, Warning: 9, Expired: 5 },
    { name: 'Pabrik 4', Aktif: 54, Warning: 7, Expired: 4 },
    { name: 'Pabrik 5', Aktif: 73, Warning: 9, Expired: 9 },
  ];

  return (
    <div className="p-8 space-y-8 font-sans-clean max-w-7xl mx-auto">
      {/* Clean Page Title */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Ringkasan Status Sertifikasi & Perizinan
        </h1>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Sertifikat</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.totalCertificates}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Status Aktif (Valid)</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-emerald-600">
              {stats.activeCount}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Akan Expired (&lt;30 Hari)</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-[#eab308]">
              {stats.warningCount}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Expired / Failure</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-rose-600">
              {stats.expiredCount}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Distribusi Status Sertifikasi per Unit
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span className="w-3 h-3 rounded bg-emerald-500"></span> Aktif
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span className="w-3 h-3 rounded bg-amber-500"></span> Warning
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span className="w-3 h-3 rounded bg-rose-500"></span> Expired
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plantBarData} barGap={4}>
                <XAxis dataKey="name" stroke="#334155" fontSize={12} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#334155" fontSize={12} fontWeight="bold" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="Aktif" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Warning" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expired" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-4 mb-4 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                Proporsi Status Sertifikasi semuanya
              </h3>
            </div>
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-2.5 border-t border-slate-200 pt-4">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-800 font-bold">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {item.value} Dokumen
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
