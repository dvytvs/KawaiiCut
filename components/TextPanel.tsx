import React, { useState, useEffect } from 'react';
import { Type, Plus, DownloadCloud, Upload, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { TextData } from '../types';
import { loadGlobalFonts, saveGlobalFont, fileToDataURL } from '../utils/db';
import { detectLocalFontsFallback, OS_FONT_CANDIDATES } from '../utils/fonts';

interface TextPanelProps {
  onDragStart: (e: React.DragEvent, textData: TextData) => void;
}

const PRESETS: { name: string; previewClass: string; data: TextData }[] = [
  // Basics
  {
    name: 'Простой',
    previewClass: 'font-sans text-text-main font-bold',
    data: { content: 'Текст', fontFamily: 'Inter, sans-serif', fontSize: 60, color: '#ffffff', align: 'center' }
  },
  {
    name: 'Заголовок',
    previewClass: 'font-anton text-text-main tracking-wide uppercase',
    data: { content: 'ЗАГОЛОВОК', fontFamily: 'Anton, sans-serif', fontSize: 100, color: '#ffffff', align: 'center' }
  },
  
  // Fancy
  {
    name: 'Элегантный',
    previewClass: 'font-dancing text-pink-300',
    data: { content: 'Elegant', fontFamily: 'Dancing Script, cursive', fontSize: 90, color: '#f9a8d4', align: 'center' }
  },
  {
    name: 'От руки',
    previewClass: 'font-caveat text-yellow-300',
    data: { content: 'Заметка', fontFamily: 'Caveat, cursive', fontSize: 80, color: '#fde047', align: 'center' }
  },
  {
    name: 'Мечтатель',
    previewClass: 'font-shadows text-purple-300 tracking-wider',
    data: { content: 'Dreamer', fontFamily: 'Shadows Into Light, cursive', fontSize: 70, color: '#d8b4fe', align: 'center' }
  },
  {
    name: 'Мода',
    previewClass: 'font-abril text-red-400 italic',
    data: { content: 'Vogue', fontFamily: 'Abril Fatface, cursive', fontSize: 90, color: '#f87171', align: 'center' }
  },

  // Sci-Fi / Modern
  {
    name: 'Кибер',
    previewClass: 'font-orbitron text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]',
    data: { content: 'CYBER', fontFamily: 'Orbitron, sans-serif', fontSize: 80, color: '#22d3ee', align: 'center', shadowColor: '#22d3ee', shadowBlur: 20 }
  },
  {
    name: 'Футуризм',
    previewClass: 'font-righteous text-lime-400 uppercase',
    data: { content: 'FUTURE', fontFamily: 'Righteous, cursive', fontSize: 80, color: '#a3e635', align: 'center' }
  },
  {
    name: 'Неон',
    previewClass: 'font-monoton text-fuchsia-500 tracking-widest',
    data: { content: 'NEON', fontFamily: 'Monoton, cursive', fontSize: 70, color: '#d946ef', align: 'center', shadowColor: '#d946ef', shadowBlur: 10 }
  },
  
  // Fun / Comic
  {
    name: 'Комикс',
    previewClass: 'font-bangers text-yellow-400 tracking-wider text-stroke-black',
    data: { content: 'BOOM!', fontFamily: 'Bangers, cursive', fontSize: 120, color: '#facc15', align: 'center', outlineColor: '#000000', outlineWidth: 4 }
  },
  {
    name: 'Пухлый',
    previewClass: 'font-fredoka text-blue-400',
    data: { content: 'Soft', fontFamily: 'Fredoka One, cursive', fontSize: 80, color: '#60a5fa', align: 'center' }
  },
  {
    name: 'Дудл',
    previewClass: 'font-gloria text-orange-400',
    data: { content: 'Doodle', fontFamily: 'Gloria Hallelujah, cursive', fontSize: 60, color: '#fb923c', align: 'center' }
  },
  
  // Specific Themes
  {
    name: 'Хоррор',
    previewClass: 'font-creepster text-red-600',
    data: { content: 'SCREAM', fontFamily: 'Creepster, cursive', fontSize: 90, color: '#dc2626', align: 'center', shadowColor: '#000', shadowBlur: 10 }
  },
  {
    name: 'Кино',
    previewClass: 'font-cinzel text-stone-300 font-bold',
    data: { content: 'CINEMA', fontFamily: 'Cinzel, serif', fontSize: 70, color: '#d6d3d1', align: 'center' }
  },
  {
    name: 'Ретро',
    previewClass: 'font-courgette text-emerald-400',
    data: { content: 'Vintage', fontFamily: 'Courgette, cursive', fontSize: 80, color: '#34d399', align: 'center' }
  },
  {
    name: 'Советский',
    previewClass: 'font-russo text-red-500 uppercase',
    data: { content: 'ПЛАКАТ', fontFamily: 'Russo One, sans-serif', fontSize: 80, color: '#ef4444', align: 'center' }
  },
  {
    name: 'Пиксель',
    previewClass: 'font-pixel text-green-500 text-xs',
    data: { content: 'GAME OVER', fontFamily: 'Press Start 2P, cursive', fontSize: 40, color: '#22c55e', align: 'center' }
  },
];

export const TextPanel: React.FC<TextPanelProps> = ({ onDragStart }) => {
  const [systemFonts, setSystemFonts] = useState<{name: string, value: string}[]>([]);
  const [customLoadedFonts, setCustomLoadedFonts] = useState<{name: string, value: string}[]>([]);
  
  const [showPresets, setShowPresets] = useState(true);
  const [showSystemFonts, setShowSystemFonts] = useState(false);
  const [showCustomFonts, setShowCustomFonts] = useState(true);

  useEffect(() => {
      const loadInitialCustomFonts = async () => {
          const fonts = await loadGlobalFonts();
          setCustomLoadedFonts(fonts.map(f => ({ name: f.name, value: `"${f.name}"` })));
      };
      loadInitialCustomFonts();
  }, []);

  const handleLoadSystemFonts = async () => {
      let fontsList: string[] = [];
      try {
          if ('queryLocalFonts' in window) {
              const fonts = await (window as any).queryLocalFonts();
              fontsList = Array.from(new Set(fonts.map((f: any) => f.family))) as string[];
          }
      } catch (e) {
          console.warn('queryLocalFonts permission denied or API error', e);
      }
      
      if (fontsList.length === 0) {
          fontsList = detectLocalFontsFallback();
      }
      
      fontsList.sort((a,b) => a.localeCompare(b));
      setSystemFonts(fontsList.map(f => ({ name: f, value: `"${f}"` })));
      setShowSystemFonts(true);
  };

  const handleLoadCustomFontFiles = (isFolder: boolean) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (isFolder) {
          input.webkitdirectory = true;
      } else {
          input.accept = '.ttf,.otf,.woff,.woff2';
          input.multiple = true;
      }
      
      input.onchange = async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (!files) return;

          const newFonts: {name: string, value: string}[] = [];
          for (let i = 0; i < files.length; i++) {
              const file = files[i];
              if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) continue;

              const fontName = file.name.split('.')[0];
              const dataUrl = await fileToDataURL(file);
              const fontFace = new FontFace(fontName, `url(${dataUrl})`);
              try {
                  await fontFace.load();
                  document.fonts.add(fontFace);
                  await saveGlobalFont(fontName, dataUrl);
                  newFonts.push({ name: fontName, value: `"${fontName}"` });
              } catch (err) {
                  console.error('Failed to load font', file.name, err);
              }
          }
          if (newFonts.length > 0) {
              setCustomLoadedFonts(prev => {
                  const merged = [...prev, ...newFonts];
                  // deduplicate
                  const unique = merged.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
                  return unique;
              });
              setShowCustomFonts(true);
          }
      };
      input.click();
  };

  const renderFontItem = (name: string, fontFamily: string, previewText: string = 'Текст', isFallback = false) => {
      const textData: TextData = {
          content: previewText,
          fontFamily,
          fontSize: 60,
          color: '#ffffff',
          align: 'center'
      };

      return (
          <div 
              key={name}
              draggable
              onDragStart={(e) => onDragStart(e, textData)}
              className="group bg-bg-input hover:bg-bg-card border border-transparent hover:border-primary/50 rounded p-3 cursor-grab active:cursor-grabbing transition-all flex flex-col items-center justify-center min-h-[60px] relative hover:scale-105 duration-200"
          >
              <div className="text-[10px] text-text-muted mb-1 w-full text-center truncate">{name}</div>
              <span className="text-xl pointer-events-none" style={{ fontFamily: isFallback ? `"${name}", sans-serif` : fontFamily }}>
                  {previewText}
              </span>
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded">
                  <Plus size={20} className="text-text-main drop-shadow" />
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-bg-panel text-text-main animate-fade-in transition-colors">
      <div className="p-4 border-b border-black/20">
        <h2 className="font-bold text-lg flex items-center gap-2">
            <Type size={20} className="text-primary"/>
            Текст
        </h2>
        <p className="text-xs text-text-muted mt-1">Перетащите стиль на таймлайн</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
         
         {/* PRESETS SECTION */}
         <div>
             <button onClick={() => setShowPresets(!showPresets)} className="flex items-center gap-2 w-full text-left font-bold text-sm text-text-main mb-2 hover:text-primary transition-colors">
                 {showPresets ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                 Шаблоны
             </button>
             {showPresets && (
                 <div className="grid grid-cols-1 gap-3">
                    {PRESETS.map((preset, idx) => (
                        <div 
                            key={idx}
                            draggable
                            onDragStart={(e) => onDragStart(e, preset.data)}
                            className="group bg-bg-input hover:bg-bg-card border border-transparent hover:border-primary/50 rounded p-4 cursor-grab active:cursor-grabbing transition-all flex flex-col items-center justify-center min-h-[80px] relative hover:scale-105 duration-200"
                        >
                            <div className="absolute top-2 left-2 text-[10px] text-text-muted font-mono uppercase opacity-50">{preset.name}</div>
                            <span className={`text-2xl ${preset.previewClass} pointer-events-none`}>
                                Текст
                            </span>
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded">
                                <Plus size={24} className="text-text-main drop-shadow-md" />
                            </div>
                        </div>
                    ))}
                 </div>
             )}
         </div>

         {/* CUSTOM FONTS SECTION */}
         <div>
             <div className="flex items-center justify-between mb-2">
                 <button onClick={() => setShowCustomFonts(!showCustomFonts)} className="flex items-center gap-2 font-bold text-sm text-text-main hover:text-primary transition-colors">
                     {showCustomFonts ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                     Мои Шрифты
                 </button>
                 <div className="flex gap-1">
                     <button title="Загрузить файл шрифта" onClick={() => handleLoadCustomFontFiles(false)} className="p-1.5 bg-bg-input hover:bg-bg-card border border-text-muted/20 rounded text-text-muted hover:text-primary transition-colors">
                         <Upload size={14} />
                     </button>
                     <button title="Загрузить папку шрифтов" onClick={() => handleLoadCustomFontFiles(true)} className="p-1.5 bg-bg-input hover:bg-bg-card border border-text-muted/20 rounded text-text-muted hover:text-primary transition-colors">
                         <FolderOpen size={14} />
                     </button>
                 </div>
             </div>
             {showCustomFonts && (
                 <div className="grid grid-cols-2 gap-2">
                     {customLoadedFonts.length === 0 ? (
                         <div className="col-span-2 text-xs text-text-muted p-4 text-center border border-dashed border-text-muted/20 rounded">
                             Вы можете загрузить свои шрифты (.ttf, .otf, .woff)
                         </div>
                     ) : (
                         customLoadedFonts.map(f => renderFontItem(f.name, f.value, f.name))
                     )}
                 </div>
             )}
         </div>

         {/* SYSTEM FONTS SECTION */}
         <div>
             <div className="flex items-center justify-between mb-2">
                 <button onClick={() => setShowSystemFonts(!showSystemFonts)} className="flex items-center gap-2 font-bold text-sm text-text-main hover:text-primary transition-colors">
                     {showSystemFonts ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                     Системные Шрифты
                 </button>
                 {systemFonts.length === 0 && (
                     <button title="Сканировать системные шрифты" onClick={handleLoadSystemFonts} className="p-1.5 bg-bg-input hover:bg-bg-card border border-text-muted/20 rounded text-text-muted hover:text-primary transition-colors">
                         <DownloadCloud size={14} />
                     </button>
                 )}
             </div>
             {showSystemFonts ? (
                 systemFonts.length === 0 ? (
                     <div className="text-xs text-text-muted p-4 text-center border border-dashed border-text-muted/20 rounded flex flex-col items-center gap-2">
                         <span>Нажмите кнопку для поиска системных шрифтов</span>
                         <button onClick={handleLoadSystemFonts} className="px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary/80">Сканировать</button>
                     </div>
                 ) : (
                     <div className="grid grid-cols-2 gap-2 pb-10">
                         {systemFonts.map(f => renderFontItem(f.name, f.value, f.name, true))}
                     </div>
                 )
             ) : null}
         </div>

      </div>
    </div>
  );
};
