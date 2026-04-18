import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { User, Phone, Mail, Droplets, Ruler, Weight, Edit3, Plus, X, Shield, AlertCircle, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calcBMI, fmt } from '../utils/helpers.js'

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl">
    <div className="w-9 h-9 bg-slate-700/60 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-emerald-400" />
    </div>
    <div>
      <p className="text-slate-500 text-xs font-body uppercase tracking-wider">{label}</p>
      <p className="text-white font-display font-semibold text-sm">{value}</p>
    </div>
  </div>
)

const LoadingSkeleton = () => (
  <div className="max-w-4xl space-y-6 animate-pulse">
    <div className="glass rounded-3xl p-8 h-32 bg-slate-800/50" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass rounded-2xl p-5 h-48 bg-slate-800/50" />
      <div className="glass rounded-2xl p-5 h-48 bg-slate-800/50" />
    </div>
    <div className="glass rounded-2xl p-5 h-64 bg-slate-800/50" />
  </div>
)

export default function Profile() {
  const { token, backendUrl, setPatient } = useApp()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [conditions, setConditions] = useState([])
  const [allergies, setAllergies] = useState([])
  const [newCondition, setNewCondition] = useState('')
  const [newAllergy, setNewAllergy] = useState('')

  // Fetch profile
  const fetchProfile = async () => {
    if (!token) {
      setError('No auth token')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const { data } = await axios.get(`${backendUrl}/api/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setProfile(data.patient)
        setConditions(data.patient.chronicConditions || [])
        setAllergies(data.patient.allergies || [])
        setPatient(data.patient) // Update context
      } else {
        toast.error(data.message || 'Failed to load profile')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load profile'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Save updates
  const saveProfile = async () => {
    try {
      const changes = {
        fullName: profile.fullName,
        phone: profile.phone,
        heightCm: profile.heightCm,
        allergies,
        chronicConditions: conditions
      }
      const { data } = await axios.put(`${backendUrl}/api/patient/profile`, changes, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        toast.success('Profile updated!')
        setProfile(data.patient)
        setConditions(data.patient.chronicConditions || [])
        setAllergies(data.patient.allergies || [])
        setPatient(data.patient)
        setEditing(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [token])

  if (loading) return <LoadingSkeleton />
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-96 text-center p-8">
      <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Error loading profile</h2>
      <p className="text-slate-400 mb-6">{error}</p>
      <button onClick={fetchProfile} className="btn-primary">Retry</button>
    </div>
  )

  if (!profile) return (
    <div className="text-center p-12">
      <p className="text-slate-400">No profile data available. <button onClick={fetchProfile} className="text-emerald-400 hover:underline">Reload</button></p>
    </div>
  )

  const bmi = profile.heightCm && profile.latestWeightKg ? calcBMI(profile.heightCm, profile.latestWeightKg) : null
  const bmiStatus = bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese') : 'Unknown'
  const bmiColor = bmi ? (bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-emerald-400' : bmi < 30 ? 'text-amber-400' : 'text-red-400') : 'text-slate-400'

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile header */}
      <div className="glass rounded-3xl p-6 lg:p-8 relative overflow-hidden border border-slate-700/40">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-display font-bold text-2xl">
              {profile.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-white">{profile.fullName}</h1>
            <p className="text-slate-400 font-body text-sm">Patient ID: #HF{String(profile._id).slice(-8).toUpperCase()}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-display rounded-full">Age {fmt.age(profile.dateOfBirth)}</span>
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-display rounded-full">Blood: {profile.bloodGroup || 'N/A'}</span>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-display rounded-full">
                BMI: {bmi || '?'} — <span className={bmiColor}>{bmiStatus}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="btn-secondary flex items-center gap-2 text-sm"
            disabled={loading}
          >
            <Edit3 className="w-4 h-4" />
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        {editing && (
          <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="input-field"
                value={profile.fullName}
                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                placeholder="Full Name"
              />
              <input
                className="input-field"
                value={profile.phone || ''}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="Phone"
              />
              <input
                className="input-field"
                type="number"
                value={profile.heightCm || ''}
                onChange={(e) => setProfile({...profile, heightCm: Number(e.target.value)})}
                placeholder="Height (cm)"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={saveProfile} className="btn-primary flex-1">Save Changes</button>
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" /> Personal Information
          </h3>
          <div className="space-y-2">
            <InfoRow label="Full Name" value={profile.fullName} icon={User} />
            <InfoRow label="Phone" value={profile.phone || 'N/A'} icon={Phone} />
            <InfoRow label="Email" value={profile.email} icon={Mail} />
            <InfoRow label="Doctor" value="Not assigned" icon={Shield} />
          </div>
        </div>

        {/* Physical stats */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-cyan-400" /> Physical Stats
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Height', value: `${profile.heightCm || '?'} cm`, icon: '📏' },
              { label: 'Weight', value: `${profile.latestWeightKg || '?'} kg`, icon: '⚖️' },
              { label: 'Blood Group', value: profile.bloodGroup || 'N/A', icon: '🩸' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-3 text-center">
                <span className="text-2xl">{s.icon}</span>
                <p className="font-display font-bold text-white text-sm mt-1">{s.value}</p>
                <p className="text-slate-500 text-xs font-body">{s.label}</p>
              </div>
            ))}
          </div>
          {/* BMI bar */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400 text-xs font-body">BMI Index</span>
              <span className={`text-xs font-mono font-bold ${bmiColor}`}>{bmi || '?'}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              {bmi && (
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-red-400"
                  style={{ width: `${Math.min((bmi / 40) * 100, 100)}%` }}
                />
              )}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-slate-600 text-xs">Underweight</span>
              <span className="text-slate-600 text-xs">Obese</span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" /> Medical Conditions
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {conditions.map((c, i) => (
              <span key={i} className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-display rounded-xl">
                {c}
                {editing && (
                  <button onClick={() => setConditions(prev => prev.filter((_, j) => j !== i))}>
                    <X className="w-3 h-3 hover:text-red-400 transition-colors" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {editing && (
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Add condition..."
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCondition.trim()) {
                    setConditions(p => [...p, newCondition.trim()])
                    setNewCondition('')
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newCondition.trim()) {
                    setConditions(p => [...p, newCondition.trim()])
                    setNewCondition('')
                  }
                }}
                className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" /> Allergies & Sensitivities
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {allergies.map((a, i) => (
              <span key={i} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-display rounded-xl">
                ⚠️ {a}
                {editing && (
                  <button onClick={() => setAllergies(prev => prev.filter((_, j) => j !== i))}>
                    <X className="w-3 h-3 hover:text-white transition-colors" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {editing && (
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Add allergy..."
                value={newAllergy}
                onChange={e => setNewAllergy(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newAllergy.trim()) {
                    setAllergies(p => [...p, newAllergy.trim()])
                    setNewAllergy('')
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newAllergy.trim()) {
                    setAllergies(p => [...p, newAllergy.trim()])
                    setNewAllergy('')
                  }
                }}
                className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Family Members - static for now */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" /> Family Members
          </h3>
          {editing && (
            <button className="btn-secondary text-xs py-2 px-4 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Member
            </button>
          )}
        </div>
        <p className="text-slate-500 italic">Family linking coming soon...</p>
      </div>
    </div>
  )
}
