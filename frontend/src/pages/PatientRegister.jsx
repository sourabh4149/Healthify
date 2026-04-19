// src/pages/auth/PatientRegister.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, User, Lock, Mail, Phone, MapPin, Pill,
  ChevronRight, ChevronLeft, Eye, EyeOff, Check, X,
  AlertCircle, Activity, Shield, Stethoscope, Loader2,
  ArrowRight, Sparkles,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext.jsx';

// ─── Step Config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'account',   title: 'Account',   subtitle: 'Credentials & security', icon: Shield,      color: 'emerald' },
  { id: 'personal',  title: 'Personal',  subtitle: 'Basic information',       icon: User,        color: 'sky'     },
  { id: 'address',   title: 'Location',  subtitle: 'Address & emergency',     icon: MapPin,      color: 'violet'  },
  { id: 'medical',   title: 'Medical',   subtitle: 'Health background',       icon: Stethoscope, color: 'rose'    },
];

const STEP_COLORS = {
  emerald: { ring: 'border-emerald-500/50', active: 'border-emerald-500 bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-500', line: 'bg-emerald-500', text: 'text-emerald-400', subtle: 'bg-emerald-500/10 border-emerald-500/25', btn: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500' },
  sky:     { ring: 'border-sky-500/50',     active: 'border-sky-500 bg-sky-500/20 text-sky-300',             dot: 'bg-sky-500',     line: 'bg-sky-500',     text: 'text-sky-400',     subtle: 'bg-sky-500/10 border-sky-500/25',         btn: 'from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500'         },
  violet:  { ring: 'border-violet-500/50',  active: 'border-violet-500 bg-violet-500/20 text-violet-300',    dot: 'bg-violet-500',  line: 'bg-violet-500',  text: 'text-violet-400',  subtle: 'bg-violet-500/10 border-violet-500/25',   btn: 'from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500' },
  rose:    { ring: 'border-rose-500/50',    active: 'border-rose-500 bg-rose-500/20 text-rose-300',          dot: 'bg-rose-500',    line: 'bg-rose-500',    text: 'text-rose-400',    subtle: 'bg-rose-500/10 border-rose-500/25',       btn: 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500'       },
};

// ─── Validation ───────────────────────────────────────────────────────────────
const STEP_REQUIRED = {
  0: ['fullName','email','password','confirmPassword'],
  1: ['dateOfBirth','gender','bloodGroup','heightCm','phone'],
  2: ['street','city','state','zipCode','emergencyName','emergencyRelationship','emergencyPhone'],
  3: [], // fully optional
};

const validateStep = (step, fields) => {
  const errs = {};
  const req = STEP_REQUIRED[step];

  if (step === 0) {
    if (!fields.fullName?.trim())         errs.fullName = 'Full name is required';
    else if (fields.fullName.trim().length < 2) errs.fullName = 'Name too short';

    if (!fields.email?.trim())            errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Invalid email address';

    if (!fields.password)                 errs.password = 'Password is required';
    else if (fields.password.length < 8)  errs.password = 'At least 8 characters';
    else if (!/[A-Z]/.test(fields.password)) errs.password = 'Must include an uppercase letter';
    else if (!/[0-9]/.test(fields.password)) errs.password = 'Must include a number';
    else if (!/[!@#$%^&*()-+]/.test(fields.password)) errs.password = 'Must include a special character';

    if (!fields.confirmPassword)          errs.confirmPassword = 'Please confirm your password';
    else if (fields.confirmPassword !== fields.password) errs.confirmPassword = 'Passwords do not match';
  }

  if (step === 1) {
    if (!fields.dateOfBirth)              errs.dateOfBirth = 'Date of birth is required';
    else {
      const age = (Date.now() - new Date(fields.dateOfBirth)) / (365.25 * 24 * 3600 * 1000);
      if (age < 1)  errs.dateOfBirth = 'Invalid date';
      if (age > 120) errs.dateOfBirth = 'Invalid date';
    }
    if (!fields.gender)                   errs.gender = 'Select a gender';
    if (!fields.bloodGroup)               errs.bloodGroup = 'Select blood group';
    if (!fields.heightCm)                 errs.heightCm = 'Height is required';
    else if (+fields.heightCm < 50 || +fields.heightCm > 300) errs.heightCm = '50–300 cm';
    if (!fields.phone?.trim())            errs.phone = 'Phone is required';
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(fields.phone.trim())) errs.phone = 'Invalid phone number';
  }

  if (step === 2) {
    if (!fields.street?.trim())           errs.street = 'Street address required';
    if (!fields.city?.trim())             errs.city = 'City required';
    if (!fields.state?.trim())            errs.state = 'State required';
    if (!fields.zipCode?.trim())          errs.zipCode = 'ZIP code required';
    else if (!/^\d{4,10}$/.test(fields.zipCode.trim())) errs.zipCode = 'Invalid ZIP code';
    if (!fields.emergencyName?.trim())    errs.emergencyName = 'Emergency contact name required';
    if (!fields.emergencyRelationship?.trim()) errs.emergencyRelationship = 'Relationship required';
    if (!fields.emergencyPhone?.trim())   errs.emergencyPhone = 'Emergency phone required';
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(fields.emergencyPhone.trim())) errs.emergencyPhone = 'Invalid phone';
  }

  return errs;
};

// ─── Reusable primitives ─────────────────────────────────────────────────────
const Label = ({ children, optional }) => (
  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-widest mb-1.5">
    {children}
    {optional && <span className="ml-2 text-slate-500 normal-case font-normal text-xs tracking-normal">(optional)</span>}
  </label>
);

const Err = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
    <AlertCircle className="w-3 h-3 flex-shrink-0" />{msg}
  </p>
) : null;

const baseInput = (hasErr) =>
  `w-full px-4 py-3 bg-slate-800/60 border rounded-xl text-white text-sm placeholder-slate-600
   outline-none transition-all ${hasErr
    ? 'border-red-500/60 focus:border-red-400'
    : 'border-slate-700/70 focus:border-emerald-500/60 focus:bg-slate-800/90'}`;

const Inp = ({ error, icon: Icon, rightSlot, ...props }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />}
    <input
      {...props}
      className={`${baseInput(!!error)} ${Icon ? 'pl-10' : ''} ${rightSlot ? 'pr-12' : ''}`}
    />
    {rightSlot && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>}
  </div>
);

const Sel = ({ error, children, ...props }) => (
  <div className="relative">
    <select {...props} className={`${baseInput(!!error)} appearance-none pr-8`}>
      {children}
    </select>
    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 rotate-90 pointer-events-none" />
  </div>
);

// ─── Tag Input ────────────────────────────────────────────────────────────────
const TagInput = ({ tags, onAdd, onRemove, placeholder, colorClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' }) => {
  const [val, setVal] = useState('');

  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) onAdd(t);
    setVal('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !val && tags.length) onRemove(tags.length - 1);
  };

  return (
    <div className="min-h-[48px] w-full px-3 py-2 bg-slate-800/60 border border-slate-700/70
      rounded-xl focus-within:border-emerald-500/60 transition-all flex flex-wrap gap-1.5 items-center">
      {tags.map((tag, i) => (
        <span key={i} className={`inline-flex items-center gap-1 border text-xs px-2.5 py-1 rounded-lg ${colorClass}`}>
          {tag}
          <button type="button" onClick={() => onRemove(i)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text" value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={handleKey}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : 'Add more…'}
        className="flex-1 min-w-[140px] bg-transparent text-white text-sm placeholder-slate-600 outline-none"
      />
    </div>
  );
};

// ─── Password strength meter ──────────────────────────────────────────────────
const PwdStrength = ({ password }) => {
  const checks = [
    { label: '8+ chars',    ok: password.length >= 8 },
    { label: 'Uppercase',   ok: /[A-Z]/.test(password) },
    { label: 'Number',      ok: /[0-9]/.test(password) },
    { label: 'Special',     ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const barColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'][score - 1] || 'bg-slate-700';
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? barColor : 'bg-slate-700'}`} />
        ))}
        {label && <span className={`text-xs font-medium ml-1 ${barColor.replace('bg-','text-')}`}>{label}</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {checks.map(({ label, ok }) => (
          <span key={label} className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-md transition-all
            ${ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
            <Check className="w-2.5 h-2.5" /> {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Animated slide variants ──────────────────────────────────────────────────
const slide = {
  enter:  d => ({ opacity: 0, x: d > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit:   d => ({ opacity: 0, x: d > 0 ? -48 : 48 }),
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PatientRegister() {
  const navigate = useNavigate();
  const { backendUrl, setToken, setPatient } = useApp();

  const [step, setStep]         = useState(0);
  const [dir, setDir]           = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── flat form state matching Patient model exactly ──────────────────────────
  const [f, setF] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    phone: '', dateOfBirth: '', gender: '', bloodGroup: '', heightCm: '',
    street: '', city: '', state: '', zipCode: '',
    emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
    // array fields stored as actual arrays
    allergies: [], chronicConditions: [], currentMedications: [],
  });

  const set = useCallback((key, val) => setF(p => ({ ...p, [key]: val })), []);

  // array helpers
  const addTag = (key, val) => setF(p => ({ ...p, [key]: [...p[key], val] }));
  const removeTag = (key, idx) => setF(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));

  const currentColor = STEP_COLORS[STEPS[step].color];

  // ── step navigation ─────────────────────────────────────────────────────────
  const goNext = () => {
    const errs = validateStep(step, f);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      toast.error(`Fix ${Object.keys(errs).length} error${Object.keys(errs).length > 1 ? 's' : ''} to continue`);
      return;
    }
    setFieldErrors({});
    setDir(1);
    setStep(s => s + 1);
  };

  const goPrev = () => {
    setFieldErrors({});
    setDir(-1);
    setStep(s => s - 1);
  };

  // clear individual field error on change
  const clearErr = (key) => setFieldErrors(p => { const n = { ...p }; delete n[key]; return n; });

  // ── submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // validate all required steps
    for (let i = 0; i < 3; i++) {
      const errs = validateStep(i, f);
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        setDir(i < step ? -1 : 1);
        setStep(i);
        toast.error(`Please fix "${STEPS[i].title}" step first`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName:    f.fullName.trim(),
        email:       f.email.trim().toLowerCase(),
        password:    f.password,
        phone:       f.phone.trim(),
        dateOfBirth: f.dateOfBirth,
        gender:      f.gender,
        bloodGroup:  f.bloodGroup,
        heightCm:    Number(f.heightCm),
        address: {
          street:  f.street.trim(),
          city:    f.city.trim(),
          state:   f.state.trim(),
          zipCode: f.zipCode.trim(),
        },
        emergencyContact: {
          name:         f.emergencyName.trim(),
          relationship: f.emergencyRelationship.trim(),
          phone:        f.emergencyPhone.trim(),
        },
        // optional arrays — send as-is (backend accepts empty arrays)
        allergies:          f.allergies,
        chronicConditions:  f.chronicConditions,
        currentMedications: f.currentMedications,
      };

      const { data: res } = await axios.post(`${backendUrl}/api/patient/register`, payload);

      if (res.success) {
        setToken(res.token);
        setPatient(res.patient);
        toast.success('Welcome to HealthVault! 🎉');
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center p-4 relative overflow-hidden">

      {/* ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ scale: [1,1.2,1], opacity:[0.06,0.12,0.06] }} transition={{ duration:7, repeat:Infinity }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1,1.15,1], opacity:[0.04,0.09,0.04] }} transition={{ duration:9, repeat:Infinity, delay:2 }}
          className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-teal-500 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="w-full max-w-lg relative z-10">

        {/* ── Logo ── */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600
              flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none tracking-tight">HealthVault</h1>
              <p className="text-emerald-400 text-[11px] font-mono mt-0.5">Patient Registration</p>
            </div>
          </div>
          <Link to="/login" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
            Sign in <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* ── Step progress bar ── */}
        <div className="flex items-center gap-0 mb-6">
          {STEPS.map((s, i) => {
            const col = STEP_COLORS[s.color];
            const done = i < step;
            const active = i === step;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={{ scale: active ? 1.1 : 1 }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border transition-all duration-300
                      ${done  ? `${col.dot} text-white border-transparent shadow-sm`
                              : active ? col.active + ' border'
                              : 'bg-slate-800/80 border-slate-700 text-slate-500'}`}
                  >
                    {done ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </motion.div>
                  <p className={`text-[10px] font-medium hidden sm:block transition-colors ${active ? col.text : done ? 'text-slate-400' : 'text-slate-600'}`}>
                    {s.title}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 mb-5 transition-all duration-500 ${i < step ? col.line : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Card ── */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">

          {/* card header stripe */}
          <div className={`px-6 py-4 border-b border-slate-800 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${currentColor.subtle}`}>
                {React.createElement(STEPS[step].icon, { className: `w-4 h-4 ${currentColor.text}` })}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{STEPS[step].title}</h2>
                <p className="text-slate-500 text-xs">{STEPS[step].subtitle}</p>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-mono">{step + 1} / {STEPS.length}</span>
          </div>

          <div className="px-6 py-5 overflow-hidden">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={step} custom={dir} variants={slide}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
              >

                {/* ══ STEP 0 — Account ══ */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <Inp icon={User} error={fieldErrors.fullName} placeholder="Rajesh Sharma"
                        value={f.fullName} onChange={e => { set('fullName', e.target.value); clearErr('fullName'); }} />
                      <Err msg={fieldErrors.fullName} />
                    </div>

                    <div>
                      <Label>Email Address</Label>
                      <Inp icon={Mail} error={fieldErrors.email} placeholder="rajesh@example.com" type="email"
                        value={f.email} onChange={e => { set('email', e.target.value); clearErr('email'); }} />
                      <Err msg={fieldErrors.email} />
                    </div>

                    <div>
                      <Label>Password</Label>
                      <Inp icon={Lock} error={fieldErrors.password}
                        type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, uppercase & number"
                        value={f.password} onChange={e => { set('password', e.target.value); clearErr('password'); }}
                        rightSlot={
                          <button type="button" onClick={() => setShowPass(v => !v)}
                            className="text-slate-500 hover:text-slate-300 transition-colors">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />
                      <Err msg={fieldErrors.password} />
                      {f.password && <div className="mt-2"><PwdStrength password={f.password} /></div>}
                    </div>

                    <div>
                      <Label>Confirm Password</Label>
                      <Inp icon={Lock} error={fieldErrors.confirmPassword}
                        type={showConf ? 'text' : 'password'} placeholder="Re-enter password"
                        value={f.confirmPassword} onChange={e => { set('confirmPassword', e.target.value); clearErr('confirmPassword'); }}
                        rightSlot={
                          <button type="button" onClick={() => setShowConf(v => !v)}
                            className="text-slate-500 hover:text-slate-300 transition-colors">
                            {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />
                      <Err msg={fieldErrors.confirmPassword} />
                      {f.confirmPassword && f.password === f.confirmPassword && (
                        <p className="flex items-center gap-1 text-emerald-400 text-xs mt-1.5">
                          <Check className="w-3 h-3" /> Passwords match
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ══ STEP 1 — Personal ══ */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Date of Birth</Label>
                        <input type="date" max={new Date().toISOString().split('T')[0]}
                          value={f.dateOfBirth}
                          onChange={e => { set('dateOfBirth', e.target.value); clearErr('dateOfBirth'); }}
                          className={`${baseInput(!!fieldErrors.dateOfBirth)} text-slate-300`} />
                        <Err msg={fieldErrors.dateOfBirth} />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <Sel error={fieldErrors.gender} value={f.gender}
                          onChange={e => { set('gender', e.target.value); clearErr('gender'); }}>
                          <option value="">Select…</option>
                          {['Male','Female','Other'].map(g => <option key={g} value={g}>{g}</option>)}
                        </Sel>
                        <Err msg={fieldErrors.gender} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Blood Group</Label>
                        <Sel error={fieldErrors.bloodGroup} value={f.bloodGroup}
                          onChange={e => { set('bloodGroup', e.target.value); clearErr('bloodGroup'); }}>
                          <option value="">Select…</option>
                          {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </Sel>
                        <Err msg={fieldErrors.bloodGroup} />
                      </div>
                      <div>
                        <Label>Height (cm)</Label>
                        <input type="number" min="50" max="300" placeholder="175"
                          value={f.heightCm}
                          onChange={e => { set('heightCm', e.target.value); clearErr('heightCm'); }}
                          className={baseInput(!!fieldErrors.heightCm)} />
                        <Err msg={fieldErrors.heightCm} />
                      </div>
                    </div>

                    <div>
                      <Label>Phone Number</Label>
                      <Inp icon={Phone} error={fieldErrors.phone} placeholder="+91 98765 43210"
                        value={f.phone} onChange={e => { set('phone', e.target.value); clearErr('phone'); }} />
                      <Err msg={fieldErrors.phone} />
                    </div>

                    {/* Age & BMI preview if enough data */}
                    {f.dateOfBirth && f.heightCm && (
                      <div className="flex gap-2">
                        {(() => {
                          const age = Math.floor((Date.now() - new Date(f.dateOfBirth)) / (365.25*24*3600*1000));
                          return (
                            <div className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-center">
                              <p className="text-white font-bold font-mono">{age}</p>
                              <p className="text-slate-500 text-xs">Years old</p>
                            </div>
                          );
                        })()}
                        <div className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-center">
                          <p className="text-white font-bold font-mono">{f.heightCm} cm</p>
                          <p className="text-slate-500 text-xs">Height</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ══ STEP 2 — Address & Emergency ══ */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-violet-400 text-xs font-semibold uppercase tracking-wider">Home Address</span>
                    </div>

                    <div>
                      <Label>Street Address</Label>
                      <input placeholder="42, Shastri Nagar" value={f.street}
                        onChange={e => { set('street', e.target.value); clearErr('street'); }}
                        className={baseInput(!!fieldErrors.street)} />
                      <Err msg={fieldErrors.street} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>City</Label>
                        <input placeholder="Ghaziabad" value={f.city}
                          onChange={e => { set('city', e.target.value); clearErr('city'); }}
                          className={baseInput(!!fieldErrors.city)} />
                        <Err msg={fieldErrors.city} />
                      </div>
                      <div>
                        <Label>State</Label>
                        <input placeholder="Uttar Pradesh" value={f.state}
                          onChange={e => { set('state', e.target.value); clearErr('state'); }}
                          className={baseInput(!!fieldErrors.state)} />
                        <Err msg={fieldErrors.state} />
                      </div>
                    </div>

                    <div>
                      <Label>ZIP Code</Label>
                      <input placeholder="201002" value={f.zipCode}
                        onChange={e => { set('zipCode', e.target.value); clearErr('zipCode'); }}
                        className={baseInput(!!fieldErrors.zipCode)} />
                      <Err msg={fieldErrors.zipCode} />
                    </div>

                    {/* Emergency divider */}
                    <div className="border-t border-slate-800 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-400 text-xs font-semibold uppercase tracking-wider">Emergency Contact</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label>Contact Name</Label>
                          <input placeholder="Priya Sharma" value={f.emergencyName}
                            onChange={e => { set('emergencyName', e.target.value); clearErr('emergencyName'); }}
                            className={baseInput(!!fieldErrors.emergencyName)} />
                          <Err msg={fieldErrors.emergencyName} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Relationship</Label>
                            <Sel error={fieldErrors.emergencyRelationship}
                              value={f.emergencyRelationship}
                              onChange={e => { set('emergencyRelationship', e.target.value); clearErr('emergencyRelationship'); }}>
                              <option value="">Select…</option>
                              {['Spouse','Parent','Sibling','Child','Friend','Other'].map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </Sel>
                            <Err msg={fieldErrors.emergencyRelationship} />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <input placeholder="+91…" value={f.emergencyPhone}
                              onChange={e => { set('emergencyPhone', e.target.value); clearErr('emergencyPhone'); }}
                              className={baseInput(!!fieldErrors.emergencyPhone)} />
                            <Err msg={fieldErrors.emergencyPhone} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ══ STEP 3 — Medical (fully optional) ══ */}
                {step === 3 && (
                  <div className="space-y-5">
                    {/* Info notice */}
                    <div className="flex gap-3 p-3.5 bg-slate-800/70 border border-slate-700/50 rounded-xl">
                      <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-300 text-xs font-semibold mb-0.5">All fields are optional</p>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Press <kbd className="bg-slate-700 px-1 py-0.5 rounded text-slate-300 text-[10px]">Enter</kbd> or{' '}
                          <kbd className="bg-slate-700 px-1 py-0.5 rounded text-slate-300 text-[10px]">,</kbd> to add each item. You can update this from your profile later.
                        </p>
                      </div>
                    </div>

                    {/* Allergies */}
                    <div>
                      <Label optional>Known Allergies</Label>
                      <p className="text-slate-600 text-xs mb-2">e.g. Penicillin, Sulfa drugs, Latex, Pollen</p>
                      <TagInput
                        tags={f.allergies}
                        onAdd={v => addTag('allergies', v)}
                        onRemove={i => removeTag('allergies', i)}
                        placeholder="Type allergy and press Enter…"
                        colorClass="bg-amber-500/15 border-amber-500/30 text-amber-300"
                      />
                    </div>

                    {/* Chronic Conditions */}
                    <div>
                      <Label optional>Chronic Conditions</Label>
                      <p className="text-slate-600 text-xs mb-2">e.g. Type 2 Diabetes, Hypertension, Asthma, PCOD</p>
                      <TagInput
                        tags={f.chronicConditions}
                        onAdd={v => addTag('chronicConditions', v)}
                        onRemove={i => removeTag('chronicConditions', i)}
                        placeholder="Type condition and press Enter…"
                        colorClass="bg-rose-500/15 border-rose-500/30 text-rose-300"
                      />
                    </div>

                    {/* Current Medications */}
                    <div>
                      <Label optional>Current Medications</Label>
                      <p className="text-slate-600 text-xs mb-2">e.g. Metformin 500mg, Amlodipine 5mg, Thyronorm</p>
                      <TagInput
                        tags={f.currentMedications}
                        onAdd={v => addTag('currentMedications', v)}
                        onRemove={i => removeTag('currentMedications', i)}
                        placeholder="Type medication and press Enter…"
                        colorClass="bg-violet-500/15 border-violet-500/30 text-violet-300"
                      />
                    </div>

                    {/* Live preview chips */}
                    {(f.chronicConditions.length > 0 || f.allergies.length > 0) && (
                      <div className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                        <p className="text-slate-500 text-xs mb-2">Medical summary preview</p>
                        <div className="flex flex-wrap gap-1.5">
                          {f.chronicConditions.map((c, i) => (
                            <span key={i} className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/25 px-2 py-0.5 rounded-lg">🩺 {c}</span>
                          ))}
                          {f.allergies.map((a, i) => (
                            <span key={i} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded-lg">⚠ {a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Nav buttons ── */}
          <div className="px-6 pb-6 flex gap-3 mt-1">
            {step > 0 && (
              <motion.button type="button" onClick={goPrev}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex-1 py-3.5 rounded-xl border border-slate-700 text-slate-300
                  hover:border-slate-600 hover:bg-slate-800/60 text-sm font-semibold
                  flex items-center justify-center gap-2 transition-all">
                <ChevronLeft className="w-4 h-4" /> Back
              </motion.button>
            )}

            {step < STEPS.length - 1 ? (
              <motion.button type="button" onClick={goNext}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className={`flex-1 bg-gradient-to-r ${currentColor.btn} py-3.5 rounded-xl text-white
                  text-sm font-semibold flex items-center justify-center gap-2
                  transition-all shadow-lg`}>
                Next: {STEPS[step + 1].title} <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button type="button" onClick={handleSubmit} disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.02 }} whileTap={{ scale: submitting ? 1 : 0.97 }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600
                  hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60
                  disabled:cursor-not-allowed py-3.5 rounded-xl text-white text-sm font-semibold
                  flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                  : <><Check className="w-4 h-4" /> Create Account</>
                }
              </motion.button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          By registering you agree to our{' '}
          <span className="text-emerald-500/70 hover:text-emerald-400 cursor-pointer transition-colors">Terms of Service</span>
          {' '}and{' '}
          <span className="text-emerald-500/70 hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}