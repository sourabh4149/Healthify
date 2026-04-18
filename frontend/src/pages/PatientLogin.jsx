// src/pages/auth/PatientLogin.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Heart, Activity,
} from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx'; // adjust path if needed
import toast from 'react-hot-toast';

// ─── Validation schema ───────────────────────────────────────────────────────
const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function PatientLogin() {
  const navigate = useNavigate();
  const location = useLocation()
  const from     = location.state?.from?.pathname || '/dashboard'
  const { setToken, setPatient, backendUrl } = useContext(AppContext);

  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  // ─── Submit handler ─────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${backendUrl}/api/patient/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Server returned 4xx / 5xx — use server message if available
        toast.error(json?.message || 'Login failed. Please try again.');
        return;
      }

      // Success — persist token + patient in context (and localStorage via setToken)
      setToken(json.token);
      setPatient(json.patient);
      toast.success(`Welcome back, ${json.patient?.name?.split(' ')[0] ?? 'there'}!`);
      navigate(from, { replace: true })
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please check your connection.');
    }
  };

  // ─── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex overflow-hidden">

      {/* ── Left Panel — branding ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">

        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-950 to-[#0a0f1e]" />
          <svg className="absolute inset-0 w-full h-full opacity-5">
            <defs>
              <pattern id="hex" width="60" height="52" patternUnits="userSpaceOnUse">
                <polygon
                  points="30,2 58,17 58,47 30,62 2,47 2,17"
                  fill="none" stroke="#10b981" strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-500 rounded-full blur-3xl"
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">HealthVault</h1>
              <p className="text-emerald-400 text-xs font-mono">Patient Portal</p>
            </div>
          </div>
        </div>

        {/* Floating vitals cards + tagline */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            {[
              { label: 'Blood Pressure', val: '128/82', icon: '❤️', color: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/30', delay: 0 },
              { label: 'Blood Sugar', val: '119 mg/dL', icon: '🩸', color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', delay: 0.5 },
              { label: 'Weight', val: '72.0 kg', icon: '⚖️', color: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30', delay: 1 },
            ].map(({ label, val, icon, color, border, delay }) => (
              <motion.div
                key={label}
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 4 + delay, repeat: Infinity, delay }}
                className={`flex items-center gap-4 bg-gradient-to-r ${color} backdrop-blur-sm border ${border} rounded-2xl p-4 w-64`}
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-white font-bold font-mono">{val}</p>
                  <p className="text-slate-400 text-xs">{label}</p>
                </div>
                <Activity className="w-4 h-4 text-emerald-400 ml-auto" />
              </motion.div>
            ))}
          </div>

          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Your health,<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                always with you.
              </span>
            </h2>
            <p className="text-slate-400 mt-3 leading-relaxed">
              Track vitals, manage records, consult doctors — all from one secure dashboard.
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="relative z-10 flex gap-3 flex-wrap">
          {['BP Tracking', 'Doctor Consult', 'e-Records', 'Analytics'].map(tag => (
            <span
              key={tag}
              className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right Panel — form ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Role badge */}
          <div className="flex items-center justify-center gap-2 mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl text-sm font-semibold">
            <Heart className="w-4 h-4" /> Patient Portal
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Patient Sign In</h2>
            <p className="text-slate-400 mt-2">Access your personal health dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-800/60 border rounded-xl text-white text-sm
                    placeholder-slate-600 outline-none transition-all
                    ${errors.email
                      ? 'border-red-500/60 focus:border-red-400'
                      : 'border-slate-700 focus:border-emerald-500/60 focus:bg-slate-800'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  ⚠ {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-300 text-sm font-medium">Password</label>
                <button
                  type="button"
                  className="text-emerald-400 text-xs hover:text-emerald-300 transition-all"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-12 py-3.5 bg-slate-800/60 border rounded-xl text-white text-sm
                    placeholder-slate-600 outline-none transition-all
                    ${errors.password
                      ? 'border-red-500/60 focus:border-red-400'
                      : 'border-slate-700 focus:border-emerald-500/60 focus:bg-slate-800'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-all"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">⚠ {errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <label htmlFor="remember" className="text-slate-400 text-sm cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500
                py-4 rounded-xl text-white font-semibold text-base
                flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <span>{isSubmitting ? 'Signing in…' : 'Sign In to Dashboard'}</span>
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          {/* Register link */}
          <p className="text-center text-slate-500 text-sm mt-6">
            New patient?{' '}
            <Link
              to="/register"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-all"
            >
              Create your account →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}