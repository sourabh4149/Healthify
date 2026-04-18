// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [token, setTokenState]       = useState(() => localStorage.getItem('token') || '');
  const [patient, setPatient]        = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loadingVitals, setLoadingVitals] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ── persist token ────────────────────────────────────────────────────────
  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setTokenState(newToken);
  };

  const logout = () => {
    setToken('');
    setPatient(null);
    setHealthRecords([]);
  };

  // ── fetch patient profile from backend ───────────────────────────────────
  const fetchPatientProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res  = await fetch(`${backendUrl}/api/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPatient(data.patient);
      } else if (res.status === 401) {
        // Token expired or invalid — log out cleanly
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch patient profile:', err);
    }
  }, [token, backendUrl]);

  // ── fetch all health records for context consumers ───────────────────────
  const fetchHealthRecords = useCallback(async () => {
    if (!token) return;
    setLoadingVitals(true);
    try {
      const res  = await fetch(`${backendUrl}/api/patient/health`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setHealthRecords(data.records ?? []);
    } catch (err) {
      console.error('Failed to fetch health records:', err);
    } finally {
      setLoadingVitals(false);
    }
  }, [token, backendUrl]);

  // ── run on token change ──────────────────────────────────────────────────
  useEffect(() => {
    if (token) {
      fetchPatientProfile();
      fetchHealthRecords();
    } else {
      setPatient(null);
      setHealthRecords([]);
      setLoadingVitals(false);
    }
  }, [token]);

  // ── derive vitals array for charts (last 7 entries) ─────────────────────
  const vitals = healthRecords
    .slice(0, 7)
    .reverse()
    .map(r => ({
      date:    r.date?.split('T')[0] ?? '',
      bp_sys:  r.bpSystolic         ?? null,
      bp_dia:  r.bpDiastolic        ?? null,
      sugar:   r.bloodSugar?.value  ?? null,
      weight:  r.weightKg           ?? null,
    }));

  // ── convenience user object (falls back gracefully) ─────────────────────
  const user = patient
    ? {
        name:       patient.fullName,
        conditions: [
          ...(patient.allergies          ?? []),
          ...(patient.chronicConditions  ?? []),
        ],
        bloodGroup: patient.bloodGroup ?? '—',
      }
    : {
        name:       'Loading…',
        conditions: [],
        bloodGroup: '—',
      };

  const value = {
    token,
    setToken,
    backendUrl,
    patient,
    setPatient,
    healthRecords,
    setHealthRecords,
    vitals,
    loadingVitals,
    fetchHealthRecords,
    fetchPatientProfile,
    logout,
    user,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);