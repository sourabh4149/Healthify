import { Link } from 'react-router-dom'
import {
  Activity, Heart, Droplets, Weight, Stethoscope, MapPin,
  ShoppingBag, File, AlertTriangle, TrendingUp, TrendingDown,
  Clock, Loader2, RefreshCw, PlusCircle, ChevronRight
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { format } from 'date-fns'

// ── Mini sparkline ───────────────────────────────────────────────────────────
const MiniChart = ({ data, dataKey, color }) => {
  // Only render if we have at least 2 non-null points for this metric
  const hasData = data.filter(d => d[dataKey] != null).length >= 2
  if (!hasData) return null
  return (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={data}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} connectNulls />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: '8px', fontSize: '11px', color: '#e2e8f0'
          }}
          labelFormatter={(v) => v || ''}
          formatter={(val) => [val ?? '—', '']}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Quick action cards ───────────────────────────────────────────────────────
const quickLinks = [
  { to: '/health-assistant', icon: Stethoscope, label: 'Health-Assistant', desc: 'AI diagnosis help',  color: 'from-pink-500/20 to-rose-500/10',    iconColor: 'text-pink-400',   border: 'border-pink-500/20'   },
  { to: '/hospitals',        icon: MapPin,      label: 'Find Hospital',   desc: 'Nearest facilities', color: 'from-indigo-500/20 to-blue-500/10',  iconColor: 'text-indigo-400', border: 'border-indigo-500/20' },
  { to: '/documents',         icon: File,        label: 'Upload Document', desc: 'See & Upload',       color: 'from-teal-500/20 to-cyan-500/10',    iconColor: 'text-teal-400',   border: 'border-teal-500/20'   },
  { to: '/pharmacy',         icon: ShoppingBag, label: 'Order Medicine',  desc: 'Fast delivery',      color: 'from-orange-500/20 to-amber-500/10', iconColor: 'text-orange-400', border: 'border-orange-500/20' },
]

// ── Category helpers ─────────────────────────────────────────────────────────
const bpCategory = (sys) => {
  if (sys == null) return { label: '—', color: 'text-slate-400' }
  if (sys < 120)   return { label: 'Normal',  color: 'text-emerald-400' }
  if (sys < 130)   return { label: 'Elevated', color: 'text-yellow-400' }
  if (sys < 140)   return { label: 'High I',   color: 'text-orange-400' }
  return                  { label: 'High II',  color: 'text-red-400'    }
}
const sugarCategory = (s) => {
  if (s == null) return { label: '—', color: 'text-slate-400' }
  if (s < 100)   return { label: 'Normal',    color: 'text-emerald-400' }
  if (s < 126)   return { label: 'Pre-Diab.', color: 'text-yellow-400' }
  return                { label: 'Diabetic',  color: 'text-red-400'    }
}

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, unit, icon: Icon, iconBg, iconColor, blobColor, trendDir, trendVal, chartData, chartKey, chartColor, badge, lastDate }) => (
  <div className="stat-card">
    <div className={`absolute top-0 right-0 w-24 h-24 ${blobColor} rounded-full -mr-8 -mt-8 blur-2xl`} />
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-slate-400 text-xs font-body uppercase tracking-wider">{title}</p>
        <p className="font-display font-bold text-3xl text-white mt-1">
          {value ?? <span className="text-slate-600 text-2xl">—</span>}
        </p>
        <p className="text-slate-500 text-xs font-body">{unit}</p>
      </div>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>

    {badge && <p className={`text-xs font-mono font-semibold mb-1 ${badge.color}`}>{badge.label}</p>}

    {/* Trend row — only when we have a real numeric diff */}
    {trendVal != null && !isNaN(trendVal) && Number(trendVal) !== 0 && (
      <div className="flex items-center gap-1 mb-2">
        {trendDir === 'down'
          ? <TrendingDown className="w-3 h-3 text-emerald-400" />
          : <TrendingUp   className="w-3 h-3 text-red-400" />}
        <span className={`text-xs font-mono ${trendDir === 'down' ? 'text-emerald-400' : 'text-red-400'}`}>
          {trendDir === 'down' ? '▼' : '▲'} {trendVal} from last
        </span>
      </div>
    )}

    {/* Last recorded date for this specific metric */}
    {lastDate && (
      <p className="text-slate-600 text-xs font-body mb-1">
        Recorded {format(new Date(lastDate), 'MMM d, yyyy')}
      </p>
    )}

    <MiniChart data={chartData} dataKey={chartKey} color={chartColor} />
  </div>
)

// ── Empty vitals placeholder ─────────────────────────────────────────────────
const EmptyVitals = () => (
  <div className="col-span-3 glass rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-700">
    <Activity className="w-10 h-10 text-slate-600 mb-3" />
    <p className="text-slate-400 font-display font-semibold text-base">No vitals logged yet</p>
    <p className="text-slate-600 text-sm font-body mt-1 mb-4">Start tracking your health by adding your first record.</p>
    <Link
      to="/records"
      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-display font-semibold hover:bg-emerald-500/20 transition-colors"
    >
      <PlusCircle className="w-4 h-4" /> Add First Record
    </Link>
  </div>
)

// ── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="stat-card animate-pulse">
    <div className="h-4 w-24 bg-slate-800 rounded mb-3" />
    <div className="h-8 w-16 bg-slate-800 rounded mb-2" />
    <div className="h-3 w-12 bg-slate-800 rounded" />
  </div>
)

// ── Mock appointments ────────────────────────────────────────────────────────
const appointments = [
  { doctor: 'Dr. Priya Mehta',  specialty: 'Cardiologist',    time: '10:30 AM', date: 'Tomorrow', status: 'confirmed' },
  { doctor: 'Dr. Rajan Gupta',  specialty: 'Endocrinologist', time: '3:00 PM',  date: 'Jul 18',   status: 'pending'   },
]

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const {
    user, patient,
    vitals,         // sparkline series
    latestVitals,   // per-metric latest values from /dashboard API
    loadingVitals,
    refreshAll,
    healthRecords,
  } = useApp()

  const today = new Date()

  // ── Trends: compare per-metric across the sparkline series ───────────────
  // Filter only records that actually have the metric, then take last 2.
  const bpPoints     = vitals.filter(v => v.bp_sys  != null)
  const sugarPoints  = vitals.filter(v => v.sugar   != null)
  const weightPoints = vitals.filter(v => v.weight  != null)

  const trend = (points, key) => {
    if (points.length < 2) return { dir: null, val: null }
    const prev = points[points.length - 2][key]
    const curr = points[points.length - 1][key]
    if (prev == null || curr == null) return { dir: null, val: null }
    const diff = Math.abs(curr - prev)
    return { dir: curr < prev ? 'down' : 'up', val: +diff.toFixed(1) }
  }

  const bpTrend     = trend(bpPoints,     'bp_sys')
  const sugarTrend  = trend(sugarPoints,  'sugar')
  const weightTrend = trend(weightPoints, 'weight')

  // Has the user logged anything at all?
  const hasAnyData = latestVitals.bp_sys != null || latestVitals.sugar != null || latestVitals.weight != null

  const recentRecords = [...healthRecords].slice(0, 5)

  return (
    <div className="space-y-6">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="glass rounded-3xl p-6 lg:p-8 relative overflow-hidden border border-emerald-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <p className="text-emerald-400 font-mono text-xs font-medium mb-1 tracking-wider uppercase">
              {format(today, 'EEEE, MMMM d yyyy')}
            </p>
            <h1 className="font-display font-bold text-3xl text-white mb-2">
              Good {greet()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="text-slate-400 font-body text-sm max-w-md">
              {hasAnyData
                ? 'Your latest readings are in. Stay consistent with your logging!'
                : 'Welcome! Start logging your vitals to see trends and insights.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {patient?.chronicConditions?.map(c => (
                <span key={c} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-display rounded-full">{c}</span>
              ))}
              {patient?.bloodGroup && (
                <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-display rounded-full">
                  Blood: {patient.bloodGroup}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <button
              onClick={refreshAll}
              disabled={loadingVitals}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              {loadingVitals
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />}
            </button>
            <Link
              to="/emergency"
              className="px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl text-white font-display font-bold text-sm flex items-center gap-3 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200 hover:-translate-y-1"
            >
              <AlertTriangle className="w-5 h-5" />
              Emergency SOS
            </Link>
          </div>
        </div>
      </div>

      {/* ── Vitals ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="section-title mb-0">Today's Vitals</h3>
            <p className="section-subtitle mt-0.5 text-slate-500 text-xs">
              Each metric shows its own most recent reading
            </p>
          </div>
          <Link
            to="/records"
            className="flex items-center gap-1.5 text-xs font-display font-semibold text-emerald-400 hover:underline"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Log Reading
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loadingVitals ? (
            <><Skeleton /><Skeleton /><Skeleton /></>
          ) : !hasAnyData ? (
            <EmptyVitals />
          ) : (
            <>
              {/* Blood Pressure */}
              <StatCard
                title="Blood Pressure" unit="mmHg"
                value={
                  latestVitals.bp_sys != null
                    ? <>{latestVitals.bp_sys}<span className="text-slate-500 text-xl">/{latestVitals.bp_dia}</span></>
                    : null
                }
                icon={Heart} iconBg="bg-rose-500/10" iconColor="text-rose-400" blobColor="bg-rose-500/5"
                trendDir={bpTrend.dir} trendVal={bpTrend.val}
                chartData={vitals} chartKey="bp_sys" chartColor="#f43f5e"
                badge={bpCategory(latestVitals.bp_sys)}
                lastDate={latestVitals.bp_date}
              />

              {/* Blood Sugar */}
              <StatCard
                title="Blood Sugar" unit="mg/dL (Fasting)"
                value={latestVitals.sugar}
                icon={Droplets} iconBg="bg-amber-500/10" iconColor="text-amber-400" blobColor="bg-amber-500/5"
                trendDir={sugarTrend.dir} trendVal={sugarTrend.val}
                chartData={vitals} chartKey="sugar" chartColor="#f59e0b"
                badge={sugarCategory(latestVitals.sugar)}
                lastDate={latestVitals.sugar_date}
              />

              {/* Weight */}
              <StatCard
                title="Weight" unit="kg"
                value={latestVitals.weight}
                icon={Weight} iconBg="bg-cyan-500/10" iconColor="text-cyan-400" blobColor="bg-cyan-500/5"
                trendDir={weightTrend.dir} trendVal={weightTrend.val}
                chartData={vitals} chartKey="weight" chartColor="#22d3ee"
                lastDate={latestVitals.weight_date}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────── */}
      <div>
        <h3 className="section-title">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, desc, color, iconColor, border }) => (
            <Link
              key={to} to={to}
              className={`glass-hover glass rounded-2xl p-4 flex flex-col gap-3 border ${border} relative overflow-hidden group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className="w-10 h-10 bg-slate-800/60 rounded-xl flex items-center justify-center mb-2">
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <p className="font-display font-semibold text-white text-sm">{label}</p>
                <p className="text-slate-500 text-xs font-body">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Appointments + Recent Records ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white text-base">Upcoming Appointments</h3>
            <Link to="/consultation" className="text-emerald-400 text-xs font-display hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {appointments.map((apt, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-800/40 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-display font-bold text-xs flex-shrink-0">
                  {apt.doctor.split(' ').slice(1).map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-display font-semibold text-sm truncate">{apt.doctor}</p>
                  <p className="text-slate-400 text-xs font-body">{apt.specialty}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-xs font-mono">{apt.time}</p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-500 text-xs font-body">{apt.date}</span>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${apt.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white text-base">Recent Records</h3>
            <Link to="/records" className="flex items-center gap-1 text-emerald-400 text-xs font-display hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loadingVitals ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-800/40 rounded-xl animate-pulse" />)}
            </div>
          ) : recentRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-slate-500 text-sm font-body">No records yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentRecords.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-mono">
                      {r.date ? format(new Date(r.date), 'MMM d, yyyy') : '—'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {r.bpSystolic        && <span className="text-rose-400  text-xs font-body">{r.bpSystolic}/{r.bpDiastolic} mmHg</span>}
                      {r.bloodSugar?.value && <span className="text-amber-400 text-xs font-body">{r.bloodSugar.value} mg/dL</span>}
                      {r.weightKg         && <span className="text-cyan-400  text-xs font-body">{r.weightKg} kg</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Health Tips ───────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-display font-bold text-white text-base mb-4">Health Recommendations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {healthTips(patient).map((rec, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl">
              <span className="text-xl flex-shrink-0">{rec.icon}</span>
              <p className="text-slate-300 text-sm font-body flex-1">{rec.text}</p>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                rec.priority === 'high' ? 'bg-red-400' : rec.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Utilities ────────────────────────────────────────────────────────────────
function greet() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function healthTips(patient) {
  const base = [
    { text: 'Walk 30 minutes every day for cardiovascular health.',  icon: '🚶', priority: 'medium' },
    { text: 'Drink 8 glasses of water throughout the day.',          icon: '💧', priority: 'low'    },
    { text: 'Log your BP reading — consistency is key.',             icon: '🩺', priority: 'high'   },
    { text: 'Eat a balanced meal and avoid processed foods.',         icon: '🥗', priority: 'medium' },
  ]
  const conditions = patient?.chronicConditions ?? []
  if (conditions.includes('Type 2 Diabetes'))
    base.unshift({ text: 'Check your fasting blood sugar every morning.', icon: '🩸', priority: 'high' })
  if (conditions.includes('Hypertension'))
    base.unshift({ text: 'Limit sodium intake — target < 2g per day.',    icon: '🧂', priority: 'high' })
  if (patient?.currentMedications?.length)
    base.unshift({ text: `Take ${patient.currentMedications[0]} as prescribed.`, icon: '💊', priority: 'high' })
  return base.slice(0, 6)
}