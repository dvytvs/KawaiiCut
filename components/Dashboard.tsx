import React, { useState, useRef, useEffect } from 'react';
import { ProjectMetadata, AspectRatio, UserProfile, Language } from '../types';
import { 
  Plus, Video, Smartphone, Instagram, Monitor, Film, 
  Settings, User as UserIcon, LogOut, Search, Bell, 
  Home, LayoutTemplate, Trash2, RefreshCcw, XCircle, Ban, PlaySquare
} from 'lucide-react';
import { t } from '../utils/i18n';

interface DashboardProps {
  projects: ProjectMetadata[];
  user: UserProfile;
  lang: Language;
  onCreateProject: (name: string, aspectRatio: AspectRatio) => void;
  onOpenProject: (id: string) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreProject: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects, user, lang, 
  onCreateProject, onOpenProject, 
  onMoveToTrash, onRestoreProject, onPermanentDelete, onEmptyTrash,
  onOpenSettings 
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'trash'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('16:9');
  
  // User Menu State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName, selectedRatio);
      setIsModalOpen(false);
      setNewProjectName('');
      setSelectedRatio('16:9');
    }
  };

  const handleSoftDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      onMoveToTrash(id);
  };

  const handleRestore = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      onRestoreProject(id);
  };

  const handleHardDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      if(window.confirm(t('deleteForeverConfirm', lang))) {
          onPermanentDelete(id);
      }
  };

  const visibleProjects = projects.filter(p => activeTab === 'trash' ? p.isDeleted : !p.isDeleted);

  const ratioOptions: { id: AspectRatio; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: '16:9', label: '16:9', sub: 'YouTube', icon: <Monitor size={20} /> },
    { id: '9:16', label: '9:16', sub: 'TikTok', icon: <Smartphone size={20} /> },
    { id: '1:1', label: '1:1', sub: 'Instagram', icon: <Instagram size={20} /> },
  ];

  return (
    // FORCE FLEX ROW HERE
    <div className="w-full h-full flex flex-row bg-bg-main text-text-main overflow-hidden font-sans transition-colors">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-[240px] flex-shrink-0 bg-bg-sidebar flex flex-col border-r border-text-muted/10 transition-colors">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 space-x-3 cursor-pointer group">
            <div className="w-8 h-8 bg-gradient-to-tr from-accent-purple to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                K
            </div>
            <span className="font-bold text-lg tracking-tight text-text-main font-montserrat">KawaiiCut</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
            <button 
                onClick={() => setActiveTab('home')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium shadow-sm transition-all ${activeTab === 'home' ? 'bg-bg-card text-text-main border-l-4 border-accent-purple translate-x-1' : 'text-text-muted hover:bg-bg-card hover:text-text-main'}`}
            >
                <Home size={20} />
                <span>{t('home', lang)}</span>
            </button>
            
            <a 
                href="https://www.canva.com/ru_ru/youtube-preview/shablony/" 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-text-muted hover:bg-bg-card hover:text-text-main transition-all hover:translate-x-1"
            >
                <LayoutTemplate size={20} />
                <span>{t('templates', lang)}</span>
            </a>

            <button 
                onClick={() => setActiveTab('trash')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium shadow-sm transition-all ${activeTab === 'trash' ? 'bg-bg-card text-red-500 border-l-4 border-red-500 translate-x-1' : 'text-text-muted hover:bg-bg-card hover:text-text-main'}`}
            >
                <Trash2 size={20} />
                <span>{t('trash', lang)}</span>
            </button>
        </nav>
        
        {/* Bottom Settings */}
        <div className="p-4 border-t border-text-muted/10">
            <button 
                onClick={onOpenSettings}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-text-muted hover:bg-bg-card hover:text-text-main transition-colors"
            >
                <Settings size={20} />
                <span>{t('settings', lang)}</span>
            </button>
        </div>
      </aside>


      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-main transition-colors">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-text-muted/5 bg-bg-main animate-fade-in transition-colors">
            {/* Search Bar (Centered) */}
            <div className="flex-1 max-w-2xl mx-auto relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted group-focus-within:text-accent-purple transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder={t('searchPlaceholder', lang)} 
                    className="w-full bg-bg-input rounded-md py-2.5 pl-12 pr-4 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-accent-purple/50 border border-transparent shadow-sm placeholder-text-muted/50 transition-all"
                />
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-5 ml-8">
                <button className="text-text-muted hover:text-text-main relative transition-colors hover:scale-110">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-bg-main animate-pulse"></span>
                </button>
                
                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="w-9 h-9 rounded-full border border-text-muted/20 overflow-hidden hover:ring-2 hover:ring-accent-purple/50 transition-all hover:scale-105"
                    >
                        <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute top-12 right-0 w-56 bg-bg-card border border-text-muted/10 rounded-lg shadow-xl py-2 z-50 animate-scale-in origin-top-right">
                            <div className="px-4 py-3 border-b border-text-muted/10 mb-2">
                                <p className="font-bold text-sm truncate text-text-main">{user.name}</p>
                            </div>
                            <button onClick={() => setIsUserMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-bg-input hover:text-text-main flex items-center gap-3 transition-colors">
                                <UserIcon size={16} /> {t('profile', lang)}
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-bg-input hover:text-red-300 flex items-center gap-3 transition-colors">
                                <LogOut size={16} /> {t('logout', lang)}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-12 animate-slide-up">
                
                {/* Hero Section (Only on Home) */}
                {activeTab === 'home' && (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-text-main font-montserrat">{t('welcomeBack', lang)} {user.name}</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="h-36 bg-gradient-to-r from-[#7c3aed] to-[#9333ea] rounded-xl flex flex-col justify-between p-6 text-white shadow-lg hover:shadow-accent-purple/30 hover:-translate-y-1 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
                            
                            <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:rotate-90 transition-transform duration-300">
                                <Plus size={24} />
                            </div>
                            <div className="text-left z-10">
                                <span className="font-bold text-lg block">{t('createVideo', lang)}</span>
                                <span className="text-white/70 text-sm">{t('startFromScratch', lang)}</span>
                            </div>
                        </button>

                        <button 
                            className="h-36 bg-bg-card border border-text-muted/10 rounded-xl flex flex-col justify-between p-6 text-text-muted hover:text-text-main hover:bg-bg-input hover:border-text-muted/30 hover:-translate-y-1 transition-all group relative cursor-not-allowed opacity-60"
                        >
                             <div className="bg-bg-main w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:bg-bg-sidebar transition-colors">
                                <Video size={20} />
                             </div>
                             <div className="text-left">
                                 <span className="font-bold text-lg block">{t('screenRec', lang)}</span>
                                 <span className="text-text-muted/70 text-sm group-hover:text-text-muted transition-colors">{t('cameraScreen', lang)}</span>
                             </div>
                        </button>
                    </div>
                </div>
                )}

                {activeTab === 'trash' && (
                     <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-text-main font-montserrat flex items-center gap-2">
                                <Trash2 className="text-red-500"/> {t('trashTitle', lang)}
                            </h1>
                            <p className="text-text-muted text-sm">{t('trashDesc', lang)}</p>
                         </div>
                         {visibleProjects.length > 0 && (
                             <button 
                                onClick={onEmptyTrash}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 shadow-lg transition-colors text-sm font-bold"
                             >
                                 <Ban size={16}/> {t('emptyTrash', lang)}
                             </button>
                         )}
                     </div>
                )}

                {/* Projects Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-text-main">
                            {activeTab === 'home' ? t('yourVideos', lang) : t('deletedProjects', lang)}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
                         {/* Empty State */}
                         {visibleProjects.length === 0 && (
                             <div className="col-span-full py-16 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-text-muted/10 rounded-xl bg-bg-input/30 animate-fade-in">
                                 <div className="bg-bg-input p-4 rounded-full mb-4 animate-bounce-soft">
                                    <PlaySquare size={32} className="opacity-50" />
                                 </div>
                                 <p className="font-medium">
                                     {activeTab === 'home' ? t('noProjects', lang) : t('trashEmpty', lang)}
                                 </p>
                                 {activeTab === 'home' && (
                                    <button onClick={() => setIsModalOpen(true)} className="mt-4 text-accent-purple font-bold hover:underline">{t('createFirst', lang)}</button>
                                 )}
                             </div>
                         )}

                         {visibleProjects.map(project => (
                            <div 
                                key={project.id}
                                onClick={() => activeTab === 'home' && onOpenProject(project.id)}
                                className={`group cursor-pointer flex flex-col space-y-3 relative transition-transform duration-300 ${activeTab === 'home' ? 'hover:-translate-y-1' : ''}`}
                            >
                                <div className="aspect-video bg-black rounded-lg overflow-hidden relative border border-text-muted/10 shadow-sm group-hover:shadow-lg group-hover:border-accent-purple/50 transition-all">
                                    {project.thumbnail ? (
                                        <img src={project.thumbnail} alt="" className={`w-full h-full object-cover transition-all duration-500 ${activeTab === 'trash' ? 'grayscale opacity-50' : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'}`} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#252528] text-text-muted">
                                            <Film size={32} className="opacity-30 group-hover:opacity-50 group-hover:text-accent-purple transition-all" />
                                        </div>
                                    )}
                                    
                                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded font-mono border border-white/10">
                                        {project.aspectRatio}
                                    </div>
                                    
                                    {/* Actions Overlay */}
                                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity bg-black/40 backdrop-blur-[1px] ${activeTab === 'trash' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        
                                        {activeTab === 'home' ? (
                                            <>
                                                <div className="bg-white p-3 rounded-full shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                                                    <Video size={20} className="text-black ml-0.5" />
                                                </div>
                                                <button 
                                                    onClick={(e) => handleSoftDelete(e, project.id)}
                                                    className="absolute bottom-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all hover:scale-110 z-20"
                                                    title={t('trash', lang)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={(e) => handleRestore(e, project.id)}
                                                    className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                                                    title="Восстановить"
                                                >
                                                    <RefreshCcw size={20} />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleHardDelete(e, project.id)}
                                                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                                                    title="Удалить навсегда"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-text-main truncate group-hover:text-accent-purple transition-colors">{project.name}</h3>
                                    <p className="text-xs text-text-muted mt-1">Изменено: {project.lastModified.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </main>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-card border border-text-muted/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in ring-1 ring-white/10">
            <div className="p-6 border-b border-text-muted/10 flex justify-between items-center bg-bg-card">
              <h3 className="font-bold text-xl text-text-main">{t('createProject', lang)}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-bg-input rounded-full p-2 transition-colors text-text-muted hover:text-text-main"><Plus size={20} className="rotate-45" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6 bg-bg-card">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-muted uppercase tracking-wider text-[11px]">{t('projectName', lang)}</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder={t('projectPlaceholder', lang)}
                  className="w-full bg-bg-input border border-text-muted/20 text-text-main rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent transition-all placeholder-text-muted/30"
                />
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-bold text-text-muted uppercase tracking-wider text-[11px]">{t('aspectRatio', lang)}</label>
                 <div className="grid grid-cols-3 gap-3">
                    {ratioOptions.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelectedRatio(opt.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedRatio === opt.id ? 'border-accent-purple bg-primary-dim text-accent-purple ring-1 ring-accent-purple/50 scale-105' : 'border-text-muted/10 hover:border-text-muted/30 text-text-muted bg-bg-input hover:scale-105'}`}
                        >
                            <div className="mb-2">{opt.icon}</div>
                            <span className="font-bold text-sm">{opt.label}</span>
                        </button>
                    ))}
                 </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-text-muted hover:text-text-main hover:bg-bg-input rounded-full font-medium transition-colors text-sm"
                >
                  {t('cancel', lang)}
                </button>
                <button 
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-8 py-2.5 bg-accent-purple text-white rounded-full font-bold shadow-lg hover:bg-accent-purpleHover transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:scale-105"
                >
                  {t('create', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};