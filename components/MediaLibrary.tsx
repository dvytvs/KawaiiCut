import React, { useState } from 'react';
import { Asset, AssetType } from '../types';
import { Image, Video, Music, Plus, Trash2, MoreVertical, FileX } from 'lucide-react';

interface MediaLibraryProps {
  assets: Asset[];
  onAddAsset: (file: File) => void;
  onDeleteAsset: (id: string) => void;
  onDragStart: (e: React.DragEvent, asset: Asset) => void;
  onClickAsset: (asset: Asset) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ assets, onAddAsset, onDeleteAsset, onDragStart, onClickAsset }) => {
  const [filter, setFilter] = useState<'all' | 'video' | 'image' | 'audio'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddAsset(e.target.files[0]);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    // Stop everything to prevent the card click from firing
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    // Call delete immediately without confirm dialog to ensure UI responsiveness
    onDeleteAsset(id);
    setActiveMenuId(null);
  };

  const filteredAssets = assets.filter(asset => {
    // Hide internal Text assets from the file library
    if (asset.type === AssetType.TEXT) return false;

    if (filter === 'all') return true;
    if (filter === 'video') return asset.type === AssetType.VIDEO;
    if (filter === 'image') return asset.type === AssetType.IMAGE;
    if (filter === 'audio') return asset.type === AssetType.AUDIO;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-bg-panel text-text-main relative">
      {/* Header */}
      <div className="p-4 border-b border-black/20">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Мультимедиа</h2>
        </div>
        
        <label className="flex items-center justify-center gap-2 w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg cursor-pointer transition-colors shadow-lg font-medium text-sm">
          <Plus size={16} />
          <span>Импорт медиа</span>
          <input type="file" className="hidden" accept="image/*,video/*,audio/*" onChange={handleFileChange} />
        </label>
      </div>

      {/* Tabs */}
      <div className="flex px-4 py-3 space-x-4 border-b border-black/20 text-sm overflow-x-auto shrink-0">
        {['all', 'video', 'image', 'audio'].map((f) => (
            <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`pb-1 border-b-2 transition-colors capitalize ${filter === f ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
                {f === 'all' ? 'Все' : f}
            </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3 content-start pb-20">
            {filteredAssets.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center py-10 text-gray-500 text-sm space-y-2">
                    <FileX size={32} className="opacity-50"/>
                    <p>Нет файлов</p>
                </div>
            )}
            {filteredAssets.map(asset => (
            <div 
                key={asset.id}
                className="group relative aspect-square rounded-lg bg-[#1a1a1a] border border-transparent hover:border-primary/50 cursor-pointer transition-all select-none"
                draggable
                onDragStart={(e) => onDragStart(e, asset)}
                onClick={() => onClickAsset(asset)}
            >
                {/* Image/Preview Container */}
                <div className="w-full h-full rounded-lg overflow-hidden relative pointer-events-none">
                    {asset.type === AssetType.IMAGE || asset.type === AssetType.VIDEO ? (
                    <img src={asset.thumbnail || asset.src} className="w-full h-full object-cover" alt={asset.name} />
                    ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-[#111]">
                        <Music size={24} />
                    </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                        <p className="text-[10px] text-gray-200 truncate pr-4">{asset.name}</p>
                        <p className="text-[9px] text-gray-400">{Math.round(asset.duration)}с</p>
                    </div>
                </div>

                {/* Type Icon */}
                <div className="absolute top-1 left-1 text-white drop-shadow-md z-10 pointer-events-none">
                    {asset.type === AssetType.VIDEO && <Video size={12} />}
                    {asset.type === AssetType.IMAGE && <Image size={12} />}
                    {asset.type === AssetType.AUDIO && <Music size={12} />}
                </div>

                {/* 3 Dots Menu Button - Explicitly clickable */}
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === asset.id ? null : asset.id);
                    }}
                    className={`absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-opacity z-20 cursor-pointer ${activeMenuId === asset.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    <MoreVertical size={14} />
                </div>

                {/* Dropdown Menu & Backdrop */}
                {activeMenuId === asset.id && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 z-40 cursor-default" 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                            }}
                        />
                        
                        {/* Menu Item */}
                        <div className="absolute top-8 right-1 w-28 bg-[#252525] border border-gray-700 rounded shadow-xl z-50 overflow-hidden animate-fade-in">
                            <button
                                onClick={(e) => handleDeleteClick(e, asset.id)}
                                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <Trash2 size={12} />
                                <span>Удалить</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};