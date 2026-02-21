import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Clip, Track, Asset, AssetType, TextData } from '../types';
import { Scissors, Lock, Volume2, Eye, Plus, MonitorPlay, Type } from 'lucide-react';

interface TimelineProps {
  tracks: Track[];
  clips: Clip[];
  assets: Asset[];
  currentTime: number;
  duration: number;
  zoom: number;
  selectedClipId: string | null;
  onSeek: (time: number) => void;
  onSelectClip: (id: string | null) => void;
  onUpdateClip: (id: string, updates: Partial<Clip>) => void;
  onDropAsset: (assetId: string, trackId: string, time: number) => void;
  onDropText: (textDataStr: string, trackId: string, time: number) => void;
  onDropEffect: (effectType: string, trackId: string, time: number) => void;
  onAddTrack: () => void;
}

const HEADER_HEIGHT = 32;
const TRACK_HEIGHT = 56;
const LEFT_PANEL_WIDTH = 100;

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  clips,
  assets,
  currentTime,
  duration,
  zoom,
  selectedClipId,
  onSeek,
  onSelectClip,
  onUpdateClip,
  onDropAsset,
  onDropText,
  onDropEffect,
  onAddTrack
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Interaction States
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [draggingClip, setDraggingClip] = useState<{ id: string; startX: number; originalStartTime: number } | null>(null);
  const [resizingClip, setResizingClip] = useState<{ 
      id: string; 
      handle: 'left' | 'right'; 
      startX: number; 
      originalStartTime: number; 
      originalDuration: number;
      originalOffset: number;
  } | null>(null);

  const [draggedOverTrack, setDraggedOverTrack] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- PLAYHEAD LOGIC ---
  const getTimeFromMouse = (clientX: number) => {
      if (!scrollContainerRef.current) return 0;
      const rect = scrollContainerRef.current.getBoundingClientRect();
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const relativeX = clientX - rect.left + scrollLeft;
      return Math.max(0, relativeX / zoom);
  };

  const handleRulerMouseDown = (e: React.MouseEvent) => {
    setIsDraggingPlayhead(true);
    const newTime = getTimeFromMouse(e.clientX);
    onSeek(newTime);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingPlayhead) {
      const newTime = getTimeFromMouse(e.clientX);
      onSeek(newTime);
    }
  }, [isDraggingPlayhead, zoom, onSeek]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingPlayhead(false);
    setDraggingClip(null);
    setResizingClip(null);
  }, []);

  useEffect(() => {
    if (isDraggingPlayhead || draggingClip || resizingClip) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } 
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, draggingClip, resizingClip]);


  // --- CLIP INTERACTION LOGIC ---
  const handleClipMouseDown = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    onSelectClip(clip.id);
    setDraggingClip({
      id: clip.id,
      startX: e.clientX,
      originalStartTime: clip.startTime
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, clip: Clip, handle: 'left' | 'right') => {
      e.preventDefault(); e.stopPropagation();
      onSelectClip(clip.id);
      setResizingClip({
          id: clip.id,
          handle,
          startX: e.clientX,
          originalStartTime: clip.startTime,
          originalDuration: clip.duration,
          originalOffset: clip.offset
      });
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
      if (resizingClip) {
          const deltaX = e.clientX - resizingClip.startX;
          const deltaSeconds = deltaX / zoom;
          const asset = assets.find(a => a.id === clips.find(c => c.id === resizingClip.id)?.assetId);
          if (!asset) return;
          
          // Allow infinite duration for static assets
          const isInfinite = asset.type === AssetType.IMAGE || asset.type === AssetType.TEXT || asset.type === AssetType.EFFECT;

          if (resizingClip.handle === 'right') {
              let newDuration = resizingClip.originalDuration + deltaSeconds;
              if (newDuration < 0.1) newDuration = 0.1;
              
              if (!isInfinite) {
                  const maxDuration = asset.duration - resizingClip.originalOffset;
                  if (newDuration > maxDuration) newDuration = maxDuration;
              }
              onUpdateClip(resizingClip.id, { duration: newDuration });
          } 
          else if (resizingClip.handle === 'left') {
              let change = deltaSeconds;
              // Prevent duration from becoming negative
              if (resizingClip.originalDuration - change < 0.1) change = resizingClip.originalDuration - 0.1;
              
              // Prevent offset from becoming negative (cannot seek before start of file)
              if (resizingClip.originalOffset + change < 0) change = -resizingClip.originalOffset;
              
              // Only limit "left" resizing by media start if it's not infinite 
              // (Though logically even static assets shouldn't have negative offset, but practically it doesn't matter as much as duration)
              
              onUpdateClip(resizingClip.id, {
                  startTime: resizingClip.originalStartTime + change,
                  duration: resizingClip.originalDuration - change,
                  offset: resizingClip.originalOffset + change
              });
          }
      } else if (draggingClip) {
          const deltaX = e.clientX - draggingClip.startX;
          const deltaTime = deltaX / zoom;
          const newStartTime = Math.max(0, draggingClip.originalStartTime + deltaTime);
          onUpdateClip(draggingClip.id, { startTime: newStartTime });
      } else if (isDraggingPlayhead) {
          handleMouseMove(e);
      }
  };

  // --- DROP ---
  const handleDragOver = (e: React.DragEvent, trackId: string) => {
      e.preventDefault(); e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
      if (draggedOverTrack !== trackId) setDraggedOverTrack(trackId);
  };
  const handleDropOnTrack = (e: React.DragEvent, trackId: string) => {
      e.preventDefault(); e.stopPropagation();
      setDraggedOverTrack(null);
      
      const assetId = e.dataTransfer.getData('assetId');
      const textData = e.dataTransfer.getData('textData');
      const effectType = e.dataTransfer.getData('effectType');
      
      if ((!assetId && !textData && !effectType) || !scrollContainerRef.current) return;
      
      const rect = scrollContainerRef.current.getBoundingClientRect();
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const relativeX = e.clientX - rect.left + scrollLeft;
      const time = Math.max(0, relativeX / zoom);
      
      if (assetId) onDropAsset(assetId, trackId, time);
      else if (textData) onDropText(textData, trackId, time);
      else if (effectType) onDropEffect(effectType, trackId, time);
  };

  const handleTrackMouseEnter = (trackId: string) => {
      if (draggingClip) onUpdateClip(draggingClip.id, { trackId: trackId });
  };

  const timelineContentWidth = Math.max(window.innerWidth - LEFT_PANEL_WIDTH, (duration + 60) * zoom);

  return (
    <div className="flex h-full bg-bg-timeline select-none overflow-hidden text-gray-300">
        {/* Left Track Headers */}
        <div className="w-[100px] flex-shrink-0 bg-bg-panel border-r border-black/30 z-20 flex flex-col shadow-lg">
          <div style={{ height: HEADER_HEIGHT }} className="border-b border-black/30 bg-bg-panel shrink-0 flex items-center px-2">
             <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Tracks</span>
          </div>
          <div className="flex-1 overflow-y-hidden">
             {tracks.map(track => (
                <div key={track.id} style={{ height: TRACK_HEIGHT }} className="border-b border-black/20 px-2 flex flex-col justify-center relative hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium truncate w-16" title={track.name}>{track.name}</span>
                        {track.type === 'video' ? <MonitorPlay size={10}/> : track.type === 'audio' ? <Volume2 size={10}/> : <Type size={10}/>}
                    </div>
                    <div className="flex gap-2">
                        <button className="text-gray-600 hover:text-white"><Eye size={12}/></button>
                        <button className="text-gray-600 hover:text-white"><Lock size={12}/></button>
                    </div>
                </div>
            ))}
            <button onClick={onAddTrack} className="w-full py-2 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white/5 transition-colors text-[10px] gap-1">
                <Plus size={12} /> Add Track
            </button>
          </div>
        </div>

        {/* Right Scrolling Timeline */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative" ref={scrollContainerRef}>
            <div style={{ width: timelineContentWidth, minWidth: '100%' }} className="relative h-full">
                {/* Ruler */}
                <div 
                    ref={rulerRef}
                    className="absolute top-0 left-0 right-0 border-b border-white/10 bg-bg-panel/90 backdrop-blur z-30 cursor-pointer sticky left-0"
                    style={{ height: HEADER_HEIGHT }}
                    onMouseDown={handleRulerMouseDown}
                >
                    {Array.from({ length: Math.ceil((duration + 60) / 5) }).map((_, i) => (
                        <div key={i} className="absolute bottom-0 h-2 border-l border-gray-600 text-[9px] text-gray-500 pl-1 select-none pointer-events-none" style={{ left: i * 5 * zoom }}>
                            {formatTime(i * 5)}
                        </div>
                    ))}
                    {Array.from({ length: Math.ceil((duration + 60)) }).map((_, i) => (
                        <div key={i} className="absolute bottom-0 h-1 border-l border-gray-800" style={{ left: i * zoom }}></div>
                    ))}
                </div>

                {/* Playhead */}
                <div className="absolute top-0 bottom-0 z-40 pointer-events-none flex flex-col items-center" style={{ left: currentTime * zoom, transform: 'translateX(-50%)' }}>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white relative top-[24px]"></div>
                    <div className="w-px bg-white h-full shadow-[0_0_8px_rgba(255,255,255,0.3)]"></div>
                </div>

                {/* Tracks */}
                <div className="relative pt-[32px]">
                    {tracks.map(track => (
                        <div 
                            key={track.id} 
                            style={{ height: TRACK_HEIGHT }} 
                            className={`relative border-b border-white/5 ${draggedOverTrack === track.id ? 'bg-white/5' : ''}`}
                            onDragOver={(e) => handleDragOver(e, track.id)}
                            onDrop={(e) => handleDropOnTrack(e, track.id)}
                            onMouseEnter={() => handleTrackMouseEnter(track.id)}
                        >
                            {clips.filter(c => c.trackId === track.id).map(clip => {
                                const asset = assets.find(a => a.id === clip.assetId);
                                const isSelected = selectedClipId === clip.id;
                                let bgClass = 'bg-[#2a2a2a]';
                                if (track.type === 'video') bgClass = 'bg-[#3b82f6]/20 border border-[#3b82f6]/40';
                                if (track.type === 'audio') bgClass = 'bg-[#10b981]/20 border border-[#10b981]/40';
                                if (asset?.type === AssetType.TEXT) bgClass = 'bg-orange-500/20 border border-orange-500/40';
                                if (asset?.type === AssetType.EFFECT) bgClass = 'bg-purple-500/20 border border-purple-500/40';
                                if (isSelected) bgClass = 'bg-[#6366f1] border border-[#818cf8] shadow-lg shadow-[#6366f1]/20';

                                return (
                                    <div
                                        key={clip.id}
                                        onMouseDown={(e) => handleClipMouseDown(e, clip)}
                                        className={`absolute top-1 bottom-1 rounded-[4px] cursor-move overflow-hidden group ${bgClass}`}
                                        style={{ left: clip.startTime * zoom, width: clip.duration * zoom }}
                                        title="Click to select, Drag to move, Delete key to remove"
                                    >
                                        <div className="w-full h-full px-2 flex items-center justify-between">
                                             <span className={`text-[10px] font-medium truncate select-none ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                {clip.textData ? `T: ${clip.textData.content}` : asset?.name}
                                             </span>
                                        </div>
                                        {(isSelected || draggingClip?.id === clip.id) && (
                                            <>
                                                <div className="absolute left-0 top-0 bottom-0 w-3 bg-white/20 hover:bg-white cursor-ew-resize flex items-center justify-center" onMouseDown={(e) => handleResizeMouseDown(e, clip, 'left')}>
                                                    <div className="w-0.5 h-3 bg-black/50"></div>
                                                </div>
                                                <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/20 hover:bg-white cursor-ew-resize flex items-center justify-center" onMouseDown={(e) => handleResizeMouseDown(e, clip, 'right')}>
                                                    <div className="w-0.5 h-3 bg-black/50"></div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};