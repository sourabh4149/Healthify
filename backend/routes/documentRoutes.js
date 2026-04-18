// routes/documentRoutes.js
import express from 'express';
import upload  from '../config/multer.js';
import { auth } from '../middlewares/auth.js';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getDocumentUrl,
} from '../controllers/documentController.js';

const router = express.Router();

router.use(auth);

router.post(  '/upload',  upload.single('file'), uploadDocument);
router.get(   '/',                               getDocuments);
router.delete('/:id',                            deleteDocument);
router.get(   '/:id/url',                        getDocumentUrl);

export default router;