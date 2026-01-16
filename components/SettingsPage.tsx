import React, { useState } from 'react';
import { UserProfile, AppSettings, Language, Theme } from '../types';
import { User, Settings, ArrowLeft, Upload, Check, Monitor, Moon, Sun } from 'lucide-react';
import { t } from '../utils/i18n';

interface SettingsPageProps {
  user: UserProfile;
  settings: AppSettings;
  onUpdateUser: (u: Partial<UserProfile>) => void;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  settings,
  onUpdateUser,
  onUpdateSettings,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'general'>('profile');

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
          if (reader.result) {
              onUpdateUser({ avatar: reader.result as string });
          }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentLang = settings.language;

  // Use fixed colors for inputs to ensure visibility regardless of global theme vars
  const inputClass = "w-full bg-zinc-800 text-white border border-zinc-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all";

  return (
    <div className="w-full h-full flex bg-bg-main text-text-main">
      {/* Sidebar */}
      <div className="w-64 bg-bg-secondary border-r border-primary-dim flex flex-col p-4">
        <h2 className="text-2xl font-bold text-primary mb-8 px-2">{t('settings', currentLang)}</h2>
        
        <div className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'profile' 
                ? 'bg-primary text-white shadow-lg shadow-primary-dim' 
                : 'text-text-muted hover:bg-bg-main hover:text-text-main'
            }`}
          >
            <User size={20} />
            <span className="font-medium">{t('profile', currentLang)}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'general' 
                ? 'bg-primary text-white shadow-lg shadow-primary-dim' 
                : 'text-text-muted hover:bg-bg-main hover:text-text-main'
            }`}
          >
            <Settings size={20} />
            <span className="font-medium">{t('general', currentLang)}</span>
          </button>
        </div>

        {/* Back Button (Bottom Left) */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-3 text-text-muted hover:text-primary transition-colors mt-auto"
        >
          <ArrowLeft size={20} />
          <span>{t('back', currentLang)}</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto animate-fade-in">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <h3 className="text-3xl font-bold mb-6">{t('profile', currentLang)}</h3>
              
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-bg-secondary group-hover:border-primary transition-colors"
                  />
                  <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                    <Upload size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-text-main">{user.name} {user.surname}</h4>
                  <p className="text-text-muted text-sm">{t('changeAvatar', currentLang)}</p>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">{t('firstName', currentLang)}</label>
                  <input 
                    type="text" 
                    value={user.name}
                    onChange={(e) => onUpdateUser({ name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">{t('lastName', currentLang)}</label>
                  <input 
                    type="text" 
                    value={user.surname}
                    onChange={(e) => onUpdateUser({ surname: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <h3 className="text-3xl font-bold mb-6">{t('general', currentLang)}</h3>
              
              {/* Language */}
              <div className="space-y-4">
                <label className="block text-lg font-medium text-text-main">{t('language', currentLang)}</label>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                      onClick={() => onUpdateSettings({ language: 'ru' })}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${settings.language === 'ru' ? 'border-primary bg-primary-dim text-primary' : 'border-bg-secondary bg-bg-secondary text-text-muted hover:border-primary-dim'}`}
                   >
                      <span className="flex items-center space-x-3">
                        <span className="text-2xl">🇷🇺</span>
                        <span className="font-medium">Русский (Russia)</span>
                      </span>
                      {settings.language === 'ru' && <Check size={20} />}
                   </button>
                   
                   <button 
                      onClick={() => onUpdateSettings({ language: 'en' })}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${settings.language === 'en' ? 'border-primary bg-primary-dim text-primary' : 'border-bg-secondary bg-bg-secondary text-text-muted hover:border-primary-dim'}`}
                   >
                      <span className="flex items-center space-x-3">
                        <span className="text-2xl">🇺🇸</span>
                        <span className="font-medium">English (USA)</span>
                      </span>
                      {settings.language === 'en' && <Check size={20} />}
                   </button>
                </div>
              </div>

              <div className="h-px bg-primary-dim w-full"></div>

              {/* Theme */}
              <div className="space-y-4">
                 <label className="block text-lg font-medium text-text-main">{t('theme', currentLang)}</label>
                 <div className="grid grid-cols-3 gap-4">
                    {/* Light */}
                    <button
                       onClick={() => onUpdateSettings({ theme: 'light' })}
                       className={`group relative p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-3 ${settings.theme === 'light' ? 'border-pink-500 bg-white shadow-lg' : 'border-gray-700 bg-gray-100 opacity-60 hover:opacity-100'}`}
                    >
                       <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                          <Sun size={24} />
                       </div>
                       <span className="font-medium text-gray-800">{t('themeLight', currentLang)}</span>
                    </button>

                    {/* Neon (Red-Orange) */}
                    <button
                       onClick={() => onUpdateSettings({ theme: 'neon' })}
                       className={`group relative p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-3 ${settings.theme === 'neon' ? 'border-[#ff4500] bg-black shadow-lg shadow-[#ff4500]/20' : 'border-gray-800 bg-black opacity-60 hover:opacity-100'}`}
                    >
                       <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#ff4500] flex items-center justify-center text-[#ff4500]">
                          <Monitor size={24} />
                       </div>
                       <span className="font-medium text-white">{t('themeNeon', currentLang)}</span>
                    </button>

                    {/* Dark */}
                    <button
                       onClick={() => onUpdateSettings({ theme: 'dark' })}
                       className={`group relative p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-3 ${settings.theme === 'dark' ? 'border-gray-500 bg-black shadow-lg' : 'border-gray-800 bg-black opacity-60 hover:opacity-100'}`}
                    >
                       <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center text-gray-400">
                          <Moon size={24} />
                       </div>
                       <span className="font-medium text-gray-300">{t('themeDark', currentLang)}</span>
                    </button>
                 </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};