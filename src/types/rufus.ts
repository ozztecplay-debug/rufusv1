export type PartitionScheme = 'MBR' | 'GPT';
export type TargetSystem = 'BIOS' | 'UEFI';
export type FileSystemType = 'FAT32' | 'NTFS' | 'exFAT' | 'ext4' | 'UDF' | 'btrfs';

export type BootType = 
  | 'iso'
  | 'freedos'
  | 'syslinux'
  | 'reactos'
  | 'uefi_ntfs'
  | 'non_bootable';

export interface UsbDevice {
  id: string;
  name: string;
  devicePath: string; // e.g. /dev/sdb
  sizeBytes: number;
  sizeFormatted: string; // e.g. 32 GB
  vendor: string;
  model: string;
  serialNumber?: string;
  isRemovable: boolean;
  isSystemDrive?: boolean;
  currentFilesystem?: string;
  currentLabel?: string;
  isWebUsb?: boolean;
}

export interface IsoMetadata {
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  osType: 'windows' | 'linux' | 'bsd' | 'dos' | 'other';
  label: string;
  partitionScheme: PartitionScheme;
  targetSystem: TargetSystem;
  recommendedFileSystem: FileSystemType;
  isHybrid: boolean;
  hasEfi: boolean;
  hasInstallWim: boolean;
  installWimLargerThan4GB: boolean;
  sha256?: string;
  sha1?: string;
  md5?: string;
  downloadUrl?: string;
  rawFile?: File;
}

export interface WindowsTweaks {
  bypassTpmAndSecureBoot: boolean;
  bypassOnlineAccount: boolean;
  createLocalAccount: boolean;
  localAccountName: string;
  setRegionalOptions: boolean;
  disableDataCollection: boolean;
  disableBitLocker: boolean;
}

export interface AdvancedFormatOptions {
  quickFormat: boolean;
  createExtendedLabel: boolean;
  checkBadBlocks: boolean;
  badBlocksPasses: 1 | 2 | 4;
  oldBiosFixes: boolean;
  zeroOutDrive: boolean;
  useRufusMbr: boolean;
}

export interface FlashingProgress {
  status: 'idle' | 'preparing' | 'partitioning' | 'formatting' | 'copying' | 'finalizing' | 'completed' | 'error';
  percentage: number;
  currentStepText: string;
  bytesWritten: number;
  totalBytes: number;
  speedBytesPerSec: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  error?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface IsoCatalogItem {
  id: string;
  name: string;
  family: 'Windows' | 'Ubuntu' | 'Debian' | 'Fedora' | 'Arch' | 'Linux Mint' | 'Server & Tools';
  version: string;
  architecture: 'x64' | 'arm64' | 'x86';
  sizeFormatted: string;
  sizeBytes: number;
  releaseDate: string;
  recommendedScheme: PartitionScheme;
  recommendedTarget: TargetSystem;
  recommendedFs: FileSystemType;
  officialDownloadUrl: string;
  officialSha256: string;
  description: string;
  iconName: string;
}
