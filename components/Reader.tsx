
import React, { useState, useRef, useEffect } from 'react';
import { LibraryItem, Highlight } from '../types';
import { ArrowLeft, Highlighter, MessageSquare, BookOpen, Send, Sparkles, X, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ReaderProps {
    item: LibraryItem;
    onBack: () => void;
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export const Reader: React.FC<ReaderProps> = ({ item, onBack }) => {
    const [activeTab, setActiveTab] = useState<'content' | 'chat'>('content');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsThinking(true);

        try {
            // Correct initialization using process.env.API_KEY
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Build context from item
            const context = `
                You are a helpful reading assistant. You are answering questions about the following document:
                Title: ${item.title}
                Author: ${item.author}
                Summary: ${item.summary}
                
                Content/Excerpt:
                ${item.content || "No full content available, rely on summary and general knowledge."}
                
                Highlights made by user:
                ${item.highlights.map(h => `- ${h.text} (Note: ${h.note || ''})`).join('\n')}
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [
                    { role: 'user', parts: [{ text: context }] }, // Context injection
                    ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), // History
                    { role: 'user', parts: [{ text: userMsg }] } // Current Query
                ],
                config: {
                    systemInstruction: "Answer concisely and reference the text where possible."
                }
            });

            const text = response.text || "I couldn't generate a response.";
            setMessages(prev => [...prev, { role: 'model', text }]);

        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="h-screen bg-app-bg text-app-text flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Top Bar */}
            <div className="h-14 border-b border-app-border flex items-center justify-between px-4 bg-app-surface/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-app-bg rounded-full text-app-muted hover:text-app-text transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-bold text-sm leading-tight">{item.title}</h2>
                        <p className="text-xs text-app-muted">{item.author}</p>
                    </div>
                </div>
                
                <div className="flex bg-app-bg rounded-lg p-1 border border-app-border">
                    <button 
                        onClick={() => setActiveTab('content')}
                        className={`px-4 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-colors ${activeTab === 'content' ? 'bg-app-surface text-app-text shadow-sm' : 'text-app-muted hover:text-app-text'}`}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-colors ${activeTab === 'chat' ? 'bg-app-surface text-app-text shadow-sm' : 'text-app-muted hover:text-app-text'}`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Chat</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                
                {/* Main Content Area */}
                <div className={`flex-1 overflow-y-auto p-8 lg:p-12 transition-all duration-300 ${activeTab === 'chat' ? 'hidden md:block w-1/2 border-r border-app-border' : 'w-full mx-auto max-w-4xl'}`}>
                    
                    {item.type === 'video' ? (
                        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden mb-8">
                             <iframe 
                                width="100%" 
                                height="100%" 
                                src={`https://www.youtube.com/embed/${item.sourceUrl?.split('v=')[1]}`} 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-lg max-w-none">
                            {/* Mock Content Display */}
                            <h1>{item.title}</h1>
                            <p className="lead">{item.summary}</p>
                            <hr className="border-app-border" />
                            {item.content ? (
                                <div className="whitespace-pre-wrap font-serif leading-loose text-app-text/90">
                                    {item.content}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-app-muted border-2 border-dashed border-app-border rounded-xl">
                                    <p>Full text content not available for this demo item.</p>
                                    <p className="text-sm mt-2">However, the AI can still chat about the summary and metadata.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Highlights Section (Bottom of content) */}
                    <div className="mt-12 pt-8 border-t border-app-border">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Highlighter className="w-4 h-4 text-app-accent" />
                            Highlights & Notes
                        </h3>
                        <div className="space-y-4">
                            {item.highlights.map(h => (
                                <div key={h.id} className="bg-app-surface/50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                                    <p className="font-serif italic text-app-text/90 mb-2">"{h.text}"</p>
                                    {h.note && (
                                        <div className="text-xs text-app-muted flex items-center gap-2 mt-2">
                                            <MessageSquare className="w-3 h-3" />
                                            {h.note}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {item.highlights.length === 0 && <p className="text-sm text-app-muted italic">No highlights yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Chat Sidebar (Visible when Chat tab is active) */}
                {(activeTab === 'chat' || window.innerWidth > 1024) && (
                    <div className={`w-full md:w-[400px] lg:w-[450px] bg-app-surface border-l border-app-border flex flex-col ${activeTab === 'content' ? 'hidden lg:flex' : ''}`}>
                        <div className="p-4 border-b border-app-border flex items-center gap-2 bg-app-surface">
                            <Sparkles className="w-4 h-4 text-app-accent" />
                            <span className="font-bold text-sm">Ask Gemini</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center py-10 px-4 text-app-muted text-sm">
                                    <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                    <p>Ask questions about this document.</p>
                                    <div className="mt-4 space-y-2">
                                        <button onClick={() => setInput("Summarize the key takeaways")} className="block w-full text-xs bg-app-bg hover:bg-app-accent/10 hover:text-app-accent border border-app-border p-2 rounded transition-colors">
                                            "Summarize the key takeaways"
                                        </button>
                                        <button onClick={() => setInput("What is the author's main argument?")} className="block w-full text-xs bg-app-bg hover:bg-app-accent/10 hover:text-app-accent border border-app-border p-2 rounded transition-colors">
                                            "What is the author's main argument?"
                                        </button>
                                    </div>
                                </div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                        ? 'bg-app-accent text-white rounded-br-none' 
                                        : 'bg-app-bg border border-app-border text-app-text rounded-bl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-app-bg border border-app-border rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-app-muted rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-app-muted rounded-full animate-bounce delay-150" />
                                        <div className="w-1.5 h-1.5 bg-app-muted rounded-full animate-bounce delay-300" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-app-border bg-app-surface">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask a question..."
                                    className="w-full bg-app-bg border border-app-border rounded-full pl-4 pr-12 py-3 text-sm focus:border-app-accent focus:outline-none focus:ring-1 focus:ring-app-accent"
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || isThinking}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-app-accent text-white rounded-full hover:bg-app-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
