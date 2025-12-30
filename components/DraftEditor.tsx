
import React, { useState, useEffect } from 'react';
import { Draft, DraftStatus, DraftType } from '../types';
import { DEMO_DRAFTS } from '../services/fixtures';
import { Search, Plus, PenTool, FileText, Video, Save, Clock, Tag } from 'lucide-react';

export const DraftEditor = () => {
    const [drafts, setDrafts] = useState<Draft[]>(() => {
        const saved = localStorage.getItem('lumina_drafts');
        return saved ? JSON.parse(saved) : DEMO_DRAFTS;
    });
    
    const [selectedDraftId, setSelectedDraftId] = useState<string | null>(drafts[0]?.id || null);
    
    useEffect(() => {
        localStorage.setItem('lumina_drafts', JSON.stringify(drafts));
    }, [drafts]);

    const activeDraft = drafts.find(d => d.id === selectedDraftId);

    const handleUpdateContent = (content: string) => {
        if (!selectedDraftId) return;
        setDrafts(drafts.map(d => d.id === selectedDraftId ? { ...d, content, lastModified: Date.now() } : d));
    };

    const handleCreateDraft = () => {
        const newDraft: Draft = {
            id: `draft-${Date.now()}`,
            title: 'Untitled Note',
            content: '# New Note\n\nStart writing...',
            status: 'idea',
            type: 'wisdom',
            lastModified: Date.now(),
            tags: []
        };
        setDrafts([newDraft, ...drafts]);
        setSelectedDraftId(newDraft.id);
    };

    return (
        <div className="flex h-screen bg-app-bg text-app-text">
            
            {/* Draft List Sidebar */}
            <div className="w-80 border-r border-app-border flex flex-col bg-app-surface/30">
                <div className="p-4 border-b border-app-border flex items-center justify-between">
                    <h2 className="font-bold flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-app-accent" />
                        <span>Drafts</span>
                    </h2>
                    <button onClick={handleCreateDraft} className="p-1.5 bg-app-accent text-white rounded hover:bg-app-accent-hover transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="p-2 overflow-y-auto flex-1 space-y-1">
                    {drafts.map(draft => (
                        <div 
                            key={draft.id}
                            onClick={() => setSelectedDraftId(draft.id)}
                            className={`p-3 rounded cursor-pointer transition-colors border ${
                                selectedDraftId === draft.id 
                                ? 'bg-app-surface border-app-accent/50 shadow-sm' 
                                : 'border-transparent hover:bg-app-surface/50 text-app-muted'
                            }`}
                        >
                            <h3 className="font-medium text-sm truncate mb-1 text-app-text">{draft.title}</h3>
                            <div className="flex items-center justify-between text-[10px] text-app-muted/70">
                                <span className="capitalize">{draft.status}</span>
                                <span>{new Date(draft.lastModified).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {activeDraft ? (
                    <>
                        {/* Toolbar */}
                        <div className="h-14 border-b border-app-border flex items-center justify-between px-6 bg-app-surface/50">
                             <input 
                                value={activeDraft.title}
                                onChange={(e) => setDrafts(drafts.map(d => d.id === activeDraft.id ? { ...d, title: e.target.value } : d))}
                                className="bg-transparent text-lg font-bold focus:outline-none w-1/2"
                             />
                             <div className="flex items-center gap-4 text-xs text-app-muted">
                                 <div className="flex items-center gap-1.5 bg-app-bg px-2 py-1 rounded border border-app-border">
                                     {activeDraft.type === 'resource' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                     <span className="capitalize">{activeDraft.type}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                     <Clock className="w-3 h-3" />
                                     <span>Saved just now</span>
                                 </div>
                             </div>
                        </div>

                        {/* Text Area */}
                        <div className="flex-1 overflow-hidden flex">
                            <textarea 
                                value={activeDraft.content}
                                onChange={(e) => handleUpdateContent(e.target.value)}
                                className="flex-1 h-full bg-app-bg p-8 resize-none focus:outline-none font-mono text-sm leading-relaxed text-app-text/90"
                                placeholder="Start typing..."
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-app-muted">
                        Select a draft to edit
                    </div>
                )}
            </div>

        </div>
    );
};
