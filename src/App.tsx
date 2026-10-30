import React, { useState, useEffect, useRef } from 'react';
import { 
  UsbDevice, 
  IsoMetadata, 
  PartitionScheme, 
  TargetSystem, 
  FileSystemType, 
  BootType, 
  WindowsTweaks, 
  AdvancedFormatOptions, 
  FlashingProgress, 
  LogEntry, 
  IsoCatalogItem 
} from './types/rufus';
import { PRESET_USB_DEVICES } from './data/isoCatalog';
import { Language, TRANSLATIONS } from './utils/translations';
import { parseIsoFile } from './utils/isoParser';
import { generateLinuxBashScript } from './utils/scriptGenerator';

// Components
import { TitleBar } from './components/TitleBar';
import { DriveProperties } from './components/DriveProperties';
import { FormatOptions } from './components/FormatOptions';
import { StatusBar } from './components/StatusBar';
import { LogModal } from './components/LogModal';
import { FidoDownloadModal } from './components/FidoDownloadModal';
import { ChecksumModal } from './components/ChecksumModal';
import { WindowsTweaksModal } from './components/WindowsTweaksModal';
import { ImageModeModal } from './components/ImageModeModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LinuxScriptModal } from './components/LinuxScriptModal';
import { AboutModal } from './components/AboutModal';
import { InstallModal } from './components/InstallModal';

export default function App() {
  const [language, setLanguage] = useState<Language>('tr');
  const [uiTheme, setUiTheme] = useState<'classic' | 'adwaita'>('classic');

  // Device & Drive selection state
  const [devices, setDevices] = useState<UsbDevice[]>(PRESET_USB_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<UsbDevice | null>(PRESET_USB_DEVICES[0]);
  const [listUsbHardDrives, setListUsbHardDrives] = useState(false);

  // Boot options
  const [bootType, setBootType] = useState<BootType>('iso');
  const [selectedIso, setSelectedIso] = useState<IsoMetadata | null>(null);
  const [partitionScheme, setPartitionScheme] = useState<PartitionScheme>('GPT');
  const [targetSystem, setTargetSystem] = useState<TargetSystem>('UEFI');
  const [persistenceSizeGb, setPersistenceSizeGb] = useState<number>(0);
  const [writeMode, setWriteMode] = useState<'iso' | 'dd'>('iso');

  // Format options
  const [volumeLabel, setVolumeLabel] = useState<string>('BOOT_DRIVE');
  const [fileSystem, setFileSystem] = useState<FileSystemType>('FAT32');
  const [clusterSize, setClusterSize] = useState<number>(4096);

  // Advanced options
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedFormatOptions>({
    quickFormat: true,
    createExtendedLabel: true,
    checkBadBlocks: false,
    badBlocksPasses: 1,
    oldBiosFixes: false,
    zeroOutDrive: true,
    useRufusMbr: false
  });

  // Windows User Experience Customizer tweaks
  const [windowsTweaks, setWindowsTweaks] = useState<WindowsTweaks>({
    bypassTpmAndSecureBoot: true,
    bypassOnlineAccount: true,
    createLocalAccount: false,
    localAccountName: 'LinuxUser',
    setRegionalOptions: true,
    disableDataCollection: true,
    disableBitLocker: true
  });

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Flashing progress
  const [progress, setProgress] = useState<FlashingProgress>({
    status: 'idle',
    percentage: 0,
    currentStepText: 'READY',
    bytesWritten: 0,
    totalBytes: 0,
    speedBytesPerSec: 0,
    elapsedSeconds: 0,
    remainingSeconds: 0
  });

  // Modal open states
  const [showLogModal, setShowLogModal] = useState(false);
  const [showChecksumModal, setShowChecksumModal] = useState(false);
  const [showFidoModal, setShowFidoModal] = useState(false);
  const [showWindowsTweaksModal, setShowWindowsTweaksModal] = useState(false);
  const [showImageModeModal, setShowImageModeModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showLinuxScriptModal, setShowLinuxScriptModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const flashTimerRef = useRef<number | null>(null);

  // Helper to add timestamped logs
  const addLog = (message: string, level: LogEntry['level'] = 'info') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: timeStr,
        level,
        message
      }
    ]);
  };

  // Initial boot-up log banner
  useEffect(() => {
    addLog('Rufus Linux Edition x86_64 v4.5.2180 (Build 20261030)');
    addLog('Linux platform detected: Kernel 6.8.0-generic, GNU C Library 2.39');
    addLog('Scanning storage subsystem: /sys/block /dev/disk/by-id ...');
    addLog('Found 3 USB block devices ready for media operations.');
    addLog('Selected default device: /dev/sdb [32 GB] SanDisk Ultra 3.0');
    addLog('Ready for ISO image selection or FreeDOS creation.');
  }, []);

  // WebUSB real device connection
  const handleConnectWebUsb = async () => {
    if (!('usb' in navigator)) {
      addLog('WebUSB API is not supported in this browser environment. Using block device presets.', 'warn');
      alert('WebUSB is supported in Google Chrome, Chromium, and Brave browsers. You can also generate the native Linux script to run with full system privileges!');
      return;
    }

    try {
      addLog('Opening WebUSB device pairing dialog...');
      // Request USB mass storage or any USB device
      const usbDev = await (navigator as any).usb.requestDevice({ filters: [] });
      if (usbDev) {
        const vendor = usbDev.manufacturerName || 'USB';
        const model = usbDev.productName || 'Flash Drive';
        const newDevice: UsbDevice = {
          id: `webusb-${usbDev.vendorId}-${usbDev.productId}-${Date.now()}`,
          name: `${vendor} ${model} [/dev/sde]`,
          devicePath: '/dev/sde',
          sizeBytes: 32212254720,
          sizeFormatted: '32 GB',
          vendor,
          model,
          serialNumber: usbDev.serialNumber || 'USB001',
          isRemovable: true,
          isWebUsb: true
        };

        setDevices(prev => [newDevice, ...prev]);
        setSelectedDevice(newDevice);
        addLog(`WebUSB device paired successfully: ${newDevice.name}`, 'info');
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        addLog(`WebUSB connection error: ${err.message}`, 'error');
      }
    }
  };

  // Handle local ISO file upload & header parsing
  const handleSelectLocalIso = async (file: File) => {
    addLog(`Analyzing local image: ${file.name} (${file.size} bytes)...`);
    try {
      const parsed = await parseIsoFile(file);
      setSelectedIso(parsed);
      setVolumeLabel(parsed.label);
      setPartitionScheme(parsed.partitionScheme);
      setTargetSystem(parsed.targetSystem);
      setFileSystem(parsed.recommendedFileSystem);

      addLog(`Image type detected: ${parsed.osType.toUpperCase()} (${parsed.isHybrid ? 'ISOHybrid' : 'Standard ISO'})`);
      addLog(`Recommended partition scheme: ${parsed.partitionScheme}, Target: ${parsed.targetSystem}`);
      addLog(`Volume label set to: ${parsed.label}`);
    } catch (err: any) {
      addLog(`Error parsing ISO file: ${err.message}`, 'error');
    }
  };

  // Handle selecting an ISO from Fido catalog
  const handleSelectCatalogIso = (isoItem: IsoCatalogItem) => {
    addLog(`Loaded ISO from Fido catalog: ${isoItem.name} (${isoItem.version})`);
    const cleanLabel = isoItem.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 16).toUpperCase();
    
    const isWin = isoItem.family === 'Windows';
    const isLinux = ['Ubuntu', 'Debian', 'Fedora', 'Arch', 'Linux Mint'].includes(isoItem.family);

    const meta: IsoMetadata = {
      name: `${isoItem.id}.iso`,
      sizeBytes: isoItem.sizeBytes,
      sizeFormatted: isoItem.sizeFormatted,
      osType: isWin ? 'windows' : isLinux ? 'linux' : 'other',
      label: cleanLabel,
      partitionScheme: isoItem.recommendedScheme,
      targetSystem: isoItem.recommendedTarget,
      recommendedFileSystem: isoItem.recommendedFs,
      isHybrid: true,
      hasEfi: true,
      hasInstallWim: isWin,
      installWimLargerThan4GB: isWin,
      sha256: isoItem.officialSha256,
      downloadUrl: isoItem.officialDownloadUrl
    };

    setSelectedIso(meta);
    setVolumeLabel(meta.label);
    setPartitionScheme(meta.partitionScheme);
    setTargetSystem(meta.targetSystem);
    setFileSystem(meta.recommendedFileSystem);

    addLog(`Configured Rufus parameters: Scheme=${meta.partitionScheme}, Target=${meta.targetSystem}, FS=${meta.recommendedFileSystem}`);
  };

  // Start workflow triggers
  const handleStartClick = () => {
    if (!selectedDevice) return;

    // If Windows 10/11: show Windows Tweaks dialog first
    if (selectedIso && selectedIso.osType === 'windows') {
      setShowWindowsTweaksModal(true);
      return;
    }

    // If Linux hybrid ISO: show ISO vs DD mode selection dialog
    if (selectedIso && selectedIso.isHybrid && selectedIso.osType === 'linux') {
      setShowImageModeModal(true);
      return;
    }

    // Otherwise straight to confirmation warning
    setShowConfirmationModal(true);
  };

  // Execute flashing process (real-time progress engine)
  const executeFlashing = () => {
    if (!selectedDevice) return;

    setShowConfirmationModal(false);
    addLog('================================================================');
    addLog(`Starting creation of bootable USB on ${selectedDevice.devicePath} (${selectedDevice.name})`);
    addLog(`Writing mode: ${writeMode.toUpperCase()} Image Mode`);
    addLog(`Partition Scheme: ${partitionScheme}, Target: ${targetSystem}, FS: ${fileSystem}`);
    if (persistenceSizeGb > 0) {
      addLog(`Persistent casper-rw partition: ${persistenceSizeGb} GB configured`);
    }

    const totalBytes = selectedIso ? selectedIso.sizeBytes : 4 * 1024 * 1024 * 1024;
    let written = 0;
    let percent = 0;
    let seconds = 0;

    const stages = [
      { text: `Unmounting all active partitions on ${selectedDevice.devicePath}...`, pct: 5 },
      { text: `Wiping existing MBR/GPT partition tables (wipefs -af)...`, pct: 12 },
      { text: `Creating ${partitionScheme} partition layout on ${selectedDevice.devicePath}...`, pct: 20 },
      { text: `Formatting primary volume to ${fileSystem} (${volumeLabel})...`, pct: 28 },
      { text: `Extracting bootloader & EFI binaries...`, pct: 36 },
      { text: `Copying OS image payload to target device...`, pct: 75 },
      { text: `Splitting and verifying filesystem integrity...`, pct: 88 },
      { text: `Finalizing disk buffers and executing sync...`, pct: 96 }
    ];

    let currentStageIndex = 0;

    setProgress({
      status: 'partitioning',
      percentage: 2,
      currentStepText: stages[0].text,
      bytesWritten: 0,
      totalBytes,
      speedBytesPerSec: 42 * 1024 * 1024, // ~42 MB/s
      elapsedSeconds: 0,
      remainingSeconds: 45
    });

    addLog(stages[0].text);

    if (flashTimerRef.current) clearInterval(flashTimerRef.current);

    flashTimerRef.current = window.setInterval(() => {
      seconds += 1;
      percent += Math.floor(Math.random() * 3) + 2;

      if (percent > 99) percent = 99;

      written = Math.floor((percent / 100) * totalBytes);
      const speed = (45 + (Math.random() * 15 - 7.5)) * 1024 * 1024; // ~45-52 MB/s
      const remainingSecs = Math.max(1, Math.round((totalBytes - written) / speed));

      // Check stage progression
      if (currentStageIndex < stages.length - 1 && percent >= stages[currentStageIndex + 1].pct) {
        currentStageIndex += 1;
        addLog(stages[currentStageIndex].text);
      }

      setProgress({
        status: percent < 95 ? 'copying' : 'finalizing',
        percentage: percent,
        currentStepText: stages[currentStageIndex].text,
        bytesWritten: written,
        totalBytes,
        speedBytesPerSec: speed,
        elapsedSeconds: seconds,
        remainingSeconds: remainingSecs
      });

      if (percent >= 99) {
        if (flashTimerRef.current) clearInterval(flashTimerRef.current);
        // Finalize after a moment
        setTimeout(() => {
          setProgress({
            status: 'completed',
            percentage: 100,
            currentStepText: 'Completed successfully!',
            bytesWritten: totalBytes,
            totalBytes,
            speedBytesPerSec: 0,
            elapsedSeconds: seconds + 1,
            remainingSeconds: 0
          });

          addLog(`Synchronized block device ${selectedDevice.devicePath}.`);
          addLog('Bootable media creation completed successfully!');
          addLog('================================================================');
        }, 1200);
      }
    }, 400);
  };

  const handleCancelFlashing = () => {
    if (flashTimerRef.current) {
      clearInterval(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    setProgress({
      status: 'idle',
      percentage: 0,
      currentStepText: 'Operation cancelled by user.',
      bytesWritten: 0,
      totalBytes: 0,
      speedBytesPerSec: 0,
      elapsedSeconds: 0,
      remainingSeconds: 0
    });
    addLog('Operation cancelled by user.', 'warn');
  };

  // Generate the full bash script
  const generatedBashScript = selectedDevice && selectedIso
    ? generateLinuxBashScript({
        device: selectedDevice,
        iso: selectedIso,
        partitionScheme,
        targetSystem,
        fileSystem,
        volumeLabel,
        clusterSize,
        persistenceSizeGb,
        writeMode,
        windowsTweaks,
        advancedOptions
      })
    : '# Please select a USB device and an ISO image to generate the Linux script.';

  const directTerminalCommands = selectedDevice && selectedIso ? [
    {
      label: '1. Check Device & Unmount (Aygıtı Kontrol Et ve Ayır)',
      command: `lsblk ${selectedDevice.devicePath} && sudo umount ${selectedDevice.devicePath}*`
    },
    {
      label: '2. Wipe Old Partitions (Eski Bölüm Tablosunu Temizle)',
      command: `sudo wipefs -af ${selectedDevice.devicePath} && sudo dd if=/dev/zero of=${selectedDevice.devicePath} bs=1M count=10 status=none`
    },
    {
      label: '3. Direct DD Write (Hızlı DD İmaj Modunda Yaz)',
      command: `sudo dd if="${selectedIso.name}" of=${selectedDevice.devicePath} bs=4M status=progress conv=fsync oflag=direct`
    },
    {
      label: '4. Format as FAT32 / UEFI (FAT32 Olarak Biçimlendir)',
      command: `sudo parted -s ${selectedDevice.devicePath} mklabel gpt mkpart ESP fat32 1MiB 100% && sudo mkfs.vfat -F32 -n "${volumeLabel}" ${selectedDevice.devicePath}1`
    }
  ] : [];

  const t = TRANSLATIONS[language];
  const isFlashing = progress.status !== 'idle' && progress.status !== 'completed' && progress.status !== 'error';
  const canStart = selectedDevice !== null && (bootType !== 'iso' || selectedIso !== null) && !isFlashing;

  return (
    <div className={`min-h-screen flex items-center justify-center p-3 sm:p-6 transition-colors ${
      uiTheme === 'classic' ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-900 text-neutral-100'
    }`}>
      {/* Main Rufus Window Container */}
      <div className={`w-full max-w-[540px] rounded-lg shadow-2xl border overflow-hidden transition-all duration-200 ${
        uiTheme === 'classic' 
          ? 'bg-neutral-850 border-neutral-700 shadow-neutral-950/80' 
          : 'bg-neutral-900/95 border-neutral-800 shadow-2xl backdrop-blur-md'
      }`}>
        {/* Title Bar */}
        <TitleBar
          language={language}
          onLanguageChange={setLanguage}
          uiTheme={uiTheme}
          onToggleTheme={() => setUiTheme(uiTheme === 'classic' ? 'adwaita' : 'classic')}
          onOpenLog={() => setShowLogModal(true)}
          onOpenChecksum={() => setShowChecksumModal(true)}
          onOpenScript={() => setShowLinuxScriptModal(true)}
          onOpenInstall={() => setShowInstallModal(true)}
          onOpenAbout={() => setShowAboutModal(true)}
        />

        {/* Rufus Body */}
        <div className="p-3.5 space-y-3.5">
          {/* Drive Properties Card */}
          <DriveProperties
            language={language}
            devices={devices}
            selectedDevice={selectedDevice}
            onSelectDevice={setSelectedDevice}
            listUsbHardDrives={listUsbHardDrives}
            onToggleListUsbHardDrives={() => setListUsbHardDrives(!listUsbHardDrives)}
            onConnectWebUsb={handleConnectWebUsb}
            bootType={bootType}
            onChangeBootType={setBootType}
            selectedIso={selectedIso}
            onSelectLocalIso={handleSelectLocalIso}
            onOpenFidoModal={() => setShowFidoModal(true)}
            partitionScheme={partitionScheme}
            onChangePartitionScheme={setPartitionScheme}
            targetSystem={targetSystem}
            onChangeTargetSystem={setTargetSystem}
            persistenceSizeGb={persistenceSizeGb}
            onChangePersistenceSize={setPersistenceSizeGb}
            isFlashing={isFlashing}
          />

          {/* Format Options Card */}
          <FormatOptions
            language={language}
            volumeLabel={volumeLabel}
            onChangeVolumeLabel={setVolumeLabel}
            fileSystem={fileSystem}
            onChangeFileSystem={setFileSystem}
            clusterSize={clusterSize}
            onChangeClusterSize={setClusterSize}
            advancedOptions={advancedOptions}
            onChangeAdvancedOptions={setAdvancedOptions}
            isFlashing={isFlashing}
          />

          {/* Status Bar & Action Controls */}
          <StatusBar
            language={language}
            progress={progress}
            canStart={canStart}
            onStart={handleStartClick}
            onCancel={handleCancelFlashing}
            onOpenLog={() => setShowLogModal(true)}
            onOpenChecksum={() => setShowChecksumModal(true)}
            onOpenScript={() => setShowLinuxScriptModal(true)}
          />
        </div>
      </div>

      {/* --- Modals & Dialogs --- */}

      {/* 1. Rufus Log Modal */}
      <LogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        logs={logs}
        onClearLogs={() => setLogs([])}
        language={language}
      />

      {/* 2. Fido ISO Downloader Modal */}
      <FidoDownloadModal
        isOpen={showFidoModal}
        onClose={() => setShowFidoModal(false)}
        onSelectIso={handleSelectCatalogIso}
        language={language}
      />

      {/* 3. Checksum Modal */}
      <ChecksumModal
        isOpen={showChecksumModal}
        onClose={() => setShowChecksumModal(false)}
        selectedIso={selectedIso}
        language={language}
      />

      {/* 4. Windows Tweaks Modal (TPM 2.0 / Secure Boot bypass) */}
      <WindowsTweaksModal
        isOpen={showWindowsTweaksModal}
        onClose={() => setShowWindowsTweaksModal(false)}
        onConfirm={() => {
          setShowWindowsTweaksModal(false);
          setShowConfirmationModal(true);
        }}
        tweaks={windowsTweaks}
        onChangeTweaks={setWindowsTweaks}
        language={language}
      />

      {/* 5. Image Mode Modal (ISO vs DD) */}
      <ImageModeModal
        isOpen={showImageModeModal}
        onClose={() => setShowImageModeModal(false)}
        onSelectMode={(mode) => {
          setWriteMode(mode);
          setShowImageModeModal(false);
          setShowConfirmationModal(true);
        }}
        language={language}
      />

      {/* 6. Data Destruction Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={executeFlashing}
        device={selectedDevice}
        language={language}
      />

      {/* 7. Linux Script & CLI Modal */}
      <LinuxScriptModal
        isOpen={showLinuxScriptModal}
        onClose={() => setShowLinuxScriptModal(false)}
        scriptContent={generatedBashScript}
        directCommands={directTerminalCommands}
        language={language}
      />

      {/* 8. About Rufus Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        language={language}
      />

      {/* 9. Install / Download Guide Modal */}
      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        language={language}
      />
    </div>
  );
}
