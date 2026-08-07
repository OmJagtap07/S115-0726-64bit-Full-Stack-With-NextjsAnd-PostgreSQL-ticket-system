import multer from 'multer';
import { BadRequestError } from '../errors/AppError';

// Define allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure Multer to use memory storage
const storage = multer.memoryStorage();

// File filter validation
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Invalid file type. Only JPG, PNG, GIF, PDF, TXT, and DOCX are allowed.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});
