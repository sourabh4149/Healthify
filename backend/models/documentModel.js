// models/documentModel.js
import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['diagnostic', 'prescription', 'imaging'],
    default: 'diagnostic',
  },
  // Cloudinary fields
  cloudinaryPublicId: { type: String, required: true },
  cloudinaryUrl:      { type: String, required: true },  // secure_url
  resourceType:       { type: String, default: 'auto' }, // image | raw
  format:             { type: String },                  // pdf, jpg, png …
  sizeBytes:          { type: Number },

  // Display helpers (derived at upload time)
  originalName: { type: String },
  mimeType:     { type: String },

  uploadedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);