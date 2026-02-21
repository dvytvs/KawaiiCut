import React, { useState } from 'react';
import { X, Film, Download, Check } from 'lucide-react';
import { t } from '../utils/i18n';
import { Language } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filename: string, resolution: string, fps: string) => void;
  lang: Language;
  defaultName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, lang, defaultName }) => {
  const [filename, setFilename] = useState(defaultName);
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState('60');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#18181b] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1f1f23]">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-purple/20 rounded-lg text-accent-purple">
                    <Film size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">{t('exportTitle', lang)}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
            
            {/* Filename */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('fileName', lang)}</label>
                <div className="flex items-center bg-[#0f0f10] border border-white/10 rounded-lg px-4 py-3 focus-within:border-accent-purple transition-colors">
                    <input 
                        type="text" 
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        className="bg-transparent w-full text-white focus:outline-none placeholder-gray-600"
                        placeholder="My Awesome Video"
                    />
                    <span className="text-gray-500 font-mono text-sm ml-2">.mp4</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Resolution */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('resolution', lang)}</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['480p', '720p', '1080p', '2k', '4k'].map(res => (
                            <button
                                key={res}
                                onClick={() => setResolution(res)}
                                className={`py-3 rounded-lg font-medium text-sm transition-all border ${resolution === res ? 'bg-accent-purple border-accent-purple text-white shadow-lg shadow-accent-purple/20' : 'bg-[#0f0f10] border-white/10 text-gray-400 hover:border-white/30'}`}
                            >
                                {res}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FPS */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('fps', lang)}</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['30', '60'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFps(f)}
                                className={`py-3 rounded-lg font-medium text-sm transition-all border ${fps === f ? 'bg-accent-purple border-accent-purple text-white shadow-lg shadow-accent-purple/20' : 'bg-[#0f0f10] border-white/10 text-gray-400 hover:border-white/30'}`}
                            >
                                {f} FPS
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quality Badge */}
            <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-4 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-accent-purple font-bold text-sm">MP4 / H.264</span>
                    <span className="text-gray-400 text-xs">Recommended for YouTube & TikTok</span>
                </div>
                <div className="text-right">
                    <span className="text-white font-bold block">{resolution} @ {fps}fps</span>
                    <span className="text-gray-500 text-xs">Est. Size: ~{(parseInt(resolution) * parseInt(fps) / 2000).toFixed(1)} MB</span>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#1f1f23] flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-6 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors font-medium"
            >
                {t('cancel', lang)}
            </button>
            <button 
                onClick={() => onExport(filename, resolution, fps)}
                className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl"
            >
                {t('startExport', lang)} <Download size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};