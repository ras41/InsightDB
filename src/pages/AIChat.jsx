import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Info, Bot, User, PlusCircle, Send, MessageSquare, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/** Lightweight markdown renderer for AI responses */
function renderMarkdown(text) {
    if (!text) return null;

    // Split by code blocks first
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, i) => {
        // Fenced code block
        if (part.startsWith('```')) {
            const match = part.match(/^```(\w*)?\n?([\s\S]*?)```$/);
            const lang = match?.[1] || '';
            const code = match?.[2]?.trim() || part.slice(3, -3).trim();
            return (
                <div key={i} className="my-3 rounded-2xl overflow-hidden bg-[#0f172a] shadow-lg">
                    {lang && <div className="px-4 py-1.5 bg-white/5 text-[10px] font-black text-brand uppercase tracking-widest">{lang}</div>}
                    <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed text-green-300 font-mono">{code}</pre>
                </div>
            );
        }

        // Process inline markdown line by line
        const lines = part.split('\n');
        return lines.map((line, j) => {
            const key = `${i}-${j}`;

            // Empty line = paragraph break
            if (line.trim() === '') return <div key={key} className="h-2" />;

            // Heading ### / ## / #
            const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                const headingText = renderInline(headingMatch[2]);
                if (level === 1) return <h3 key={key} className="text-lg font-black text-[#0f172a] mt-3 mb-1">{headingText}</h3>;
                if (level === 2) return <h4 key={key} className="text-base font-black text-[#0f172a] mt-2 mb-1">{headingText}</h4>;
                return <h5 key={key} className="text-sm font-black text-[#0f172a] mt-2 mb-1">{headingText}</h5>;
            }

            // Bullet points (• or - or *)
            const bulletMatch = line.match(/^\s*[•\-*]\s+(.+)$/);
            if (bulletMatch) {
                return (
                    <div key={key} className="flex gap-3 items-start ml-1 my-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                        <span>{renderInline(bulletMatch[1])}</span>
                    </div>
                );
            }

            // Numbered list
            const numMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
            if (numMatch) {
                return (
                    <div key={key} className="flex gap-3 items-start ml-1 my-0.5">
                        <span className="text-brand font-black text-xs mt-0.5 shrink-0">{numMatch[1]}.</span>
                        <span>{renderInline(numMatch[2])}</span>
                    </div>
                );
            }

            // Regular line
            return <span key={key}>{renderInline(line)}{'\n'}</span>;
        });
    });
}

/** Render inline markdown: **bold**, `code`, *italic* */
function renderInline(text) {
    // Split by inline patterns
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
    return parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) {
            return <strong key={i} className="font-black text-[#0f172a]">{p.slice(2, -2)}</strong>;
        }
        if (p.startsWith('`') && p.endsWith('`')) {
            return <code key={i} className="bg-brand/10 text-brand font-mono text-[13px] px-1.5 py-0.5 rounded-md font-bold">{p.slice(1, -1)}</code>;
        }
        if (p.startsWith('*') && p.endsWith('*')) {
            return <em key={i}>{p.slice(1, -1)}</em>;
        }
        return p;
    });
}

export default function AIChat() {
    const navigate = useNavigate();
    const { activeConnection } = useConnection();
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm your data assistant. I can help you analyze schemas, write SQL, or interpret trends. What's on your mind?",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const res = await chatAPI.sendMessage({
                message: userMessage,
                connectionId: activeConnection?.id,
                sessionId: sessionId,
            });
            const data = res.data.data;
            setMessages(prev => [...prev, { role: 'assistant', content: data.message?.content || data.response || 'No response' }]);
            if (data.sessionId) setSessionId(data.sessionId);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to get AI response');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const startNewChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: "Hello! I'm your data assistant. I can help you analyze schemas, write SQL, or interpret trends. What's on your mind?",
            },
        ]);
        setSessionId(null);
    };

    const handleSuggestion = (text) => {
        setInput(text);
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-white">
            {/* Mobile Header */}
            <div className="flex lg:hidden items-center px-6 py-8 border-b border-insight-border bg-white sticky top-0 z-20">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-insight-text">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="flex-1 text-center font-black text-lg text-insight-text">Data Intelligence</h1>
                <button onClick={startNewChat} className="p-2 text-brand">
                    <PlusCircle size={24} />
                </button>
            </div>

            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto px-6 py-8 lg:p-12 space-y-10 custom-scrollbar pb-40">
                    {messages.map((msg, idx) => (
                        msg.role === 'assistant' ? (
                            <div key={idx} className="flex gap-5 max-w-[85%]">
                                <div className="w-12 h-12 shrink-0 bg-brand rounded-[20px] flex items-center justify-center text-white shadow-elevated">
                                    <Bot size={28} fill="currentColor" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-insight-muted uppercase tracking-[0.2em] ml-1">Insight AI Agent</p>
                                    <div className="bg-[#f1f5f9] rounded-[28px] rounded-tl-none p-6 text-[#1e293b] text-[15px] font-medium leading-relaxed shadow-sm">
                                        {renderMarkdown(msg.content)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key={idx} className="flex flex-row-reverse gap-5 ml-auto max-w-[85%]">
                                <div className="w-12 h-12 shrink-0">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`} alt="user" className="w-12 h-12 rounded-full border-2 border-white shadow-md ring-4 ring-brand/5" />
                                </div>
                                <div className="space-y-3 flex flex-col items-end">
                                    <p className="text-[10px] font-black text-insight-muted uppercase tracking-[0.2em] mr-1">{user?.fullName || 'You'}</p>
                                    <div className="bg-brand rounded-[28px] rounded-tr-none p-6 text-white text-[16px] font-medium leading-relaxed shadow-elevated whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                    {loading && (
                        <div className="flex gap-5 max-w-[85%]">
                            <div className="w-12 h-12 shrink-0 bg-brand rounded-[20px] flex items-center justify-center text-white shadow-elevated">
                                <Bot size={28} fill="currentColor" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-insight-muted uppercase tracking-[0.2em] ml-1">Thinking...</p>
                                <div className="bg-[#f1f5f9] rounded-[28px] rounded-tl-none p-6 shadow-sm">
                                    <div className="flex gap-2">
                                        <div className="w-2.5 h-2.5 bg-brand/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2.5 h-2.5 bg-brand/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2.5 h-2.5 bg-brand/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Dock */}
                <div className="p-6 lg:p-10 bg-gradient-to-t from-white via-white/95 to-transparent pt-20">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                            <button
                                onClick={() => handleSuggestion('Show me the schema of my tables')}
                                className="flex items-center gap-3 px-6 py-3 bg-white border border-insight-border rounded-2xl whitespace-nowrap text-xs font-black uppercase tracking-wider hover:bg-insight-bg transition-all shadow-sm"
                            >
                                <MessageSquare size={16} className="text-brand" fill="currentColor" />
                                Table Schema Insight
                            </button>
                            <button
                                onClick={() => handleSuggestion('Give me optimization tips for my database')}
                                className="flex items-center gap-3 px-6 py-3 bg-white border border-insight-border rounded-2xl whitespace-nowrap text-xs font-black uppercase tracking-wider hover:bg-insight-bg transition-all shadow-sm"
                            >
                                <Bot size={16} className="text-indigo-600" fill="currentColor" />
                                Optimization Tips
                            </button>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-brand/5 blur-2xl rounded-3xl group-focus-within:bg-brand/10 transition-colors"></div>
                            <div className="relative premium-card !rounded-[28px] flex items-center p-3 bg-white border border-insight-border shadow-xl">
                                <button onClick={startNewChat} className="p-4 text-[#94a3b8] hover:text-brand transition-colors">
                                    <PlusCircle size={32} />
                                </button>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask InsightDB anything about your data..."
                                    className="flex-1 bg-transparent py-5 px-3 focus:outline-none text-[16px] font-bold text-insight-text placeholder:text-slate-400 placeholder:font-medium"
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="w-16 h-16 bg-[#0f172a] text-white rounded-[22px] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none ring-4 ring-brand/5 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={28} className="animate-spin" /> : <Send size={28} className="ml-1" fill="currentColor" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
