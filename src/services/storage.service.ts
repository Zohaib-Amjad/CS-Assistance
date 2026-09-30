import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface UploadOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
}

export interface StorageProvider {
  saveAvatar(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<{ url: string; fileName: string; size: number }>;
}

const DEFAULT_MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const DEFAULT_ALLOWED_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Validates magic bytes of an image buffer
 */
export function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  const hex = buffer.subarray(0, 12).toString("hex").toUpperCase();

  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    // JPEG starts with FFD8FF
    return hex.startsWith("FFD8FF");
  }

  if (mimeType === "image/png") {
    // PNG starts with 89504E470D0A1A0A
    return hex.startsWith("89504E47");
  }

  if (mimeType === "image/webp") {
    // WebP starts with 'RIFF' (52494646) and has 'WEBP' (57454250) at offset 8
    const riff = buffer.subarray(0, 4).toString("ascii");
    const webp = buffer.subarray(8, 12).toString("ascii");
    return riff === "RIFF" && webp === "WEBP";
  }

  return false;
}

export class LocalDiskStorageProvider implements StorageProvider {
  private uploadDir: string;
  private publicPrefix: string;
  private maxSizeBytes: number;
  private allowedMimeTypes: string[];

  constructor(options?: UploadOptions) {
    this.uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    this.publicPrefix = "/uploads/avatars";
    this.maxSizeBytes = options?.maxSizeBytes || DEFAULT_MAX_SIZE;
    this.allowedMimeTypes = options?.allowedMimeTypes || DEFAULT_ALLOWED_MIMES;
  }

  async saveAvatar(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<{ url: string; fileName: string; size: number }> {
    // 1. Size check
    if (buffer.length > this.maxSizeBytes) {
      throw new Error(`File size exceeds 2 MB limit (Received ${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`);
    }

    // 2. MIME type check
    const normalizedMime = mimeType.toLowerCase().trim();
    if (!this.allowedMimeTypes.includes(normalizedMime)) {
      throw new Error(`Unsupported file type '${mimeType}'. Allowed formats: JPG, PNG, WebP.`);
    }

    // 3. Magic bytes / header check
    const isValidMagic = validateImageMagicBytes(buffer, normalizedMime);
    if (!isValidMagic) {
      throw new Error("Invalid image binary format. The file signature does not match the declared MIME type.");
    }

    // 4. Derive safe extension
    let ext = "png";
    if (normalizedMime.includes("jpeg") || normalizedMime.includes("jpg")) ext = "jpg";
    else if (normalizedMime.includes("webp")) ext = "webp";

    const fileName = `avatar-${crypto.randomUUID()}.${ext}`;

    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      const filePath = path.join(this.uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      return {
        url: `${this.publicPrefix}/${fileName}`,
        fileName,
        size: buffer.length,
      };
    } catch (error) {
      // Fallback: return base64 Data URL if local filesystem cannot be written
      const base64 = buffer.toString("base64");
      return {
        url: `data:${normalizedMime};base64,${base64}`,
        fileName,
        size: buffer.length,
      };
    }
  }
}

// Export default storage instance
export const avatarStorage = new LocalDiskStorageProvider();
