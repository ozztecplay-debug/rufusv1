import React, { useRef } from 'react';
import { 
  UsbDevice, 
  IsoMetadata, 
  PartitionScheme, 
  TargetSystem, 
  BootType 
} from '../types/rufus';
import { Language, TRANSLATIONS } from '../utils/translations';
import { HardDrive, Download, FolderOpen, Info, ShieldAlert } from 'lucide-react';

interface DrivePropertiesProps {
  language: Language;
  devices: UsbDevice[];
  selectedDevice: UsbDevice | null;
  onSelectDevice: (device: UsbDevice) => void;
  listUsbHardDrives: boolean;
  onToggleListUsbHardDrives: () => void;
  onConnectWebUsb: () => void;
  bootType: BootType;
  onChangeBootType: (type: BootType) => void;
  selectedIso: IsoMetadata | null;
  onSelectLocalIso: (file: File) => void;
  onOpenFidoModal: () => void;
  partitionScheme: PartitionScheme;
  onChangePartitionScheme: (scheme: PartitionScheme) => void;
  targetSystem: TargetSystem;
  onChangeTargetSystem: (target: TargetSystem) => void;
  persistenceSizeGb: number;
  onChangePersistenceSize: (size: number) => void;
  isFlashing: boolean;
}

export const DriveProperties: React.FC<DrivePropertiesProps> = ({
  language,
  devices,
  selectedDevice,
  onSelectDevice,
  listUsbHardDrives,
  onToggleListUsbHardDrives,
  onConnectWebUsb,
  bootType,
  onChangeBootType,
  selectedIso,
  onSelectLocalIso,
  onOpenFidoModal,
  partitionScheme,
  onChangePartitionScheme,
  targetSystem,
  onChangeTargetSystem,
  persistenceSizeGb,
  onChangePersistenceSize,
  isFlashing
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectLocalIso(file);
    }
  };

  const showPersistenceSlider = selectedIso && selectedIso.osType === 'linux' && bootType === 'iso';

  return (
    <div className="border border-neutral-700/80 rounded bg-neutral-800/40 p-3 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-700/60">
        <span className="text-xs font-bold tracking-wide uppercase text-neutral-300 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-blue-400" />
          {t.driveProperties}
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-400 hover:text-neutral-200">
          <input
            type="checkbox"
            checked={listUsbHardDrives}
            onChange={onToggleListUsbHardDrives}
            disabled={isFlashing}
            className="w-3 h-3 rounded bg-neutral-700 border-neutral-600 text-blue-600 focus:ring-0 cursor-pointer"
          />
          <span>{t.listUsbHardDrives}</span>
        </label>
      </div>

      {/* 1. Device Selection Dropdown */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-300">{t.device}</label>
          <button
            type="button"
            onClick={onConnectWebUsb}
            disabled={isFlashing}
            className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors"
          >
            <span>+ {t.connectWebUsb}</span>
          </button>
        </div>

        <select
          value={selectedDevice?.id || ''}
          onChange={(e) => {
            const dev = devices.find(d => d.id === e.target.value);
            if (dev) onSelectDevice(dev);
          }}
          disabled={isFlashing}
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono focus:border-blue-500 focus:outline-none transition-colors"
        >
          {devices.length === 0 ? (
            <option value="">{t.noDeviceDetected}</option>
          ) : (
            devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* 2. Boot Selection */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-neutral-300">{t.bootSelection}</label>
        
        <div className="grid grid-cols-12 gap-2">
          {/* Boot Type / ISO Title */}
          <div className="col-span-7 sm:col-span-8">
            {bootType === 'iso' ? (
              <div 
                onClick={() => !isFlashing && fileInputRef.current?.click()}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 truncate cursor-pointer hover:border-neutral-500 transition-colors flex items-center justify-between"
                title={selectedIso ? selectedIso.name : t.diskOrIsoImage}
              >
                <span className="truncate">
                  {selectedIso ? selectedIso.name : t.diskOrIsoImage}
                </span>
                {selectedIso && (
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
                    {selectedIso.sizeFormatted}
                  </span>
                )}
              </div>
            ) : (
              <select
                value={bootType}
                onChange={(e) => onChangeBootType(e.target.value as BootType)}
                disabled={isFlashing}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="freedos">FreeDOS</option>
                <option value="syslinux">Syslinux v6.04</option>
                <option value="reactos">ReactOS</option>
                <option value="uefi_ntfs">UEFI:NTFS</option>
                <option value="non_bootable">Non bootable</option>
              </select>
            )}
          </div>

          {/* SELECT Button */}
          <div className="col-span-5 sm:col-span-4 flex items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".iso,.img,.vhd,.raw,.bin"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => {
                onChangeBootType('iso');
                fileInputRef.current?.click();
              }}
              disabled={isFlashing}
              className="flex-1 bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-800 text-neutral-100 text-xs font-semibold py-1.5 px-2 rounded border border-neutral-600 transition-colors flex items-center justify-center gap-1"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.selectIsoBtn}</span>
            </button>

            {/* DOWNLOAD Button (Fido integration) */}
            <button
              type="button"
              onClick={onOpenFidoModal}
              disabled={isFlashing}
              className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold py-1.5 px-2.5 rounded border border-blue-500 transition-colors flex items-center justify-center gap-1"
              title="Rufus Fido ISO Downloader"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.downloadIsoBtn}</span>
            </button>
          </div>
        </div>

        {/* Quick ISO Info Banner if loaded */}
        {selectedIso && (
          <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="capitalize text-neutral-300 font-medium">{selectedIso.osType}</span>
              <span>·</span>
              <span>{selectedIso.isHybrid ? 'Hybrid ISO9660' : 'Standard ISO'}</span>
              {selectedIso.hasInstallWim && <span>· install.wim &gt; 4GB</span>}
            </span>
            <button
              onClick={() => onChangeBootType(bootType === 'iso' ? 'freedos' : 'iso')}
              className="text-blue-400 hover:underline"
            >
              {bootType === 'iso' ? 'Diğer Seçenekler' : 'ISO Moduna Dön'}
            </button>
          </div>
        )}
      </div>

      {/* 3. Partition Scheme & Target System (Side by side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Partition Scheme */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-300">{t.partitionScheme}</label>
          <select
            value={partitionScheme}
            onChange={(e) => {
              const scheme = e.target.value as PartitionScheme;
              onChangePartitionScheme(scheme);
              // Auto-sync target system in Rufus fashion
              if (scheme === 'GPT') {
                onChangeTargetSystem('UEFI');
              } else {
                onChangeTargetSystem('BIOS');
              }
            }}
            disabled={isFlashing}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono focus:border-blue-500 focus:outline-none"
          >
            <option value="GPT">GPT</option>
            <option value="MBR">MBR</option>
          </select>
        </div>

        {/* Target System */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-300">{t.targetSystem}</label>
          <select
            value={targetSystem}
            onChange={(e) => onChangeTargetSystem(e.target.value as TargetSystem)}
            disabled={isFlashing}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono focus:border-blue-500 focus:outline-none"
          >
            {partitionScheme === 'GPT' ? (
              <option value="UEFI">UEFI (non CSM)</option>
            ) : (
              <>
                <option value="BIOS">BIOS (or UEFI-CSM)</option>
                <option value="UEFI">UEFI (non CSM)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* 4. Persistent Partition Slider (Ubuntu/Debian Casper Persistence) */}
      {showPersistenceSlider && (
        <div className="p-2.5 rounded bg-blue-950/20 border border-blue-900/40 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              {t.persistenceSize}:
            </span>
            <span className="font-mono text-blue-400 font-semibold">
              {persistenceSizeGb === 0 ? '0 (Kalıcılık Devre Dışı)' : `${persistenceSizeGb} GB (casper-rw)`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="16"
            step="1"
            value={persistenceSizeGb}
            onChange={(e) => onChangePersistenceSize(parseInt(e.target.value, 10))}
            disabled={isFlashing}
            className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>0 GB</span>
            <span>4 GB</span>
            <span>8 GB</span>
            <span>16 GB</span>
          </div>
        </div>
      )}
    </div>
  );
};
