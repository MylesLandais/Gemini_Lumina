import React, { useRef, useState, useEffect } from 'react';
import { FeedItem as FeedItemType, MediaType } from '../types';
import { Heart, Share2, Play, Instagram, Twitter, Command, ScanSearch, Archive, MessageSquare, MessagesSquare, AlignLeft, Clover, ShoppingBag, Euro, DollarSign, Tag, Database, Layers } from 'lucide-react';

interface FeedItemProps {
  item: FeedItemType;
  onClick?: (item: FeedItemType) => void;
}

const getSourceIcon = (source: string) => {
  const s = source?.toLowerCase() || '';
  if (s.includes('instagram')) return <Instagram className="w-3 h-3" />;
  if (s.includes('twitter') || s.includes('x')) return <Twitter className="w-3 h-3" />;
  if (s.includes('reddit')) return <span className="text-[10px] font-bold">r/</span>;
  if (s.includes('4chan') || s.includes('4channel') || s === 'b' || s === 'g' || s === 'po') return <Clover className="w-3 h-3 fill-current" />;
  if (s.includes('kemono') || s.includes('coomer')) return <Archive className="w-3 h-3" />;
  if (s.includes('simpcity')) return <MessageSquare className="w-3 h-3" />;
  if (s.includes('level1') || s.includes('forum')) return <MessagesSquare className="w-3 h-3" />;
  if (s.includes('pixiv')) return <span className="text-[10px] font-bold text-blue-400">P</span>;
  if (s.includes('depop') || s.includes('vinted') || s.includes('grailed')) return <ShoppingBag className="w-3 h-3" />;
  if (s.includes('ebay')) return <Tag className="w-3 h-3" />;
  if (s.includes('myfigurecollection') || s.includes('mfc')) return <Database className="w-3 h-3" />;
  if (s.includes('kun') || s.includes('chan')) return <Clover className="w-3 h-3" />;
  return <Command className="w-3 h-3" />;
};

export const FeedItem: React.FC<FeedItemProps> = ({ item, onClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const mediaSource = item.mediaUrl || `https://picsum.photos/seed/${item.id}/${item.width}/${item.height}`;
  
  const isVideo = item.type === MediaType.SHORT || item.type === MediaType.GIF;
  const isText = item.type === MediaType.TEXT;
  const isGallery = item.galleryUrls && item.galleryUrls.length > 1;

  // For video thumbnails, use the provided url or fallback to mediaSource (if browser can generate thumb, otherwise poster)
  const displayImage = item.thumbnailUrl || (isVideo ? undefined : mediaSource);

  useEffect(() => {
    if (isVideo && videoRef.current) {
        if (isHovering) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setIsPlaying(true)).catch(e => console.log("Autoplay prevent", e));
            }
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; 
            setIsPlaying(false);
        }
    }
  }, [isHovering, isVideo]);

  const handleSauceSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isText) return;
    window.open(`https://saucenao.com/search.php?url=${encodeURIComponent(displayImage || mediaSource)}`, '_blank');
  };

  return (
    <div 
        onClick={() => onClick && onClick(item)}
        className="break-inside-avoid mb-4 group relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer ring-1 ring-white/5 hover:ring-white/20 transition-all duration-300"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
    >
      {/* 
         Aspect Ratio Container
         We rigorously enforce the aspect ratio class provided by the backend/service.
         This ensures 16:9 (aspect-video) items don't collapse.
      */}
      <div className={`relative w-full overflow-hidden ${item.aspectRatio || 'aspect-square'} bg-gray-950`}>
        
        {isText ? (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950 flex flex-col p-6">
                <AlignLeft className="w-8 h-8 text-app-muted/30 mb-3" />
                <h3 className="text-app-text font-serif text-lg leading-snug line-clamp-4 font-medium opacity-90">
                    {item.caption}
                </h3>
                <p className="text-xs text-app-muted mt-2 line-clamp-3 opacity-60">
                    {item.bodyText}
                </p>
            </div>
        ) : isVideo ? (
             <>
                <video
                    ref={videoRef}
                    src={mediaSource}
                    poster={item.thumbnailUrl}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                    loop
                    muted
                    playsInline
                />
                {displayImage && (
                    <img 
                        src={displayImage} 
                        alt={item.caption}
                        className={`absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 ease-out ${isPlaying ? 'opacity-0' : 'opacity-100'} group-hover:scale-105`}
                        loading="lazy"
                    />
                )}
             </>
        ) : (
            <img 
                src={displayImage || mediaSource} 
                alt={item.caption}
                className={`absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105 ${item.isSold ? 'grayscale contrast-125 opacity-50' : ''}`}
                loading="lazy"
            />
        )}
        
        {/* Top-Right Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-20">
             {item.type === MediaType.SHORT && (
                <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 text-white">
                    <Play className="w-3 h-3 fill-current" />
                </div>
            )}
            {item.type === MediaType.GIF && (
                <div className="bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10 text-[10px] font-bold text-white tracking-wider">
                    GIF
                </div>
            )}
            {/* Gallery Indicator */}
            {isGallery && (
                 <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-md border border-white/10 text-white flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{item.galleryUrls?.length}</span>
                </div>
            )}
            {/* Condition Badge (Marketplace) */}
            {item.condition && !item.isSold && (
                <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-medium text-white/90">
                    {item.condition}
                </div>
            )}
        </div>

        {/* Sold Overlay */}
        {item.isSold && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="border-4 border-red-500/80 text-red-500/80 font-black text-3xl uppercase -rotate-12 px-4 py-1 rounded-lg tracking-widest bg-black/20 backdrop-blur-sm">
                    SOLD
                </div>
            </div>
        )}

        {/* Source Badge (Top-Left) - Glassmorphism */}
        <div className="absolute top-3 left-3 z-20 opacity-90 group-hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md pl-1.5 pr-2.5 py-1 rounded-full border border-white/10 shadow-sm text-xs text-white/90">
                {getSourceIcon(item.source)}
                <span className="font-medium tracking-wide text-[10px] uppercase">{item.source.replace('4chan/', '').replace('myfigurecollection', 'MFC')}</span>
             </div>
        </div>

        {/* Interactive Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

        {/* Content Overlay (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            
            {/* Marketplace Price Tag */}
            {item.price !== undefined && (
                <div className="flex items-baseline gap-1 text-emerald-400 font-bold text-lg drop-shadow-md mb-1">
                    <span className="text-sm">{item.currency || '$'}</span>
                    <span>{item.price.toLocaleString()}</span>
                </div>
            )}

            {/* Caption */}
            {!isText && (
                <p className="text-white/95 font-medium text-sm leading-snug line-clamp-2 drop-shadow-sm mb-2 group-hover:text-white transition-colors">
                    {item.caption}
                </p>
            )}

            {/* Metadata Row */}
            <div className="flex items-center justify-between text-white/60 text-xs border-t border-white/10 pt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                <div className="flex items-center gap-2">
                    <span className="truncate max-w-[100px] font-medium hover:text-white/90">{item.author.handle}</span>
                </div>
                
                <div className="flex items-center gap-3">
                     <button className="hover:text-pink-400 transition-colors flex items-center gap-1 group/btn">
                        <Heart className="w-3.5 h-3.5 group-hover/btn:fill-current" />
                        <span className="text-[10px]">{new Intl.NumberFormat('en-US', { notation: "compact" }).format(item.likes)}</span>
                     </button>
                     
                     {/* Search Source Button */}
                     <button 
                        onClick={handleSauceSearch}
                        className="hover:text-app-accent transition-colors"
                        title="Find Source"
                     >
                        <ScanSearch className="w-3.5 h-3.5" />
                     </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};