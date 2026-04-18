// routes/patientRoutes.js
// Make sure these routes exist in your Express app.
// The key insight: patientId is read from req.user.id (set by your auth middleware),
// so the frontend never needs to send it explicitly.

import express from 'express';
import {
  registerPatient,
  loginPatient,
  getPatientProfile,
  updatePatientProfile,
  changePassword,
  addHealthRecord,
  getHealthRecords,
  deleteHealthRecord,
  getDashboardData,
} from '../controllers/patientController.js';
import { auth } from '../middlewares/auth.js'; // your existing JWT middleware

const router = express.Router();

// ── Auth (no token needed) ──────────────────────────────────────────────────
router.post('/register', registerPatient);
router.post('/login',    loginPatient);

// ── Protected routes (token required) ──────────────────────────────────────
router.use(auth);

// Profile
router.get('/profile',         getPatientProfile);
router.put('/profile',         updatePatientProfile);
router.put('/change-password', changePassword);

// Dashboard
router.get('/dashboard', getDashboardData);

// Health records  ← these are what HealthRecords.jsx calls
router.post(  '/health',     addHealthRecord);    // POST   /api/patient/health
router.get(   '/health',     getHealthRecords);   // GET    /api/patient/health
router.delete('/health/:id', deleteHealthRecord); // DELETE /api/patient/health/:id

export default router;

// ── Mount in your main app.js / server.js ───────────────────────────────────
// import patientRoutes from './routes/patientRoutes.js';
// app.use('/api/patient', patientRoutes);