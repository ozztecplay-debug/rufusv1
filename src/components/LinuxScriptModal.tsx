import React, { useState } from 'react';
import { Language, TRANSLATIONS } from '../utils/translations';
import { X, Copy, Download, Check, Terminal, Code2, BookOpen } from 'lucide-react';

interface LinuxScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptContent: string;
  directCommands: {
    label: string;
    command: string;
  }[];
  language: Language;
}

export const LinuxScriptModal: React.FC<LinuxScriptModalProps> = ({
  isOpen,
  onClose,
  scriptContent,
  directCommands,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'script' | 'commands' | 'guide'>('script');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCmdIndex, setCopiedCmdIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmdIndex(index);
    setTimeout(() => setCopiedCmdIndex(null), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([scriptContent], { type: 'application/x-sh;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'create-bootable-usb.sh';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col h-[620px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <div>
              <h2 className="font-bold text-sm text-neutral-100">{t.linuxScriptTitle}</h2>
              <p className="text-[11px] text-neutral-400">{t.linuxScriptDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-neutral-850 border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
              activeTab === 'script'
                ? 'bg-neutral-700 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Bash Script (Automated)</span>
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
              activeTab === 'commands'
                ? 'bg-neutral-700 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.directCommandsTitle}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
              activeTab === 'guide'
                ? 'bg-neutral-700 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rufus Linux Architecture</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-neutral-950 text-xs">
          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-mono text-[11px]">
                  #!/bin/bash · Self-contained script with safety guards & root check
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors text-xs"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? t.copied : t.copyScript}</span>
                  </button>
                  <button
                    onClick={handleDownloadScript}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors text-xs shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadScript}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded bg-neutral-900 border border-neutral-800 font-mono text-[11px] leading-relaxed text-neutral-200 overflow-x-auto whitespace-pre select-all">
                {scriptContent}
              </div>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-4">
              <p className="text-neutral-400">
                You can copy and run each of these Linux commands directly in your terminal if you prefer manual execution:
              </p>

              <div className="space-y-3">
                {directCommands.map((cmd, idx) => (
                  <div key={idx} className="p-3 rounded bg-neutral-900 border border-neutral-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-300">{cmd.label}</span>
                      <button
                        onClick={() => handleCopyCommand(cmd.command, idx)}
                        className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        {copiedCmdIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCmdIndex === idx ? t.copied : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-[11px] bg-neutral-950 p-2 rounded border border-neutral-850 text-blue-300 select-all break-all">
                      {cmd.command}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3.5 text-neutral-300 leading-relaxed">
              <h3 className="font-bold text-sm text-neutral-100">
                How Rufus for Linux Works Under the Hood
              </h3>
              <p>
                In Windows, Pete Batard&apos;s Rufus communicates directly with the Windows Virtual Disk Service (VDS), volume I/O controls (`IOCTL_VOLUME_GET_VOLUME_DISK_EXTENTS`, etc.), and user-mode file system drivers.
              </p>
              <p>
                On Linux, Rufus translates these low-level mechanisms into hardened Linux kernel and userspace toolchains:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                  <span className="font-bold text-blue-400">Disk Partitioning & Alignment</span>
                  <p className="text-[11px] text-neutral-400">
                    Uses GNU <code className="text-neutral-200">parted</code> to align sectors on 1MiB boundaries, creates protective MBRs or GPT headers, and sets the ESP boot flag.
                  </p>
                </div>

                <div className="p-3 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                  <span className="font-bold text-emerald-400">File System Formatting</span>
                  <p className="text-[11px] text-neutral-400">
                    Utilizes <code className="text-neutral-200">mkfs.vfat</code>, <code className="text-neutral-200">mkfs.ntfs</code>, or <code className="text-neutral-200">mkfs.exfat</code> with custom cluster sizing and volume labels.
                  </p>
                </div>

                <div className="p-3 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                  <span className="font-bold text-amber-400">Windows 11 Bypasses</span>
                  <p className="text-[11px] text-neutral-400">
                    Injects <code className="text-neutral-200">autounattend.xml</code> into the USB root with <code className="text-neutral-200">LabConfig</code> registry keys that bypass TPM 2.0, RAM, CPU, and Secure Boot during setup.
                  </p>
                </div>

                <div className="p-3 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                  <span className="font-bold text-purple-400">Large WIM Splitting</span>
                  <p className="text-[11px] text-neutral-400">
                    If FAT32 is chosen with Windows, Rufus uses <code className="text-neutral-200">wimlib-imagex</code> to split multi-gigabyte <code className="text-neutral-200">install.wim</code> into 3.8GB <code className="text-neutral-200">.swm</code> files.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-2.5 bg-neutral-850 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
