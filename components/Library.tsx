
import React, { useState } from 'react';
import { LibraryItem } from '../types';
import { DEMO_LIBRARY } from '../services/fixtures';
import { Book, FileText, Video, Search, Filter, Play, CheckCircle2, Clock, Inbox, ChevronRight } from 'lucide-react';

interface LibraryProps {
    onOpenReader: (item: LibraryItem) => void;
}

export const Library: React.FC<LibraryProps> = ({ onOpenReader }) => {
    const [items] = useState<LibraryItem[]>(DEMO_LIBRARY);
    const [filter, setFilter] = useState<'all' | 'reading' | 'inbox' | 'completed'>('all');

    const filteredItems = items.filter(i => filter === 'all' || i.status === filter);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'book': return <Book className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'reading': return 'text-app-accent border-app-accent';
            case 'completed': return 'text-green-500 border-green-500';
            case 'inbox': return 'text-app-muted border-app-border';
            default: return 'text-app-muted';
        }
    };

    return (
        <div className="h-screen bg-app-bg text-app-text flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-app-border flex items-center justify-between bg-app-bg/50 backdrop-blur-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Book className="w-6 h-6 text-app-accent" />
                        Library
                    </h1>
                    <p className="text-sm text-app-muted mt-1">Manage documents, books, and videos.</p>
                </div>
                
                <div className="flex items-center gap-4">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted" />
                        <input 
                            type="text" 
                            placeholder="Search library..."
                            className="bg-app-surface border border-app-border rounded-full pl-9 pr-4 py-2 text-sm focus:border-app-accent outline-none w-64"
                        />
                    </div>
                    <div className="flex bg-app-surface rounded-lg p-1 border border-app-border">
                        {(['all', 'inbox', 'reading', 'completed'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-app-bg shadow-sm text-app-text' : 'text-app-muted hover:text-app-text'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => onOpenReader(item)}
                            className="group bg-app-surface border border-app-border rounded-xl overflow-hidden cursor-pointer hover:border-app-accent/50 hover:shadow-lg hover:shadow-app-accent/5 transition-all duration-300 flex flex-col h-[320px]"
                        >
                            {/* Cover Image Area */}
                            <div className="h-40 bg-app-bg relative overflow-hidden">
                                {item.coverUrl ? (
                                    <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-app-surface to-app-bg">
                                        <Book className="w-12 h-12 text-app-muted/20" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase text-white flex items-center gap-1.5 border border-white/10">
                                    {getTypeIcon(item.type)}
                                    <span>{item.type}</span>
                                </div>
                                <div className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase border bg-black/60 backdrop-blur-md ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </div>
                                
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 font-medium text-sm flex items-center gap-2">
                                        Open Reader <ChevronRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-app-text line-clamp-2 leading-tight mb-1 group-hover:text-app-accent transition-colors">{item.title}</h3>
                                <p className="text-xs text-app-muted mb-3 font-medium">{item.author}</p>
                                
                                <p className="text-xs text-app-muted/80 line-clamp-3 mb-4 flex-1">
                                    {item.summary}
                                </p>
                                
                                <div className="flex items-center justify-between text-[10px] text-app-muted pt-3 border-t border-app-border/50">
                                    <div className="flex gap-2">
                                        {item.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="bg-app-bg border border-app-border px-1.5 py-0.5 rounded">#{tag}</span>
                                        ))}
                                    </div>
                                    <span>{new Date(item.addedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
