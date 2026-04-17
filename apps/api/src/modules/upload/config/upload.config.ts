import multer, { diskStorage } from "multer";
import path from "path";
import fs from "fs";
import { MAX_FILE_SIZE } from "@memorium/config";
import { ALLOWED_EXTENSIONS } from "@memorium/config";

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const tempDir = path.join(process.cwd(), "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_EXTENSIONS.includes(ext as any)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${ext}`));
  }
};

export const uploadConfig = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 100,
  },
  fileFilter,
});
