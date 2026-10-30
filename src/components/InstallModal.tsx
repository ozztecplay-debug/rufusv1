import React, { useState } from 'react';
import { Language, TRANSLATIONS } from '../utils/translations';
import { 
  X, 
  Download, 
  Monitor, 
  Terminal, 
  FileCode, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles,
  Layers,
  HardDrive
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Generate downloadable .desktop launcher file
  const downloadDesktopFile = () => {
    const desktopFileContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=Rufus Linux Edition
GenericName=USB Formatting Utility
Comment=The Reliable USB Formatting Utility for Linux systems
Exec=xdg-open "${window.location.origin}"
Icon=media-removable
Terminal=false
Categories=System;Utility;Archiving;
Keywords=usb;flash;bootable;iso;formatting;rufus;
`;
    const blob = new Blob([desktopFileContent], { type: 'application/x-desktop;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rufus-linux.desktop';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate standalone all-in-one rufus-linux.sh CLI launcher
  const downloadCliScript = () => {
    const cliScript = `#!/usr/bin/env bash
# ==============================================================================
# Rufus for Linux - Standalone Universal USB Flasher & Formatter
# ==============================================================================
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "[-] HATA: Bu script root yetkisiyle çalıştırılmalıdır."
  echo "    Lütfen çalıştırın: sudo bash $0"
  exit 1
fi

echo "=========================================================="
echo "  RUFUS FOR LINUX - The Reliable USB Formatting Utility"
echo "=========================================================="
echo "Mevcut USB Aygıtları taranıyor..."
lsblk -d -o NAME,SIZE,MODEL,TRAN | grep -E "usb|NAME"

echo ""
read -p "Hedef USB Aygıtını girin (Örn: /dev/sdb): " TARGET_DEV
read -p "Yazılacak ISO dosyasının yolunu girin: " ISO_PATH

if [ ! -b "$TARGET_DEV" ]; then
  echo "[-] HATA: $TARGET_DEV blok aygıtı bulunamadı!"
  exit 1
fi

if [ ! -f "$ISO_PATH" ]; then
  echo "[-] HATA: '$ISO_PATH' dosyası bulunamadı!"
  exit 1
fi

echo ""
echo "[*] DİKKAT: $TARGET_DEV üzerindeki TÜM VERİLER SİLİNECEKTİR!"
read -p "Devam etmek istiyor musunuz? (e/H): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[EeYy]$ ]]; then
  echo "[-] İşlem iptal edildi."
  exit 0
fi

echo "[1/4] Aygıt üzerindeki bölümler ayrılıyor..."
umount \${TARGET_DEV}* 2>/dev/null || true

echo "[2/4] Eski dosya sistemi imzaları temizleniyor..."
wipefs -af "$TARGET_DEV"

echo "[3/4] ISO aygıta yazılıyor (DD Modu)..."
dd if="$ISO_PATH" of="$TARGET_DEV" bs=4M status=progress conv=fsync oflag=direct

echo "[4/4] Disk tamponları eşitleniyor..."
sync
partprobe "$TARGET_DEV" || true

echo "=========================================================="
echo "[+] BAŞARILI: Önyüklenebilir USB başarıyla oluşturuldu!"
echo "=========================================================="
`;
    const blob = new Blob([cliScript], { type: 'application/x-sh;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rufus-linux.sh';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-800 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-bold text-sm text-neutral-100">
                {language === 'tr' ? 'Rufus Linux Sürümünü İndirme & Kurma Kılavuzu' : 'Rufus Linux Edition Download & Installation Guide'}
              </h2>
              <p className="text-xs text-neutral-400">
                {language === 'tr' ? 'Masaüstü uygulaması veya bağımsız Linux betiği olarak edinin' : 'Get it as a native desktop application or standalone Linux tool'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto bg-neutral-950 text-xs text-neutral-300">
          {/* Method 1: PWA Desktop Install */}
          <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-100 font-semibold text-sm">
                <Monitor className="w-4 h-4 text-blue-400" />
                <span>{language === 'tr' ? '1. Yöntem: Masaüstüne Uygulama Olarak Yükle (PWA)' : 'Method 1: Install as Native Desktop App (PWA)'}</span>
              </div>
              <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded font-medium">
                {language === 'tr' ? 'Önerilen' : 'Recommended'}
              </span>
            </div>

            <p className="text-neutral-300 leading-relaxed text-[11.5px]">
              {language === 'tr'
                ? 'Chrome, Brave, Edge veya Firefox üzerinden Rufus\'u bilgisayarınıza doğrudan bir masaüstü uygulaması olarak kurabilirsiniz. Kendi penceresinde açılır, internet olmadan da çevrim dışı çalışır ve Linux uygulama menünüze (Ubuntu/GNOME/KDE) eklenir.'
                : 'Install Rufus directly to your Linux desktop via Chrome, Brave, Edge, or Firefox. Runs in its own standalone window, functions offline, and integrates directly into your Linux application launcher.'}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              {isInstalled ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <Check className="w-4 h-4" />
                  <span>{language === 'tr' ? 'Uygulama zaten masaüstünüzde kurulu!' : 'Application is already installed on your system!'}</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={install}
                  className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded shadow transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'tr' ? 'Masaüstüne Yükle (Tek Tık)' : 'Install to Desktop (1-Click)'}</span>
                </button>
              ) : (
                <div className="text-[11px] text-neutral-400 bg-neutral-900 p-2.5 rounded border border-neutral-800 w-full space-y-1">
                  <div className="font-semibold text-neutral-200">
                    {language === 'tr' ? 'Tarayıcı Menüsünden Kurulum:' : 'Install via Browser Menu:'}
                  </div>
                  <div>
                    {language === 'tr' 
                      ? 'Tarayıcınızın sağ üstündeki ⋮ (Menü) simgesine tıklayın ➜ "Kaydet ve Paylaş" veya "Uygulamayı Yükle" ➜ "Rufus Linux Edition uygulamasını yükle"yi seçin.'
                      : 'Click your browser menu (⋮) ➜ "Save and Share" or "Install App" ➜ select "Install Rufus Linux Edition".'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Method 2: Standalone Shell Script Download */}
          <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-100 font-semibold text-sm">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>{language === 'tr' ? '2. Yöntem: Bağımsız Linux Bash Betiği İndir' : 'Method 2: Standalone Linux Shell Script (.sh)'}</span>
              </div>
            </div>

            <p className="text-neutral-300 leading-relaxed text-[11.5px]">
              {language === 'tr'
                ? 'Doğrudan Linux terminalinizde çalıştırabileceğiniz, bağımsız USB biçimlendirme ve ISO önyükleme betiğini indirin.'
                : 'Download a standalone Bash script ready to run directly in any Linux terminal environment.'}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={downloadCliScript}
                className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded shadow transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>rufus-linux.sh İndir</span>
              </button>
            </div>

            <div className="bg-neutral-950 p-3 rounded border border-neutral-850 font-mono text-[11px] text-neutral-300 space-y-1 select-all">
              <div className="text-neutral-500"># Terminalde çalıştırma:</div>
              <div>chmod +x rufus-linux.sh</div>
              <div>sudo ./rufus-linux.sh</div>
            </div>
          </div>

          {/* Method 3: Desktop Launcher (.desktop) */}
          <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-100 font-semibold text-sm">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>{language === 'tr' ? '3. Yöntem: Linux Masaüstü Kısayolu (.desktop)' : 'Method 3: Linux Desktop Launcher (.desktop)'}</span>
              </div>
            </div>

            <p className="text-neutral-300 leading-relaxed text-[11.5px]">
              {language === 'tr'
                ? 'Ubuntu, Debian, Fedora, Arch veya Mint uygulama menünüze Rufus simgesi eklemek için masaüstü yapılandırma dosyasını indirin.'
                : 'Download the desktop launcher configuration to add Rufus to your application menu in Ubuntu, Fedora, Debian, or Arch.'}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={downloadDesktopFile}
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded shadow transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>rufus-linux.desktop İndir</span>
              </button>
            </div>

            <div className="bg-neutral-950 p-3 rounded border border-neutral-850 font-mono text-[11px] text-neutral-300 space-y-1 select-all">
              <div className="text-neutral-500"># Uygulamalar menüsüne kopyalama:</div>
              <div>mkdir -p ~/.local/share/applications</div>
              <div>mv rufus-linux.desktop ~/.local/share/applications/</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 bg-neutral-850 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            {language === 'tr' ? 'Tamam' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
