import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../types/rufus';
import { Language, TRANSLATIONS } from '../utils/translations';
import { X, Copy, Download, Trash2, Check, Terminal } from 'lucide-react';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClearLogs: () => void;
  language: Language;
}

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const fullLogText = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLogText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const blob = new Blob([fullLogText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rufus-linux-log-${new Date().toISOString().slice(0, 10)}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col h-[520px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-800 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-sm text-neutral-100">{t.logTitle}</span>
            <span className="text-xs font-mono text-neutral-400">({logs.length} entries)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Console Viewport */}
        <div 
          ref={logContainerRef}
          className="flex-1 p-3 bg-neutral-950 font-mono text-xs overflow-y-auto space-y-1 select-text scrollbar-thin scrollbar-thumb-neutral-700"
        >
          {logs.length === 0 ? (
            <div className="text-neutral-500 italic py-4 text-center">
              No logs recorded yet.
            </div>
          ) : (
            logs.map((entry) => (
              <div key={entry.id} className="leading-relaxed flex items-start gap-2">
                <span className="text-neutral-500 shrink-0 select-none">[{entry.timestamp}]</span>
                <span className={
                  entry.level === 'error'
                    ? 'text-red-400 font-semibold'
                    : entry.level === 'warn'
                    ? 'text-amber-400'
                    : entry.level === 'debug'
                    ? 'text-neutral-400'
                    : 'text-neutral-200'
                }>
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-850 border-t border-neutral-800">
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-neutral-300 hover:text-red-400 hover:bg-neutral-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearLog}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copied : t.copyLog}</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.saveLog}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
