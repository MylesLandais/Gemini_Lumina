import React, { useEffect, useState } from 'react';
import { FeedItem, MediaType, Comment, RelatedThread } from '../types';
import { getThreadContext } from '../services/geminiService';
import { X, Heart, Share2, MessageCircle, ExternalLink, Calendar, Tag, AlertTriangle, Link2, GitBranch, Loader2, ArrowRight, ChevronLeft, ChevronRight, ScanSearch } from 'lucide-react';

interface LightboxProps {
  item: FeedItem;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ item, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [fullBody, setFullBody] = useState<string>(item.bodyText || '');
  const [relatedThreads, setRelatedThreads] = useState<RelatedThread[]>([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Fetch rich context (comments, related, full body) on mount
  useEffect(() => {
    const fetchContext = async () => {
        if (item.source.startsWith('r/') && item.permalink) {
            setIsLoadingContext(true);
            try {
                const data = await getThreadContext(item.permalink);
                setComments(data.comments);
                setRelatedThreads(data.relatedThreads);
                if (data.bodyText && data.bodyText.length > fullBody.length) {
                    setFullBody(data.bodyText);
                }
            } catch (e) {
                console.error("Context load failed", e);
            } finally {
                setIsLoadingContext(false);
            }
        }
    };
    fetchContext();
  }, [item]);

  const [hasError, setHasError] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (galleryIndex > 0) setGalleryIndex(prev => prev - 1);
  };

  const handleNextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (item.galleryUrls && galleryIndex < item.galleryUrls.length - 1) setGalleryIndex(prev => prev + 1);
  };

  const isVideo = (item.type === MediaType.SHORT || item.type === MediaType.GIF) && !hasError;
  const isTextPost = item.type === MediaType.TEXT;
  const isGallery = item.galleryUrls && item.galleryUrls.length > 1;
  
  // Determine current image URL
  let imageUrl = item.mediaUrl || `https://picsum.photos/seed/${item.id}/${item.width}/${item.height}`;
  if (isGallery && item.galleryUrls) {
      imageUrl = item.galleryUrls[galleryIndex];
  }

  const handleSauceSearch = () => {
      window.open(`https://saucenao.com/search.php?url=${encodeURIComponent(imageUrl)}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col md:flex-row w-full max-w-7xl h-full md:h-[90vh] bg-app-surface border border-app-border rounded-xl overflow-hidden shadow-2xl">
        
        {/* Media Section (Left/Top) */}
        {!isTextPost ? (
            <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden group min-h-[40vh] select-none">
            {isVideo ? (
                <video 
                src={imageUrl} 
                className="w-full h-full object-contain max-h-[90vh]" 
                controls 
                autoPlay 
                loop
                onError={(e) => {
                    console.warn("Video failed to load", e);
                    setHasError(true);
                }}
                />
            ) : (
                <>
                    {hasError && (
                        <div className="absolute top-4 left-4 bg-red-500/20 text-red-200 px-3 py-1 rounded text-xs flex items-center gap-2 border border-red-500/30 z-10">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Media unavailable</span>
                        </div>
                    )}
                    <img 
                        src={imageUrl} 
                        alt={item.caption} 
                        className="w-full h-full object-contain max-h-[90vh]"
                    />
                    
                    {/* Gallery Controls */}
                    {isGallery && (
                        <>
                            <button 
                                onClick={handlePrevImage}
                                disabled={galleryIndex === 0}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={handleNextImage}
                                disabled={galleryIndex === (item.galleryUrls?.length || 0) - 1}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-xs font-medium text-white/90">
                                {galleryIndex + 1} / {item.galleryUrls?.length}
                            </div>
                        </>
                    )}
                    
                    {/* Floating Source Search for Image */}
                    <button 
                        onClick={handleSauceSearch}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-app-accent text-white p-2 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 group/sauce"
                        title="Find source for this specific image"
                    >
                        <ScanSearch className="w-4 h-4" />
                        <span className="text-xs font-medium max-w-0 overflow-hidden group-hover/sauce:max-w-[100px] transition-all duration-300 whitespace-nowrap">Find Source</span>
                    </button>
                </>
            )}
            </div>
        ) : null}

        {/* Content/Info Sidebar (Right/Bottom) - Expands for text posts */}
        <div className={`${isTextPost ? 'w-full' : 'w-full md:w-[450px] lg:w-[500px]'} bg-app-surface border-l border-app-border flex flex-col h-full overflow-y-auto`}>
          
          {/* Header User Info */}
          <div className="p-6 border-b border-app-border flex items-center gap-3 sticky top-0 bg-app-surface/95 backdrop-blur z-10">
             <div className="w-10 h-10 rounded-full bg-app-accent flex items-center justify-center text-sm font-bold text-white uppercase shadow-md flex-shrink-0">
                {item.author.name ? item.author.name[0] : '?'}
             </div>
             <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-app-text text-sm hover:underline cursor-pointer truncate">{item.author.name}</h3>
                <div className="flex items-center gap-2 text-xs text-app-muted">
                    <span className="truncate">{item.author.handle}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                </div>
             </div>
             <button className="text-xs font-semibold bg-app-text text-app-bg px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
                Follow
             </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
             <div className="p-6 pb-2">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-app-muted border border-app-border px-2 py-0.5 rounded">
                        {item.source}
                    </span>
                </div>

                <h2 className="text-xl font-bold text-app-text mb-4 leading-snug">
                    {item.caption}
                </h2>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                        {item.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-app-bg text-app-muted px-2 py-1 rounded-md border border-app-border flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                
                {/* Related Threads (Correlation Engine) */}
                {relatedThreads.length > 0 && (
                    <div className="mb-6 bg-app-accent/10 border border-app-accent/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-app-accent uppercase mb-2">
                            <GitBranch className="w-3 h-3" />
                            <span>Related Discussions</span>
                        </div>
                        <div className="space-y-2">
                            {relatedThreads.map(thread => (
                                <a 
                                    key={thread.id} 
                                    href={thread.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center justify-between text-sm p-2 bg-app-surface rounded hover:bg-app-surface-hover transition-colors group"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Link2 className="w-3.5 h-3.5 text-app-muted flex-shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="truncate text-app-text group-hover:underline">{thread.title}</span>
                                            <span className="text-[10px] text-app-muted">{thread.subreddit} • {thread.type}</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-app-muted -ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Full Body Text (Markdown-ish) */}
                {fullBody && (
                    <div className="prose prose-invert prose-sm max-w-none text-app-muted/90 mb-8 whitespace-pre-wrap leading-relaxed border-l-2 border-app-border pl-4">
                        {fullBody}
                    </div>
                )}
             </div>

             {/* Comments Section */}
             <div className="border-t border-app-border/50 bg-app-bg/30 min-h-[200px] p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-semibold text-app-muted uppercase tracking-wider">Comments</h4>
                    {isLoadingContext && <Loader2 className="w-4 h-4 animate-spin text-app-muted" />}
                </div>

                {comments.length > 0 ? (
                    <div className="space-y-5">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 text-sm group">
                                <div className="w-7 h-7 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400">
                                    {comment.author[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-semibold text-xs text-app-text hover:underline cursor-pointer">{comment.author}</span>
                                        <span className="text-[10px] text-app-muted/60">{new Intl.NumberFormat('en-US', { notation: "compact" }).format(comment.score)} pts</span>
                                    </div>
                                    <p className="text-app-muted text-xs mt-1 leading-relaxed">{comment.body}</p>
                                    
                                    {/* Shallow Reply Rendering */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-2 pl-3 border-l-2 border-app-border/50 space-y-2">
                                            {comment.replies.slice(0, 2).map(reply => (
                                                <div key={reply.id} className="text-xs text-app-muted/80">
                                                    <span className="font-bold text-app-muted/60 mr-1">{reply.author}</span>
                                                    {reply.body}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-app-muted/50 text-sm">
                        {isLoadingContext ? "Fetching discussion..." : "No comments found."}
                    </div>
                )}
             </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-app-border bg-app-surface-hover/30 z-10">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-app-text hover:text-red-400 transition-colors">
                     <Heart className="w-5 h-5" />
                     <span className="text-sm font-semibold">{new Intl.NumberFormat('en-US', { notation: "compact" }).format(item.likes)}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-app-text hover:text-blue-400 transition-colors">
                     <MessageCircle className="w-5 h-5" />
                     <span className="text-sm font-semibold">{comments.length > 0 ? comments.length + "+" : "0"}</span>
                  </button>
                  <button className="text-app-text hover:text-app-accent transition-colors">
                     <Share2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
            
            <a 
                href={item.mediaUrl || item.permalink ? `https://reddit.com${item.permalink}` : '#'} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-app-bg hover:bg-app-bg/80 border border-app-border text-app-text py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
                <span>View Original Source</span>
                <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};