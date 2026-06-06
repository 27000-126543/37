import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = join(__dirname, '..', '..', '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

const ALLOWED_MIME_TYPES = [
  'image/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/',
];

const ALLOWED_EXT_REGEX = /\.(jpg|jpeg|png|gif|bmp|webp|pdf|doc|docx|mp4|avi|mov|mkv|wmv|flv|webm)$/i;

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  const mimeTypeAllowed = ALLOWED_MIME_TYPES.some(type => file.mimetype.startsWith(type) || file.mimetype === type);
  const extAllowed = ALLOWED_EXT_REGEX.test(file.originalname);

  if (mimeTypeAllowed || extAllowed) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型，仅支持 image、pdf、doc、video 格式'));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export const uploadSingle = upload.single('file');
