import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Storage abstraction. The default implementation writes to the local
 * filesystem under /uploads (gitignored, never served as static assets —
 * always read back through an authenticated route). To move to a hosted
 * bucket (S3, Supabase Storage, etc.) later, implement `StorageProvider`
 * against that provider and swap the export below.
 */
export interface StorageProvider {
  save(input: {
    buffer: Buffer;
    applicationId: string;
    originalFileName: string;
  }): Promise<{ filePath: string }>;
  read(filePath: string): Promise<Buffer>;
}

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

class LocalStorageProvider implements StorageProvider {
  async save(input: {
    buffer: Buffer;
    applicationId: string;
    originalFileName: string;
  }) {
    const dir = path.join(UPLOAD_ROOT, input.applicationId);
    await mkdir(dir, { recursive: true });
    const ext = path.extname(input.originalFileName) || "";
    const safeName = `${randomUUID()}${ext}`;
    const fullPath = path.join(dir, safeName);
    await writeFile(fullPath, input.buffer);

    const relativePath = path.join(input.applicationId, safeName);
    return { filePath: relativePath };
  }

  async read(filePath: string) {
    const fullPath = path.join(UPLOAD_ROOT, filePath);
    if (!fullPath.startsWith(UPLOAD_ROOT)) {
      throw new Error("Invalid file path");
    }
    return readFile(fullPath);
  }
}

export const storage: StorageProvider = new LocalStorageProvider();
