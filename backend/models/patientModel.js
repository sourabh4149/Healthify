import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'patient', enum: ['patient'] },
  fullName: { type: String, required: true },
  phone: String,
  avatarUrl: String,
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
  }
}
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  heightCm: { type: Number, min: 50, max: 300 },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String , required: true}],
  currentMedications: [{ type: String }],
  healthrecordIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HealthRecord' }],
  linkedFamilyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  isActive: { type: Boolean, default: true },
  lastLogin: Date

}, { timestamps: true });

patientSchema.index({ 'address.location': '2dsphere' });
export default mongoose.model('Patient', patientSchema);