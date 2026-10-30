import React from 'react';
import { Language, TRANSLATIONS } from '../utils/translations';
import { Disc, HardDrive, HelpCircle } from 'lucide-react';

interface ImageModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'iso' | 'dd') => void;
  language: Language;
}

export const ImageModeModal: React.FC<ImageModeModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [selectedMode, setSelectedMode] = React.useState<'iso' | 'dd'>('iso');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800 border-b border-neutral-700">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <h2 className="font-bold text-sm text-neutral-100">{t.imageModeTitle}</h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 bg-neutral-950 text-xs text-neutral-200">
          <p className="text-neutral-300 leading-relaxed">
            {t.imageModeDesc}
          </p>

          <div className="space-y-3">
            {/* ISO Mode */}
            <label 
              onClick={() => setSelectedMode('iso')}
              className={`p-3 rounded border flex items-start gap-3 cursor-pointer transition-all ${
                selectedMode === 'iso' 
                  ? 'bg-blue-950/30 border-blue-500' 
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <input
                type="radio"
                name="writeMode"
                checked={selectedMode === 'iso'}
                onChange={() => setSelectedMode('iso')}
                className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-0 shrink-0"
              />
              <div className="space-y-1">
                <div className="font-semibold text-neutral-100 flex items-center gap-1.5">
                  <Disc className="w-4 h-4 text-blue-400" />
                  <span>{t.isoMode}</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {t.isoModeDesc}
                </p>
              </div>
            </label>

            {/* DD Mode */}
            <label 
              onClick={() => setSelectedMode('dd')}
              className={`p-3 rounded border flex items-start gap-3 cursor-pointer transition-all ${
                selectedMode === 'dd' 
                  ? 'bg-blue-950/30 border-blue-500' 
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <input
                type="radio"
                name="writeMode"
                checked={selectedMode === 'dd'}
                onChange={() => setSelectedMode('dd')}
                className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-0 shrink-0"
              />
              <div className="space-y-1">
                <div className="font-semibold text-neutral-100 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <span>{t.ddMode}</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {t.ddModeDesc}
                </p>
              </div>
            </label>
          </div>
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
            onClick={() => onSelectMode(selectedMode)}
            className="px-5 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow transition-colors"
          >
            {t.ok}
          </button>
        </div>
      </div>
    </div>
  );
};
