import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Info, Bot, User, PlusCircle, Send, MessageSquare, Loader2, History, Trash2, Copy, Check, Play, Table, X, ChevronDown, Database, Sparkles, Zap, Search as SearchIcon, Code, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, queryAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

/** Lightweight markdown renderer for AI responses */
function renderMarkdown(text) {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
        if (part.startsWith('```')) {
            const match = part.match(/^```(\w*)?\n?([\s\S]*?)```$/);
            const lang = match?.[1] || '';
            const code = match?.[2]?.trim() || part.slice(3, -3).trim();
            return (
                <div key={i} className="my-3 rounded-2xl overflow-hidden bg-[#0f172a] shadow-lg group/code relative">
                    {lang && <div className="px-4 py-1.5 bg-white/5 text-[10px] font-black text-brand uppercase tracking-widest">{lang}</div>}
                    <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed text-green-300 font-mono">{code}</pre>
                </div>
            );
        }
        const lines = part.split('\n');
        return lines.map((line, j) => {
            const key = `${i}-${j}`;
            if (line.trim() === '') return <div key={key} className="h-2" />;
            const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                const headingText = renderInline(headingMatch[2]);
                if (level === 1) return <h3 key={key} className="text-lg font-black text-[#0f172a] mt-3 mb-1">{headingText}</h3>;
                if (level === 2) return <h4 key={key} className="text-base font-black text-[#0f172a] mt-2 mb-1">{headingText}</h4>;
                return <h5 key={key} className="text-sm font-black text-[#0f172a] mt-2 mb-1">{headingText}</h5>;
            }
            const bulletMatch = line.match(/^\s*[•\-*]\s+(.+)$/);
            if (bulletMatch) {
                return (
                    <div key={key} className="flex gap-3 items-start ml-1 my-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                        <span>{renderInline(bulletMatch[1])}</span>
                    </div>
                );
            }
            const numMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
            if (numMatch) {
                return (
                    <div key={key} className="flex gap-3 items-start ml-1 my-0.5">
                        <span className="text-brand font-black text-xs mt-0.5 shrink-0">{numMatch[1]}.</span>
                        <span>{renderInline(numMatch[2])}</span>
                    </div>
                );
            }
            return <span key={key}>{renderInline(line)}{'\n'}</span>;
        });
    });
}

function renderInline(text) {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
    return parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-black text-[#0f172a]">{p.slice(2, -2)}</strong>;
        if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="bg-brand/10 text-brand font-mono text-[13px] px-1.5 py-0.5 rounded-md font-bold">{p.slice(1, -1)}</code>;
        if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
        return p;
    });
}

/** Extract SQL code blocks from text */
function extractSQLBlocks(text) {
    const blocks = [];
    const regex = /```sql\n([\s\S]*?)```/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
        blocks.push(match[1].trim());
    }
    return blocks;
}

/** SQL Result Table Component */
function SQLResultTable({ result }) {
    const [expanded, setExpanded] = useState(false);
    if (!result) return null;

    if (result.error) {
        return (
            <div className="my-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-medium">
                <span className="font-black">Query Error:</span> {result.error}
            </div>
        );
    }

    if (!result.rows?.length) {
        return (
            <div className="my-3 p-4 bg-slate-50 border border-insight-border rounded-2xl text-sm text-insight-muted font-medium">
                Query returned 0 rows.
            </div>
        );
    }

    const cols = result.columns || Object.keys(result.rows[0]);
    const displayRows = expanded ? result.rows : result.rows.slice(0, 10);

    return (
        <div className="my-3 rounded-2xl overflow-hidden border border-insight-border shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-[#f8fafc] border-b border-insight-border">
                <div className="flex items-center gap-2 text-[10px] font-black text-insight-muted uppercase tracking-widest">
                    <Table size={12} className="text-brand" />
                    {result.rowCount} row{result.rowCount !== 1 ? 's' : ''} • {cols.length} column{cols.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
                    <Check size={10} /> Executed
                </div>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0">
                        <tr className="bg-[#f1f5f9]">
                            {cols.map(col => (
                                <th key={col} className="text-left px-3 py-2 text-[10px] font-black text-insight-muted uppercase tracking-wider whitespace-nowrap border-b border-insight-border">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayRows.map((row, ri) => (
                            <tr key={ri} className="border-b border-insight-border/30 hover:bg-[#f8fafc]">
                                {cols.map(col => (
                                    <td key={col} className="px-3 py-2 text-[13px] text-[#1e293b] font-medium max-w-[250px] truncate whitespace-nowrap">
                                        {row[col] === null ? <span className="text-slate-300 italic">NULL</span> : typeof row[col] === 'object' ? JSON.stringify(row[col]).slice(0, 60) : String(row[col])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {result.rows.length > 10 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full py-2 text-xs font-bold text-brand bg-[#f8fafc] border-t border-insight-border hover:bg-brand/5 transition-colors"
                >
                    {expanded ? 'Show less' : `Show all ${result.rows.length} rows`}
                </button>
            )}
        </div>
    );
}

/** Copy button component */
function CopyButton({ text, className = '' }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className={clsx("p-1.5 rounded-lg transition-all", copied ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/50 hover:text-white hover:bg-white/20", className)}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
    );
}

const SUGGESTIONS = [
    { label: 'Show Tables', prompt: 'Show me all the tables in my database with their row counts', icon: Table, color: 'text-brand' },
    { label: 'Schema Analysis', prompt: 'Analyze my database schema and suggest improvements', icon: SearchIcon, color: 'text-indigo-600' },
    { label: 'Write a Query', prompt: 'Help me write a SQL query to', icon: Code, color: 'text-emerald-600' },
    { label: 'Data Quality', prompt: 'Check data quality across my tables — find nulls, duplicates, or anomalies', icon: Shield, color: 'text-amber-600' },
    { label: 'Sample Data', prompt: 'Show me sample data from my largest table', icon: Database, color: 'text-rose-600' },
    { label: 'Performance Tips', prompt: 'Give me optimization tips for my database queries and indexing', icon: Zap, color: 'text-purple-600' },
];

export default function AIChat() {
    const navigate = useNavigate();
    const { activeConnection } = useConnection();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Load sessions on mount
    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        setSessionsLoading(true);
        try {
            const res = await chatAPI.getSessions();
            setSessions(res.data.data || []);
        } catch (e) { /* ignore */ }
        finally { setSessionsLoading(false); }
    };

    const loadSession = async (sid) => {
        setSessionId(sid);
        setLoading(true);
        try {
            const res = await chatAPI.getHistory(sid);
            const msgs = (res.data.data || []).map(m => ({
                role: m.role,
                content: m.content,
                queryResults: m.metadata?.queryResults || [],
            }));
            setMessages(msgs);
        } catch (e) {
            toast.error('Failed to load chat history');
        } finally {
            setLoading(false);
            setShowSidebar(false);
        }
    };

    const deleteSession = async (sid, e) => {
        e.stopPropagation();
        try {
            await chatAPI.deleteSession(sid);
            setSessions(prev => prev.filter(s => s.sessionId !== sid));
            if (sessionId === sid) startNewChat();
            toast.success('Chat deleted');
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
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
            const content = data.message?.content || data.response || 'No response';
            const queryResults = data.queryResults || data.message?.metadata?.queryResults || [];
            setMessages(prev => [...prev, { role: 'assistant', content, queryResults }]);
            if (data.sessionId) setSessionId(data.sessionId);
            // Refresh sessions list
            loadSessions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to get AI response');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', queryResults: [] }]);
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
        setMessages([]);
        setSessionId(null);
    };

    const handleSuggestion = (text) => {
        setInput(text);
        inputRef.current?.focus();
    };

    // Manually run a SQL query from a code block
    const runQuery = async (sql) => {
        if (!activeConnection?.id) {
            toast.error('No database connected');
            return;
        }
        setLoading(true);
        try {
            const res = await queryAPI.execute({
                connectionId: activeConnection.id,
                query: sql,
            });
            const result = res.data.data;
            const rows = result.rows || [];
            const cols = rows.length > 0 ? Object.keys(rows[0]) : [];
            // Append result as a system message
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Query executed successfully — **${rows.length}** row${rows.length !== 1 ? 's' : ''} returned.`,
                queryResults: [{ sql, rows: rows.slice(0, 50), columns: cols, rowCount: rows.length }],
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Query execution failed.`,
                queryResults: [{ sql, error: err.response?.data?.message || err.message, rows: [] }],
            }]);
        } finally {
            setLoading(false);
        }
    };

    // Check if we're in the "empty / welcome" state
    const isWelcomeState = messages.length === 0 && !loading;

    return (
        <div className="flex-1 flex h-screen bg-white overflow-hidden">
            {/* Session History Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-80 bg-[#0f172a] text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col",
                showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                "hidden lg:flex lg:w-72 lg:shrink-0"
            )}>
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h2 className="font-black text-sm">InsightDB AI</h2>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Data Assistant</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={startNewChat}
                        className="w-full py-3 bg-brand rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand/80 transition-colors"
                    >
                        <PlusCircle size={16} /> New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2 mb-3">Recent Chats</p>
                    {sessionsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 size={20} className="animate-spin text-white/30" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-xs text-white/20 font-medium px-2 py-4">No chat history yet</p>
                    ) : (
                        sessions.map(s => (
                            <div
                                key={s.sessionId}
                                onClick={() => loadSession(s.sessionId)}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all group",
                                    sessionId === s.sessionId ? "bg-white/10" : "hover:bg-white/5"
                                )}
                            >
                                <MessageSquare size={14} className="text-white/30 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white/70 truncate">
                                        Chat {s.sessionId?.slice(0, 8)}...
                                    </p>
                                    <p className="text-[10px] text-white/30">
                                        {new Date(s.lastMessageAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => deleteSession(s.sessionId, e)}
                                    className="p-1.5 text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {activeConnection && (
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <div className="min-w-0">
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Connected</p>
                                <p className="text-xs font-bold text-white/70 truncate">{activeConnection.database}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile sidebar overlay */}
            {showSidebar && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center px-6 py-4 border-b border-insight-border bg-white sticky top-0 z-20">
                    <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 -ml-2 text-insight-muted hover:text-brand transition-colors lg:hidden">
                        <History size={22} />
                    </button>
                    <div className="flex-1 flex items-center justify-center gap-3">
                        <Sparkles size={16} className="text-brand" />
                        <h1 className="font-black text-sm text-[#0f172a] uppercase tracking-widest">Data Intelligence</h1>
                    </div>
                    <button onClick={startNewChat} className="p-2 text-insight-muted hover:text-brand transition-colors">
                        <PlusCircle size={22} />
                    </button>
                </div>

                {/* Welcome State */}
                {isWelcomeState ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-40">
                        <div className="max-w-2xl w-full space-y-10 text-center">
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-brand rounded-[28px] flex items-center justify-center text-white mx-auto shadow-elevated">
                                    <Bot size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">What can I help you with?</h2>
                                <p className="text-insight-muted font-bold text-lg max-w-md mx-auto">
                                    I can analyze your {activeConnection ? <span className="text-brand">{activeConnection.database}</span> : 'database'}, write SQL queries, and provide data insights.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {SUGGESTIONS.map((s, i) => {
                                    const Icon = s.icon;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestion(s.prompt)}
                                            className="premium-card p-4 flex flex-col items-center gap-3 group hover:border-brand/30 hover:shadow-elevated transition-all text-center"
                                        >
                                            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center bg-[#f8fafc] group-hover:scale-110 transition-transform", s.color)}>
                                                <Icon size={18} />
                                            </div>
                                            <span className="text-xs font-bold text-[#0f172a]">{s.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Chat Messages */
                    <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-12 space-y-8 custom-scrollbar">
                        {messages.map((msg, idx) => {
                            const sqlBlocks = msg.role === 'assistant' ? extractSQLBlocks(msg.content) : [];
                            return msg.role === 'assistant' ? (
                                <div key={idx} className="flex gap-4 max-w-[90%] lg:max-w-[80%]">
                                    <div className="w-10 h-10 shrink-0 bg-brand rounded-[16px] flex items-center justify-center text-white shadow-sm">
                                        <Bot size={22} />
                                    </div>
                                    <div className="space-y-2 min-w-0 flex-1">
                                        <p className="text-[10px] font-black text-insight-muted uppercase tracking-[0.2em] ml-1">InsightDB AI</p>
                                        <div className="bg-[#f1f5f9] rounded-[24px] rounded-tl-none p-5 text-[#1e293b] text-[15px] font-medium leading-relaxed shadow-sm">
                                            {renderMarkdown(msg.content)}

                                            {/* SQL action buttons */}
                                            {sqlBlocks.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-insight-border/50">
                                                    {sqlBlocks.map((sql, si) => (
                                                        <div key={si} className="flex gap-1.5">
                                                            <CopyButton text={sql} className="!bg-brand/10 !text-brand hover:!bg-brand/20 !p-2" />
                                                            <button
                                                                onClick={() => runQuery(sql)}
                                                                disabled={loading}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 text-brand rounded-lg text-[11px] font-bold hover:bg-brand/20 transition-colors disabled:opacity-50"
                                                            >
                                                                <Play size={10} fill="currentColor" /> Run Query
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Query Results */}
                                        {msg.queryResults?.map((result, ri) => (
                                            <SQLResultTable key={ri} result={result} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div key={idx} className="flex flex-row-reverse gap-4 ml-auto max-w-[90%] lg:max-w-[80%]">
                                    <div className="w-10 h-10 shrink-0">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`} alt="user" className="w-10 h-10 rounded-full border-2 border-white shadow-md ring-4 ring-brand/5" />
                                    </div>
                                    <div className="space-y-2 flex flex-col items-end">
                                        <p className="text-[10px] font-black text-insight-muted uppercase tracking-[0.2em] mr-1">{user?.fullName || 'You'}</p>
                                        <div className="bg-brand rounded-[24px] rounded-tr-none p-5 text-white text-[15px] font-medium leading-relaxed shadow-sm whitespace-pre-wrap">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="flex gap-4 max-w-[90%] lg:max-w-[80%]">
                                <div className="w-10 h-10 shrink-0 bg-brand rounded-[16px] flex items-center justify-center text-white shadow-sm">
                                    <Bot size={22} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-insight-muted uppercase tracking-[0.2em] ml-1">Thinking...</p>
                                    <div className="bg-[#f1f5f9] rounded-[24px] rounded-tl-none p-5 shadow-sm">
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
                )}

                {/* Input Dock */}
                <div className="p-4 lg:p-6 bg-gradient-to-t from-white via-white to-transparent border-t border-insight-border/30">
                    <div className="max-w-4xl mx-auto space-y-3">
                        {/* Quick suggestions (visible only when there are messages) */}
                        {messages.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                {SUGGESTIONS.slice(0, 4).map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestion(s.prompt)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#f8fafc] border border-insight-border rounded-xl whitespace-nowrap text-[11px] font-bold text-insight-muted hover:text-brand hover:border-brand/30 transition-all shrink-0"
                                    >
                                        <s.icon size={12} className={s.color} /> {s.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-0 bg-brand/5 blur-2xl rounded-3xl group-focus-within:bg-brand/10 transition-colors"></div>
                            <div className="relative premium-card !rounded-[24px] flex items-center p-2 bg-white border border-insight-border shadow-lg">
                                <button onClick={startNewChat} className="p-3 text-[#94a3b8] hover:text-brand transition-colors shrink-0">
                                    <PlusCircle size={24} />
                                </button>
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={activeConnection ? `Ask about ${activeConnection.database}...` : "Ask anything about databases..."}
                                    className="flex-1 bg-transparent py-4 px-2 focus:outline-none text-[15px] font-bold text-insight-text placeholder:text-slate-400 placeholder:font-medium"
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="w-12 h-12 bg-[#0f172a] text-white rounded-[18px] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none disabled:opacity-40 shrink-0"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" fill="currentColor" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
