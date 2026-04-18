// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [token, setTokenState]            = useState(() => localStorage.getItem('token') || '');
  const [patient, setPatient]             = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingVitals, setLoadingVitals] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ── persist token ────────────────────────────────────────────────────────
  const setToken = (newToken) => {
    if (newToken) localStorage.setItem('token', newToken);
    else          localStorage.removeItem('token');
    setTokenState(newToken);
  };

  const logout = () => {
    setToken('');
    setPatient(null);
    setHealthRecords([]);
    setDashboardData(null);
  };

  // ── fetch patient profile ────────────────────────────────────────────────
  const fetchPatientProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res  = await fetch(`${backendUrl}/api/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok)              setPatient(data.patient);
      else if (res.status === 401) logout();
    } catch (err) {
      console.error('Failed to fetch patient profile:', err);
    }
  }, [token, backendUrl]);

  // ── fetch dashboard data ─────────────────────────────────────────────────
  // Uses GET /api/patient/dashboard which queries the latest BP, sugar, and
  // weight INDEPENDENTLY — so a sugar-only record never clears the BP value.
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      const res  = await fetch(`${backendUrl}/api/patient/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  }, [token, backendUrl]);

  // ── fetch all health records (records page + sparklines) ─────────────────
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

  // ── refresh everything after add / delete ────────────────────────────────
  const refreshAll = useCallback(() => {
    return Promise.all([fetchHealthRecords(), fetchDashboardData()]);
  }, [fetchHealthRecords, fetchDashboardData]);

  // ── boot on token change ─────────────────────────────────────────────────
  useEffect(() => {
    if (token) {
      fetchPatientProfile();
      fetchHealthRecords();
      fetchDashboardData();
    } else {
      setPatient(null);
      setHealthRecords([]);
      setDashboardData(null);
      setLoadingVitals(false);
    }
  }, [token]);

  // ── sparkline data: last 7 records in chronological order ────────────────
  // Each entry may have nulls for metrics not recorded — used only for charts.
  const vitals = [...healthRecords]
    .reverse()
    .slice(-7)
    .map(r => ({
      date:   r.date?.split('T')[0] ?? '',
      bp_sys: r.bpSystolic        ?? null,
      bp_dia: r.bpDiastolic       ?? null,
      sugar:  r.bloodSugar?.value ?? null,
      weight: r.weightKg          ?? null,
    }));

  // ── latestVitals: each metric from its OWN latest record ─────────────────
  // Sourced from /api/patient/dashboard — BP never goes blank just because
  // the newest entry only recorded sugar.
  const latestVitals = {
    bp_sys:       dashboardData?.latest?.bp?.systolic        ?? null,
    bp_dia:       dashboardData?.latest?.bp?.diastolic       ?? null,
    sugar:        dashboardData?.latest?.bloodSugar?.value   ?? null,
    weight:       dashboardData?.latest?.weight?.value       ?? null,
    bp_date:      dashboardData?.latest?.bp?.date            ?? null,
    sugar_date:   dashboardData?.latest?.bloodSugar?.date    ?? null,
    weight_date:  dashboardData?.latest?.weight?.date        ?? null,
  };

  // ── convenience user object ──────────────────────────────────────────────
  const user = patient
    ? {
        name:       patient.fullName,
        conditions: [...(patient.allergies ?? []), ...(patient.chronicConditions ?? [])],
        bloodGroup: patient.bloodGroup ?? '—',
      }
    : { name: 'Loading…', conditions: [], bloodGroup: '—' };

  const value = {
    token,
    setToken,
    backendUrl,
    patient,
    setPatient,
    healthRecords,
    setHealthRecords,
    vitals,         // sparkline series (nulls possible per-record)
    latestVitals,   // guaranteed latest per metric
    loadingVitals,
    fetchHealthRecords,
    fetchDashboardData,
    refreshAll,
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