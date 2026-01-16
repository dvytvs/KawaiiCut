import React, { useContext } from 'react';
import { Sparkles, CloudSnow, Sun, Moon, Maximize, Move, Star, Flower, CloudRain, Tv, Droplets, Film, Zap, Contrast } from 'lucide-react';
import { EffectType, AppSettings } from '../types';
import { t } from '../utils/i18n';

// Use a hook or context to get language if available, for now we assume it's passed or available
// Since the component signature is fixed in the prompt, I will read settings from a global context or assume a prop is missing.
// However, to keep it simple within the prompt constraints, I'll assume we can pass the language or I will just pass a hardcoded 'ru' 
// if I can't change the props signature easily. 
// BUT, I can see App.tsx renders this. I will modify the App.tsx to pass 'lang' if needed, 
// but wait, App.tsx wasn't asked to change for props. 
// I'll assume the component can take a 'lang' prop, or I'll check App.tsx.
// Looking at App.tsx, EffectsPanel doesn't take 'lang'. I should fix App.tsx to pass it or read it.
// To satisfy the "fix english translation" request, I MUST be able to read the language.
// I will create a simple internal helper or just modify the props in App.tsx (I'll add the change for App.tsx too).

interface EffectsPanelProps {
  onDragStart: (e: React.DragEvent, effectType: EffectType) => void;
  lang: 'ru' | 'en'; // Added lang prop
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ onDragStart, lang }) => {
  
  const EFFECTS = [
    { id: EffectType.SNOW, name: t('eff_snow', lang), icon: <CloudSnow size={32} className="text-blue-300"/>, desc: t('eff_snow_desc', lang) },
    { id: EffectType.LEAVES, name: t('eff_leaves', lang), icon: <Flower size={32} className="text-orange-400"/>, desc: t('eff_leaves_desc', lang) },
    { id: EffectType.RAIN, name: t('eff_rain', lang), icon: <CloudRain size={32} className="text-blue-500"/>, desc: t('eff_rain_desc', lang) },
    { id: EffectType.VHS, name: t('eff_vhs', lang), icon: <Tv size={32} className="text-cyan-400"/>, desc: t('eff_vhs_desc', lang) },
    { id: EffectType.BLUR, name: t('eff_blur', lang), icon: <Droplets size={32} className="text-gray-400"/>, desc: t('eff_blur_desc', lang) },
    { id: EffectType.SEPIA, name: t('eff_sepia', lang), icon: <Film size={32} className="text-amber-600"/>, desc: t('eff_sepia_desc', lang) },
    { id: EffectType.FLASH, name: t('eff_flash', lang), icon: <Zap size={32} className="text-yellow-200"/>, desc: t('eff_flash_desc', lang) },
    { id: EffectType.INVERT, name: t('eff_invert', lang), icon: <Contrast size={32} className="text-white"/>, desc: t('eff_invert_desc', lang) },
    { id: EffectType.FRAME, name: t('eff_frame', lang), icon: <Maximize size={32} className="text-pink-400"/>, desc: t('eff_frame_desc', lang) },
    { id: EffectType.SUNRISE, name: t('eff_sunrise', lang), icon: <Sun size={32} className="text-yellow-400"/>, desc: t('eff_sunrise_desc', lang) },
    { id: EffectType.FADE_OUT, name: t('eff_fadeout', lang), icon: <Moon size={32} className="text-purple-400"/>, desc: t('eff_fadeout_desc', lang) },
    { id: EffectType.SHAKE, name: t('eff_shake', lang), icon: <Move size={32} className="text-red-400 animate-pulse"/>, desc: t('eff_shake_desc', lang) },
    { id: EffectType.STARS, name: t('eff_stars', lang), icon: <Star size={32} className="text-yellow-200"/>, desc: t('eff_stars_desc', lang) },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-panel text-text-main animate-fade-in transition-colors">
      <div className="p-4 border-b border-black/20">
        <h2 className="font-bold text-lg flex items-center gap-2">
            <Sparkles size={20} className="text-primary"/>
            {t('effectsTitle', lang)}
        </h2>
        <p className="text-xs text-text-muted mt-1">{t('dragEffect', lang)}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         <div className="grid grid-cols-2 gap-3">
            {EFFECTS.map((effect) => (
                <div 
                    key={effect.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, effect.id)}
                    className="group bg-bg-input hover:bg-bg-card border border-transparent hover:border-primary/50 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all flex flex-col items-center justify-center text-center h-32 hover:scale-105 duration-200"
                >
                    <div className="mb-2 transform group-hover:scale-110 transition-transform duration-300">
                        {effect.icon}
                    </div>
                    <span className="font-bold text-sm">{effect.name}</span>
                    <span className="text-[10px] text-text-muted mt-1">{effect.desc}</span>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};