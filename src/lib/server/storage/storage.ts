import "server-only";
import { put, get } from "@vercel/blob";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Storage abstraction backed by a private Vercel Blob store. Private blobs
 * require authentication for every read, so files are only ever reachable
 * through our own authenticated route (see /api/documents/[id]/download) —
 * never via a public URL. To move to a different provider later, implement
 * `StorageProvider` against it and swap the export below.
 */
export interface StorageProvider {
  save(input: {
    buffer: Buffer;
    applicationId: string;
    originalFileName: string;
  }): Promise<{ filePath: string }>;
  read(filePath: string): Promise<Buffer>;
}

class BlobStorageProvider implements StorageProvider {
  async save(input: {
    buffer: Buffer;
    applicationId: string;
    originalFileName: string;
  }) {
    const ext = path.extname(input.originalFileName) || "";
    const pathname = `${input.applicationId}/${randomUUID()}${ext}`;
    await put(pathname, input.buffer, { access: "private" });
    return { filePath: pathname };
  }

  async read(filePath: string) {
    const result = await get(filePath, { access: "private" });
    if (result?.statusCode !== 200 || !result.stream) {
      throw new Error(`Document not found in storage: ${filePath}`);
    }
    const arrayBuffer = await new Response(result.stream).arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

export const storage: StorageProvider = new BlobStorageProvider();
