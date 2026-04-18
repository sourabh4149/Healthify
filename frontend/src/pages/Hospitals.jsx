import { useState } from 'react'
import { MapPin, Phone, Star, Clock, Navigation, Search, Bed } from 'lucide-react'

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

const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    background: '#0f1117',
    minHeight: '100vh',
    color: '#e2e8f0',
    padding: '16px',
    boxSizing: 'border-box',
  },
  wrapper: {
    maxWidth: 720,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  sectionTitle: {
    fontSize: 'clamp(20px, 5vw, 26px)',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  sectionSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  glass: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  mapBox: {
    padding: '20px',
    borderRadius: 20,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    position: 'relative',
    overflow: 'hidden',
  },
  gpsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  gpsDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#34d399',
    boxShadow: '0 0 8px #34d399',
  },
  gpsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#34d399',
  },
  mapArea: {
    position: 'relative',
    height: 120,
    width: '100%',
  },
  mapNote: {
    fontSize: 11,
    color: '#334155',
    textAlign: 'center',
    marginTop: 8,
  },
  searchRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
  },
  searchInput: {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '10px 12px 10px 36px',
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  searchIcon: {
    position: 'absolute',
    left: 11,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    pointerEvents: 'none',
  },
  filterRow: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'none',
  },
  filterBtn: (active) => ({
    padding: '7px 14px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    border: active ? '1px solid rgba(52,211,153,0.35)' : '1px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
    color: active ? '#34d399' : '#94a3b8',
    transition: 'all 0.2s',
    flexShrink: 0,
  }),
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: (selected) => ({
    background: selected ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${selected ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 18,
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.25s',
  }),
  cardTop: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  icon: (open) => ({
    width: 46,
    height: 46,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
    background: open ? 'rgba(52,211,153,0.08)' : 'rgba(100,116,139,0.2)',
    border: open ? '1px solid rgba(52,211,153,0.2)' : '1px solid transparent',
  }),
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  hospitalName: {
    fontWeight: 700,
    fontSize: 'clamp(13px, 3.5vw, 15px)',
    color: '#f1f5f9',
    margin: 0,
    lineHeight: 1.3,
  },
  openBadge: (open) => ({
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 20,
    fontWeight: 600,
    background: open ? 'rgba(52,211,153,0.1)' : 'rgba(100,116,139,0.2)',
    color: open ? '#34d399' : '#64748b',
    flexShrink: 0,
  }),
  typeText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  distBlock: {
    textAlign: 'right',
    flexShrink: 0,
  },
  distText: {
    fontWeight: 700,
    fontSize: 14,
    color: '#fff',
  },
  timeText: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 12,
    color: '#64748b',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  tagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 12,
  },
  tag: (color) => {
    const map = {
      red: { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.2)' },
      purple: { bg: 'rgba(168,85,247,0.1)', text: '#c084fc', border: 'rgba(168,85,247,0.2)' },
      cyan: { bg: 'rgba(34,211,238,0.1)', text: '#22d3ee', border: 'rgba(34,211,238,0.2)' },
    }[color]
    return {
      fontSize: 11,
      padding: '2px 8px',
      borderRadius: 20,
      fontWeight: 600,
      background: map.bg,
      color: map.text,
      border: `1px solid ${map.border}`,
    }
  },
  bedsText: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: '#34d399',
    marginTop: 6,
  },
  divider: {
    borderTop: '1px solid rgba(255,255,255,0.07)',
    marginTop: 14,
    paddingTop: 14,
  },
  expandGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 14,
  },
  expandLabel: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 6,
  },
  expandAddress: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 5,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  specialtyWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyChip: {
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 8,
    background: 'rgba(100,116,139,0.2)',
    color: '#94a3b8',
  },
  actionRow: {
    display: 'flex',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 16px',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    flexShrink: 0,
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 16px',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    flexShrink: 0,
  },
}

export default function Hospitals() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = HOSPITALS.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchFilter =
      filter === 'All' ? true :
      filter === 'Emergency' ? h.emergency :
      filter === 'ICU Available' ? h.icu :
      filter === 'Open Now' ? h.open :
      filter === 'Insurance' ? h.insurance : true
    return matchSearch && matchFilter
  })

  const MAP_DOTS = [
    { top: '30%', left: '45%', label: 'You', color: '#22d3ee', size: 14, isYou: true },
    { top: '25%', left: '55%', label: 'Max', color: '#f87171', size: 11 },
    { top: '50%', left: '65%', label: 'Fortis', color: '#fb923c', size: 11 },
    { top: '60%', left: '40%', label: 'Kailash', color: '#fbbf24', size: 11 },
    { top: '20%', left: '30%', label: 'Apollo', color: '#64748b', size: 11 },
    { top: '70%', left: '70%', label: 'Yashoda', color: '#a78bfa', size: 11 },
  ]

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #475569; }
        ::-webkit-scrollbar { display: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes ping { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.2);opacity:0} }
        .gps-pulse { animation: pulse 2s infinite; }
        .ping { animation: ping 1.5s infinite; }
        @media (min-width: 520px) {
          .expand-grid { grid-template-columns: 1fr 1fr !important; }
          .search-row { flex-direction: row !important; }
        }
      `}</style>

      <div style={styles.wrapper}>
        {/* Header */}
        <div>
          <h2 style={styles.sectionTitle}>Nearby Hospitals</h2>
          <p style={styles.sectionSub}>Real-time availability · Based on your location in Ghaziabad, UP</p>
        </div>

        {/* Map */}
        <div style={styles.mapBox}>
          <div style={styles.gpsRow}>
            <div className="gps-pulse" style={styles.gpsDot} />
            <span style={styles.gpsText}>GPS Active · Ghaziabad, UP 201010</span>
          </div>
          <div style={styles.mapArea}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }} viewBox="0 0 400 130">
              <line x1="0" y1="65" x2="400" y2="65" stroke="#64748b" strokeWidth="1" strokeDasharray="4" />
              <line x1="180" y1="0" x2="180" y2="130" stroke="#64748b" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="40" x2="400" y2="90" stroke="#64748b" strokeWidth="0.5" strokeDasharray="3" />
            </svg>
            {MAP_DOTS.map((dot, i) => (
              <div key={i} style={{ position: 'absolute', top: dot.top, left: dot.left, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translate(-50%,-50%)' }}>
                <div style={{ position: 'relative', width: dot.size, height: dot.size }}>
                  {dot.isYou && (
                    <div className="ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: dot.color, opacity: 0.4 }} />
                  )}
                  <div style={{ width: dot.size, height: dot.size, borderRadius: '50%', background: dot.color, position: 'relative', zIndex: 1, boxShadow: dot.isYou ? `0 0 10px ${dot.color}` : 'none' }} />
                </div>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: dot.isYou ? '#22d3ee' : '#64748b', marginTop: 2, whiteSpace: 'nowrap' }}>{dot.label}</span>
              </div>
            ))}
          </div>
          <p style={styles.mapNote}>Interactive map · Integrate with Google Maps API for live view</p>
        </div>

        {/* Search + Filters */}
        <div className="search-row" style={{ ...styles.searchRow }}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}><Search size={15} /></span>
            <input
              style={styles.searchInput}
              placeholder="Search by hospital name or specialty..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={styles.filterRow}>
            {FILTERS.map(f => (
              <button key={f} style={styles.filterBtn(filter === f)} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={styles.cardList}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569', fontSize: 14 }}>
              No hospitals match your search or filter.
            </div>
          )}
          {filtered.map(h => (
            <div
              key={h.id}
              style={styles.card(selected === h.id)}
              onClick={() => setSelected(selected === h.id ? null : h.id)}
            >
              <div style={styles.cardTop}>
                <div style={styles.icon(h.open)}>🏥</div>
                <div style={styles.cardBody}>
                  <div style={styles.cardHeader}>
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.nameRow}>
                        <span style={styles.hospitalName}>{h.name}</span>
                        <span style={styles.openBadge(h.open)}>{h.open ? '● Open' : '● Closed'}</span>
                      </div>
                      <div style={styles.typeText}>{h.type}</div>
                    </div>
                    <div style={styles.distBlock}>
                      <div style={styles.distText}>{h.dist}</div>
                      <div style={styles.timeText}><Clock size={11} />{h.time}</div>
                    </div>
                  </div>

                  <div style={styles.tagRow}>
                    <div style={styles.ratingBadge}>
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>{h.rating}</span>
                      <span style={{ color: '#475569', fontSize: 11 }}>({h.reviews})</span>
                    </div>
                    {h.emergency && <span style={styles.tag('red')}>Emergency</span>}
                    {h.icu && <span style={styles.tag('purple')}>ICU</span>}
                    {h.insurance && <span style={styles.tag('cyan')}>Insurance</span>}
                  </div>

                  {h.open && h.beds > 0 && (
                    <div style={styles.bedsText}><Bed size={12} />{h.beds} beds available</div>
                  )}
                </div>
              </div>

              {/* Expanded */}
              {selected === h.id && (
                <div style={styles.divider}>
                  <div className="expand-grid" style={styles.expandGrid}>
                    <div>
                      <div style={styles.expandLabel}>Address</div>
                      <div style={styles.expandAddress}>
                        <MapPin size={12} color="#475569" style={{ marginTop: 2, flexShrink: 0 }} />
                        {h.address}
                      </div>
                    </div>
                    <div>
                      <div style={styles.expandLabel}>Specialties</div>
                      <div style={styles.specialtyWrap}>
                        {h.specialties.map(s => (
                          <span key={s} style={styles.specialtyChip}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={styles.actionRow}>
                    <a href={`tel:${h.phone}`} style={styles.btnPrimary}>
                      <Phone size={14} /> Call Hospital
                    </a>
                    <button style={styles.btnSecondary}>
                      <Navigation size={14} /> Directions
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}