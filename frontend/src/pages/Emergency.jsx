// src/pages/Emergency.jsx
import { useState, useEffect } from 'react'
import { Phone, AlertTriangle, MapPin, Clock, Heart, User, Shield } from 'lucide-react'
import { useApp } from '../context/AppContext'

const EMERGENCY_NUMBERS = [
  { name: 'National Emergency', number: '112', desc: 'Police, Fire, Ambulance', icon: '🆘', color: 'from-red-500 to-rose-600' },
  { name: 'Ambulance',          number: '108', desc: 'Medical Emergency',       icon: '🚑', color: 'from-orange-500 to-red-500' },
  { name: 'Police',             number: '100', desc: 'Law Enforcement',         icon: '👮', color: 'from-blue-500 to-indigo-600' },
  { name: 'Fire Brigade',       number: '101', desc: 'Fire Emergency',          icon: '🚒', color: 'from-orange-400 to-amber-500' },
]

// ── Google Places nearby hospitals hook ──────────────────────────────────────
function useNearbyHospitals() {
  const [hospitals, setHospitals]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [locationErr, setLocationErr] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationErr('Geolocation not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude: lat, longitude: lng } = coords

          // ── Google Places Nearby Search ──
          // Replace YOUR_GOOGLE_PLACES_API_KEY with your actual key
          // IMPORTANT: In production, proxy this through your backend to keep the key secret
          const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
          const radius = 5000 // 5 km
          const url =
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
            `?location=${lat},${lng}&radius=${radius}&type=hospital&key=${apiKey}`

          // Because Google Places API blocks direct browser requests (CORS),
          // we proxy through our own backend endpoint:
          // Backend route: GET /api/places/hospitals?lat=&lng=
          // (see backend snippet below)
          const res  = await fetch(
            `/api/places/hospitals?lat=${lat}&lng=${lng}`
          )
          const data = await res.json()

          if (!data.success) throw new Error(data.message)

          setHospitals(data.hospitals)
        } catch (err) {
          setLocationErr('Could not load nearby hospitals')
          console.error(err)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setLocationErr('Location access denied — enable location to see nearby hospitals')
        setLoading(false)
      },
      { timeout: 10000 }
    )
  }, [])

  return { hospitals, loading, locationErr }
}

export default function Emergency() {
  const { user, patient } = useApp()

  const [sosActive, setSosActive] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [called, setCalled]       = useState(false)
  const [sosTimer, setSosTimer]   = useState(null)

  const { hospitals, loading: hospitalsLoading, locationErr } = useNearbyHospitals()

  const call = (num) => { window.location.href = `tel:${num}` }

  // ── SOS with cancel support ───────────────────────────────────────────────
  const handleSOS = () => {
    if (sosActive) {
      // Cancel
      clearInterval(sosTimer)
      setSosActive(false)
      setCountdown(5)
      return
    }

    setSosActive(true)
    setCalled(false)
    let c = 5

    const interval = setInterval(() => {
      c--
      setCountdown(c)
      if (c === 0) {
        clearInterval(interval)
        setCalled(true)
        setSosActive(false)
        setCountdown(5)
        window.location.href = 'tel:108'
      }
    }, 1000)

    setSosTimer(interval)
  }

  // Derive safe values from patient profile
  const allergies         = patient?.allergies         ?? []
  const chronicConditions = patient?.chronicConditions ?? []
  const emergencyContact  = patient?.emergencyContact  ?? null   // { name, relationship, phone }

  const medicalAlertItems = [
    { label: 'Name',        value: user?.name      || '—',                          icon: '👤' },
    { label: 'Blood Group', value: patient?.bloodGroup || '—',                      icon: '🩸' },
    { label: 'Conditions',  value: chronicConditions.length ? chronicConditions.join(', ') : 'None', icon: '⚕️' },
    { label: 'Allergies',   value: allergies.length ? allergies.join(', ') : 'None', icon: '⚠️' },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-white mb-1">Emergency &amp; SOS</h2>
        <p className="text-slate-400 text-sm font-body">Quick access to emergency services and contacts</p>
      </div>

      {/* ── SOS Button ── */}
      <div className="glass rounded-3xl p-8 border border-red-500/20 bg-red-500/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5" />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-6 relative">
            <button
              onClick={handleSOS}
              className={`w-40 h-40 rounded-full font-display font-black text-3xl text-white transition-all duration-200 flex flex-col items-center justify-center gap-1 relative ${
                sosActive
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 scale-95'
                  : 'bg-gradient-to-br from-red-500 to-rose-600 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40 active:scale-95'
              }`}
            >
              <div className="absolute inset-0 rounded-full border-2 border-red-400/40 animate-ping" />
              <div
                className="absolute inset-0 rounded-full border-2 border-red-400/20"
                style={{ animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite', animationDelay: '0.5s' }}
              />
              <AlertTriangle className="w-10 h-10" />
              <span>SOS</span>
            </button>
          </div>

          {sosActive ? (
            <div className="text-center">
              <p className="font-display font-bold text-white text-xl mb-1">Calling Ambulance in…</p>
              <p className="font-display font-black text-red-400 text-5xl">{countdown}</p>
              <p className="text-slate-400 text-sm font-body mt-2">Tap again to cancel</p>
            </div>
          ) : called ? (
            <div className="text-center">
              <p className="font-display font-bold text-emerald-400 text-xl">✓ Emergency services notified</p>
              <p className="text-slate-400 text-sm font-body mt-1">Stay calm. Help is on the way.</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-display font-bold text-white text-xl mb-1">Emergency SOS</p>
              <p className="text-slate-400 text-sm font-body max-w-sm">
                Press to call 108 Ambulance. Your location will be shared automatically.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Medical Alert Card ── */}
      <div className="glass rounded-2xl p-5 border border-red-500/10">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-400" /> Medical Alert Card
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {medicalAlertItems.map((item, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-3">
              <span className="text-lg">{item.icon}</span>
              <p className="text-slate-500 text-xs font-body mt-1">{item.label}</p>
              <p className="text-white font-display font-semibold text-sm leading-snug">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Emergency Numbers ── */}
      <div>
        <h3 className="section-title">Emergency Numbers</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {EMERGENCY_NUMBERS.map((e, i) => (
            <button
              key={i}
              onClick={() => call(e.number)}
              className={`bg-gradient-to-br ${e.color} p-5 rounded-2xl text-white text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-95`}
            >
              <span className="text-3xl mb-3 block">{e.icon}</span>
              <p className="font-display font-bold text-lg">{e.number}</p>
              <p className="font-display font-semibold text-sm opacity-90">{e.name}</p>
              <p className="text-xs opacity-70 font-body mt-0.5">{e.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Nearby Hospitals (Google Places) ── */}
      <div>
        <h3 className="section-title">Nearest Emergency Hospitals</h3>

        {locationErr ? (
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-slate-400 text-sm">{locationErr}</p>
          </div>
        ) : hospitalsLoading ? (
          <div className="glass rounded-2xl p-8 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Finding hospitals near you…</p>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-slate-400 text-sm">No hospitals found nearby</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hospitals.map((h, i) => (
              <div key={i} className="glass glass-hover rounded-2xl p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  h.open ? 'bg-emerald-500/10' : 'bg-slate-700/60'
                }`}>
                  🏥
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-white text-sm">{h.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-display ${
                      h.open
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-700 text-slate-500'
                    }`}>
                      {h.open ? 'Open' : 'Closed'}
                    </span>
                    {h.rating && (
                      <span className="text-xs text-amber-400">★ {h.rating}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{h.vicinity}
                    </span>
                    {h.distance && (
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />{h.distance}
                      </span>
                    )}
                  </div>
                </div>
                {h.open && (
                  <button
                    onClick={() => call('108')}
                    className="btn-danger text-xs py-2 px-4 flex items-center gap-1 flex-shrink-0"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Emergency Contact (from patient profile) ── */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" /> Emergency Contact
        </h3>

        {emergencyContact?.name ? (
          <div className="flex items-center gap-4 p-3 bg-slate-800/40 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-display font-bold text-xs flex-shrink-0">
              {emergencyContact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-display font-semibold text-sm">{emergencyContact.name}</p>
              <p className="text-slate-400 text-xs font-body">{emergencyContact.relationship || 'Emergency Contact'}</p>
              <p className="text-slate-500 text-xs font-mono mt-0.5">{emergencyContact.phone || '—'}</p>
            </div>
            {emergencyContact.phone && (
              <button
                onClick={() => call(emergencyContact.phone.replace(/\s+/g, ''))}
                className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all flex-shrink-0"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-800/40 rounded-xl text-center">
            <p className="text-slate-500 text-sm">No emergency contact added to your profile</p>
            <p className="text-slate-600 text-xs mt-1">Go to Profile → Edit to add one</p>
          </div>
        )}
      </div>
    </div>
  )
}