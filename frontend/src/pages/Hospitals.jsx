import { useState } from 'react'
import { MapPin, Phone, Star, Clock, Navigation, Search, Filter, Bed, Stethoscope } from 'lucide-react'

const HOSPITALS = [
  {
    id: 1, name: 'Max Super Speciality Hospital', type: 'Multi-Speciality',
    dist: '1.2 km', time: '4 min', open: true, rating: 4.5, reviews: 2341,
    beds: 12, phone: '+91 120 4555555', address: 'W-3, Sector 1, Vaishali, Ghaziabad',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology'],
    emergency: true, icu: true, insurance: true
  },
  {
    id: 2, name: 'Fortis Hospital Noida', type: 'Multi-Speciality',
    dist: '2.8 km', time: '8 min', open: true, rating: 4.3, reviews: 1876,
    beds: 6, phone: '+91 120 4545454', address: 'B-22, Sector 62, Noida',
    specialties: ['Cardiac Surgery', 'Gastroenterology', 'Urology'],
    emergency: true, icu: true, insurance: true
  },
  {
    id: 3, name: 'Kailash Hospital', type: 'General Hospital',
    dist: '3.1 km', time: '9 min', open: true, rating: 4.1, reviews: 987,
    beds: 20, phone: '+91 120 2777777', address: 'H-33, Sector 27, Noida',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology'],
    emergency: true, icu: false, insurance: true
  },
  {
    id: 4, name: 'Apollo Clinic Indirapuram', type: 'Clinic',
    dist: '4.5 km', time: '14 min', open: false, rating: 4.4, reviews: 654,
    beds: 0, phone: '+91 120 6611111', address: 'Shipra Sun City, Indirapuram, Ghaziabad',
    specialties: ['General Checkup', 'Diagnostics', 'Pharmacy'],
    emergency: false, icu: false, insurance: true
  },
  {
    id: 5, name: 'Yashoda Super Speciality Hospital', type: 'Super Speciality',
    dist: '5.2 km', time: '16 min', open: true, rating: 4.2, reviews: 1234,
    beds: 35, phone: '+91 120 6767676', address: 'NH-09, Kaushambi, Ghaziabad',
    specialties: ['Kidney Transplant', 'Liver Surgery', 'Neurosurgery'],
    emergency: true, icu: true, insurance: true
  },
]

const FILTERS = ['All', 'Emergency', 'ICU Available', 'Open Now', 'Insurance']

export default function Hospitals() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = HOSPITALS.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchFilter =
      filter === 'All' ? true :
      filter === 'Emergency' ? h.emergency :
      filter === 'ICU Available' ? h.icu :
      filter === 'Open Now' ? h.open :
      filter === 'Insurance' ? h.insurance : true
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">Nearby Hospitals</h2>
        <p className="section-subtitle">Real-time availability · Based on your location in Ghaziabad, UP</p>
      </div>

      {/* Map placeholder */}
      <div className="glass rounded-3xl p-6 relative overflow-hidden min-h-48 border border-slate-700/40">
        <div className="absolute inset-0 opacity-10 card-grid" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-mono text-xs">GPS Active · Ghaziabad, UP 201010</span>
          </div>
          {/* Fake map dots */}
          <div className="relative h-32 w-full">
            {[
              { top: '30%', left: '45%', label: 'You', color: 'bg-cyan-400', size: 'w-4 h-4' },
              { top: '25%', left: '55%', label: 'Max', color: 'bg-red-400', size: 'w-3 h-3' },
              { top: '50%', left: '65%', label: 'Fortis', color: 'bg-orange-400', size: 'w-3 h-3' },
              { top: '60%', left: '40%', label: 'Kailash', color: 'bg-amber-400', size: 'w-3 h-3' },
              { top: '20%', left: '30%', label: 'Apollo', color: 'bg-slate-500', size: 'w-3 h-3' },
              { top: '70%', left: '70%', label: 'Yashoda', color: 'bg-purple-400', size: 'w-3 h-3' },
            ].map((dot, i) => (
              <div key={i} className="absolute flex flex-col items-center" style={{ top: dot.top, left: dot.left }}>
                <div className={`${dot.size} rounded-full ${dot.color} ${i === 0 ? 'ring-4 ring-cyan-400/30' : ''} relative`}>
                  {i === 0 && <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-40" />}
                </div>
                <span className={`text-xs font-mono mt-0.5 ${i === 0 ? 'text-cyan-400' : 'text-slate-400'}`}>{dot.label}</span>
              </div>
            ))}
            {/* Fake roads */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 130">
              <line x1="0" y1="65" x2="400" y2="65" stroke="#64748b" strokeWidth="1" strokeDasharray="4" />
              <line x1="180" y1="0" x2="180" y2="130" stroke="#64748b" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="40" x2="400" y2="90" stroke="#64748b" strokeWidth="0.5" strokeDasharray="3" />
            </svg>
          </div>
          <p className="text-slate-600 text-xs text-center font-body mt-2">Interactive map · Integrate with Google Maps API for live view</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="input-field pl-9"
            placeholder="Search by hospital name or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-display font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'glass text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital cards */}
      <div className="space-y-4">
        {filtered.map(h => (
          <div
            key={h.id}
            onClick={() => setSelected(selected === h.id ? null : h.id)}
            className={`glass glass-hover rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
              selected === h.id ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700/40'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${h.open ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-700/60'}`}>
                🏥
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-white text-base">{h.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-display ${h.open ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                        {h.open ? '● Open' : '● Closed'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm font-body">{h.type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-display font-bold text-sm">{h.dist}</p>
                    <p className="text-slate-400 text-xs flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />{h.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" fill="#f59e0b" />
                    <span className="text-amber-400 text-xs font-mono font-bold">{h.rating}</span>
                    <span className="text-slate-500 text-xs">({h.reviews})</span>
                  </div>
                  {h.emergency && <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-display">Emergency</span>}
                  {h.icu && <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full font-display">ICU</span>}
                  {h.insurance && <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-display">Insurance</span>}
                </div>

                {h.open && h.beds > 0 && (
                  <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                    <Bed className="w-3 h-3" /> {h.beds} beds available
                  </p>
                )}
              </div>
            </div>

            {/* Expanded details */}
            {selected === h.id && (
              <div className="mt-4 pt-4 border-t border-slate-700/40 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs font-body mb-2">Address</p>
                    <p className="text-slate-300 text-sm font-body flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                      {h.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-body mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {h.specialties.map(s => (
                        <span key={s} className="text-xs px-2 py-1 bg-slate-700/60 text-slate-300 rounded-lg font-display">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <a href={`tel:${h.phone}`} className="btn-primary flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" /> Call Hospital
                  </a>
                  <button className="btn-secondary flex items-center gap-2 text-sm">
                    <Navigation className="w-4 h-4" /> Directions
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}