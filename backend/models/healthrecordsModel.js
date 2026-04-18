// models/HealthRecord.js
import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },


  // Date of measurement (defaults to now)
  date: { type: Date, required: true, default: Date.now },

  // Blood Pressure (optional – can be omitted if only sugar is logged)
  bpSystolic: { type: Number, min: 0, max: 300 },
  bpDiastolic: { type: Number, min: 0, max: 200 },

  // Blood Sugar (optional – can be omitted if only BP is logged)
  bloodSugar: {
    value: { type: Number, min: 0 },         // mg/dL
    type: {
      type: String,
      enum: ['fasting', 'postprandial', 'random', 'hba1c'],
      default: 'fasting'
    }
  },

  // Weight & BMI (optional)
  weightKg: { type: Number, min: 0, max: 500 },
  heightCm: { type: Number, min: 50, max: 300 }, // if not provided, uses patient's stored height

  // Additional context
  notes: { type: String },
  mealTime: { type: String }   // e.g., "before breakfast", "after lunch"

}, { timestamps: true });

// Virtual for BMI (if weight and height are present)
healthRecordSchema.virtual('bmi').get(function() {
  let height = this.heightCm;
  if (!height && this.patientId) {
    // height would need to be populated from patient model
  }
  if (this.weightKg && height && height > 0) {
    const heightM = height / 100;
    return +(this.weightKg / (heightM * heightM)).toFixed(1);
  }
  return null;
});

// Indexes for fast queries
healthRecordSchema.index({ patientId: 1, date: -1 });

// Ensure virtuals are included in JSON output
healthRecordSchema.set('toJSON', { virtuals: true });
healthRecordSchema.set('toObject', { virtuals: true });

export default mongoose.model('HealthRecord', healthRecordSchema);