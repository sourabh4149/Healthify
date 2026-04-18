// controllers/patientController.js
import Patient from "../models/patientModel.js";
import HealthRecord from "../models/healthrecordsModel.js";   // ✅ fixed import
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const createToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });

// ==================== AUTH ====================
export const registerPatient = async (req, res) => {
  try {
    const { email, password, fullName, phone, dateOfBirth, gender, address, emergencyContact, bloodGroup, heightCm, allergies, chronicConditions, currentMedications } = req.body;
    if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: "Invalid email" });
    if (password.length < 8) return res.status(400).json({ success: false, message: "Password too short" });
    const existing = await Patient.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const patient = new Patient({ email, passwordHash, fullName, phone, dateOfBirth, gender, address, emergencyContact, bloodGroup, heightCm, allergies, chronicConditions, currentMedications });
    await patient.save();
    const token = createToken(patient._id, 'patient');
    const fullPatient = await Patient.findById(patient._id).select('-passwordHash');
    res.status(201).json({ success: true, token, patient: fullPatient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, patient.passwordHash);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });
    patient.lastLogin = new Date();
    await patient.save();
    const fullPatient = await Patient.findById(patient._id).select('-passwordHash');
    const token = createToken(patient._id, 'patient');
    res.json({ success: true, token, patient: fullPatient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PROFILE ====================
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select('-passwordHash');
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    // Compute age
    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

    // Get latest weight from health records for BMI
    const latestRecord = await HealthRecord.findOne({ patientId: req.user.id, weightKg: { $exists: true } }).sort({ date: -1 }).select('weightKg date');
    const latestWeightKg = latestRecord ? latestRecord.weightKg : null;

    // Combine conditions/allergies
    const conditions = [...(patient.allergies || []), ...(patient.chronicConditions || [])];

    const profileData = {
      ...patient.toObject(),
      age,
      latestWeightKg,
      conditions
    };

    res.json({ success: true, patient: profileData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePatientProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.passwordHash; delete updates.email; delete updates._id;
    const patient = await Patient.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-passwordHash');
    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const patient = await Patient.findById(req.user.id);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    const ok = await bcrypt.compare(currentPassword, patient.passwordHash);
    if (!ok) return res.status(401).json({ success: false, message: "Current password incorrect" });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: "New password too short" });
    patient.passwordHash = await bcrypt.hash(newPassword, 10);
    await patient.save();
    res.json({ success: true, message: "Password updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== HEALTH RECORDS ====================
export const addHealthRecord = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    const { date, bpSystolic, bpDiastolic, bloodSugar, sugarType, weightKg, heightCm, notes, mealTime } = req.body;
    const finalHeight = heightCm || patient.heightCm;
    const record = new HealthRecord({
      patientId: patient._id,
      recordedByPatientId: patient._id,
      date: date || Date.now(),
      bpSystolic,
      bpDiastolic,
      bloodSugar: bloodSugar ? { value: bloodSugar, type: sugarType || 'fasting' } : undefined,
      weightKg,
      heightCm: finalHeight,
      notes,
      mealTime
    });
    await record.save();
    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all health records for the logged-in patient (with pagination & filters)
export const getHealthRecords = async (req, res) => {
  try {
    const { startDate, endDate, type, limit = 50, page = 1 } = req.query;
    const patientId = req.user.id;

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
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a health record (only if it belongs to the logged-in patient)
export const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await HealthRecord.findOne({ _id: id, patientId: req.user.id });
    if (!record) return res.status(404).json({ success: false, message: "Record not found or not yours" });
    await record.deleteOne();
    res.json({ success: true, message: "Health record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard summary: latest readings and quick stats
export const getDashboardData = async (req, res) => {
  try {
    const patientId = req.user.id;
    const patient = await Patient.findById(patientId).select('-passwordHash');
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    // Latest records
    const latestBP = await HealthRecord.findOne({ patientId, bpSystolic: { $exists: true } }).sort({ date: -1 });
    const latestSugar = await HealthRecord.findOne({ patientId, 'bloodSugar.value': { $exists: true } }).sort({ date: -1 });
    const latestWeight = await HealthRecord.findOne({ patientId, weightKg: { $exists: true } }).sort({ date: -1 });

    // 30-day averages
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
      profile: {
        fullName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        bloodGroup: patient.bloodGroup,
        heightCm: patient.heightCm
      },
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
    res.status(500).json({ success: false, message: error.message });
  }
};