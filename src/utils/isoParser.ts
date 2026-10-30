import { IsoMetadata, PartitionScheme, TargetSystem, FileSystemType } from '../types/rufus';
import { formatBytes } from './checksum';

export async function parseIsoFile(file: File): Promise<IsoMetadata> {
  const fileName = file.name;
  const lowerName = fileName.toLowerCase();
  const sizeBytes = file.size;

  let osType: IsoMetadata['osType'] = 'other';
  let partitionScheme: PartitionScheme = 'GPT';
  let targetSystem: TargetSystem = 'UEFI';
  let recommendedFileSystem: FileSystemType = 'FAT32';
  let isHybrid = true;
  let hasEfi = true;
  let hasInstallWim = false;
  let installWimLargerThan4GB = false;
  let cleanLabel = fileName.replace(/\.iso$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 16).toUpperCase();

  // Inspect first 64KB of the file to check ISO9660 / UDF header
  try {
    const headerSlice = file.slice(0, 65536);
    const headerBuffer = await headerSlice.arrayBuffer();
    const uint8 = new Uint8Array(headerBuffer);
    
    // Check for "CD001" at sector 16 (offset 0x8000 = 32768)
    const offset = 32768;
    const magic = String.fromCharCode(uint8[offset + 1], uint8[offset + 2], uint8[offset + 3], uint8[offset + 4], uint8[offset + 5]);
    
    if (magic === 'CD001') {
      // Extract Volume Identifier (offset 32768 + 40, length 32)
      let rawVolId = '';
      for (let i = 0; i < 32; i++) {
        const charCode = uint8[offset + 40 + i];
        if (charCode >= 32 && charCode <= 126) {
          rawVolId += String.fromCharCode(charCode);
        }
      }
      rawVolId = rawVolId.trim();
      if (rawVolId.length > 0) {
        cleanLabel = rawVolId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 16);
      }
    }
  } catch (err) {
    console.warn('Could not parse ISO header directly, falling back to name heuristic', err);
  }

  // Detect OS type based on name and heuristics
  if (lowerName.includes('win11') || lowerName.includes('windows 11') || lowerName.includes('windows_11')) {
    osType = 'windows';
    partitionScheme = 'GPT';
    targetSystem = 'UEFI';
    recommendedFileSystem = 'NTFS'; // Windows 11 install.wim is usually > 4GB
    hasInstallWim = true;
    installWimLargerThan4GB = true;
  } else if (lowerName.includes('win10') || lowerName.includes('windows 10') || lowerName.includes('windows_10')) {
    osType = 'windows';
    partitionScheme = 'GPT';
    targetSystem = 'UEFI';
    recommendedFileSystem = 'NTFS';
    hasInstallWim = true;
    installWimLargerThan4GB = true;
  } else if (lowerName.includes('ubuntu') || lowerName.includes('mint') || lowerName.includes('debian') || lowerName.includes('fedora') || lowerName.includes('arch') || lowerName.includes('manjaro') || lowerName.includes('pop') || lowerName.includes('kali') || lowerName.includes('proxmox') || lowerName.includes('linux')) {
    osType = 'linux';
    partitionScheme = 'GPT';
    targetSystem = 'UEFI';
    recommendedFileSystem = 'FAT32';
    isHybrid = true;
  } else if (lowerName.includes('freebsd') || lowerName.includes('openbsd') || lowerName.includes('netbsd')) {
    osType = 'bsd';
    partitionScheme = 'GPT';
    targetSystem = 'UEFI';
    recommendedFileSystem = 'FAT32';
  } else if (lowerName.includes('freedos') || lowerName.includes('msdos') || lowerName.includes('dos')) {
    osType = 'dos';
    partitionScheme = 'MBR';
    targetSystem = 'BIOS';
    recommendedFileSystem = 'FAT32';
    hasEfi = false;
  }

  return {
    name: fileName,
    sizeBytes,
    sizeFormatted: formatBytes(sizeBytes),
    osType,
    label: cleanLabel || 'BOOT_DRIVE',
    partitionScheme,
    targetSystem,
    recommendedFileSystem,
    isHybrid,
    hasEfi,
    hasInstallWim,
    installWimLargerThan4GB,
    rawFile: file
  };
}
