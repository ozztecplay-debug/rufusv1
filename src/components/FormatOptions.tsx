import React, { useState } from 'react';
import { 
  FileSystemType, 
  AdvancedFormatOptions 
} from '../types/rufus';
import { Language, TRANSLATIONS } from '../utils/translations';
import { Settings2, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface FormatOptionsProps {
  language: Language;
  volumeLabel: string;
  onChangeVolumeLabel: (label: string) => void;
  fileSystem: FileSystemType;
  onChangeFileSystem: (fs: FileSystemType) => void;
  clusterSize: number;
  onChangeClusterSize: (size: number) => void;
  advancedOptions: AdvancedFormatOptions;
  onChangeAdvancedOptions: (opts: AdvancedFormatOptions) => void;
  isFlashing: boolean;
}

export const FormatOptions: React.FC<FormatOptionsProps> = ({
  language,
  volumeLabel,
  onChangeVolumeLabel,
  fileSystem,
  onChangeFileSystem,
  clusterSize,
  onChangeClusterSize,
  advancedOptions,
  onChangeAdvancedOptions,
  isFlashing
}) => {
  const t = TRANSLATIONS[language];
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="border border-neutral-700/80 rounded bg-neutral-800/40 p-3 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-700/60">
        <span className="text-xs font-bold tracking-wide uppercase text-neutral-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          {t.formatOptions}
        </span>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
        >
          <span>{t.advancedOptions}</span>
          {showAdvanced ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* 1. Volume Label */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-neutral-300">{t.volumeLabel}</label>
        <input
          type="text"
          value={volumeLabel}
          onChange={(e) => onChangeVolumeLabel(e.target.value.toUpperCase())}
          disabled={isFlashing}
          placeholder="BOOT_DISK"
          maxLength={32}
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono tracking-wide focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* 2. File System & Cluster Size (Side by Side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* File System */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-300">{t.fileSystem}</label>
          <select
            value={fileSystem}
            onChange={(e) => onChangeFileSystem(e.target.value as FileSystemType)}
            disabled={isFlashing}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono focus:border-blue-500 focus:outline-none"
          >
            <option value="FAT32">FAT32 (Varsayılan / Default)</option>
            <option value="NTFS">NTFS (UEFI:NTFS)</option>
            <option value="exFAT">exFAT</option>
            <option value="ext4">ext4 (Linux Native)</option>
            <option value="UDF">UDF (DVD Image)</option>
            <option value="btrfs">btrfs</option>
          </select>
        </div>

        {/* Cluster Size */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-300">{t.clusterSize}</label>
          <select
            value={clusterSize}
            onChange={(e) => onChangeClusterSize(parseInt(e.target.value, 10))}
            disabled={isFlashing}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono focus:border-blue-500 focus:outline-none"
          >
            <option value={4096}>4096 bayt (Varsayılan)</option>
            <option value={8192}>8192 bayt</option>
            <option value={16384}>16 kilobayt</option>
            <option value={32768}>32 kilobayt</option>
            <option value={65536}>64 kilobayt</option>
          </select>
        </div>
      </div>

      {/* Advanced Format Options (Expandable) */}
      {showAdvanced && (
        <div className="pt-2 border-t border-neutral-700/60 space-y-2 text-xs text-neutral-300">
          {/* Quick Format */}
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={advancedOptions.quickFormat}
              onChange={(e) => onChangeAdvancedOptions({ ...advancedOptions, quickFormat: e.target.checked })}
              disabled={isFlashing}
              className="w-3.5 h-3.5 rounded bg-neutral-700 border-neutral-600 text-blue-600 focus:ring-0"
            />
            <span>{t.quickFormat}</span>
          </label>

          {/* Extended label and icon */}
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={advancedOptions.createExtendedLabel}
              onChange={(e) => onChangeAdvancedOptions({ ...advancedOptions, createExtendedLabel: e.target.checked })}
              disabled={isFlashing}
              className="w-3.5 h-3.5 rounded bg-neutral-700 border-neutral-600 text-blue-600 focus:ring-0"
            />
            <span>{t.extendedLabel}</span>
          </label>

          {/* Bad Blocks */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={advancedOptions.checkBadBlocks}
                onChange={(e) => onChangeAdvancedOptions({ ...advancedOptions, checkBadBlocks: e.target.checked })}
                disabled={isFlashing}
                className="w-3.5 h-3.5 rounded bg-neutral-700 border-neutral-600 text-blue-600 focus:ring-0"
              />
              <span>{t.checkBadBlocks}</span>
            </label>
            {advancedOptions.checkBadBlocks && (
              <select
                value={advancedOptions.badBlocksPasses}
                onChange={(e) => onChangeAdvancedOptions({ 
                  ...advancedOptions, 
                  badBlocksPasses: parseInt(e.target.value, 10) as 1 | 2 | 4 
                })}
                disabled={isFlashing}
                className="bg-neutral-900 border border-neutral-700 text-[11px] rounded px-1.5 py-0.5 text-neutral-200"
              >
                <option value={1}>1 Geçiş (1 Pass)</option>
                <option value={2}>2 Geçiş (2 Passes)</option>
                <option value={4}>4 Geçiş (4 Passes)</option>
              </select>
            )}
          </div>

          {/* Old BIOSes fixes */}
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={advancedOptions.oldBiosFixes}
              onChange={(e) => onChangeAdvancedOptions({ ...advancedOptions, oldBiosFixes: e.target.checked })}
              disabled={isFlashing}
              className="w-3.5 h-3.5 rounded bg-neutral-700 border-neutral-600 text-blue-600 focus:ring-0"
            />
            <span>{t.oldBiosFixes}</span>
          </label>

          {/* Zero out drive */}
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={advancedOptions.zeroOutDrive}
              onChange={(e) => onChangeAdvancedOptions({ ...advancedOptions, zeroOutDrive: e.target.checked })}
              disabled={isFlashing}
              className="w-3.5 h-3.5 rounded bg-neutral-700 border-neutral-600 text-blue-600 focus:ring-0"
            />
            <span>{t.zeroOutDrive}</span>
          </label>
        </div>
      )}
    </div>
  );
};
