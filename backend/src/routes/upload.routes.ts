import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from '../controller/upload.controller.ts';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

router.post('/', upload.array('files', 10), uploadFile); // Allow up to 10 files

export default router; 