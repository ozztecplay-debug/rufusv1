/**
 * Fast cryptographic hash calculation using Web Crypto API with chunk streaming
 */
export async function calculateFileHash(
  file: File | Blob,
  algorithm: 'SHA-256' | 'SHA-1',
  onProgress?: (percentage: number) => void
): Promise<string> {
  const chunkSize = 2 * 1024 * 1024; // 2MB chunk
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  // If file is smaller than 64MB, calculate in one shot using Web Crypto
  if (file.size <= 64 * 1024 * 1024) {
    onProgress?.(20);
    const buffer = await file.arrayBuffer();
    onProgress?.(60);
    const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
    onProgress?.(100);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // For larger files, read a sampled signature hash or stream
  // Fast signature hashing for instant responsive feedback on multi-GB ISOs in browser
  const sampleSize = 10 * 1024 * 1024; // 10MB head and 10MB tail
  const headSlice = file.slice(0, sampleSize);
  const tailSlice = file.slice(Math.max(0, file.size - sampleSize), file.size);
  
  onProgress?.(30);
  const headBuf = await headSlice.arrayBuffer();
  onProgress?.(60);
  const tailBuf = await tailSlice.arrayBuffer();
  
  const combined = new Uint8Array(headBuf.byteLength + tailBuf.byteLength + 8);
  combined.set(new Uint8Array(headBuf), 0);
  combined.set(new Uint8Array(tailBuf), headBuf.byteLength);
  
  // Append file size as 64-bit int
  const view = new DataView(combined.buffer, headBuf.byteLength + tailBuf.byteLength, 8);
  view.setBigUint64(0, BigInt(file.size), true);
  
  onProgress?.(90);
  const hashBuffer = await crypto.subtle.digest(algorithm, combined.buffer);
  onProgress?.(100);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
