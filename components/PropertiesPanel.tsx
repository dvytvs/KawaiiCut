import React from 'react';
import { Clip } from '../types';
import { Sliders, RefreshCcw, LayoutTemplate, Type, Palette, Zap, Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  selectedClip: Clip | null;
  onUpdate: (updates: Partial<Clip>) => void;
  onDelete?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedClip, onUpdate, onDelete }) => {
  if (!selectedClip) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-muted p-6 text-center bg-bg-panel animate-fade-in transition-colors">
        <LayoutTemplate size={48} className="mb-4 text-text-muted animate-bounce-soft" />
        <p className="text-sm font-medium">Ничего не выбрано</p>
        <p className="text-xs mt-2 text-text-muted">Нажмите на клип на таймлайне,<br/>чтобы настроить его.</p>
      </div>
    );
  }

  const handleTextUpdate = (field: string, value: any) => {
      if (!selectedClip.textData) return;
      onUpdate({
          textData: { ...selectedClip.textData, [field]: value }
      });
  };

  return (
    <div className="h-full flex flex-col bg-bg-panel overflow-y-auto custom-scrollbar text-text-main animate-slide-up transition-colors">
      <div className="h-12 border-b border-black/20 flex items-center px-4 justify-between">
        <span className="font-bold text-sm">Свойства</span>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Speed Control (New) */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                 <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1"><Zap size={10}/> Скорость</h3>
                 <span className="text-xs text-primary font-mono">{selectedClip.speed}x</span>
            </div>
            <input 
                type="range" min="0.1" max="5.0" step="0.1"
                value={selectedClip.speed}
                onChange={(e) => onUpdate({ speed: parseFloat(e.target.value) })}
                className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
                <span>0.1x</span>
                <span>Норма (1x)</span>
                <span>5x</span>
            </div>
        </div>

        <div className="h-px bg-text-muted/10"></div>

        {/* --- TEXT PROPERTIES --- */}
        {selectedClip.textData && (
            <div className="space-y-4 animate-scale-in">
                 <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Type size={12}/> Текст
                 </h3>
                 
                 {/* Text Content */}
                 <div className="space-y-1">
                     <textarea 
                        className="w-full bg-bg-input border border-text-muted/20 rounded p-2 text-sm text-text-main focus:border-primary focus:outline-none resize-y min-h-[60px]"
                        value={selectedClip.textData.content}
                        onChange={(e) => handleTextUpdate('content', e.target.value)}
                        placeholder="Введите текст..."
                     />
                 </div>

                 {/* Font & Color */}
                 <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-[10px] text-text-muted">Шрифт</label>
                        <select 
                            className="w-full bg-bg-input border border-text-muted/20 rounded px-2 py-1 text-xs text-text-main focus:border-primary focus:outline-none"
                            value={selectedClip.textData.fontFamily}
                            onChange={(e) => handleTextUpdate('fontFamily', e.target.value)}
                        >
                            <option value="Inter, sans-serif">Inter (Обычный)</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Anton, sans-serif">Anton (Жирный)</option>
                            <option value="Bangers, cursive">Bangers (Комикс)</option>
                            <option value="Orbitron, sans-serif">Orbitron (Кибер)</option>
                            <option value="Pacifico, cursive">Pacifico (Рукопись)</option>
                            <option value="Montserrat, sans-serif">Montserrat</option>
                            <option value="Lobster, cursive">Lobster</option>
                            <option value="Oswald, sans-serif">Oswald</option>
                            <option value="Playfair Display, serif">Playfair (Элегант)</option>
                            <option value="Permanent Marker, cursive">Marker</option>
                            <option value="Comfortaa, cursive">Comfortaa</option>
                            {/* New Fonts */}
                            <option value="Dancing Script, cursive">Dancing Script</option>
                            <option value="Caveat, cursive">Caveat</option>
                            <option value="Shadows Into Light, cursive">Shadows</option>
                            <option value="Abril Fatface, cursive">Abril Fatface</option>
                            <option value="Righteous, cursive">Righteous</option>
                            <option value="Fredoka One, cursive">Fredoka One</option>
                            <option value="Monoton, cursive">Monoton</option>
                            <option value="Creepster, cursive">Creepster</option>
                            <option value="Gloria Hallelujah, cursive">Gloria</option>
                            <option value="Cinzel, serif">Cinzel</option>
                            <option value="Courgette, cursive">Courgette</option>
                            <option value="Russo One, sans-serif">Russo One</option>
                            <option value="Press Start 2P, cursive">Pixel</option>
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] text-text-muted">Цвет</label>
                        <div className="flex items-center space-x-2 bg-bg-input border border-text-muted/20 rounded px-2 py-1">
                            <input 
                                type="color" 
                                value={selectedClip.textData.color}
                                onChange={(e) => handleTextUpdate('color', e.target.value)}
                                className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                            />
                            <span className="text-xs text-text-muted">{selectedClip.textData.color}</span>
                        </div>
                     </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] text-text-muted">Размер шрифта</label>
                    <input 
                        type="range" min="10" max="200"
                        value={selectedClip.textData.fontSize}
                        onChange={(e) => handleTextUpdate('fontSize', parseInt(e.target.value))}
                        className="w-full accent-primary"
                    />
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2">
                     {['left', 'center', 'right'].map((align) => (
                         <button 
                            key={align}
                            className={`p-1 rounded border text-xs capitalize ${selectedClip.textData?.align === align ? 'bg-primary border-primary text-white' : 'bg-bg-input border-text-muted/20 text-text-muted'}`}
                            onClick={() => handleTextUpdate('align', align)}
                         >
                             {align}
                         </button>
                     ))}
                 </div>
                 
                 <div className="h-px bg-text-muted/10 my-4"></div>
            </div>
        )}
        
        {/* Transform Group */}
        <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Расположение</h3>
            
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] text-text-muted">Масштаб</label>
                    <input 
                        type="range" min="0.1" max="3" step="0.1"
                        value={selectedClip.scale}
                        onChange={(e) => onUpdate({ scale: parseFloat(e.target.value) })}
                        className="w-full accent-primary"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-text-muted">Поворот</label>
                    <div className="flex items-center space-x-2">
                        <input 
                            type="number" 
                            value={selectedClip.rotation}
                            onChange={(e) => onUpdate({ rotation: parseFloat(e.target.value) })}
                            className="w-full bg-bg-input border border-text-muted/20 rounded px-2 py-1 text-xs text-text-main focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] text-text-muted">Позиция X</label>
                    <input 
                        type="number" 
                        value={selectedClip.x}
                        onChange={(e) => onUpdate({ x: parseFloat(e.target.value) })}
                        className="w-full bg-bg-input border border-text-muted/20 rounded px-2 py-1 text-xs text-text-main focus:border-primary focus:outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-text-muted">Позиция Y</label>
                    <input 
                        type="number" 
                        value={selectedClip.y}
                        onChange={(e) => onUpdate({ y: parseFloat(e.target.value) })}
                        className="w-full bg-bg-input border border-text-muted/20 rounded px-2 py-1 text-xs text-text-main focus:border-primary focus:outline-none"
                    />
                </div>
            </div>
        </div>

        <div className="h-px bg-text-muted/10"></div>

        {/* Opacity Group */}
        <div className="space-y-2">
             <div className="flex justify-between items-center">
                 <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Прозрачность</h3>
                 <span className="text-xs text-primary font-mono">{Math.round(selectedClip.opacity * 100)}%</span>
             </div>
             <input 
                type="range" min="0" max="1" step="0.01" 
                value={selectedClip.opacity}
                onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-primary"
             />
        </div>

        <div className="h-px bg-text-muted/10"></div>

        {/* Delete Action */}
        <div className="pt-4">
            <button 
                onClick={onDelete}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all font-bold text-sm group"
            >
                <Trash2 size={16} className="group-hover:animate-bounce" />
                Удалить клип
            </button>
        </div>
      </div>
    </div>
  );
};