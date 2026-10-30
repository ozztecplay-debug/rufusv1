import React from 'react';
import { UsbDevice } from '../types/rufus';
import { Language, TRANSLATIONS } from '../utils/translations';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  device: UsbDevice | null;
  language: Language;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  device,
  language
}) => {
  const t = TRANSLATIONS[language];

  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-neutral-900 border border-amber-600/60 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-850 border-b border-neutral-700">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <h2 className="font-bold text-sm text-neutral-100">{t.warningModalTitle}</h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 bg-neutral-950 text-xs text-neutral-200">
          <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-amber-300 font-semibold text-center break-all">
            {device.name}
          </div>

          <p className="text-neutral-300 leading-relaxed">
            {t.warningModalMessage}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-neutral-850 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-1.5 rounded text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg transition-colors"
          >
            {t.ok}
          </button>
        </div>
      </div>
    </div>
  );
};
