import React from 'react';
import { Language, TRANSLATIONS } from '../utils/translations';
import { X, Usb, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white">
              <Usb className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-bold text-sm text-neutral-100">{t.aboutTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 bg-neutral-950 text-xs text-neutral-300">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-2">
              <Usb className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-neutral-100">Rufus Linux Edition</h3>
            <p className="text-[11px] font-mono text-neutral-400">Version 4.5.2180 (x86_64 / Web / Linux)</p>
          </div>

          <p className="leading-relaxed text-neutral-300">
            {t.aboutText}
          </p>

          <div className="p-3 rounded bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Licensing & Attribution</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Rufus is created by Pete Batard and contributors. This Linux web utility implements Rufus&apos;s UI concepts, ISO parsing heuristics, Windows 11 bypasses, and partition layouts under the GNU General Public License (GPL) v3.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <a
              href="https://github.com/pbatard/rufus"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center justify-between p-2.5 rounded bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 transition-colors"
            >
              <span className="font-medium">{t.viewOnGithub}</span>
              <ExternalLink className="w-4 h-4 text-neutral-400" />
            </a>
          </div>

          <div className="text-center text-[11px] text-neutral-500 flex items-center justify-center gap-1">
            <span>Built with precision for Linux and Open Source enthusiasts</span>
            <Heart className="w-3 h-3 text-red-500 fill-current" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-2.5 bg-neutral-850 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
