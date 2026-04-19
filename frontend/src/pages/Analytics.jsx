// src/pages/Analytics.jsx
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-emerald-500/20 text-xs">
      <p className="text-slate-400 font-body mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 font-mono">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-300 truncate">{p.name}:</span>
          <span className="text-white font-bold">{p.value ?? '—'}</span>
        </div>
      ))}
    </div>
  )
}

const tabs = ['Blood Pressure', 'Blood Sugar', 'Weight', 'Combined']

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
    <div className="w-12 h-12 bg-slate-800/60 rounded-2xl flex items-center justify-center mb-3">
      <span className="text-2xl">📊</span>
    </div>
    <p className="text-slate-400 font-display font-semibold text-sm mb-1">No data yet</p>
    <p className="text-slate-600 text-xs font-body max-w-xs">{message}</p>
  </div>
)

const ChartCard = ({ title, subtitle, children }) => (
  <div className="glass rounded-2xl p-4 sm:p-5">
    <h3 className="font-display font-bold text-white text-sm sm:text-base mb-0.5">{title}</h3>
    <p className="text-slate-400 text-xs font-body mb-4">{subtitle}</p>
    {children}
  </div>
)

export default function Analytics() {
  const { healthRecords, loadingVitals } = useApp()
  const [activeTab, setActiveTab] = useState('Blood Pressure')

  const data = useMemo(() => {
    return [...healthRecords]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(r => ({
        date:           r.date ? format(new Date(r.date), 'MMM d') : '—',
        bp_sys:         r.bpSystolic              ?? null,
        bp_dia:         r.bpDiastolic             ?? null,
        sugar:          r.bloodSugar?.value        ?? null,
        weight:         r.weightKg                ?? null,
        pulse_pressure:
          r.bpSystolic != null && r.bpDiastolic != null
            ? r.bpSystolic - r.bpDiastolic
            : null,
      }))
  }, [healthRecords])

  const stats = useMemo(() => {
    const bp     = data.filter(d => d.bp_sys != null)
    const sugar  = data.filter(d => d.sugar  != null)
    const weight = data.filter(d => d.weight != null)

    const bpTrend    = bp.length >= 2
      ? (((bp[0].bp_sys - bp[bp.length - 1].bp_sys) / bp[0].bp_sys) * 100).toFixed(1)
      : null
    const sugarTrend = sugar.length >= 2
      ? (((sugar[0].sugar - sugar[sugar.length - 1].sugar) / sugar[0].sugar) * 100).toFixed(1)
      : null
    const weightLost = weight.length >= 2
      ? (weight[0].weight - weight[weight.length - 1].weight).toFixed(1)
      : null

    const latest = data[data.length - 1]
    let score = 100
    if (latest?.bp_sys != null && latest.bp_sys >= 130) score -= 15
    if (latest?.bp_sys != null && latest.bp_sys >= 140) score -= 10
    if (latest?.sugar  != null && latest.sugar  >= 100) score -= 10
    if (latest?.sugar  != null && latest.sugar  >= 126) score -= 10
    if (latest?.weight != null && latest.weight >   80) score -= 5
    score = Math.max(0, Math.min(100, score))

    return { bpTrend, sugarTrend, weightLost, score }
  }, [data])

  // ── Shared axis / grid styles ────────────────────────────────────────────
  const axisStyle = { fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }
  const gridStyle = { stroke: 'rgba(100,116,139,0.1)', strokeDasharray: '4 4' }

  // ── Thin out data if too many points ────────────────────────────────────
  const chartData = data.length > 20
    ? data.filter((_, i) => i % Math.ceil(data.length / 20) === 0 || i === data.length - 1)
    : data

  // ── Shared chart margin & Y-axis width ──────────────────────────────────
  // Left margin = 0 so the axis labels aren't clipped.
  // YAxis width = 44 gives 3-digit numbers (e.g. 140) comfortable room.
  const chartMargin = { top: 6, right: 8, left: 0, bottom: 0 }
  const yAxisWidth  = 44

  if (loadingVitals) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="section-title">Health Analytics</h2>
          <p className="section-subtitle">Loading your health data…</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-2xl p-4 animate-pulse">
              <div className="h-3 w-20 bg-slate-800 rounded mb-2" />
              <div className="h-7 w-16 bg-slate-800 rounded mb-2" />
              <div className="h-3 w-24 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const summaryCards = [
    {
      label: 'BP Trend',
      value: stats.bpTrend != null
        ? `${stats.bpTrend > 0 ? '▼' : '▲'} ${Math.abs(stats.bpTrend)}%`
        : '—',
      desc:  stats.bpTrend != null
        ? (stats.bpTrend > 0 ? 'Systolic improving' : 'Systolic rising')
        : 'Not enough data',
      color: stats.bpTrend > 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'Sugar Trend',
      value: stats.sugarTrend != null
        ? `${stats.sugarTrend > 0 ? '▼' : '▲'} ${Math.abs(stats.sugarTrend)}%`
        : '—',
      desc:  stats.sugarTrend != null
        ? (stats.sugarTrend > 0 ? 'Good control' : 'Rising — watch diet')
        : 'Not enough data',
      color: stats.sugarTrend > 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'Weight Δ',
      value: stats.weightLost != null
        ? `${stats.weightLost > 0 ? '-' : '+'}${Math.abs(stats.weightLost)} kg`
        : '—',
      desc:  stats.weightLost != null
        ? (stats.weightLost > 0 ? 'Since first record' : 'Gained since first')
        : 'Not enough data',
      color: 'text-cyan-400',
    },
    {
      label: 'Health Score',
      value: data.length > 0 ? `${stats.score}/100` : '—',
      desc:  'Based on latest readings',
      color: stats.score >= 80
        ? 'text-emerald-400'
        : stats.score >= 60
        ? 'text-amber-400'
        : 'text-red-400',
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div>
        <h2 className="section-title">Health Analytics</h2>
        <p className="section-subtitle">Trend analysis across all vitals over time</p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((s, i) => (
          <div key={i} className="glass rounded-2xl p-3 sm:p-4">
            <p className="text-slate-500 text-xs font-body uppercase tracking-wider mb-1 truncate">
              {s.label}
            </p>
            <p className={`font-display font-bold text-xl sm:text-2xl ${s.color}`}>
              {s.value}
            </p>
            <p className="text-slate-500 text-xs font-body mt-1 leading-tight">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-display font-semibold
              transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === tab
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'glass text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Blood Pressure tab ── */}
      {activeTab === 'Blood Pressure' && (
        <div className="space-y-4">
          <ChartCard
            title="Blood Pressure Over Time"
            subtitle="Systolic & Diastolic readings (mmHg)"
          >
            {data.filter(d => d.bp_sys != null).length < 2
              ? <EmptyState message="Log at least 2 blood pressure readings to see trends." />
              : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={chartMargin}>
                  <defs>
                    <linearGradient id="sysGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="diaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} />
                  <XAxis
                    dataKey="date"
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    width={yAxisWidth}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }} />
                  <ReferenceLine y={120} stroke="#f43f5e" strokeDasharray="6 3" strokeOpacity={0.4}
                    label={{ value: 'Sys limit', fill: '#f43f5e', fontSize: 9, position: 'insideTopRight' }} />
                  <ReferenceLine y={80}  stroke="#f97316" strokeDasharray="6 3" strokeOpacity={0.4}
                    label={{ value: 'Dia limit', fill: '#f97316', fontSize: 9, position: 'insideTopRight' }} />
                  <Area connectNulls type="monotone" dataKey="bp_sys" name="Systolic"
                    stroke="#f43f5e" fill="url(#sysGrad)" strokeWidth={2}
                    dot={false} activeDot={{ r: 5 }} />
                  <Area connectNulls type="monotone" dataKey="bp_dia" name="Diastolic"
                    stroke="#f97316" fill="url(#diaGrad)" strokeWidth={2}
                    dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="Pulse Pressure"
            subtitle="Systolic − Diastolic (target: 40–60 mmHg)"
          >
            {data.filter(d => d.pulse_pressure != null).length < 1
              ? <EmptyState message="No blood pressure data to compute pulse pressure." />
              : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={chartData.filter(d => d.pulse_pressure != null)}
                  margin={chartMargin}
                >
                  <CartesianGrid {...gridStyle} />
                  <XAxis
                    dataKey="date"
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    width={yAxisWidth}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={40} stroke="#10b981" strokeDasharray="4 3" strokeOpacity={0.5} />
                  <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 3" strokeOpacity={0.5} />
                  <Bar
                    dataKey="pulse_pressure"
                    name="Pulse Pressure"
                    fill="#818cf8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}

      {/* ── Blood Sugar tab ── */}
      {activeTab === 'Blood Sugar' && (
        <ChartCard
          title="Fasting Blood Sugar Trend"
          subtitle="Normal <100 mg/dL · Pre-diabetic 100–125 · Diabetic ≥126"
        >
          {data.filter(d => d.sugar != null).length < 2
            ? <EmptyState message="Log at least 2 blood sugar readings to see trends." />
            : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={chartMargin}>
                <defs>
                  <linearGradient id="sugarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis
                  dataKey="date"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  width={yAxisWidth}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={100} stroke="#10b981" strokeDasharray="6 3" strokeOpacity={0.5}
                  label={{ value: 'Normal', fill: '#10b981', fontSize: 9, position: 'insideTopRight' }} />
                <ReferenceLine y={126} stroke="#ef4444" strokeDasharray="6 3" strokeOpacity={0.5}
                  label={{ value: 'Diabetic', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }} />
                <Area connectNulls type="monotone" dataKey="sugar" name="Blood Sugar"
                  stroke="#f59e0b" fill="url(#sugarGrad)" strokeWidth={2}
                  dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      )}

      {/* ── Weight tab ── */}
      {activeTab === 'Weight' && (() => {
        const latestWeight = [...data].reverse().find(d => d.weight != null)
        return (
          <ChartCard
            title="Weight Progress"
            subtitle={`Target: 68 kg · Current: ${latestWeight?.weight ?? '—'} kg`}
          >
            {data.filter(d => d.weight != null).length < 2
              ? <EmptyState message="Log at least 2 weight entries to see trends." />
              : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={chartMargin}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} />
                  <XAxis
                    dataKey="date"
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    width={yAxisWidth}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={68} stroke="#10b981" strokeDasharray="6 3" strokeOpacity={0.5}
                    label={{ value: 'Target', fill: '#10b981', fontSize: 9, position: 'insideTopRight' }} />
                  <Area connectNulls type="monotone" dataKey="weight" name="Weight (kg)"
                    stroke="#22d3ee" fill="url(#weightGrad)" strokeWidth={2}
                    dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        )
      })()}

      {/* ── Combined tab ── */}
      {activeTab === 'Combined' && (
        <ChartCard
          title="All Vitals Overview"
          subtitle="BP in mmHg · Sugar in mg/dL · Weight in kg"
        >
          {data.length < 2
            ? <EmptyState message="Not enough data to show combined trends." />
            : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid {...gridStyle} />
                <XAxis
                  dataKey="date"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  width={yAxisWidth}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }} />
                <Line connectNulls type="monotone" dataKey="bp_sys"  name="Systolic BP"  stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line connectNulls type="monotone" dataKey="bp_dia"  name="Diastolic BP" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line connectNulls type="monotone" dataKey="sugar"   name="Blood Sugar"  stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line connectNulls type="monotone" dataKey="weight"  name="Weight (kg)"  stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  )
}