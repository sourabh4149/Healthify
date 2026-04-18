// controllers/documentController.js
import streamifier from 'streamifier';
import cloudinary  from '../config/cloudinary.js';
import Document    from '../models/documentModel.js';

// Helper: upload a buffer to Cloudinary via a stream
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

// ── POST /api/documents/upload ───────────────────────────────────────────────
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const { category = 'diagnostic', name } = req.body;
    const patientId = req.user.id;

    // Determine resource_type for Cloudinary
    const isPdf  = req.file.mimetype === 'application/pdf';
    const isDocx = req.file.mimetype.includes('wordprocessingml');
    const resourceType = (isPdf || isDocx) ? 'raw' : 'image';

    const result = await uploadToCloudinary(req.file.buffer, {
      folder:        `medical_docs/${patientId}`,
      resource_type: resourceType,
      public_id:     `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`,
    });

    const doc = await Document.create({
      patientId,
      name:               name || req.file.originalname.replace(/\.[^.]+$/, ''),
      category,
      cloudinaryPublicId: result.public_id,
      cloudinaryUrl:      result.secure_url,
      resourceType:       result.resource_type,
      format:             result.format,
      sizeBytes:          result.bytes,
      originalName:       req.file.originalname,
      mimeType:           req.file.mimetype,
    });

    res.status(201).json({ success: true, document: _formatDoc(doc) });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/documents ───────────────────────────────────────────────────────
export const getDocuments = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const patientId = req.user.id;

    const query = { patientId };
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      Document.find(query).sort({ uploadedAt: -1 }).skip(skip).limit(parseInt(limit)),
      Document.countDocuments(query),
    ]);

    res.json({
      success: true,
      documents: docs.map(_formatDoc),
      pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/documents/:id ────────────────────────────────────────────────
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, patientId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Remove from Cloudinary
    await cloudinary.uploader.destroy(doc.cloudinaryPublicId, {
      resource_type: doc.resourceType,
    });

    await doc.deleteOne();
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/documents/:id/url  (generate short-lived signed URL) ────────────
export const getDocumentUrl = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, patientId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // For raw files (pdf/docx) Cloudinary public URLs are already accessible;
    // return the stored secure_url directly (or generate a signed URL if private)
    res.json({ success: true, url: doc.cloudinaryUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Internal formatter ───────────────────────────────────────────────────────
const _formatDoc = (doc) => ({
  id:       doc._id,
  name:     doc.name,
  category: doc.category,
  date:     doc.uploadedAt,
  type:     doc.format?.toUpperCase() || 'FILE',
  size:     doc.sizeBytes ? `${(doc.sizeBytes / 1024 / 1024).toFixed(1)} MB` : '—',
  url:      doc.cloudinaryUrl,
  mimeType: doc.mimeType,
});