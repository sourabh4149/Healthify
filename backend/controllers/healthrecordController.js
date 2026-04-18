// controllers/healthRecordController.js
import HealthRecord from "../models/healthrecordsModel.js";
import Patient from "../models/patientModel.js";

// ==================== AUTHORIZATION HELPERS ====================

const isSelfPatient = async (userId, patientId) => {
  const patient = await Patient.findById(patientId);
  return patient && patient._id.toString() === userId;
};

const canWrite = async (userId, userRole, patientId) => {
  if (userRole === 'admin') return true;
  if (userRole === 'patient') return await isSelfPatient(userId, patientId);
  return false;
};

const canRead = async (userId, userRole, patientId) => {
  if (userRole === 'admin') return true;
  if (userRole === 'patient') return await isSelfPatient(userId, patientId);
  if (userRole === 'doctor') return true;
  return false;
};

// ==================== CREATE ====================

export const createHealthRecord = async (req, res) => {
  try {
    const {
      patientId,
      date,
      bpSystolic,
      bpDiastolic,
      bloodSugar,
      sugarType,
      weightKg,
      heightCm,
      notes,
      mealTime
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: "patientId is required" });
    }

    // At least one metric must be provided
    if (!bpSystolic && !bpDiastolic && !bloodSugar && !weightKg) {
      return res.status(400).json({
        success: false,
        message: "At least one health metric (BP, sugar, or weight) is required"
      });
    }

    const authorized = await canWrite(req.user.id, req.user.role, patientId);
    if (!authorized) {
      return res.status(403).json({ success: false, message: "Only patients can add their own health records" });
    }

    // Get patient's default height if not provided
    let finalHeight = heightCm;
    if (!finalHeight) {
      const patient = await Patient.findById(patientId);
      finalHeight = patient?.heightCm;
    }

    const recordData = {
      patientId,
      date: date || Date.now(),
      bpSystolic,
      bpDiastolic,
      weightKg,
      heightCm: finalHeight,
      notes,
      mealTime
    };

    // Set recordedBy based on role
    if (req.user.role === 'patient') {
      recordData.recordedByPatientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      recordData.recordedByDoctorId = req.user.id;
    }

    if (bloodSugar) {
      recordData.bloodSugar = {
        value: bloodSugar,
        type: sugarType || 'fasting'
      };
    }

    const record = new HealthRecord(recordData);
    await record.save();
    res.status(201).json({ success: true, record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== READ ====================

export const getHealthRecords = async (req, res) => {
  try {
    const { patientId, startDate, endDate, type, limit = 50, page = 1 } = req.query;

    if (!patientId) {
      return res.status(400).json({ success: false, message: "patientId is required" });
    }

    const authorized = await canRead(req.user.id, req.user.role, patientId);
    if (!authorized) {
      return res.status(403).json({ success: false, message: "Unauthorized to view these records" });
    }

    const query = { patientId };
    if (startDate || endDate) query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);

    if (type === 'bp') query.bpSystolic = { $exists: true };
    if (type === 'sugar') query['bloodSugar.value'] = { $exists: true };
    if (type === 'weight') query.weightKg = { $exists: true };

    const skip = (page - 1) * limit;
    const records = await HealthRecord.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await HealthRecord.countDocuments(query);

    res.json({
      success: true,
      records,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getHealthRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await HealthRecord.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    const authorized = await canRead(req.user.id, req.user.role, record.patientId);
    if (!authorized) {
      return res.status(403).json({ success: false, message: "Unauthorized to view this record" });
    }

    res.json({ success: true, record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== UPDATE ====================

export const updateHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const record = await HealthRecord.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    const authorized = await canWrite(req.user.id, req.user.role, record.patientId);
    if (!authorized) {
      return res.status(403).json({ success: false, message: "Only patients can modify their own records" });
    }

    // Remove immutable fields
    delete updates._id;
    delete updates.patientId;
    delete updates.recordedByPatientId;
    delete updates.recordedByDoctorId;
    delete updates.createdAt;

    // Handle bloodSugar update (frontend may send bloodSugar as number and optionally sugarType)
    if (updates.bloodSugar !== undefined) {
      const sugarValue = updates.bloodSugar;
      const sugarType = updates.sugarType || record.bloodSugar?.type || 'fasting';
      record.bloodSugar = { value: sugarValue, type: sugarType };
      delete updates.bloodSugar;
      delete updates.sugarType;
    }

    // Apply remaining scalar updates
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        record[key] = updates[key];
      }
    });

    record.updatedAt = Date.now();
    await record.save();

    res.json({ success: true, record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== DELETE ====================

export const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await HealthRecord.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    const authorized = await canWrite(req.user.id, req.user.role, record.patientId);
    if (!authorized) {
      return res.status(403).json({ success: false, message: "Only patients can delete their own records" });
    }

    await record.deleteOne();
    res.json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== ANALYTICS & TRENDS ====================

export const getPatientAnalytics = async (req, res) => {
  try {
    const { patientId, days = 30 } = req.query;
    if (!patientId) {
      return res.status(400).json({ success: false, message: "patientId is required" });
    }

    const authorized = await canRead(req.user.id, req.user.role, patientId);
    if (!authorized) {
      return res.status(403).json({ success: false, message: "Unauthorized to view analytics" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const records = await HealthRecord.find({
      patientId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Group by day and aggregate
    const dailyMap = new Map();
    records.forEach(record => {
      const day = record.date.toISOString().split('T')[0];
      if (!dailyMap.has(day)) {
        dailyMap.set(day, {
          date: day,
          bpSystolic: [],
          bpDiastolic: [],
          bloodSugar: [],
          weightKg: [],
          bmi: []
        });
      }
      const entry = dailyMap.get(day);
      if (record.bpSystolic) entry.bpSystolic.push(record.bpSystolic);
      if (record.bpDiastolic) entry.bpDiastolic.push(record.bpDiastolic);
      if (record.bloodSugar?.value) entry.bloodSugar.push(record.bloodSugar.value);
      if (record.weightKg) {
        entry.weightKg.push(record.weightKg);
        let height = record.heightCm || patient.heightCm;
        if (height && record.weightKg) {
          const heightM = height / 100;
          entry.bmi.push(record.weightKg / (heightM * heightM));
        }
      }
    });

    const chartData = Array.from(dailyMap.values()).map(day => ({
      date: day.date,
      bpSystolic: day.bpSystolic.length ? +(day.bpSystolic.reduce((a,b)=>a+b,0)/day.bpSystolic.length).toFixed(1) : null,
      bpDiastolic: day.bpDiastolic.length ? +(day.bpDiastolic.reduce((a,b)=>a+b,0)/day.bpDiastolic.length).toFixed(1) : null,
      bloodSugar: day.bloodSugar.length ? +(day.bloodSugar.reduce((a,b)=>a+b,0)/day.bloodSugar.length).toFixed(1) : null,
      weightKg: day.weightKg.length ? +(day.weightKg.reduce((a,b)=>a+b,0)/day.weightKg.length).toFixed(1) : null,
      bmi: day.bmi.length ? +(day.bmi.reduce((a,b)=>a+b,0)/day.bmi.length).toFixed(1) : null
    }));

    const compareTrend = (current, previous) => {
      if (current === null || previous === null) return 'insufficient';
      if (current > previous) return 'increase';
      if (current < previous) return 'decrease';
      return 'stable';
    };

    let trend = {};
    if (chartData.length >= 14) {
      const last7 = chartData.slice(-7);
      const prev7 = chartData.slice(-14, -7);
      const avg = (arr, key) => {
        const vals = arr.map(d => d[key]).filter(v => v !== null);
        return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
      };
      trend = {
        bpSystolic: compareTrend(avg(last7,'bpSystolic'), avg(prev7,'bpSystolic')),
        bpDiastolic: compareTrend(avg(last7,'bpDiastolic'), avg(prev7,'bpDiastolic')),
        bloodSugar: compareTrend(avg(last7,'bloodSugar'), avg(prev7,'bloodSugar')),
        weight: compareTrend(avg(last7,'weightKg'), avg(prev7,'weightKg')),
        bmi: compareTrend(avg(last7,'bmi'), avg(prev7,'bmi'))
      };
    }

    res.json({ success: true, chartData, trend });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getHealthSummary = async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) {
      return res.status(400).json({ success: false, message: "patientId is required" });
    }

    const authorized = await canRead(req.user.id, req.user.role, patientId);
    if (!authorized) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const latestBP = await HealthRecord.findOne({ patientId, bpSystolic: { $exists: true } }).sort({ date: -1 });
    const latestSugar = await HealthRecord.findOne({ patientId, 'bloodSugar.value': { $exists: true } }).sort({ date: -1 });
    const latestWeight = await HealthRecord.findOne({ patientId, weightKg: { $exists: true } }).sort({ date: -1 });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const avgBP = await HealthRecord.aggregate([
      { $match: { patientId, date: { $gte: thirtyDaysAgo }, bpSystolic: { $exists: true } } },
      { $group: { _id: null, avgSys: { $avg: "$bpSystolic" }, avgDia: { $avg: "$bpDiastolic" } } }
    ]);
    const avgSugar = await HealthRecord.aggregate([
      { $match: { patientId, date: { $gte: thirtyDaysAgo }, 'bloodSugar.value': { $exists: true } } },
      { $group: { _id: null, avgSugar: { $avg: "$bloodSugar.value" } } }
    ]);
    const avgWeight = await HealthRecord.aggregate([
      { $match: { patientId, date: { $gte: thirtyDaysAgo }, weightKg: { $exists: true } } },
      { $group: { _id: null, avgWeight: { $avg: "$weightKg" } } }
    ]);

    res.json({
      success: true,
      latest: {
        bp: latestBP ? { systolic: latestBP.bpSystolic, diastolic: latestBP.bpDiastolic, date: latestBP.date } : null,
        bloodSugar: latestSugar ? { value: latestSugar.bloodSugar?.value, type: latestSugar.bloodSugar?.type, date: latestSugar.date } : null,
        weight: latestWeight ? { value: latestWeight.weightKg, date: latestWeight.date } : null
      },
      averages: {
        bp: avgBP.length ? { systolic: avgBP[0].avgSys.toFixed(1), diastolic: avgBP[0].avgDia.toFixed(1) } : null,
        bloodSugar: avgSugar.length ? avgSugar[0].avgSugar.toFixed(1) : null,
        weight: avgWeight.length ? avgWeight[0].avgWeight.toFixed(1) : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};