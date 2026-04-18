// src/pages/HealthRecords.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Activity, Droplets, Scale,
  Heart, FileText, Trash2,
  Check, AlertCircle, Calendar, Clock, RefreshCw,
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const bpStatus = (sys, dia) => {
  if (!sys || !dia) return null;
  if (sys < 120 && dia < 80) return { label: 'Normal',  color: 'emerald' };
  if (sys < 130 && dia < 80) return { label: 'Elevated', color: 'yellow' };
  if (sys < 140 || dia < 90) return { label: 'Stage 1', color: 'orange' };
  return { label: 'Stage 2', color: 'red' };
};

const sugarStatus = (val, type) => {
  if (!val) return null;
  if (type === 'fasting') {
    if (val < 100) return { label: 'Normal',       color: 'emerald' };
    if (val < 126) return { label: 'Pre-diabetic', color: 'yellow'  };
    return { label: 'Diabetic', color: 'red' };
  }
  if (val < 140) return { label: 'Normal',       color: 'emerald' };
  if (val < 200) return { label: 'Pre-diabetic', color: 'yellow'  };
  return { label: 'Diabetic', color: 'red' };
};

const statusColors = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  yellow:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  orange:  'bg-orange-500/15 text-orange-400 border-orange-500/30',
  red:     'bg-red-500/15 text-red-400 border-red-500/30',
};

// ─── Section toggles ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'bp',     label: 'Blood Pressure', icon: Heart,    color: 'rose'   },
  { id: 'sugar',  label: 'Blood Sugar',    icon: Droplets, color: 'amber'  },
  { id: 'weight', label: 'Weight & BMI',   icon: Scale,    color: 'violet' },
  { id: 'notes',  label: 'Notes & Meal',   icon: FileText, color: 'sky'    },
];

const sectionRing = {
  rose:   'border-rose-500/50 bg-rose-500/10 text-rose-400',
  amber:  'border-amber-500/50 bg-amber-500/10 text-amber-400',
  violet: 'border-violet-500/50 bg-violet-500/10 text-violet-400',
  sky:    'border-sky-500/50 bg-sky-500/10 text-sky-400',
};
const activeSectionStyle = {
  rose:   'border-rose-500 bg-rose-500/20 text-rose-300',
  amber:  'border-amber-500 bg-amber-500/20 text-amber-300',
  violet: 'border-violet-500 bg-violet-500/20 text-violet-300',
  sky:    'border-sky-500 bg-sky-500/20 text-sky-300',
};

// ─── Form primitives ──────────────────────────────────────────────────────────
const Field = ({ label, error, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-widest">{label}</label>
    {children}
    {hint && !error && <p className="text-slate-600 text-xs">{hint}</p>}
    {error && (
      <p className="text-red-400 text-xs flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full px-4 py-2.5 bg-slate-800/70 border border-slate-700/60
      rounded-lg text-white text-sm placeholder-slate-600
      focus:outline-none focus:border-emerald-500/60 focus:bg-slate-800
      transition-all ${className}`}
  />
);

const Select = ({ children, className = '', ...props }) => (
  <select
    {...props}
    className={`w-full px-4 py-2.5 bg-slate-800/70 border border-slate-700/60
      rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/60
      transition-all appearance-none ${className}`}
  >
    {children}
  </select>
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    {...props}
    rows={3}
    className={`w-full px-4 py-2.5 bg-slate-800/70 border border-slate-700/60
      rounded-lg text-white text-sm placeholder-slate-600 resize-none
      focus:outline-none focus:border-emerald-500/60 focus:bg-slate-800
      transition-all ${className}`}
  />
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20
      flex items-center justify-center mb-6">
      <Activity className="w-9 h-9 text-emerald-500/60" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">No records yet</h3>
    <p className="text-slate-500 mb-6 max-w-xs">
      Start tracking your vitals. Add your first health record to see trends over time.
    </p>
    <button
      onClick={onAdd}
      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/20 border
        border-emerald-500/40 text-emerald-400 rounded-xl text-sm font-medium
        hover:bg-emerald-500/30 transition-all"
    >
      <Plus className="w-4 h-4" /> Add First Record
    </button>
  </motion.div>
);

// ─── Record card ──────────────────────────────────────────────────────────────
const RecordCard = ({ record, onDelete, index }) => {
  const bp    = bpStatus(record.bpSystolic, record.bpDiastolic);
  const sugar = sugarStatus(record.bloodSugar?.value, record.bloodSugar?.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.04 }}
      className="group relative bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5
        hover:border-slate-600/60 hover:bg-slate-800/60 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Calendar className="w-3.5 h-3.5" />
          <span>{fmt(record.date)}</span>
          <span className="text-slate-600">·</span>
          <Clock className="w-3.5 h-3.5" />
          <span>{fmtTime(record.date)}</span>
        </div>
        <button
          onClick={() => onDelete(record._id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
            text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {record.bpSystolic && (
          <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" fill="currentColor" />
              <span className="text-rose-400 text-xs font-semibold">Blood Pressure</span>
            </div>
            <p className="text-white font-bold font-mono text-lg">{record.bpSystolic}/{record.bpDiastolic}</p>
            <p className="text-slate-500 text-xs">mmHg</p>
            {bp && (
              <span className={`mt-1.5 inline-flex text-xs px-2 py-0.5 rounded-full border ${statusColors[bp.color]}`}>
                {bp.label}
              </span>
            )}
          </div>
        )}

        {record.bloodSugar?.value && (
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold">Blood Sugar</span>
            </div>
            <p className="text-white font-bold font-mono text-lg">{record.bloodSugar.value}</p>
            <p className="text-slate-500 text-xs">mg/dL · {record.bloodSugar.type}</p>
            {sugar && (
              <span className={`mt-1.5 inline-flex text-xs px-2 py-0.5 rounded-full border ${statusColors[sugar.color]}`}>
                {sugar.label}
              </span>
            )}
          </div>
        )}

        {record.weightKg && (
          <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Scale className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-violet-400 text-xs font-semibold">Weight</span>
            </div>
            <p className="text-white font-bold font-mono text-lg">{record.weightKg}</p>
            <p className="text-slate-500 text-xs">kg</p>
            {record.bmi && <p className="text-violet-300 text-xs mt-1">BMI {record.bmi}</p>}
          </div>
        )}
      </div>

      {(record.notes || record.mealTime) && (
        <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-start gap-2">
          <FileText className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-400 space-y-0.5">
            {record.mealTime && <p><span className="text-slate-500">Meal:</span> {record.mealTime}</p>}
            {record.notes    && <p>{record.notes}</p>}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HealthRecords() {
  const { token, backendUrl, refreshAll } = useContext(AppContext);

  const [records, setRecords]               = useState([]);
  const [loading, setLoading]               = useState(false);
  const [showForm, setShowForm]             = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [activeSections, setActiveSections] = useState(['bp']);
  const [errors, setErrors]                 = useState({});

  const [form, setForm] = useState({
    date:        new Date().toISOString().slice(0, 16),
    bpSystolic:  '', bpDiastolic: '',
    sugarValue:  '', sugarType: 'fasting',
    weightKg:    '', heightCm: '',
    mealTime:    '', notes: '',
  });

  // ── local fetch ───────────────────────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${backendUrl}/api/patient/health`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRecords(data.records ?? []);
      else toast.error(data.message || 'Failed to load records');
    } catch {
      toast.error('Network error loading records');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const toggleSection = (id) =>
    setActiveSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    const hasBP     = activeSections.includes('bp');
    const hasSugar  = activeSections.includes('sugar');
    const hasWeight = activeSections.includes('weight');

    if (hasBP) {
      if (form.bpSystolic  && (form.bpSystolic  < 60  || form.bpSystolic  > 300)) e.bpSystolic  = 'Must be 60–300';
      if (form.bpDiastolic && (form.bpDiastolic < 40  || form.bpDiastolic > 200)) e.bpDiastolic = 'Must be 40–200';
      if ((form.bpSystolic && !form.bpDiastolic) || (!form.bpSystolic && form.bpDiastolic))
        e.bpDiastolic = 'Both systolic & diastolic required';
    }
    if (hasSugar  && form.sugarValue && form.sugarValue  < 0) e.sugarValue = 'Must be positive';
    if (hasWeight && form.weightKg   && (form.weightKg   < 10 || form.weightKg  > 500)) e.weightKg = 'Must be 10–500 kg';
    if (hasWeight && form.heightCm   && (form.heightCm   < 50 || form.heightCm  > 300)) e.heightCm = 'Must be 50–300 cm';

    const hasAny =
      (hasBP     && form.bpSystolic && form.bpDiastolic) ||
      (hasSugar  && form.sugarValue) ||
      (hasWeight && form.weightKg);
    if (!hasAny) e._general = 'Add at least one vital measurement';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { date: new Date(form.date).toISOString() };

      if (activeSections.includes('bp') && form.bpSystolic && form.bpDiastolic) {
        payload.bpSystolic  = Number(form.bpSystolic);
        payload.bpDiastolic = Number(form.bpDiastolic);
      }
      if (activeSections.includes('sugar') && form.sugarValue) {
        payload.bloodSugar = Number(form.sugarValue);
        payload.sugarType  = form.sugarType;
      }
      if (activeSections.includes('weight')) {
        if (form.weightKg) payload.weightKg = Number(form.weightKg);
        if (form.heightCm) payload.heightCm = Number(form.heightCm);
      }
      if (activeSections.includes('notes')) {
        if (form.mealTime) payload.mealTime = form.mealTime;
        if (form.notes)    payload.notes    = form.notes;
      }

      const res  = await fetch(`${backendUrl}/api/patient/health`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Health record saved!');
        setShowForm(false);
        setForm({
          date: new Date().toISOString().slice(0, 16),
          bpSystolic: '', bpDiastolic: '',
          sugarValue: '', sugarType: 'fasting',
          weightKg: '',   heightCm: '',
          mealTime: '',   notes: '',
        });
        setActiveSections(['bp']);
        setErrors({});
        // Refresh local list AND context (dashboard vitals + sparklines)
        await fetchRecords();
        refreshAll();
      } else {
        toast.error(data.message || 'Failed to save record');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${backendUrl}/api/patient/health/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRecords(r => r.filter(x => x._id !== id));
        refreshAll(); // keep dashboard in sync
        toast.success('Record deleted');
      } else {
        toast.error('Could not delete');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-900/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Health Records</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {records.length} record{records.length !== 1 ? 's' : ''} logged
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRecords}
              className="p-2.5 rounded-xl border border-slate-700/60 text-slate-400
                hover:text-white hover:border-slate-600 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r
                from-emerald-500 to-teal-600 text-white text-sm font-semibold
                rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all
                shadow-lg shadow-emerald-900/30"
            >
              <Plus className="w-4 h-4" /> Add Record
            </motion.button>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowForm(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2
                  sm:-translate-x-1/2 sm:-translate-y-1/2 z-50
                  w-full sm:max-w-xl bg-slate-900 border border-slate-700/60
                  rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h2 className="text-base font-bold text-white">New Health Record</h2>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[80vh] px-6 py-5 space-y-6">
                  <Field label="Date & Time">
                    <Input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} />
                  </Field>

                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest mb-3 font-semibold">Select what to log</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SECTIONS.map(({ id, label, icon: Icon, color }) => {
                        const active = activeSections.includes(id);
                        return (
                          <button
                            key={id} type="button" onClick={() => toggleSection(id)}
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all
                              ${active ? activeSectionStyle[color] : sectionRing[color]} hover:opacity-90`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                            {active && <Check className="w-3 h-3 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {errors._general && (
                    <p className="text-red-400 text-xs flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errors._general}
                    </p>
                  )}

                  <AnimatePresence>
                    {activeSections.includes('bp') && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
                            <h3 className="text-rose-300 text-sm font-semibold">Blood Pressure</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Systolic (mmHg)" error={errors.bpSystolic}>
                              <Input type="number" placeholder="120" min="60" max="300" value={form.bpSystolic} onChange={e => set('bpSystolic', e.target.value)} />
                            </Field>
                            <Field label="Diastolic (mmHg)" error={errors.bpDiastolic}>
                              <Input type="number" placeholder="80" min="40" max="200" value={form.bpDiastolic} onChange={e => set('bpDiastolic', e.target.value)} />
                            </Field>
                          </div>
                          {form.bpSystolic && form.bpDiastolic && (() => {
                            const s = bpStatus(+form.bpSystolic, +form.bpDiastolic);
                            return s ? <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[s.color]}`}>{s.label}</span> : null;
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {activeSections.includes('sugar') && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplets className="w-4 h-4 text-amber-400" />
                            <h3 className="text-amber-300 text-sm font-semibold">Blood Sugar</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Value (mg/dL)" error={errors.sugarValue}>
                              <Input type="number" placeholder="110" min="0" value={form.sugarValue} onChange={e => set('sugarValue', e.target.value)} />
                            </Field>
                            <Field label="Test Type">
                              <Select value={form.sugarType} onChange={e => set('sugarType', e.target.value)}>
                                <option value="fasting">Fasting</option>
                                <option value="postprandial">Post-Prandial</option>
                                <option value="random">Random</option>
                                <option value="hba1c">HbA1c</option>
                              </Select>
                            </Field>
                          </div>
                          {form.sugarValue && (() => {
                            const s = sugarStatus(+form.sugarValue, form.sugarType);
                            return s ? <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[s.color]}`}>{s.label}</span> : null;
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {activeSections.includes('weight') && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Scale className="w-4 h-4 text-violet-400" />
                            <h3 className="text-violet-300 text-sm font-semibold">Weight & BMI</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Weight (kg)" error={errors.weightKg}>
                              <Input type="number" placeholder="72.5" step="0.1" min="10" value={form.weightKg} onChange={e => set('weightKg', e.target.value)} />
                            </Field>
                            <Field label="Height (cm)" hint="Optional override" error={errors.heightCm}>
                              <Input type="number" placeholder="170" min="50" value={form.heightCm} onChange={e => set('heightCm', e.target.value)} />
                            </Field>
                          </div>
                          {form.weightKg && form.heightCm && (() => {
                            const h = form.heightCm / 100;
                            const bmi = +(form.weightKg / (h * h)).toFixed(1);
                            const cat = bmi < 18.5 ? { l: 'Underweight', c: 'sky' } : bmi < 25 ? { l: 'Normal', c: 'emerald' } : bmi < 30 ? { l: 'Overweight', c: 'yellow' } : { l: 'Obese', c: 'red' };
                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-xs">BMI:</span>
                                <span className="text-white font-mono font-bold">{bmi}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[cat.c]}`}>{cat.l}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {activeSections.includes('notes') && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-sky-400" />
                            <h3 className="text-sky-300 text-sm font-semibold">Notes & Meal Context</h3>
                          </div>
                          <Field label="Meal Time">
                            <Select value={form.mealTime} onChange={e => set('mealTime', e.target.value)}>
                              <option value="">— select —</option>
                              <option value="before breakfast">Before Breakfast</option>
                              <option value="after breakfast">After Breakfast</option>
                              <option value="before lunch">Before Lunch</option>
                              <option value="after lunch">After Lunch</option>
                              <option value="before dinner">Before Dinner</option>
                              <option value="after dinner">After Dinner</option>
                              <option value="bedtime">Bedtime</option>
                            </Select>
                          </Field>
                          <Field label="Notes">
                            <Textarea placeholder="Any symptoms, medication taken, activity level…" value={form.notes} onChange={e => set('notes', e.target.value)} />
                          </Field>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="px-6 py-4 border-t border-slate-800 flex gap-3">
                  <button
                    type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400
                      hover:border-slate-600 hover:text-white text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit} disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600
                      text-white text-sm font-semibold flex items-center justify-center gap-2
                      hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60 transition-all"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save Record</>}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Records list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          <motion.div initial="hidden" animate="visible" className="space-y-3">
            <AnimatePresence>
              {records.map((r, i) => (
                <RecordCard key={r._id} record={r} onDelete={handleDelete} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}