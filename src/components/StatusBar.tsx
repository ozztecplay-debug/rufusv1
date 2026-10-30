import React from 'react';
import { FlashingProgress } from '../types/rufus';
import { Language, TRANSLATIONS } from '../utils/translations';
import { FileText, Hash, Terminal, Play, Square, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatBytes } from '../utils/checksum';

interface StatusBarProps {
  language: Language;
  progress: FlashingProgress;
  canStart: boolean;
  onStart: () => void;
  onCancel: () => void;
  onOpenLog: () => void;
  onOpenChecksum: () => void;
  onOpenScript: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  language,
  progress,
  canStart,
  onStart,
  onCancel,
  onOpenLog,
  onOpenChecksum,
  onOpenScript
}) => {
  const t = TRANSLATIONS[language];
  const isFlashing = progress.status !== 'idle' && progress.status !== 'completed' && progress.status !== 'error';

  return (
    <div className="space-y-3 pt-1">
      {/* 1. Status Text & Speed / ETA Indicators */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          {progress.status === 'completed' ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.statusBarCompleted}
            </span>
          ) : progress.status === 'error' ? (
            <span className="text-red-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {progress.error || 'ERROR'}
            </span>
          ) : isFlashing ? (
            <span className="text-blue-400 font-semibold truncate max-w-[280px]">
              {progress.currentStepText}
            </span>
          ) : (
            <span className="text-neutral-400 font-semibold tracking-wide">
              {t.statusBarReady}
            </span>
          )}
        </div>

        {/* Speed & ETA Readout */}
        {isFlashing && (
          <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2 shrink-0">
            <span>{formatBytes(progress.speedBytesPerSec)}/s</span>
            <span>·</span>
            <span>ETA: {Math.floor(progress.remainingSeconds / 60)}m {progress.remainingSeconds % 60}s</span>
            <span>·</span>
            <span className="text-neutral-200 font-bold">{progress.percentage}%</span>
          </div>
        )}
      </div>

      {/* 2. Classic Rufus Solid Progress Bar */}
      <div className="w-full bg-neutral-900 border border-neutral-700 rounded-sm h-5 p-0.5 overflow-hidden">
        <div
          className={`h-full rounded-sm transition-all duration-300 ${
            progress.status === 'completed'
              ? 'bg-emerald-500'
              : progress.status === 'error'
              ? 'bg-red-500'
              : isFlashing
              ? 'bg-emerald-600 bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-sm'
              : 'bg-neutral-800'
          }`}
          style={{ width: `${isFlashing || progress.status === 'completed' ? progress.percentage : 0}%` }}
        />
      </div>

      {/* 3. Action Buttons Area */}
      <div className="flex items-center justify-between pt-1">
        {/* Left Utility Shortcuts (Log, Hash, Linux CLI) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenLog}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
            title={t.logBtn}
          >
            <FileText className="w-4 h-4 text-sky-400" />
          </button>
          <button
            type="button"
            onClick={onOpenChecksum}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
            title={t.checksumBtn}
          >
            <Hash className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            type="button"
            onClick={onOpenScript}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
            title={t.scriptBtn}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Right Primary Action Buttons (START / CLOSE) */}
        <div className="flex items-center gap-2">
          {isFlashing ? (
            <button
              type="button"
              onClick={onCancel}
              className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-xs px-5 py-2 rounded shadow transition-colors flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t.cancel}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              disabled={!canStart}
              className={`font-semibold text-xs px-6 py-2 rounded shadow transition-all flex items-center gap-1.5 ${
                canStart
                  ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white cursor-pointer hover:shadow-blue-500/20'
                  : 'bg-neutral-700 text-neutral-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.startBtn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.close ? window.close() : null}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold px-4 py-2 rounded border border-neutral-700 transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
