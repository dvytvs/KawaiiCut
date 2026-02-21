import React from 'react';
import { Type, Plus } from 'lucide-react';
import { TextData } from '../types';

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
  return (
    <div className="flex flex-col h-full bg-bg-panel text-text-main animate-fade-in transition-colors">
      <div className="p-4 border-b border-black/20">
        <h2 className="font-bold text-lg flex items-center gap-2">
            <Type size={20} className="text-primary"/>
            Текст
        </h2>
        <p className="text-xs text-text-muted mt-1">Перетащите стиль на таймлайн</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         <div className="grid grid-cols-1 gap-4">
            {PRESETS.map((preset, idx) => (
                <div 
                    key={idx}
                    draggable
                    onDragStart={(e) => onDragStart(e, preset.data)}
                    className="group bg-bg-input hover:bg-bg-card border border-transparent hover:border-primary/50 rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all flex flex-col items-center justify-center min-h-[100px] relative hover:scale-105 duration-200"
                >
                    <div className="absolute top-2 left-2 text-[10px] text-text-muted font-mono uppercase opacity-50">{preset.name}</div>
                    <span className={`text-2xl ${preset.previewClass} pointer-events-none`}>
                        Текст
                    </span>
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-lg">
                        <Plus size={24} className="text-text-main drop-shadow-md" />
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};