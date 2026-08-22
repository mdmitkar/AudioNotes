import path from "path";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

export interface StorageService {
  upload(file: Express.Multer.File, folder: string): Promise<string>;
  delete(url: string): Promise<void>;
  getUploader(fieldName: string, folder: string, allowedTypes: RegExp): multer.Multer;
}

class LocalStorageService implements StorageService {
  private uploadsDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadsDir = path.resolve(process.env.UPLOADS_DIR || "./uploads");
    this.baseUrl = process.env.BASE_URL || "http://localhost:4000";
    ["audio", "thumbnails"].forEach(dir => {
      const fullPath = path.join(this.uploadsDir, dir);
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    });
  }

  async upload(file: Express.Multer.File, _folder: string): Promise<string> {
    const relativePath = path.relative(this.uploadsDir, file.path).replace(/\\\\/g, "/");
    return this.baseUrl + "/uploads/" + relativePath;
  }

  async delete(url: string): Promise<void> {
    const relativePath = url.replace(this.baseUrl + "/uploads/", "");
    const fullPath = path.join(this.uploadsDir, relativePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }

  getUploader(_fieldName: string, folder: string, allowedTypes: RegExp): multer.Multer {
    const uploadsDir = this.uploadsDir;
    const storage = multer.diskStorage({
      destination: (_req: Request, _file: Express.Multer.File, cb) => {
        const dest = path.join(uploadsDir, folder);
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (_req: Request, file: Express.Multer.File, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
      },
    });
    return multer({
      storage,
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (_req: Request, file: Express.Multer.File, cb) => {
        if (allowedTypes.test(file.mimetype)) { cb(null, true); }
        else { cb(new Error("Invalid file type")); }
      },
    });
  }
}

function createStorageService(): StorageService {
  return new LocalStorageService();
}

export const storageService = createStorageService();