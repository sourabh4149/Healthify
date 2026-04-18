import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, User, Activity, BarChart3, FileText,
  Stethoscope, AlertTriangle, MapPin, ShoppingBag, Video,
  Menu, X, Heart, Bell, Settings, ChevronRight, LogOut
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',       color: 'text-emerald-400' },
  { to: '/profile',    icon: User,            label: 'My Profile',      color: 'text-cyan-400'    },
  { to: '/records',    icon: Activity,        label: 'Health Records',  color: 'text-blue-400'    },
  { to: '/analytics',  icon: BarChart3,       label: 'Analytics',       color: 'text-purple-400'  },
  { to: '/documents',  icon: FileText,        label: 'Documents',       color: 'text-amber-400'   },
  { to: '/health-assistent',   icon: Stethoscope,     label: 'Health Assistent', color: 'text-pink-400'    },
  { to: '/hospitals',  icon: MapPin,          label: 'Nearby Hospitals',color: 'text-indigo-400'  },
  { to: '/pharmacy',   icon: ShoppingBag,     label: 'Pharmacy',        color: 'text-orange-400'  },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { user, patient, logout } = useApp()
  const location  = useLocation()
  const navigate  = useNavigate()

    const allPages = [
      ...navItems,
      { to: '/emergency', label: 'Emergency & SOS' },
      { to: '/settings',  label: 'Settings'        },
    ]
    const currentPage = allPages.find(n => location.pathname === n.to)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-x-hidden">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-display font-bold text-white text-center text-lg mb-1">Sign out?</h3>
            <p className="text-slate-400 text-sm text-center font-body mb-6">
              You'll be redirected to the login page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-display font-semibold text-sm hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-display font-semibold text-sm hover:bg-red-500/30 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 z-40 flex flex-col
        bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/60
        transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-none">Healthify</h1>
              <p className="text-slate-500 text-xs font-body mt-0.5">Health Platform</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User card */}
        <NavLink
          to="/profile"
          className="mx-4 mt-4 p-4 glass rounded-2xl flex items-center gap-3 hover:border-emerald-500/30 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0">
            {patient?.avatarUrl
              ? <img src={patient.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              : initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-display font-semibold text-sm truncate">
              {user?.name || 'Loading…'}
            </p>
            <p className="text-slate-400 text-xs font-body truncate">
              {patient?.email || 'patient'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
        </NavLink>

        {/* Emergency button */}
        <NavLink
          to="/emergency"
          className={({ isActive }) => `mx-4 mt-3 p-3 rounded-2xl flex items-center gap-3 font-display font-semibold text-sm transition-all duration-200 ${
            isActive
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40'
          }`}
        >
          <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          Emergency &amp; SOS
          <div className="ml-auto w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        </NavLink>

        {/* Nav items */}
        <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto">
          <p className="text-slate-600 text-xs font-display font-semibold uppercase tracking-wider px-2 mb-2">Navigation</p>
          {navItems.map(({ to, icon: Icon, label, color }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/60 flex-shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Settings + Logout */}
        <div className="px-4 py-4 border-t border-slate-800/60 space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/60">
              <Settings className="w-4 h-4 text-slate-400" />
            </div>
            Settings
          </NavLink>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="nav-link w-full text-left hover:bg-red-500/10 hover:border-red-500/20 group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/60 group-hover:bg-red-500/10">
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
            </div>
            <span className="group-hover:text-red-400 transition-colors">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 px-4 lg:px-8 h-16 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-display font-bold text-white text-base">
              {currentPage?.label || 'MediCore'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              title="Sign out"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-display font-bold text-xs hover:opacity-80 transition-opacity"
            >
              {initials}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}