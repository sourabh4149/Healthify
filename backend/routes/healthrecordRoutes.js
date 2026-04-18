import express from 'express';
import { auth } from '../middlewares/auth.js';
import * as healthController from '../controllers/healthRecordController.js';

const healthrecordRouter = express.Router();

// All routes require authentication
// healthrecordRouter.use(auth);

// Create a health record (patient only)
healthrecordRouter.post('/', healthController.createHealthRecord);

// Get health records with filters (patient or doctor)
healthrecordRouter.get('/', healthController.getHealthRecords);

// Analytics & summary
healthrecordRouter.get('/analytics', healthController.getPatientAnalytics);
healthrecordRouter.get('/summary', healthController.getHealthSummary);

// Single record operations
healthrecordRouter.get('/:id', healthController.getHealthRecordById);
healthrecordRouter.put('/:id', healthController.updateHealthRecord);
healthrecordRouter.delete('/:id', healthController.deleteHealthRecord);

export default healthrecordRouter;