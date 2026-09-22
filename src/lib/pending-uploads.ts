import { reportsApi } from "./reports-api";

export interface PendingUpload {
  file: File;
  folder: string;
  acceptType: "image" | "document";
  name: string;
  size: number;
}

// In-memory store of local object URLs to pending file instances
const pendingUploadsMap = new Map<string, PendingUpload>();

/**
 * Creates a local blob URL for instant preview without uploading to Cloudinary.
 * The file will be deferred until the user saves the form.
 */
export function createPendingUpload(
  file: File,
  folder: string = "reports",
  acceptType: "image" | "document" = "image",
): string {
  if (typeof window === "undefined") return "";

  const blobUrl = URL.createObjectURL(file);
  pendingUploadsMap.set(blobUrl, {
    file,
    folder,
    acceptType,
    name: file.name,
    size: file.size,
  });

  return blobUrl;
}

/**
 * Checks if a given URL is a local uncommitted blob preview.
 */
export function isPendingUpload(url?: string): boolean {
  return Boolean(url && typeof url === "string" && url.startsWith("blob:"));
}

/**
 * Retrieves the pending file info for a blob URL.
 */
export function getPendingUpload(url?: string): PendingUpload | undefined {
  if (!url || !isPendingUpload(url)) return undefined;
  return pendingUploadsMap.get(url);
}

/**
 * Revokes a local blob preview and cleans up the memory without touching Cloudinary.
 */
export function revokePendingUpload(url?: string): void {
  if (!url || !isPendingUpload(url)) return;

  if (typeof window !== "undefined") {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore revoke errors
    }
  }
  pendingUploadsMap.delete(url);
}

/**
 * Formats byte size into human readable string (KB / MB).
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Scans a form payload (including nested blocks) for any `blob:` URLs,
 * uploads each one to Cloudinary in sequence, and replaces the blob URLs
 * with the resulting permanent Cloudinary URLs.
 */
export async function uploadAllPendingInPayload(
  payload: any,
  onProgress?: (message: string) => void,
): Promise<any> {
  // Clone to avoid mutating original state until resolved
  const clone = JSON.parse(JSON.stringify(payload));

  // Collect all unique blob URLs present in the cloned payload
  const blobUrls = new Set<string>();

  function scan(obj: any) {
    if (!obj) return;
    if (typeof obj === "string") {
      if (obj.startsWith("blob:")) {
        blobUrls.add(obj);
      }
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach(scan);
      return;
    }
    if (typeof obj === "object") {
      Object.values(obj).forEach(scan);
    }
  }

  scan(clone);

  if (blobUrls.size === 0) {
    return clone;
  }

  const urlReplacementMap = new Map<string, string>();
  const total = blobUrls.size;
  let current = 0;

  for (const blobUrl of Array.from(blobUrls)) {
    current++;
    const pending = pendingUploadsMap.get(blobUrl);

    if (pending) {
      if (onProgress) {
        onProgress(`Uploading ${pending.name} (${current}/${total})...`);
      }

      let result: any;
      if (pending.acceptType === "image") {
        result = await reportsApi.uploadImage(pending.file, pending.folder);
      } else {
        result = await reportsApi.uploadDocument(pending.file, pending.folder);
      }

      const uploadedUrl = typeof result === "string" ? result : (result?.url || result?.data?.url);
      if (!uploadedUrl) {
        throw new Error(`Upload failed for ${pending.name}. No URL returned.`);
      }

      urlReplacementMap.set(blobUrl, uploadedUrl);
      // Clean up the local blob
      revokePendingUpload(blobUrl);
    }
  }

  // Replace all blob URLs in clone with the permanent Cloudinary URLs
  function replaceBlobs(obj: any): any {
    if (!obj) return obj;
    if (typeof obj === "string") {
      if (urlReplacementMap.has(obj)) {
        return urlReplacementMap.get(obj);
      }
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(replaceBlobs);
    }
    if (typeof obj === "object") {
      const replaced: any = {};
      for (const [key, value] of Object.entries(obj)) {
        replaced[key] = replaceBlobs(value);
      }
      return replaced;
    }
    return obj;
  }

  return replaceBlobs(clone);
}
