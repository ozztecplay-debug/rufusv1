import React from 'react';
import { WindowsTweaks } from '../types/rufus';
import { Language, TRANSLATIONS } from '../utils/translations';
import { ShieldCheck, User, Globe, Lock, Cpu, X } from 'lucide-react';

interface WindowsTweaksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tweaks: WindowsTweaks;
  onChangeTweaks: (tweaks: WindowsTweaks) => void;
  language: Language;
}

export const WindowsTweaksModal: React.FC<WindowsTweaksModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tweaks,
  onChangeTweaks,
  language
}) => {
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-sm text-neutral-100">{t.winTweaksTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Checkboxes */}
        <div className="p-4 space-y-3 bg-neutral-950 text-xs text-neutral-200">
          <p className="text-neutral-400 text-[11px] pb-1 border-b border-neutral-800">
            Customize Windows installation options before writing:
          </p>

          {/* 1. TPM 2.0 & Secure Boot */}
          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white group">
            <input
              type="checkbox"
              checked={tweaks.bypassTpmAndSecureBoot}
              onChange={(e) => onChangeTweaks({ ...tweaks, bypassTpmAndSecureBoot: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded bg-neutral-800 border-neutral-600 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="font-medium flex items-center gap-1.5 text-neutral-100">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                {t.bypassTpm}
              </span>
              <p className="text-[11px] text-neutral-400">
                Bypasses hardware checks for older CPUs, lack of TPM 2.0, or disabled Secure Boot.
              </p>
            </div>
          </label>

          {/* 2. Online Microsoft Account */}
          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white group">
            <input
              type="checkbox"
              checked={tweaks.bypassOnlineAccount}
              onChange={(e) => onChangeTweaks({ ...tweaks, bypassOnlineAccount: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded bg-neutral-800 border-neutral-600 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="font-medium flex items-center gap-1.5 text-neutral-100">
                <User className="w-3.5 h-3.5 text-blue-400" />
                {t.bypassOnlineAccount}
              </span>
              <p className="text-[11px] text-neutral-400">
                Enables creating an offline local user account without requiring a Microsoft login.
              </p>
            </div>
          </label>

          {/* 3. Create Local Account */}
          <div className="space-y-1.5 pl-6.5">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={tweaks.createLocalAccount}
                onChange={(e) => onChangeTweaks({ ...tweaks, createLocalAccount: e.target.checked })}
                className="w-4 h-4 rounded bg-neutral-800 border-neutral-600 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="font-medium text-neutral-200">{t.createLocalAccount}</span>
            </label>
            {tweaks.createLocalAccount && (
              <input
                type="text"
                value={tweaks.localAccountName}
                onChange={(e) => onChangeTweaks({ ...tweaks, localAccountName: e.target.value })}
                placeholder="User"
                className="w-48 bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs text-neutral-100 font-mono ml-6 focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>

          {/* 4. Set Regional Options */}
          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white group">
            <input
              type="checkbox"
              checked={tweaks.setRegionalOptions}
              onChange={(e) => onChangeTweaks({ ...tweaks, setRegionalOptions: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded bg-neutral-800 border-neutral-600 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="font-medium flex items-center gap-1.5 text-neutral-100">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                {t.setRegionalOptions}
              </span>
            </div>
          </label>

          {/* 5. Disable Data Collection */}
          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white group">
            <input
              type="checkbox"
              checked={tweaks.disableDataCollection}
              onChange={(e) => onChangeTweaks({ ...tweaks, disableDataCollection: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded bg-neutral-800 border-neutral-600 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="font-medium text-neutral-100">
                {t.disableDataCollection}
              </span>
            </div>
          </label>

          {/* 6. Disable BitLocker */}
          <label className="flex items-start gap-2.5 cursor-pointer hover:text-white group">
            <input
              type="checkbox"
              checked={tweaks.disableBitLocker}
              onChange={(e) => onChangeTweaks({ ...tweaks, disableBitLocker: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded bg-neutral-800 border-neutral-600 text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="font-medium flex items-center gap-1.5 text-neutral-100">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                {t.disableBitLocker}
              </span>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-neutral-850 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow transition-colors"
          >
            {t.ok}
          </button>
        </div>
      </div>
    </div>
  );
};
