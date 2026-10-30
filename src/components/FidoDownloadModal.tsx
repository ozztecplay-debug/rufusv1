import React, { useState } from 'react';
import { POPULAR_ISOS } from '../data/isoCatalog';
import { IsoCatalogItem, IsoMetadata } from '../types/rufus';
import { Language, TRANSLATIONS } from '../utils/translations';
import { X, Search, Download, Check, ExternalLink, HardDrive } from 'lucide-react';

interface FidoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIso: (isoItem: IsoCatalogItem) => void;
  language: Language;
}

export const FidoDownloadModal: React.FC<FidoDownloadModalProps> = ({
  isOpen,
  onClose,
  onSelectIso,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Windows', 'Ubuntu', 'Debian', 'Fedora', 'Arch', 'Server & Tools'];

  const filteredIsos = POPULAR_ISOS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.version.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.family === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700">
          <div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <h2 className="font-bold text-sm text-neutral-100">{t.fidoTitle}</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{t.fidoDesc}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 bg-neutral-850 border-b border-neutral-800 space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-neutral-900 border border-neutral-700 rounded pl-9 pr-3 py-1.5 text-xs text-neutral-100 focus:border-blue-500 focus:outline-none placeholder:text-neutral-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ISO Cards List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-neutral-950">
          {filteredIsos.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No matching ISO distributions found.
            </div>
          ) : (
            filteredIsos.map((iso) => (
              <div
                key={iso.id}
                className="p-3 rounded border border-neutral-800 bg-neutral-900/90 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-neutral-100">{iso.name}</span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">
                      {iso.architecture}
                    </span>
                    <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-900/40 px-1.5 py-0.5 rounded font-mono">
                      {iso.sizeFormatted}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-1">{iso.description}</p>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                    <span>{iso.version}</span>
                    <span>·</span>
                    <span>{iso.releaseDate}</span>
                    <span>·</span>
                    <span className="text-neutral-400">
                      {iso.recommendedScheme} / {iso.recommendedTarget} / {iso.recommendedFs}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <a
                    href={iso.officialDownloadUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                    title={t.officialDownload}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      onSelectIso(iso);
                      onClose();
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{t.loadIntoRufus}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-neutral-850 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
          <span>Official mirrors & verified SHA-256 releases</span>
          <button
            onClick={onClose}
            className="text-xs text-neutral-300 hover:text-white"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
