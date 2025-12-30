
import React, { useState, useEffect } from 'react';
import { FilterState, SavedBoard, Theme, AppView, IdentityProfile } from '../types';
import { getIdentityGraph } from '../services/contentGraph';
import { User, Globe, Hash, Plus, LayoutGrid, Radio, CheckCircle2, Bookmark, Trash2, ArrowRight, Moon, Sparkles, Settings, Eye, EyeOff, Hash as HashIcon, X, PenTool, ShoppingCart, BookOpen, Library as LibraryIcon } from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isMobileOpen: boolean;
  savedBoards: SavedBoard[];
  onSelectBoard: (board: SavedBoard) => void;
  onDeleteBoard: (id: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onViewChange: (view: AppView) => void;
  currentView: AppView;
  followedTags: string[];
  setFollowedTags: React.Dispatch<React.SetStateAction<string[]>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  filters, 
  setFilters, 
  isMobileOpen,
  savedBoards,
  onSelectBoard,
  onDeleteBoard,
  theme,
  setTheme,
  onViewChange,
  currentView,
  followedTags,
  setFollowedTags
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [identities, setIdentities] = useState<Record<string, IdentityProfile>>({});

  useEffect(() => {
    // Sync with global graph
    setIdentities(getIdentityGraph());
    
    // Listen for graph updates from the EntityManager
    const handleUpdate = () => setIdentities(getIdentityGraph());
    window.addEventListener('lumina_graph_update', handleUpdate);
    return () => window.removeEventListener('lumina_graph_update', handleUpdate);
  }, []);
  
  const togglePerson = (person: string) => {
    onViewChange('feed');
    setFilters(prev => {
      const exists = prev.persons.includes(person);
      return {
        ...prev,
        persons: exists ? prev.persons.filter(p => p !== person) : [...prev.persons, person]
      };
    });
  };

  const toggleTag = (tag: string) => {
    onViewChange('feed');
    setFilters(prev => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      };
    });
  };

  const handleAddTag = () => {
      if (!newTagInput.trim()) return;
      let tag = newTagInput.trim();
      if (!tag.startsWith('#')) tag = '#' + tag;
      
      if (!followedTags.includes(tag)) {
          setFollowedTags(prev => [...prev, tag]);
      }
      setNewTagInput('');
  };

  const removeFollowedTag = (tag: string) => {
      setFollowedTags(prev => prev.filter(t => t !== tag));
      setFilters(prev => ({
          ...prev,
          tags: prev.tags.filter(t => t !== tag)
      }));
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-app-bg border-r border-app-border transform transition-transform duration-300 ease-in-out
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="h-full overflow-y-auto no-scrollbar p-6 flex flex-col">
        
        {/* Logo Area */}
        <div 
          className="flex items-center gap-3 mb-10 cursor-pointer"
          onClick={() => onViewChange('feed')}
        >
          <div className="w-8 h-8 bg-app-text rounded flex items-center justify-center shadow-lg">
            <LayoutGrid className="w-5 h-5 text-app-bg" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-app-text">Lumina</h1>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-8 flex-1">

          {/* Knowledge Base */}
          <div>
            <div className="flex items-center justify-between mb-2 text-xs font-semibold text-app-muted uppercase tracking-wider">
               <span>Knowledge OS</span>
            </div>
            <div className="space-y-1">
                <button
                    onClick={() => onViewChange('drafts')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                    ${currentView === 'drafts' 
                        ? 'bg-app-surface text-app-text shadow-sm border border-app-border' 
                        : 'text-app-muted hover:text-app-text hover:bg-app-surface-hover'
                    }
                    `}
                >
                    <PenTool className="w-4 h-4" />
                    <span>Drafts & Notes</span>
                </button>
                 <button
                    onClick={() => onViewChange('library')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                    ${currentView === 'library' || currentView === 'reader'
                        ? 'bg-app-surface text-app-text shadow-sm border border-app-border' 
                        : 'text-app-muted hover:text-app-text hover:bg-app-surface-hover'
                    }
                    `}
                >
                    <LibraryIcon className="w-4 h-4" />
                    <span>Library & Reader</span>
                </button>
            </div>
          </div>

          {/* Persons Section - REFACTORED */}
          <div>
            <div className="flex items-center justify-between mb-4 text-xs font-semibold text-app-muted uppercase tracking-wider">
              <span>Following Persons</span>
              <User className="w-3 h-3" />
            </div>
            <ul className="space-y-2">
              {(Object.values(identities) as IdentityProfile[]).map(profile => {
                const isActive = filters.persons.includes(profile.name) && currentView === 'feed';
                return (
                  <li key={profile.id}>
                    <button
                      onClick={() => togglePerson(profile.name)}
                      className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-xl text-sm transition-all duration-200 group
                        ${isActive 
                          ? 'bg-app-surface text-app-text shadow-md border border-app-border scale-[1.02]' 
                          : 'text-app-muted/60 hover:text-app-muted hover:bg-app-surface-hover/50'
                        }
                      `}
                    >
                      <div className="relative">
                        <img 
                          src={profile.avatarUrl} 
                          alt={profile.name} 
                          className={`w-7 h-7 rounded-full object-cover border transition-all ${isActive ? 'border-app-accent' : 'border-app-border grayscale opacity-50'}`} 
                        />
                        {isActive && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-app-accent rounded-full border-2 border-app-surface animate-pulse" />}
                      </div>
                      <span className={`font-medium flex-1 text-left ${!isActive ? 'opacity-70' : ''}`}>{profile.name}</span>
                      {isActive ? (
                        <CheckCircle2 className="w-4 h-4 text-app-accent" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-app-border/30 group-hover:border-app-muted transition-colors" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Tags Section */}
          <div>
            <div className="flex items-center justify-between mb-4 text-xs font-semibold text-app-muted uppercase tracking-wider">
               <span>Following Topics</span>
               <HashIcon className="w-3 h-3" />
            </div>
            
            <ul className="space-y-1 mb-3">
               {followedTags.map(tag => {
                   const isActive = filters.tags.includes(tag) && currentView === 'feed';
                   return (
                       <li key={tag} className="group relative">
                           <button
                             onClick={() => toggleTag(tag)}
                             className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200
                               ${isActive 
                                 ? 'bg-app-surface text-app-text shadow-sm border border-app-border' 
                                 : 'text-app-muted/60 hover:text-app-muted hover:bg-app-surface-hover/50'
                               }
                             `}
                           >
                             <div className={`flex items-center gap-3 transition-all ${!isActive ? 'opacity-80' : ''}`}>
                                <Hash className="w-3.5 h-3.5" />
                                <span className={!isActive ? 'line-through decoration-app-muted/50 decoration-2' : ''}>{tag}</span>
                             </div>
                             {isActive ? (
                                <Eye className="w-3.5 h-3.5 text-app-accent" />
                             ) : (
                                <EyeOff className="w-3.5 h-3.5 text-app-muted/40 group-hover:text-app-muted/70 transition-colors" />
                             )}
                           </button>
                           <button 
                                onClick={(e) => { e.stopPropagation(); removeFollowedTag(tag); }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-app-muted/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                           </button>
                       </li>
                   );
               })}
            </ul>

            <div className="relative">
                <input 
                    type="text" 
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add tag..." 
                    className="w-full bg-app-bg border border-app-border rounded-lg pl-3 pr-8 py-1.5 text-xs focus:border-app-accent focus:outline-none placeholder:text-app-muted/50"
                />
                <button 
                    onClick={handleAddTag}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-accent transition-colors"
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
          </div>

          {/* Saved Boards Section */}
          {savedBoards.length > 0 && (
            <div className="animate-in slide-in-from-left-2 duration-300">
              <div className="flex items-center justify-between mb-4 text-xs font-semibold text-app-accent uppercase tracking-wider">
                <span>My Boards</span>
                <Bookmark className="w-3 h-3" />
              </div>
              <ul className="space-y-1">
                {savedBoards.map(board => (
                  <li key={board.id} className="group relative">
                    <button
                      onClick={() => { onSelectBoard(board); onViewChange('feed'); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-app-muted hover:text-app-text hover:bg-app-surface transition-all"
                    >
                      <span className="truncate">{board.name}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteBoard(board.id); }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-app-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
        </div>

        {/* Footer & Theme Switcher */}
        <div className="pt-6 border-t border-app-border space-y-4">
          
          <div className="bg-app-surface rounded-lg p-1 flex">
            <button
              onClick={() => setTheme('default')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all
                ${theme === 'default' 
                  ? 'bg-app-border text-white shadow-sm' 
                  : 'text-app-muted hover:text-app-text'
                }
              `}
            >
              <Moon className="w-3 h-3" />
              <span>Midnight</span>
            </button>
            <button
              onClick={() => setTheme('kanagawa')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all
                ${theme === 'kanagawa' 
                  ? 'bg-[#98BB6C] text-[#181616] shadow-sm' 
                  : 'text-app-muted hover:text-app-text'
                }
              `}
            >
              <Sparkles className="w-3 h-3" />
              <span>Dragon</span>
            </button>
          </div>
          
          <button
              onClick={() => onViewChange('admin')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-app-muted hover:text-app-text hover:bg-app-surface-hover transition-colors"
          >
              <Settings className="w-3.5 h-3.5" />
              <span>Manage Entity Graph</span>
          </button>

          <div className="text-[10px] text-app-muted px-3">
            <p>© 2024 Lumina Feed</p>
          </div>
        </div>

      </div>
    </aside>
  );
};
