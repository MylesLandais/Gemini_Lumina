
import React, { useState, useEffect } from 'react';
import { AcquisitionTask, AcquisitionStatus } from '../types';
import { DEMO_TASKS } from '../services/fixtures';
import { Search, ShoppingCart, Check, ExternalLink, BookOpen, Filter, ArrowRight } from 'lucide-react';

export const AcquisitionBoard = () => {
    const [tasks, setTasks] = useState<AcquisitionTask[]>(() => {
        const saved = localStorage.getItem('lumina_acquisition_tasks');
        return saved ? JSON.parse(saved) : DEMO_TASKS;
    });

    useEffect(() => {
        localStorage.setItem('lumina_acquisition_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const handleStatusChange = (taskId: string, newStatus: AcquisitionStatus) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    // Helper to generate search URLs
    const getSearchUrls = (task: AcquisitionTask) => {
        const query = encodeURIComponent(`${task.resourceName} ${task.author || ''}`);
        return {
            anna: `https://annas-archive.org/search?q=${query}`,
            abebooks: `https://www.abebooks.com/servlet/SearchResults?tn=${encodeURIComponent(task.resourceName)}&an=${encodeURIComponent(task.author || '')}`,
            thriftbooks: `https://www.thriftbooks.com/browse/?b.search=${query}`,
            libgen: `https://libgen.is/search.php?req=${query}`,
            ebay: `https://www.ebay.com/sch/i.html?_nkw=${query}&_sacat=267` // Books category
        };
    };

    const StatusColumn = ({ status, label, icon }: { status: AcquisitionStatus, label: string, icon: React.ReactNode }) => {
        const items = tasks.filter(t => t.status === status);
        const totalPrice = items.reduce((sum, t) => sum + (t.estPrice || 0), 0);

        return (
            <div className="flex-1 min-w-[300px] flex flex-col bg-app-surface/20 rounded-xl border border-app-border overflow-hidden">
                <div className="p-4 border-b border-app-border bg-app-surface/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-app-text">
                        {icon}
                        <span>{label}</span>
                        <span className="bg-app-accent/20 text-app-accent text-xs px-2 py-0.5 rounded-full">{items.length}</span>
                    </div>
                    {totalPrice > 0 && <span className="text-xs text-app-muted">Est. ${totalPrice}</span>}
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                    {items.map(task => {
                        const urls = getSearchUrls(task);
                        return (
                            <div key={task.id} className="bg-app-bg border border-app-border p-4 rounded-lg shadow-sm hover:border-app-accent/50 transition-all group">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-sm text-app-text leading-tight">{task.resourceName}</h4>
                                    {task.priority === 'high' && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" title="High Priority" />}
                                </div>
                                <p className="text-xs text-app-muted mb-3">{task.author}</p>
                                
                                {status === 'searching' && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <a href={urls.anna} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 bg-app-surface hover:bg-app-accent hover:text-white px-2 py-1 rounded border border-app-border transition-colors">
                                            Anna's
                                        </a>
                                        <a href={urls.thriftbooks} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 bg-app-surface hover:bg-green-600 hover:text-white px-2 py-1 rounded border border-app-border transition-colors">
                                            Thrift
                                        </a>
                                        <a href={urls.abebooks} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 bg-app-surface hover:bg-red-500 hover:text-white px-2 py-1 rounded border border-app-border transition-colors">
                                            Abe
                                        </a>
                                        <a href={urls.ebay} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 bg-app-surface hover:bg-blue-500 hover:text-white px-2 py-1 rounded border border-app-border transition-colors">
                                            eBay
                                        </a>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-app-border/50">
                                    <span className="text-xs font-mono text-app-muted/70">{task.estPrice ? `$${task.estPrice}` : 'Free'}</span>
                                    
                                    <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                        {status !== 'searching' && (
                                            <button onClick={() => handleStatusChange(task.id, 'searching')} className="p-1 hover:bg-app-surface rounded" title="Move to Searching">
                                                <Search className="w-3 h-3" />
                                            </button>
                                        )}
                                        {status !== 'ordered' && (
                                            <button onClick={() => handleStatusChange(task.id, 'ordered')} className="p-1 hover:bg-app-surface rounded" title="Move to Ordered">
                                                <ShoppingCart className="w-3 h-3" />
                                            </button>
                                        )}
                                        {status !== 'acquired' && (
                                            <button onClick={() => handleStatusChange(task.id, 'acquired')} className="p-1 hover:bg-app-surface rounded" title="Mark Acquired">
                                                <Check className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {items.length === 0 && (
                        <div className="text-center py-10 text-app-muted/30 text-xs italic">
                            No items
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen bg-app-bg text-app-text flex flex-col">
            <div className="p-6 border-b border-app-border flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6 text-app-accent" />
                        Acquisition List
                    </h1>
                    <p className="text-sm text-app-muted mt-1">Track and source resources found in your feed drafts.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-app-surface border border-app-border rounded-lg text-sm hover:bg-app-surface-hover">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-x-auto p-6">
                <div className="flex gap-6 h-full pb-4">
                    <StatusColumn status="wishlist" label="Wishlist" icon={<BookOpen className="w-4 h-4" />} />
                    <StatusColumn status="searching" label="Sourcing / Searching" icon={<Search className="w-4 h-4" />} />
                    <StatusColumn status="ordered" label="Ordered" icon={<ShoppingCart className="w-4 h-4" />} />
                    <StatusColumn status="acquired" label="Library / Acquired" icon={<Check className="w-4 h-4" />} />
                </div>
            </div>
        </div>
    );
};
