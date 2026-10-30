import React from 'react';
import { 
  Usb, 
  Hash, 
  Terminal, 
  HelpCircle, 
  Globe, 
  Monitor, 
  FileText,
  Download,
  Minus,
  Square,
  X
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface TitleBarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  uiTheme: 'classic' | 'adwaita';
  onToggleTheme: () => void;
  onOpenLog: () => void;
  onOpenChecksum: () => void;
  onOpenScript: () => void;
  onOpenInstall: () => void;
  onOpenAbout: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  language,
  onLanguageChange,
  uiTheme,
  onToggleTheme,
  onOpenLog,
  onOpenChecksum,
  onOpenScript,
  onOpenInstall,
  onOpenAbout
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className={`flex items-center justify-between px-3 py-2 select-none border-b ${
      uiTheme === 'classic' 
        ? 'bg-neutral-800 border-neutral-700 text-neutral-200' 
        : 'bg-neutral-900 border-neutral-800 text-neutral-100'
    }`}>
      {/* Brand & Logo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-600 text-white shadow-sm">
          <Usb className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-sm tracking-tight text-white">Rufus</span>
          <span className="text-xs text-blue-400 font-mono">v4.5.2180</span>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">Linux Edition</span>
        </div>
      </div>

      {/* Action Buttons & Utilities */}
      <div className="flex items-center gap-1">
        {/* Language selector */}
        <button
          onClick={() => onLanguageChange(language === 'tr' ? 'en' : 'tr')}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-neutral-700/60 text-neutral-300 hover:text-white transition-colors"
          title="Dili Değiştir / Change Language"
        >
          <Globe className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold uppercase">{language}</span>
        </button>

        {/* Checksum Button (#) */}
        <button
          onClick={onOpenChecksum}
          className="p-1.5 rounded hover:bg-neutral-700/60 text-neutral-300 hover:text-white transition-colors"
          title={t.checksumBtn}
          aria-label="Calculate Checksum"
        >
          <Hash className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        {/* Script & Linux CLI */}
        <button
          onClick={onOpenScript}
          className="p-1.5 rounded hover:bg-neutral-700/60 text-neutral-300 hover:text-white transition-colors"
          title={t.scriptBtn}
          aria-label="Linux CLI Script"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
        </button>

        {/* Log Window */}
        <button
          onClick={onOpenLog}
          className="p-1.5 rounded hover:bg-neutral-700/60 text-neutral-300 hover:text-white transition-colors"
          title={t.logBtn}
          aria-label="Log Console"
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
        </button>

        {/* Theme Switch */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded hover:bg-neutral-700/60 text-neutral-300 hover:text-white transition-colors"
          title={`${t.themeToggle}: ${uiTheme === 'classic' ? t.adwaitaTheme : t.classicTheme}`}
          aria-label="Toggle Theme Style"
        >
          <Monitor className="w-3.5 h-3.5 text-neutral-300" />
        </button>

        {/* Download & Install App Guide */}
        <button
          onClick={onOpenInstall}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white border border-blue-500/40 transition-colors"
          title={language === 'tr' ? 'Uygulamayı İndir / Masaüstüne Yükle' : 'Download / Install App to Desktop'}
          aria-label="Download or Install Rufus"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold">{language === 'tr' ? 'İndir / Yükle' : 'Install'}</span>
        </button>

        {/* About Dialog */}
        <button
          onClick={onOpenAbout}
          className="p-1.5 rounded hover:bg-neutral-700/60 text-neutral-300 hover:text-white transition-colors"
          title={t.aboutBtn}
          aria-label="About Rufus"
        >
          <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {/* Window Chrome Decors */}
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-neutral-700">
          <div className="w-3 h-3 rounded-full bg-neutral-600 hover:bg-neutral-500 cursor-default flex items-center justify-center">
            <Minus className="w-2 h-2 text-neutral-300" />
          </div>
          <div className="w-3 h-3 rounded-full bg-neutral-600 hover:bg-neutral-500 cursor-default flex items-center justify-center">
            <Square className="w-1.5 h-1.5 text-neutral-300" />
          </div>
          <div className="w-3 h-3 rounded-full bg-red-600/80 hover:bg-red-500 cursor-default flex items-center justify-center">
            <X className="w-2 h-2 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
