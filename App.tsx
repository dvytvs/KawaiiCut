import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Asset, AssetType, Clip, ProjectState, Track, AspectRatio, ProjectMetadata, UserProfile, AppSettings, TextData, EffectType } from './types';
import { MediaLibrary } from './components/MediaLibrary';
import { TextPanel } from './components/TextPanel';
import { EffectsPanel } from './components/EffectsPanel';
import { Timeline } from './components/Timeline';
import { Player, PlayerRef } from './components/Player';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './components/SettingsPage';
import { ExportModal } from './components/ExportModal'; 
import { ChevronLeft, LayoutGrid, Music, Type, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { t } from './utils/i18n';
import { 
    loadProjectsMeta, loadProjectFromDB, saveProjectToDB, 
    deleteProjectFromDB, softDeleteProjectInDB, restoreProjectInDB, 
    emptyTrashInDB, fileToDataURL, 
    loadUserProfile, saveUserProfile, 
    loadAppSettings, saveAppSettings 
} from './utils/db';

const INITIAL_TRACKS: Track[] = [
  { id: 'track-1', name: 'Overlay', type: 'video', isMuted: false, isLocked: false },
  { id: 'track-2', name: 'Video 1', type: 'video', isMuted: false, isLocked: false },
  { id: 'track-3', name: 'Audio 1', type: 'audio', isMuted: false, isLocked: false },
];

export default function App() {
  const [view, setView] = useState<'dashboard' | 'editor' | 'settings'>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Layout
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [timelineHeight, setTimelineHeight] = useState(300);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'media' | 'audio' | 'text' | 'effects'>('media');
  const [isResizing, setIsResizing] = useState<'left' | 'right' | 'timeline' | null>(null);

  // Data
  const [user, setUser] = useState<UserProfile>({ name: 'User', surname: 'Editor', avatar: 'https://picsum.photos/id/64/200/200' });
  const [settings, setSettings] = useState<AppSettings>({ language: 'ru', theme: 'dark' });
  const [projectsList, setProjectsList] = useState<ProjectMetadata[]>([]);
  const [project, setProject] = useState<ProjectState | null>(null);
  
  // Playback & Export
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderSuccess, setRenderSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const playerRef = useRef<PlayerRef>(null);

  // --- INIT ---
  useEffect(() => {
    const initApp = async () => {
        const [savedUser, savedSettings, metas] = await Promise.all([
            loadUserProfile(), loadAppSettings(), loadProjectsMeta()
        ]);
        if (savedUser) setUser(savedUser);
        if (savedSettings) setSettings(savedSettings);
        setProjectsList(metas.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()));
        setIsLoaded(true);
    };
    initApp();
  }, []);

  useEffect(() => { if (isLoaded) saveUserProfile(user); }, [user, isLoaded]);
  useEffect(() => { if (isLoaded) saveAppSettings(settings); }, [settings, isLoaded]);

  // --- THEME ---
  useEffect(() => {
    const root = document.documentElement;
    const themeMap = {
        light: { bg: '#f3f4f6', txt: '#1f2937', acc: '#6366f1' },
        neon: { bg: '#000000', txt: '#ffffff', acc: '#ff3333' },
        dark: { bg: '#141414', txt: '#ffffff', acc: '#6366f1' }
    };
    const t = themeMap[settings.theme] || themeMap.dark;
    root.style.setProperty('--bg-main', t.bg);
    root.style.setProperty('--text-main', t.txt);
    root.style.setProperty('--accent', t.acc);
  }, [settings.theme]);

  // --- AUTO SAVE ---
  useEffect(() => {
    if (project && !isRendering) {
      const timer = setTimeout(() => {
        saveProjectToDB({...project, meta: {...project.meta, lastModified: new Date()}});
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [project, isRendering]);

  // --- HELPER: RECALCULATE DURATION ---
  const recalculateProject = (p: ProjectState): ProjectState => {
      let maxEndTime = 0;
      if (p.clips.length > 0) {
          maxEndTime = p.clips.reduce((max, clip) => Math.max(max, clip.startTime + clip.duration), 0);
      }
      
      const newDuration = Math.max(1, maxEndTime);
      const newCurrentTime = p.currentTime > newDuration ? 0 : p.currentTime;

      return { ...p, duration: newDuration, currentTime: newCurrentTime };
  };

  // --- KEYBOARD SHORTCUTS (DELETE) ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (view === 'editor' && project && !isRendering && project.selectedClipId) {
              if (e.key === 'Delete' || e.key === 'Backspace') {
                  if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
                  
                  setProject(p => {
                      if (!p) return null;
                      const newClips = p.clips.filter(c => c.id !== p.selectedClipId);
                      return recalculateProject({ 
                          ...p, 
                          clips: newClips, 
                          selectedClipId: null 
                      });
                  });
              }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, project?.selectedClipId, isRendering]);


  // --- PLAYBACK LOOP ---
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setProject(prev => {
        if (!prev || !prev.isPlaying) return prev;
        
        const safeDt = Math.min(dt, 0.1); 
        const nextTime = prev.currentTime + safeDt;

        if (nextTime >= prev.duration) {
            return { ...prev, isPlaying: false, currentTime: prev.duration }; 
        }
        return { ...prev, currentTime: nextTime };
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    if (project?.isPlaying) {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [project?.isPlaying]);

  // --- EXPORT MONITOR ---
  useEffect(() => {
      if (isRendering && project && project.currentTime >= project.duration) {
          stopExport();
      }
      if (isRendering && project) {
          setRenderProgress(Math.min(100, Math.round((project.currentTime / project.duration) * 100)));
      }
  }, [project?.currentTime, isRendering]);

  const handleMouseMoveResize = useCallback((e: MouseEvent) => {
    if (isResizing === 'left') setLeftPanelWidth(Math.max(200, Math.min(600, e.clientX - 64))); 
    else if (isResizing === 'right') setRightPanelWidth(Math.max(200, Math.min(500, window.innerWidth - e.clientX)));
    else if (isResizing === 'timeline') setTimelineHeight(Math.max(150, Math.min(800, window.innerHeight - e.clientY)));
  }, [isResizing]);
  const handleMouseUpResize = useCallback(() => { setIsResizing(null); document.body.style.cursor = ''; }, []);
  useEffect(() => {
    if (isResizing) { window.addEventListener('mousemove', handleMouseMoveResize); window.addEventListener('mouseup', handleMouseUpResize); }
    return () => { window.removeEventListener('mousemove', handleMouseMoveResize); window.removeEventListener('mouseup', handleMouseUpResize); };
  }, [isResizing, handleMouseMoveResize, handleMouseUpResize]);


  // --- EXPORT FUNCTIONS ---
  const startExport = async (filename: string) => {
      if (!project || !playerRef.current) return;
      setIsExportModalOpen(false);

      const combinedStream = playerRef.current.getCombinedStream();
      if (!combinedStream) {
          alert("Could not initialize recording stream. Check camera/audio permissions.");
          return;
      }

      setIsRendering(true);
      setRenderProgress(0);
      recordedChunksRef.current = [];

      let options: MediaRecorderOptions = { mimeType: 'video/webm' };
      const types = [
          'video/mp4;codecs=avc1', 
          'video/mp4', 
          'video/webm;codecs=h264', 
          'video/webm;codecs=vp9'
      ];
      
      for (const type of types) {
          if (MediaRecorder.isTypeSupported(type)) {
              options = { mimeType: type };
              break;
          }
      }

      try {
          const mediaRecorder = new MediaRecorder(combinedStream, { ...options, videoBitsPerSecond: 10000000 }); 
          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  recordedChunksRef.current.push(event.data);
              }
          };
          mediaRecorder.start();
          mediaRecorderRef.current = mediaRecorder;

          setProject(p => p ? { ...p, currentTime: 0, isPlaying: true, selectedClipId: null } : null);

      } catch (e) {
          console.error(e);
          alert("Recording failed. Please ensure no other apps are blocking audio.");
          setIsRendering(false);
      }
  };

  const stopExport = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
          setProject(p => p ? { ...p, isPlaying: false } : null);
          
          setTimeout(() => {
              if (recordedChunksRef.current.length === 0) {
                  alert("Recording failed: No data was captured.");
                  setIsRendering(false);
                  return;
              }

              const blob = new Blob(recordedChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'video/mp4' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = `video_export.mp4`; 
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              
              setIsRendering(false);
              setRenderSuccess(true);
              setTimeout(() => setRenderSuccess(false), 3000);
          }, 500); 
      }
  };


  const handleCreateProject = (name: string, aspectRatio: AspectRatio) => {
    const newMeta: ProjectMetadata = { id: Math.random().toString(36).substr(2, 9), name, aspectRatio, lastModified: new Date(), isDeleted: false };
    const newProject: ProjectState = { meta: newMeta, assets: [], tracks: INITIAL_TRACKS, clips: [], currentTime: 0, duration: 10, isPlaying: false, selectedClipId: null, zoom: 30 };
    setProjectsList([newMeta, ...projectsList]);
    setProject(newProject);
    saveProjectToDB(newProject);
    setView('editor');
  };
  const handleOpenProject = async (id: string) => {
    const p = await loadProjectFromDB(id);
    if (p) { setProject(p); setView('editor'); } else alert(t('projectNotFound', settings.language));
  };
  
  const handleAddClip = (assetId: string, trackId: string, time: number) => {
      if (!project) return;
      const asset = project.assets.find(a => a.id === assetId);
      if (!asset) return;
      const newClip: Clip = {
          id: Math.random().toString(36).substr(2, 9), assetId: asset.id, trackId: trackId, startTime: time, duration: asset.duration,
          offset: 0, x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, mirror: false, speed: 1.0, effectType: asset.effectType
      };
      setProject(p => p ? recalculateProject({ ...p, clips: [...p.clips, newClip], selectedClipId: newClip.id }) : null);
  };
  const handleAddTextClip = (textData: TextData, trackId: string, time: number) => {
      if (!project) return;
      const textAssetId = `text-asset-${Math.random().toString(36).substr(2, 9)}`;
      const newAsset: Asset = { id: textAssetId, name: 'Текст', type: AssetType.TEXT, src: '', duration: 5 };
      const newClip: Clip = {
          id: Math.random().toString(36).substr(2, 9), assetId: textAssetId, trackId: trackId, startTime: time, duration: 5,
          offset: 0, x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, mirror: false, speed: 1.0, textData
      };
      setProject(p => p ? recalculateProject({ ...p, assets: [...p.assets, newAsset], clips: [...p.clips, newClip], selectedClipId: newClip.id }) : null);
  };
  const handleAddEffectClip = (effectType: EffectType, trackId: string, time: number) => {
      if (!project) return;
      const effectAssetId = `effect-asset-${Math.random().toString(36).substr(2, 9)}`;
      const newAsset: Asset = { id: effectAssetId, name: effectType, type: AssetType.EFFECT, src: '', duration: 5, effectType };
      const newClip: Clip = {
          id: Math.random().toString(36).substr(2, 9), assetId: effectAssetId, trackId: trackId, startTime: time, duration: 5,
          offset: 0, x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, mirror: false, speed: 1.0, effectType
      };
      setProject(p => p ? recalculateProject({ ...p, assets: [...p.assets, newAsset], clips: [...p.clips, newClip], selectedClipId: newClip.id }) : null);
  };
  const handleDropGlobal = (assetId: string | null, textData: string | null, effectType: string | null, trackId: string, time: number) => {
     if (assetId) handleAddClip(assetId, trackId, time);
     else if (textData) { try { handleAddTextClip(JSON.parse(textData), trackId, time); } catch (e) {} } 
     else if (effectType) handleAddEffectClip(effectType as EffectType, trackId, time);
  };
  
  const handleUpdateClip = (id: string, updates: Partial<Clip>) => {
      setProject(p => {
          if (!p) return null;
          const updatedClips = p.clips.map(c => c.id === id ? { ...c, ...updates } : c);
          return recalculateProject({ ...p, clips: updatedClips });
      });
  };

  const handleAddAsset = async (file: File) => {
    if (!project) return;
    const url = await fileToDataURL(file);
    const type = file.type.startsWith('image') ? AssetType.IMAGE : file.type.startsWith('video') ? AssetType.VIDEO : AssetType.AUDIO;
    const newAsset: Asset = { id: Math.random().toString(36).substr(2, 9), name: file.name, type, src: url, duration: type === AssetType.IMAGE ? 5 : 10, thumbnail: type === AssetType.IMAGE ? url : undefined };
    setProject(p => p ? ({ ...p, assets: [...p.assets, newAsset] }) : null);
    if (type === AssetType.VIDEO || type === AssetType.AUDIO) {
        const media = document.createElement(type === AssetType.VIDEO ? 'video' : 'audio');
        media.onloadedmetadata = () => {
            if (media.duration && Number.isFinite(media.duration)) {
                 setProject(p => {
                     if(!p) return null;
                     const updatedAssets = p.assets.map(a => a.id === newAsset.id ? { ...a, duration: media.duration } : a);
                     const updatedClips = p.clips.map(c => c.assetId === newAsset.id && (c.duration === 10) ? { ...c, duration: media.duration } : c);
                     return recalculateProject({ ...p, assets: updatedAssets, clips: updatedClips });
                 });
            }
        };
        media.src = url;
    }
  };

  const handleDeleteAsset = (id: string) => {
      setProject(p => {
          if (!p) return null;
          const newAssets = p.assets.filter(a => a.id !== id);
          const newClips = p.clips.filter(c => c.assetId !== id);
          return recalculateProject({ ...p, assets: newAssets, clips: newClips, selectedClipId: p.selectedClipId === id ? null : p.selectedClipId });
      });
  };

  const handleDeleteClip = (id: string) => {
      setProject(p => {
          if (!p) return null;
          const newClips = p.clips.filter(c => c.id !== id);
          return recalculateProject({ ...p, clips: newClips, selectedClipId: null });
      });
  };

  // Keyboard Shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Delete' || e.key === 'Backspace') {
              // Only delete if not typing in an input/textarea
              if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
              if (project?.selectedClipId) {
                  handleDeleteClip(project.selectedClipId);
              }
          }
          if (e.code === 'Space') {
              if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
              e.preventDefault();
              setProject(p => p ? { ...p, isPlaying: !p.isPlaying } : null);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project?.selectedClipId]);

  if (view === 'settings') return <SettingsPage user={user} settings={settings} onUpdateUser={u => setUser({...user, ...u})} onUpdateSettings={s => setSettings({...settings, ...s})} onBack={() => setView('dashboard')} />;
  if (view === 'dashboard') return <Dashboard projects={projectsList} user={user} lang={settings.language} onCreateProject={handleCreateProject} onOpenProject={handleOpenProject} onMoveToTrash={(id) => {setProjectsList(p => p.map(pr => pr.id === id ? {...pr, isDeleted: true} : pr)); softDeleteProjectInDB(id);}} onRestoreProject={(id) => {setProjectsList(p => p.map(pr => pr.id === id ? {...pr, isDeleted: false} : pr)); restoreProjectInDB(id);}} onPermanentDelete={(id) => {setProjectsList(p => p.filter(pr => pr.id !== id)); deleteProjectFromDB(id);}} onEmptyTrash={() => {if(window.confirm(t('emptyTrashConfirm', settings.language))) {setProjectsList(p => p.filter(pr => !pr.isDeleted)); emptyTrashInDB();}}} onOpenSettings={() => setView('settings')} />;

  const selectedClip = project?.clips.find(c => c.id === project.selectedClipId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-sans bg-bg-main text-text-main animate-fade-in relative">
        {/* Render Overlay */}
        {isRendering && (
            <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-wait">
                 <Loader2 size={64} className="text-accent-purple animate-spin mb-8" />
                 <h2 className="text-2xl font-bold text-white mb-2">{t('rendering', settings.language)}</h2>
                 <p className="text-gray-400 mb-8">{t('renderDesc', settings.language)}</p>
                 <div className="w-96 h-2 bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-accent-purple transition-all duration-75 ease-linear" style={{ width: `${renderProgress}%` }}></div>
                 </div>
                 <span className="mt-4 font-mono text-accent-purple">{renderProgress}%</span>
            </div>
        )}
        
        {renderSuccess && (
            <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center animate-fade-in">
                 <div className="bg-green-500 rounded-full p-4 mb-6 animate-bounce-soft"><CheckCircle2 size={64} className="text-white" /></div>
                 <h2 className="text-3xl font-bold text-white mb-2">{t('success', settings.language)}</h2>
                 <p className="text-gray-400">{t('successDesc', settings.language)}</p>
            </div>
        )}

        <ExportModal 
            isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} 
            onExport={(name) => startExport(name)}
            lang={settings.language} defaultName={project?.meta.name || 'Video'}
        />

        {/* --- MAIN UI --- */}
        <header className={`h-14 bg-bg-header border-b border-black/20 flex items-center justify-between px-4 shrink-0 z-50 transition-colors ${isRendering ? 'hidden' : ''}`}>
             <div className="flex items-center gap-4">
                 <button onClick={() => setView('dashboard')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={20} /></button>
                 <div className="flex flex-col"><span className="font-bold text-sm">{project?.meta.name}</span><span className="text-[10px] text-text-muted">{project?.meta.aspectRatio} • {Math.floor(project?.duration || 0)}s</span></div>
             </div>
             <button onClick={() => setIsExportModalOpen(true)} className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95">{t('export', settings.language)}</button>
        </header>

        {/* FORCED flex-row HERE */}
        <div className="flex-1 flex flex-row overflow-hidden">
            {/* Sidebar & Panels */}
            {!isRendering && (
            <>
                <div className="w-16 bg-bg-sidebar flex flex-col items-center py-4 gap-4 border-r border-black/20 shrink-0 z-40 transition-colors">
                    <SidebarIcon icon={<LayoutGrid size={24}/>} label={t('media', settings.language)} active={activeSidebarTab === 'media'} onClick={() => setActiveSidebarTab('media')} />
                    <SidebarIcon icon={<Music size={24}/>} label={t('audio', settings.language)} active={activeSidebarTab === 'audio'} onClick={() => setActiveSidebarTab('audio')} />
                    <SidebarIcon icon={<Type size={24}/>} label={t('text', settings.language)} active={activeSidebarTab === 'text'} onClick={() => setActiveSidebarTab('text')} />
                    <SidebarIcon icon={<Sparkles size={24}/>} label={t('effectsTitle', settings.language)} active={activeSidebarTab === 'effects'} onClick={() => setActiveSidebarTab('effects')} />
                </div>
                <div style={{ width: leftPanelWidth }} className="bg-bg-panel border-r border-black/20 flex flex-col shrink-0 relative z-30 group transition-width duration-0 transition-colors">
                    {activeSidebarTab === 'media' && project && ( 
                        <MediaLibrary 
                            assets={project.assets} 
                            onAddAsset={handleAddAsset} 
                            onDragStart={(e, asset) => { e.dataTransfer.setData('assetId', asset.id); e.dataTransfer.effectAllowed = 'copy'; }} 
                            onClickAsset={(asset) => handleAddClip(asset.id, 'track-1', project.currentTime)} 
                            onDeleteAsset={handleDeleteAsset}
                        /> 
                    )}
                    {activeSidebarTab === 'audio' && <div className="p-4 text-gray-500 text-center">Audio Library (Coming Soon)</div>}
                    {activeSidebarTab === 'text' && <TextPanel onDragStart={(e, textData) => { e.dataTransfer.setData('textData', JSON.stringify(textData)); e.dataTransfer.effectAllowed = 'copy'; }} />}
                    {activeSidebarTab === 'effects' && <EffectsPanel lang={settings.language} onDragStart={(e, effectType) => { e.dataTransfer.setData('effectType', effectType); e.dataTransfer.effectAllowed = 'copy'; }} />}
                    <div className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-primary z-50 transition-colors opacity-0 group-hover:opacity-100" onMouseDown={() => setIsResizing('left')} />
                </div>
            </>
            )}

            {/* Main Center Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-bg-main relative transition-colors">
                 {/* Player Container */}
                 <div className={`flex-1 bg-black/50 p-4 flex items-center justify-center relative overflow-hidden ${isRendering ? 'pointer-events-none' : ''}`}>
                    <div className="w-full h-full"> 
                        {project && (
                            <Player 
                                ref={playerRef}
                                isPlaying={project.isPlaying} currentTime={project.currentTime} duration={project.duration}
                                clips={project.clips} tracks={project.tracks} assets={project.assets} aspectRatio={project.meta.aspectRatio}
                                selectedClipId={project.selectedClipId}
                                onTogglePlay={() => setProject(p => {
                                    if (!p) return null;
                                    const isAtEnd = p.currentTime >= p.duration;
                                    return { 
                                        ...p, 
                                        isPlaying: isAtEnd ? true : !p.isPlaying,
                                        currentTime: isAtEnd ? 0 : p.currentTime 
                                    };
                                })}
                                onSeek={(t) => setProject(p => p ? ({ ...p, currentTime: t }) : null)}
                                onUpdateClip={handleUpdateClip}
                                onSelectClip={(id) => setProject(p => p ? ({ ...p, selectedClipId: id }) : null)}
                                onDropAsset={(assetId) => handleAddClip(assetId, 'track-1', project.currentTime)}
                                onDropText={(textData) => handleAddTextClip(textData, 'track-1', project.currentTime)}
                                isExporting={isRendering}
                            />
                        )}
                    </div>
                 </div>

                 {/* Timeline */}
                 {!isRendering && (
                 <div style={{ height: timelineHeight }} className="bg-bg-timeline border-t border-black/50 flex flex-col shrink-0 relative group transition-height duration-0 transition-colors">
                    <div className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary z-50 transition-colors opacity-0 group-hover:opacity-100" onMouseDown={() => setIsResizing('timeline')} />
                    {project && (
                        <Timeline 
                            tracks={project.tracks} clips={project.clips} assets={project.assets}
                            currentTime={project.currentTime} duration={project.duration} zoom={project.zoom}
                            selectedClipId={project.selectedClipId}
                            onSeek={(t) => setProject(p => p ? ({ ...p, currentTime: t }) : null)}
                            onSelectClip={(id) => setProject(p => p ? ({ ...p, selectedClipId: id }) : null)}
                            onUpdateClip={handleUpdateClip}
                            onDropAsset={(assetId, trackId, time) => handleDropGlobal(assetId, null, null, trackId, time)}
                            onDropText={(textDataStr, trackId, time) => handleDropGlobal(null, textDataStr, null, trackId, time)}
                            onDropEffect={(effectType, trackId, time) => handleDropGlobal(null, null, effectType, trackId, time)}
                            onAddTrack={() => setProject(p => p ? {...p, tracks: [...p.tracks, { id: `track-${Math.random()}`, name: `Track ${p.tracks.length+1}`, type: 'video', isMuted: false, isLocked: false }]} : null)}
                        />
                    )}
                 </div>
                 )}
            </div>

            {/* Right Panel */}
            {!isRendering && (
            <div style={{ width: rightPanelWidth }} className="bg-bg-panel border-l border-black/20 shrink-0 relative group transition-width duration-0 transition-colors">
                 <div className="absolute top-0 left-0 bottom-0 w-1 cursor-col-resize hover:bg-primary z-50 transition-colors opacity-0 group-hover:opacity-100" onMouseDown={() => setIsResizing('right')} />
                 <PropertiesPanel 
                    selectedClip={selectedClip} 
                    onUpdate={(u) => selectedClip && handleUpdateClip(selectedClip.id, u)} 
                    onDelete={() => selectedClip && handleDeleteClip(selectedClip.id)}
                 />
            </div>
            )}
        </div>
    </div>
  );
}

const SidebarIcon = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all w-full ${active ? 'text-primary bg-primary-dim border-l-2 border-primary' : 'text-text-muted hover:text-text-main hover:bg-primary-dim hover:scale-105'}`}>
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);