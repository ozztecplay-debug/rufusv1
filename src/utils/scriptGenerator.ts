import { 
  UsbDevice, 
  IsoMetadata, 
  PartitionScheme, 
  TargetSystem, 
  FileSystemType, 
  WindowsTweaks,
  AdvancedFormatOptions 
} from '../types/rufus';

interface ScriptOptions {
  device: UsbDevice;
  iso: IsoMetadata;
  partitionScheme: PartitionScheme;
  targetSystem: TargetSystem;
  fileSystem: FileSystemType;
  volumeLabel: string;
  clusterSize: number;
  persistenceSizeGb: number;
  writeMode: 'iso' | 'dd';
  windowsTweaks: WindowsTweaks;
  advancedOptions: AdvancedFormatOptions;
}

export function generateLinuxBashScript(options: ScriptOptions): string {
  const {
    device,
    iso,
    partitionScheme,
    targetSystem,
    fileSystem,
    volumeLabel,
    persistenceSizeGb,
    writeMode,
    windowsTweaks,
    advancedOptions
  } = options;

  const targetDev = device.devicePath;
  const isWindows = iso.osType === 'windows';

  // Build the bash script
  let script = `#!/usr/bin/env bash
# ==============================================================================
# Rufus for Linux - Automated Bootable USB Creator Script
# Generated based on Pete Batard's Rufus (https://github.com/pbatard/rufus)
# Target Device: ${targetDev} (${device.name})
# Source ISO:    ${iso.name} (${iso.sizeFormatted})
# Scheme/Target: ${partitionScheme} / ${targetSystem}
# File System:   ${fileSystem}
# Write Mode:    ${writeMode.toUpperCase()} Image Mode
# ==============================================================================

set -euo pipefail

# 1. Root permission check
if [ "$EUID" -ne 0 ]; then
  echo "[-] ERROR: This script must be run with root privileges."
  echo "    Please run: sudo bash $0"
  exit 1
fi

TARGET_DEV="${targetDev}"
ISO_PATH="\${1:-"${iso.name}"}"
LABEL="${volumeLabel.replace(/"/g, '')}"

echo "=========================================================="
echo "  RUFUS FOR LINUX - Bootable Media Creation"
echo "=========================================================="
echo "Target Device: $TARGET_DEV"
echo "Source Image:  $ISO_PATH"
echo "Target System: ${targetSystem} (${partitionScheme})"
echo "File System:   ${fileSystem}"
echo "=========================================================="

# Check if target device exists
if [ ! -b "$TARGET_DEV" ]; then
  echo "[-] ERROR: Block device $TARGET_DEV not found!"
  exit 1
fi

# Safety guard: Prevent accidental overwrite of system drive
ROOT_DEV=$(findmnt -n -o SOURCE / | sed -r 's/p?[0-9]+$//')
if [ "$TARGET_DEV" = "$ROOT_DEV" ]; then
  echo "[-] CRITICAL REFUSAL: $TARGET_DEV is your active ROOT filesystem!"
  echo "    Operation aborted for system safety."
  exit 1
fi

# Verify ISO file exists
if [ ! -f "$ISO_PATH" ]; then
  echo "[-] ERROR: ISO file '$ISO_PATH' not found."
  echo "    Usage: sudo bash $0 /path/to/${iso.name}"
  exit 1
fi

echo "[*] WARNING: ALL DATA ON $TARGET_DEV WILL BE PERMANENTLY DESTROYED!"
read -p "Are you sure you want to proceed? (y/N): " -r CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "[-] Operation cancelled by user."
  exit 0
fi

# 2. Unmount any active partitions on device
echo "[1/6] Unmounting active partitions on $TARGET_DEV..."
umount \${TARGET_DEV}* 2>/dev/null || true

# 3. Wipe partition signatures and old filesystem headers
echo "[2/6] Wiping partition tables and signatures..."
wipefs -af "$TARGET_DEV"
dd if=/dev/zero of="$TARGET_DEV" bs=1M count=10 status=none conv=notrunc
sync
`;

  if (writeMode === 'dd') {
    script += `
# ------------------------------------------------------------------------------
# DD Image Mode (Direct Bit-by-bit Raw Copy)
# ------------------------------------------------------------------------------
echo "[3/6] Writing ISO directly to device using dd..."
dd if="$ISO_PATH" of="$TARGET_DEV" bs=4M status=progress conv=fsync oflag=direct

echo "[4/6] Synchronizing cached disk buffers..."
sync

echo "[5/6] Probing partition table changes..."
partprobe "$TARGET_DEV" || true

echo "=========================================================="
echo "[+] SUCCESS: Bootable USB drive created in DD mode!"
echo "    You can now safely unplug $TARGET_DEV and boot from it."
echo "=========================================================="
exit 0
`;
    return script;
  }

  // ISO Image Mode (File extraction & Bootloader installation)
  script += `
# ------------------------------------------------------------------------------
# ISO Image Mode (Native Partitioning & Extraction)
# ------------------------------------------------------------------------------
echo "[3/6] Creating ${partitionScheme} partition table..."

${partitionScheme === 'GPT' ? `
# Create GPT Table
parted -s "$TARGET_DEV" mklabel gpt

# Partition 1: EFI System Partition (FAT32)
parted -s "$TARGET_DEV" mkpart ESP fat32 1MiB 200MiB
parted -s "$TARGET_DEV" set 1 esp on
parted -s "$TARGET_DEV" set 1 boot on

# Partition 2: Main Data Partition
${persistenceSizeGb > 0 ? `
parted -s "$TARGET_DEV" mkpart primary ${fileSystem.toLowerCase()} 200MiB -${persistenceSizeGb}GiB
parted -s "$TARGET_DEV" mkpart persistence ext4 -${persistenceSizeGb}GiB 100%
` : `
parted -s "$TARGET_DEV" mkpart primary ${fileSystem.toLowerCase()} 200MiB 100%
`}
` : `
# Create MBR (msdos) Table
parted -s "$TARGET_DEV" mklabel msdos

# Partition 1: Bootable Partition
${persistenceSizeGb > 0 ? `
parted -s "$TARGET_DEV" mkpart primary ${fileSystem.toLowerCase()} 1MiB -${persistenceSizeGb}GiB
parted -s "$TARGET_DEV" set 1 boot on
parted -s "$TARGET_DEV" mkpart primary ext4 -${persistenceSizeGb}GiB 100%
` : `
parted -s "$TARGET_DEV" mkpart primary ${fileSystem.toLowerCase()} 1MiB 100%
parted -s "$TARGET_DEV" set 1 boot on
`}
`}

sleep 2
partprobe "$TARGET_DEV" || true

# Determine partition naming (sdX1 vs nvmeXn1p1)
P1="\${TARGET_DEV}1"
P2="\${TARGET_DEV}2"
if [[ "$TARGET_DEV" =~ [0-9]$ ]]; then
  P1="\${TARGET_DEV}p1"
  P2="\${TARGET_DEV}p2"
fi

echo "[4/6] Formatting partitions..."
${partitionScheme === 'GPT' ? `
mkfs.vfat -F 32 -n "EFI" "$P1"
${fileSystem === 'NTFS' ? `mkfs.ntfs -Q -L "$LABEL" "$P2"` : 
  fileSystem === 'exFAT' ? `mkfs.exfat -n "$LABEL" "$P2"` :
  fileSystem === 'ext4' ? `mkfs.ext4 -F -L "$LABEL" "$P2"` :
  `mkfs.vfat -F 32 -n "$LABEL" "$P2"`}
` : `
${fileSystem === 'NTFS' ? `mkfs.ntfs -Q -L "$LABEL" "$P1"` : 
  fileSystem === 'exFAT' ? `mkfs.exfat -n "$LABEL" "$P1"` :
  fileSystem === 'ext4' ? `mkfs.ext4 -F -L "$LABEL" "$P1"` :
  `mkfs.vfat -F 32 -n "$LABEL" "$P1"`}
`}

${persistenceSizeGb > 0 ? `
echo "[*] Formatting Casper Persistence partition (ext4)..."
P_PERSIST="\${TARGET_DEV}3"
if [[ "$TARGET_DEV" =~ [0-9]$ ]]; then
  P_PERSIST="\${TARGET_DEV}p3"
fi
mkfs.ext4 -F -L "casper-rw" "$P_PERSIST"
` : ''}

# 5. Extract ISO contents
echo "[5/6] Extracting ISO files onto target partition..."
MOUNT_ISO=$(mktemp -d /tmp/rufus_iso_XXXXXX)
MOUNT_USB=$(mktemp -d /tmp/rufus_usb_XXXXXX)

mount -o loop,ro "$ISO_PATH" "$MOUNT_ISO"
${partitionScheme === 'GPT' ? `mount "$P2" "$MOUNT_USB"` : `mount "$P1" "$MOUNT_USB"`}

# Copy files using rsync with progress
rsync -ah --info=progress2 "$MOUNT_ISO/" "$MOUNT_USB/"

${partitionScheme === 'GPT' ? `
# Populate EFI system partition
MOUNT_EFI=$(mktemp -d /tmp/rufus_efi_XXXXXX)
mount "$P1" "$MOUNT_EFI"
if [ -d "$MOUNT_ISO/efi" ]; then
  cp -r "$MOUNT_ISO/efi" "$MOUNT_EFI/"
elif [ -d "$MOUNT_ISO/EFI" ]; then
  cp -r "$MOUNT_ISO/EFI" "$MOUNT_EFI/"
fi
umount "$MOUNT_EFI"
rm -rf "$MOUNT_EFI"
` : ''}
`;

  // Windows 11 / 10 specific tweaks (autounattend.xml for TPM, Secure Boot, Local Account)
  if (isWindows && (windowsTweaks.bypassTpmAndSecureBoot || windowsTweaks.bypassOnlineAccount || windowsTweaks.createLocalAccount)) {
    const user = windowsTweaks.localAccountName || 'User';
    script += `
# ------------------------------------------------------------------------------
# Rufus Windows User Experience Customizations
# ------------------------------------------------------------------------------
echo "[*] Applying Rufus Windows Customizations (autounattend.xml)..."
cat << 'EOF' > "$MOUNT_USB/autounattend.xml"
<?xml version="1.0" encoding="utf-8"?>
<unattend xmlns="urn:schemas-microsoft-com:unattend">
  <settings pass="windowsPE">
    <component name="Microsoft-Windows-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <RunSynchronous>
${windowsTweaks.bypassTpmAndSecureBoot ? `        <!-- Rufus TPM 2.0 & Secure Boot Bypass -->
        <RunSynchronousCommand wcm:action="add">
          <Order>1</Order>
          <Path>reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassTPMCheck /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>
        <RunSynchronousCommand wcm:action="add">
          <Order>2</Order>
          <Path>reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassSecureBootCheck /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>
        <RunSynchronousCommand wcm:action="add">
          <Order>3</Order>
          <Path>reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassRAMCheck /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>
        <RunSynchronousCommand wcm:action="add">
          <Order>4</Order>
          <Path>reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassCPUCheck /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>
        <RunSynchronousCommand wcm:action="add">
          <Order>5</Order>
          <Path>reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassStorageCheck /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>` : ''}
      </RunSynchronous>
    </component>
  </settings>
  <settings pass="oobeSystem">
    <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <OOBE>
        <HideEULAPage>true</HideEULAPage>
        <HideOnlineAccountScreens>${windowsTweaks.bypassOnlineAccount ? 'true' : 'false'}</HideOnlineAccountScreens>
        <HideWirelessSetupInOOBE>false</HideWirelessSetupInOOBE>
        <ProtectYourPC>3</ProtectYourPC>
      </OOBE>
${windowsTweaks.createLocalAccount ? `      <UserAccounts>
        <LocalAccounts>
          <LocalAccount wcm:action="add">
            <Name>${user}</Name>
            <Group>Administrators</Group>
            <DisplayName>${user}</DisplayName>
            <Description>Rufus Local Administrator</Description>
            <Password><Value></Value><PlainText>true</PlainText></Password>
          </LocalAccount>
        </LocalAccounts>
      </UserAccounts>` : ''}
    </component>
  </settings>
</unattend>
EOF
`;
  }

  // Handle FAT32 4GB install.wim splitting if needed
  if (isWindows && fileSystem === 'FAT32') {
    script += `
# ------------------------------------------------------------------------------
# Split install.wim into SWM chunks if > 4GB for FAT32 compatibility
# ------------------------------------------------------------------------------
if [ -f "$MOUNT_USB/sources/install.wim" ]; then
  WIM_SIZE=$(stat -c%s "$MOUNT_USB/sources/install.wim")
  if [ "$WIM_SIZE" -gt 4294967295 ]; then
    echo "[*] Splitting install.wim (>4GB) using wimlib-imagex for FAT32..."
    if command -v wimlib-imagex &> /dev/null; then
      wimlib-imagex split "$MOUNT_USB/sources/install.wim" "$MOUNT_USB/sources/install.swm" 3800
      rm -f "$MOUNT_USB/sources/install.wim"
    else
      echo "[-] WARNING: wimlib-imagex not found. Install wimtools (sudo apt install wimtools)."
    fi
  fi
fi
`;
  }

  script += `
# 6. Cleanup and sync
echo "[6/6] Finalizing disk write and unmounting..."
sync
umount "$MOUNT_USB"
umount "$MOUNT_ISO"
rm -rf "$MOUNT_USB" "$MOUNT_ISO"

echo "=========================================================="
echo "[+] SUCCESS: Bootable USB drive created successfully!"
echo "    Device: $TARGET_DEV"
echo "    System: ${targetSystem} / ${partitionScheme}"
echo "    You can now reboot and select $TARGET_DEV from BIOS/UEFI."
echo "=========================================================="
`;

  return script;
}
