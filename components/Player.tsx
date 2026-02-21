import React, { useEffect, useRef, useMemo, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Clip, Asset, AssetType, AspectRatio, Track, TextData, EffectType } from '../types';
import { Play, Pause, SkipBack, SkipForward, Maximize, Monitor } from 'lucide-react';

interface PlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  clips: Clip[];
  tracks: Track[];
  assets: Asset[];
  aspectRatio: AspectRatio;
  selectedClipId: string | null;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onUpdateClip: (id: string, updates: Partial<Clip>) => void;
  onSelectClip: (id: string | null) => void;
  onDropAsset: (assetId: string) => void;
  onDropText?: (textData: TextData) => void;
  isExporting?: boolean;
}

export interface PlayerRef {
    getCombinedStream: () => MediaStream | null;
}

export const Player = forwardRef<PlayerRef, PlayerProps>(({
  isPlaying,
  currentTime,
  duration,
  clips,
  tracks,
  assets,
  aspectRatio,
  selectedClipId,
  onTogglePlay,
  onSeek,
  onUpdateClip,
  onSelectClip,
  onDropAsset,
  onDropText,
  isExporting = false
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // --- AUDIO SYSTEM ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null); // For Export
  
  // Resource Cache
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const videoCache = useRef<Record<string, { el: HTMLVideoElement, source?: MediaElementAudioSourceNode }>>({});
  const audioCache = useRef<Record<string, { el: HTMLAudioElement, source?: MediaElementAudioSourceNode }>>({});
  
  // Dimensions
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Transform State
  const [transformMode, setTransformMode] = useState<'none' | 'move' | 'resize'>('none');
  const [resizeCorner, setResizeCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialClipState, setInitialClipState] = useState<Partial<Clip> | null>(null);

  // Init Audio Context Interaction
  useEffect(() => {
      if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass();
          const gain = ctx.createGain();
          const dest = ctx.createMediaStreamDestination(); // For recording
          
          gain.connect(ctx.destination); // Connect to speakers
          gain.connect(dest); // Connect to recorder stream
          
          audioContextRef.current = ctx;
          masterGainRef.current = gain;
          destRef.current = dest;
      }
  }, []);

  // Expose Stream to Parent
  useImperativeHandle(ref, () => ({
      getCombinedStream: () => {
          if (!canvasRef.current || !destRef.current) return null;
          // High FPS capture for smoother video
          const videoStream = canvasRef.current.captureStream(60); 
          const audioStream = destRef.current.stream;
          
          // Combine tracks
          const tracks = [
              ...videoStream.getVideoTracks(),
              ...audioStream.getAudioTracks()
          ];
          return new MediaStream(tracks);
      }
  }));

  // Resize Observer
  useEffect(() => {
      if (!containerRef.current) return;
      const observer = new ResizeObserver((entries) => {
          const { width, height } = entries[0].contentRect;
          setContainerSize({ width, height });
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
  }, []);

  // --- ASSET LOADING & AUDIO ROUTING ---
  useEffect(() => {
      const ctx = audioContextRef.current;
      const gain = masterGainRef.current;
      if (!ctx || !gain) return;

      assets.forEach(asset => {
          if (asset.type === AssetType.IMAGE && !imageCache.current[asset.src]) {
              const img = new Image();
              img.src = asset.src;
              img.crossOrigin = "anonymous";
              imageCache.current[asset.src] = img;
          } 
          else if (asset.type === AssetType.VIDEO && !videoCache.current[asset.src]) {
              const vid = document.createElement('video');
              vid.src = asset.src;
              vid.crossOrigin = "anonymous";
              vid.playsInline = true;
              vid.preload = 'auto';
              
              // CRITICAL: We must create a source node to route audio through our context
              // Need to wait for metadata or just try
              vid.oncanplay = () => {
                 if (!videoCache.current[asset.src].source) {
                     try {
                        const source = ctx.createMediaElementSource(vid);
                        source.connect(gain);
                        videoCache.current[asset.src].source = source;
                     } catch (e) {
                         // Source already created or error
                     }
                 }
              };

              videoCache.current[asset.src] = { el: vid };
          }
          else if (asset.type === AssetType.AUDIO && !audioCache.current[asset.src]) {
              const aud = new Audio();
              aud.src = asset.src;
              aud.crossOrigin = "anonymous";
              aud.preload = 'auto';
              
              aud.oncanplay = () => {
                  if (!audioCache.current[asset.src].source) {
                      try {
                        const source = ctx.createMediaElementSource(aud);
                        source.connect(gain);
                        audioCache.current[asset.src].source = source;
                      } catch(e) {}
                  }
              }

              audioCache.current[asset.src] = { el: aud };
          }
      });
  }, [assets]);

  // --- SYNC MEDIA WITH TIMELINE ---
  useEffect(() => {
      // 1. Video Sync
      Object.values(videoCache.current).forEach(({ el }) => {
          const activeClip = clips.find(c => {
             const asset = assets.find(a => a.id === c.assetId);
             return asset?.src === el.src && currentTime >= c.startTime && currentTime < c.startTime + c.duration;
          });

          // Track Mute Logic
          const track = activeClip ? tracks.find(t => t.id === activeClip.trackId) : null;
          const isMuted = track?.isMuted || false;
          el.muted = false; // We control volume via gain, but source needs to be unmuted. 
          // Actually for createMediaElementSource to work, element shouldn't be muted, 
          // but we can disconnect source if muted. Simpler: set volume on element.
          el.volume = isMuted ? 0 : 1;

          if (activeClip) {
              const videoTime = (currentTime - activeClip.startTime) * activeClip.speed + activeClip.offset;
              
              // Only seek if drift is significant to prevent audio glitching
              if (Math.abs(el.currentTime - videoTime) > 0.25) {
                  el.currentTime = videoTime;
              }
              
              el.playbackRate = activeClip.speed;

              if (isPlaying && el.paused) {
                  // Resume Audio Context if suspended (browser policy)
                  if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
                  el.play().catch(() => {});
              }
              if (!isPlaying && !el.paused) el.pause();
          } else {
              if (!el.paused) el.pause();
              el.currentTime = 0;
          }
      });

      // 2. Audio Sync
      Object.values(audioCache.current).forEach(({ el }) => {
          const activeClip = clips.find(c => {
             const asset = assets.find(a => a.id === c.assetId);
             return asset?.src === el.src && currentTime >= c.startTime && currentTime < c.startTime + c.duration;
          });

          const track = activeClip ? tracks.find(t => t.id === activeClip.trackId) : null;
          const isMuted = track?.isMuted || false;
          el.volume = isMuted ? 0 : 1;

          if (activeClip) {
              const audioTime = (currentTime - activeClip.startTime) * activeClip.speed + activeClip.offset;
              
              if (Math.abs(el.currentTime - audioTime) > 0.25) {
                  el.currentTime = audioTime;
              }
              
              el.playbackRate = activeClip.speed;

              if (isPlaying && el.paused) {
                  if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
                  el.play().catch(() => {});
              }
              if (!isPlaying && !el.paused) el.pause();
          } else {
              if (!el.paused) el.pause();
              el.currentTime = 0;
          }
      });

  }, [currentTime, isPlaying, clips, assets, tracks]);


  // --- VISUAL RENDER LOOP ---
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false }); // Optimize
      if (!ctx) return;

      // Layout Logic
      let targetW = containerSize.width;
      let targetH = containerSize.height;
      let ratio = 16 / 9;
      if (aspectRatio === '9:16') ratio = 9 / 16;
      else if (aspectRatio === '1:1') ratio = 1;
      else if (aspectRatio === '4:3') ratio = 4 / 3;

      if (targetW / targetH > ratio) targetW = targetH * ratio;
      else targetH = targetW / ratio;

      // Set Canvas Size
      if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
      }
      
      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetW, targetH);

      // Active Clips & Sorting
      const trackOrder = tracks.reduce((acc, t, i) => ({...acc, [t.id]: i}), {} as Record<string,number>);
      const activeClips = clips.filter(c => currentTime >= c.startTime && currentTime < c.startTime + c.duration);
      
      // Sort: Higher index (bottom in list) = Draw First (Background)
      activeClips.sort((a, b) => (trackOrder[b.trackId] || 0) - (trackOrder[a.trackId] || 0));

      const activeEffects = activeClips.reduce((acc, clip) => {
         const asset = assets.find(a => a.id === clip.assetId);
         if (asset?.type === AssetType.EFFECT && asset.effectType) acc.push({ type: asset.effectType, clip });
         return acc;
      }, [] as { type: EffectType, clip: Clip }[]);

      // Draw
      activeClips.forEach(clip => {
          const asset = assets.find(a => a.id === clip.assetId);
          if (!asset || asset.type === AssetType.EFFECT || asset.type === AssetType.AUDIO) return;

          ctx.save();

          const cx = targetW / 2;
          const cy = targetH / 2;

          ctx.translate(cx + clip.x, cy + clip.y);
          ctx.rotate((clip.rotation * Math.PI) / 180);
          ctx.scale(clip.scale * (clip.mirror ? -1 : 1), clip.scale);
          ctx.globalAlpha = clip.opacity;

          // Filters
          let filterString = '';
          if (activeEffects.find(e => e.type === EffectType.BLUR)) filterString += 'blur(5px) ';
          if (activeEffects.find(e => e.type === EffectType.SEPIA)) filterString += 'sepia(0.8) ';
          if (activeEffects.find(e => e.type === EffectType.INVERT)) filterString += 'invert(1) ';
          if (filterString) ctx.filter = filterString;

          if (asset.type === AssetType.IMAGE) {
              const img = imageCache.current[asset.src];
              if (img && img.complete) {
                  const drawW = targetW;
                  const drawH = (img.height / img.width) * drawW;
                  ctx.drawImage(img, -drawW/2, -drawH/2, drawW, drawH);
              }
          } else if (asset.type === AssetType.VIDEO) {
              const vidData = videoCache.current[asset.src];
              if (vidData && vidData.el) {
                  const vid = vidData.el;
                  if (vid.readyState >= 2) { // HAVE_CURRENT_DATA
                      const drawW = targetW;
                      const drawH = (vid.videoHeight / vid.videoWidth) * drawW;
                      ctx.drawImage(vid, -drawW/2, -drawH/2, drawW, drawH);
                  }
              }
          } else if (asset.type === AssetType.TEXT && clip.textData) {
              const td = clip.textData;
              ctx.font = `${td.isItalic ? 'italic ' : ''}${td.isBold ? 'bold ' : ''}${td.fontSize}px "${td.fontFamily.split(',')[0]}"`;
              ctx.textAlign = td.align;
              ctx.textBaseline = 'middle';
              if (td.shadowColor) {
                  ctx.shadowColor = td.shadowColor;
                  ctx.shadowBlur = td.shadowBlur || 0;
              }
              const lines = td.content.split('\n');
              const lineHeight = td.fontSize * 1.2;
              let startY = -((lines.length * lineHeight) / 2) + (lineHeight / 2);

              lines.forEach(line => {
                  if (td.outlineColor && td.outlineWidth) {
                      ctx.strokeStyle = td.outlineColor;
                      ctx.lineWidth = td.outlineWidth;
                      ctx.strokeText(line, 0, startY);
                  }
                  ctx.fillStyle = td.color;
                  ctx.fillText(line, 0, startY);
                  startY += lineHeight;
              });
          }
          ctx.restore();
      });

      // Effects Overlay
      activeEffects.forEach(({ type, clip }) => {
          const progress = Math.max(0, Math.min(1, (currentTime - clip.startTime) / clip.duration));
          if (type === EffectType.FADE_OUT) {
              ctx.fillStyle = `rgba(0,0,0,${progress})`;
              ctx.fillRect(0, 0, targetW, targetH);
          } else if (type === EffectType.SUNRISE) {
              ctx.fillStyle = `rgba(0,0,0,${1 - progress})`;
              ctx.fillRect(0, 0, targetW, targetH);
          } else if (type === EffectType.FLASH) {
              const opacity = Math.abs(Math.sin(Date.now() / 100)) * 0.5;
              ctx.fillStyle = `rgba(255,255,255,${opacity})`;
              ctx.fillRect(0, 0, targetW, targetH);
          } else if (type === EffectType.VHS) {
              ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
              for(let i=0; i<targetH; i+=4) ctx.fillRect(0, i, targetW, 1);
          }
      });
      
      // --- SELECTION BOX ---
      if (selectedClipId) {
          const clip = clips.find(c => c.id === selectedClipId);
          const isActive = clip && currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
          const asset = clip ? assets.find(a => a.id === clip.assetId) : null;
          
          if (clip && isActive && asset && asset.type !== AssetType.AUDIO && asset.type !== AssetType.EFFECT) {
              ctx.save();
              const cx = targetW / 2;
              const cy = targetH / 2;
              
              ctx.translate(cx + clip.x, cy + clip.y);
              ctx.rotate((clip.rotation * Math.PI) / 180);
              
              // Calculate bounds
              let w = targetW;
              let h = targetW;
              if (asset.type === AssetType.IMAGE) {
                  const img = imageCache.current[asset.src];
                  if (img) h = (img.height / img.width) * w;
              } else if (asset.type === AssetType.VIDEO) {
                  const vid = videoCache.current[asset.src]?.el;
                  if (vid) h = (vid.videoHeight / vid.videoWidth) * w;
              }
              
              const sw = w * clip.scale;
              const sh = h * clip.scale;
              
              // Draw selection border
              ctx.strokeStyle = '#7851a9';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              ctx.strokeRect(-sw/2, -sh/2, sw, sh);
              
              // Draw corners
              ctx.setLineDash([]);
              ctx.fillStyle = '#ffffff';
              const handleSize = 10;
              
              // Corners
              ctx.fillRect(-sw/2 - handleSize/2, -sh/2 - handleSize/2, handleSize, handleSize); // TL
              ctx.fillRect(sw/2 - handleSize/2, -sh/2 - handleSize/2, handleSize, handleSize);  // TR
              ctx.fillRect(-sw/2 - handleSize/2, sh/2 - handleSize/2, handleSize, handleSize);  // BL
              ctx.fillRect(sw/2 - handleSize/2, sh/2 - handleSize/2, handleSize, handleSize);   // BR
              
              ctx.restore();
          }
      }

  }, [containerSize, clips, currentTime, assets, tracks, aspectRatio, selectedClipId]);


  // --- TRANSFORM HANDLERS ---
  const getCanvasMousePos = (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (!selectedClipId) return;
      const clip = clips.find(c => c.id === selectedClipId);
      if (!clip) return;
      
      const pos = getCanvasMousePos(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Convert pos to clip-relative space
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const dx = pos.x - (cx + clip.x);
      const dy = pos.y - (cy + clip.y);
      
      // Rotate back
      const rad = (-clip.rotation * Math.PI) / 180;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
      
      // Check corners for resize
      const asset = assets.find(a => a.id === clip.assetId);
      if (!asset) return;
      
      let w = canvas.width;
      let h = canvas.width;
      if (asset.type === AssetType.IMAGE) {
          const img = imageCache.current[asset.src];
          if (img) h = (img.height / img.width) * w;
      } else if (asset.type === AssetType.VIDEO) {
          const vid = videoCache.current[asset.src]?.el;
          if (vid) h = (vid.videoHeight / vid.videoWidth) * w;
      }
      
      const sw = w * clip.scale;
      const sh = h * clip.scale;
      const handleSize = 20; // Hit area
      
      const halfW = sw / 2;
      const halfH = sh / 2;
      
      if (Math.abs(rx - halfW) < handleSize && Math.abs(ry - halfH) < handleSize) {
          setTransformMode('resize');
          setResizeCorner('br');
      } else if (Math.abs(rx + halfW) < handleSize && Math.abs(ry - halfH) < handleSize) {
          setTransformMode('resize');
          setResizeCorner('bl');
      } else if (Math.abs(rx - halfW) < handleSize && Math.abs(ry + halfH) < handleSize) {
          setTransformMode('resize');
          setResizeCorner('tr');
      } else if (Math.abs(rx + halfW) < handleSize && Math.abs(ry + halfH) < handleSize) {
          setTransformMode('resize');
          setResizeCorner('tl');
      } else if (Math.abs(rx) < halfW && Math.abs(ry) < halfH) {
          setTransformMode('move');
      } else {
          return;
      }
      
      e.stopPropagation();
      setDragStart({ x: pos.x, y: pos.y });
      setInitialClipState({ ...clip });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (transformMode === 'none' || !selectedClipId || !initialClipState) return;
      
      const pos = getCanvasMousePos(e);
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      
      if (transformMode === 'move') {
          onUpdateClip(selectedClipId, {
              x: (initialClipState.x || 0) + dx,
              y: (initialClipState.y || 0) + dy
          });
      } else if (transformMode === 'resize') {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          
          const distInitial = Math.sqrt(
              Math.pow(dragStart.x - (cx + (initialClipState.x || 0)), 2) + 
              Math.pow(dragStart.y - (cy + (initialClipState.y || 0)), 2)
          );
          const distCurrent = Math.sqrt(
              Math.pow(pos.x - (cx + (initialClipState.x || 0)), 2) + 
              Math.pow(pos.y - (cy + (initialClipState.y || 0)), 2)
          );
          
          const scaleFactor = distCurrent / distInitial;
          onUpdateClip(selectedClipId, {
              scale: Math.max(0.1, (initialClipState.scale || 1) * scaleFactor)
          });
      }
  };

  const handleMouseUp = () => {
      setTransformMode('none');
      setResizeCorner(null);
      setInitialClipState(null);
  };

  // UI HANDLERS
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDragOver(true); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const assetId = e.dataTransfer.getData('assetId');
    const textDataStr = e.dataTransfer.getData('textData');
    if (assetId) onDropAsset(assetId);
    else if (textDataStr && onDropText) { try { onDropText(JSON.parse(textDataStr)); } catch(err) {} }
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen(); else document.exitFullscreen();
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#18181b] relative overflow-hidden" onDragOver={handleDragOver} onDragLeave={() => setIsDragOver(false)} onDrop={handleDrop}>
      <div className="flex-1 relative flex items-center justify-center bg-[#0f0f10] overflow-hidden p-4" onMouseDown={() => onSelectClip(null)}>
         <canvas 
            ref={canvasRef} 
            id="render-canvas" 
            className={`shadow-2xl bg-black ${transformMode !== 'none' ? 'cursor-grabbing' : selectedClipId ? 'cursor-crosshair' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
         />
         {isDragOver && (
            <div className="absolute inset-0 z-50 bg-primary/20 border-4 border-primary border-dashed m-4 rounded-xl flex items-center justify-center pointer-events-none">
                <span className="bg-black/80 text-white px-4 py-2 rounded-full font-bold shadow-lg">Drop to Add</span>
            </div>
         )}
      </div>
      <div className={`h-14 bg-[#1f1f23] border-t border-[#27272a] flex items-center justify-center space-x-6 relative z-10 select-none shrink-0 ${isExporting ? 'opacity-50 pointer-events-none' : ''}`}>
          <button onClick={() => onSeek(Math.max(0, currentTime - 5))} className="text-[#a1a1aa] hover:text-white p-2"><SkipBack size={20} /></button>
          <button onClick={onTogglePlay} className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center shadow-lg transform active:scale-95">
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={() => onSeek(Math.min(duration, currentTime + 5))} className="text-[#a1a1aa] hover:text-white p-2"><SkipForward size={20} /></button>
          <div className="absolute right-4 flex items-center space-x-2">
               <span className="text-xs text-text-muted font-mono mr-2">{new Date(currentTime * 1000).toISOString().substr(14, 8)} / {new Date(duration * 1000).toISOString().substr(14, 8)}</span>
               <button onClick={toggleFullscreen} className="text-[#a1a1aa] hover:text-white p-2"><Maximize size={18} /></button>
          </div>
      </div>
    </div>
  );
});

Player.displayName = "Player";