import { useState, useEffect } from 'react';
import { FileCode, Play, History, Save, Search, Plus, Sparkles, Loader2, Database, AlertCircle, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { dbService } from '../services/dbService';
import { clsx } from 'clsx';

export default function Queries() {
    const [sql, setSql] = useState('SELECT * FROM orders\nWHERE status = \'completed\'\nORDER BY created_at DESC\nLIMIT 10;');
    const [results, setResults] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [savedQueries, setSavedQueries] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeView, setActiveView] = useState('saved'); // 'saved' or 'history'

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [saved, hist] = await Promise.all([
                dbService.getSavedQueries(),
                dbService.getHistory()
            ]);
            setSavedQueries(saved);
            setHistory(hist);
        } catch (e) {
            console.error("Failed to load queries data");
        }
    };

    const handleExecute = async () => {
        setIsExecuting(true);
        setError(null);
        try {
            const data = await dbService.executeQuery(sql);
            setResults(data);
            const hist = await dbService.getHistory();
            setHistory(hist);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleAIFormat = async () => {
        setIsFormatting(true);
        try {
            const formatted = await dbService.formatSQL(sql);
            setSql(formatted);
        } catch (err) {
            console.error("Formatting failed");
        } finally {
            setIsFormatting(false);
        }
    };

    const handleSave = async () => {
        const title = prompt("Enter query name:");
        if (!title) return;

        setIsSaving(true);
        try {
            await dbService.saveQuery(title, sql);
            const saved = await dbService.getSavedQueries();
            setSavedQueries(saved);
        } catch (err) {
            console.error("Save failed");
        } finally {
            setIsSaving(false);
        }
import { useState, useEffect, useRef } from 'react';
import { FileCode, Play, History, Save, Search, Plus, Loader2, Database, AlertCircle, BookmarkCheck } from 'lucide-react';
import { queryAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import toast from 'react-hot-toast';

export default function Queries() {
    const { activeConnection } = useConnection();
    const connId = activeConnection?.id;
    const [sql, setSql] = useState("SELECT * FROM \nWHERE \nORDER BY \nLIMIT 10;");
    const [results, setResults] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await queryAPI.getHistory({ limit: 10 });
            setHistory(res.data.data || []);
        } catch (err) {
            // silent fail
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleRun = async () => {
        if (!connId) {
            toast.error('Connect to a database first');
            return;
        }
        if (!sql.trim()) {
            toast.error('Enter a SQL query');
            return;
        }
        setLoading(true);
        setResults(null);
        try {
            const res = await queryAPI.execute({
                connectionId: connId,
                sql: sql.trim(),
            });
            setResults(res.data.data);
            toast.success(`Query executed: ${res.data.data?.rowCount ?? 0} rows`);
            fetchHistory();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Query execution failed');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSave = async (queryId) => {
        try {
            await queryAPI.toggleSave(queryId);
            toast.success('Query bookmark toggled');
            fetchHistory();
        } catch (err) {
            toast.error('Failed to toggle bookmark');
        }
    };

    const loadQuery = (q) => {
        setSql(q.sql);
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-6 lg:px-0">
                    <div>
                        <div className="flex items-center gap-3 text-brand font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                            <Database size={14} fill="currentColor" />
                            Data Science Hub
                        </div>
                        <h1 className="text-5xl font-black text-[#0f172a] tracking-tight">SQL Queries</h1>
                        <p className="text-insight-muted font-bold mt-2 text-lg">Build, analyze, and save complex data insights.</p>
                    </div>
                    <button
                        onClick={() => setSql('-- Start new query...\nSELECT ')}
                        className="flex items-center justify-center gap-3 px-8 py-5 bg-[#0f172a] text-white rounded-2xl font-black text-sm shadow-elevated hover:scale-105 active:scale-95 transition-all w-full lg:w-auto"
                        <h1 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight">SQL Queries</h1>
                        <p className="text-insight-muted font-bold">Write and execute queries on your connected database.</p>
                    </div>
                    <button
                        onClick={() => { setSql(''); setResults(null); }}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-bold shadow-elevated hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                        New Analysis
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-10 px-6 lg:px-0">
                    {/* Main Editor & Results */}
                    <div className="xl:col-span-3 space-y-8">
                        <div className="premium-card p-0 overflow-hidden flex flex-col bg-white border-none shadow-premium min-h-[600px]">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-insight-border bg-[#fdfdfe]">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <FileCode size={18} className="text-slate-400" />
                                    </div>
                                    <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">query_editor.sql</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={handleAIFormat}
                                        disabled={isFormatting}
                                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:underline disabled:opacity-50"
                                    >
                                        {isFormatting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} fill="currentColor" />}
                                        AI Format
                                    </button>
                                    <div className="h-4 w-px bg-slate-200"></div>
                                    <span className="text-[11px] font-black text-brand uppercase tracking-widest">PostgreSQL v14</span>
                                </div>
                            </div>

                            {/* Textarea Editor */}
                            <div className="flex-1 relative flex flex-col min-h-[300px]">
                                <textarea
                                    value={sql}
                                    onChange={(e) => setSql(e.target.value)}
                                    spellCheck={false}
                                    className="flex-1 font-mono text-lg leading-relaxed text-[#1e293b] p-10 bg-white focus:outline-none resize-none custom-scrollbar"
                                    placeholder="SELECT * FROM table..."
                                />

                                {/* Bottom Action Bar */}
                                <div className="px-8 py-6 border-t border-insight-border bg-[#f8fafc]/50 flex items-center justify-between">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="p-4 bg-white border border-insight-border rounded-xl text-slate-500 hover:text-brand hover:border-brand/30 transition-all shadow-sm flex items-center gap-2 font-bold text-xs"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            Save Query
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const h = await dbService.getHistory();
                                                setHistory(h);
                                                setActiveView('history');
                                            }}
                                            className="p-4 bg-white border border-insight-border rounded-xl text-slate-500 hover:text-brand hover:border-brand/30 transition-all shadow-sm flex items-center gap-2 font-bold text-xs"
                                        >
                                            <History size={18} />
                                            History
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleExecute}
                                        disabled={isExecuting}
                                        className="flex items-center gap-3 px-12 py-5 bg-brand text-white rounded-2xl font-black text-sm shadow-elevated hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isExecuting ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                                        Run Query
                                    </button>
                                </div>
                            </div>

                            {/* Results Area */}
                            <div className="border-t-2 border-slate-50">
                                {results || error ? (
                                    <div className="p-0 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="px-8 py-4 bg-slate-50/80 flex items-center justify-between border-b border-insight-border">
                                            <span className="text-[10px] font-black text-insight-muted uppercase tracking-widest">Results Explorer</span>
                                            {results && (
                                                <span className="text-[10px] font-bold text-insight-muted">{results.rowCount} rows • {results.executionTime}</span>
                                            )}
                                        </div>
                                        {error ? (
                                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                                                    <AlertCircle size={32} />
                                                </div>
                                                <h4 className="text-xl font-black text-[#0f172a] mb-2">Execution Failed</h4>
                                                <p className="text-sm font-medium text-rose-600 font-mono bg-rose-50/50 p-6 rounded-2xl border border-rose-100 max-w-2xl">
                                                    {error}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="max-h-[400px] overflow-auto custom-scrollbar">
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="sticky top-0 bg-white border-b border-insight-border z-10">
                                                        <tr>
                                                            {results.columns.map(col => (
                                                                <th key={col} className="px-8 py-5 text-[10px] font-black text-insight-muted uppercase tracking-widest">{col}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {results.rows.map((row, i) => (
                                                            <tr key={i} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
                                                                {row.map((cell, j) => (
                                                                    <td key={j} className="px-8 py-5 text-sm font-medium text-[#1e293b]">{cell}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-20 flex flex-col items-center justify-center text-center opacity-30">
                                        <Database size={48} className="text-slate-200 mb-4" />
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Waiting for execution...</p>
                                    </div>
                                )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 lg:px-0">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="premium-card p-8 min-h-[400px] flex flex-col">
                            <div className="flex items-center justify-between mb-6 border-b border-insight-border pb-4 font-mono text-sm text-insight-muted">
                                <span>query_editor.sql</span>
                                <div className="flex gap-4">
                                    <span className="text-brand font-bold underline">
                                        {activeConnection?.type === 'mysql' ? 'MySQL' : 'PostgreSQL'}
                                    </span>
                                    <span className="opacity-40 tracking-tighter">{activeConnection?.database || 'No DB'}</span>
                                </div>
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={sql}
                                onChange={(e) => setSql(e.target.value)}
                                placeholder="Enter your SQL query here..."
                                className="flex-1 font-mono text-[15px] leading-relaxed text-[#0f172a] focus:outline-none bg-[#fdfdfe] p-4 rounded-xl border border-slate-50 shadow-inner resize-none min-h-[250px]"
                                spellCheck={false}
                            />
                            <div className="mt-8 flex items-center justify-between">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => toast('Use bookmark in history to save queries')}
                                        className="p-4 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        <Save size={20} />
                                    </button>
                                    <button
                                        onClick={fetchHistory}
                                        className="p-4 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        <History size={20} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleRun}
                                    disabled={loading}
                                    className="flex items-center gap-3 px-10 py-5 bg-brand text-white rounded-2xl font-black text-lg shadow-elevated hover:bg-brand-dark transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={22} className="animate-spin" /> : <Play size={22} fill="currentColor" />}
                                    {loading ? 'Running...' : 'Run Query'}
                                </button>
                            </div>
                        </div>

                        {/* Results Table */}
                        {results && (
                            <div className="premium-card overflow-hidden">
                                <div className="p-6 border-b border-insight-border flex items-center justify-between">
                                    <h3 className="font-black text-[#0f172a]">Results ({results.rowCount ?? 0} rows)</h3>
                                    <span className="text-xs font-bold text-insight-muted">{results.executionTime ? `${results.executionTime}ms` : ''}</span>
                                </div>
                                {results.rows && results.rows.length > 0 ? (
                                    <div className="overflow-x-auto max-h-[400px]">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-white">
                                                <tr className="border-b border-insight-border">
                                                    {Object.keys(results.rows[0]).map(key => (
                                                        <th key={key} className="text-left p-3 text-[10px] font-black text-insight-muted uppercase tracking-widest whitespace-nowrap">{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.rows.map((row, i) => (
                                                    <tr key={i} className="border-b border-insight-border/50 hover:bg-[#f8fafc]">
                                                        {Object.values(row).map((val, j) => (
                                                            <td key={j} className="p-3 font-medium text-[#1e293b] whitespace-nowrap max-w-[200px] truncate">
                                                                {val === null ? <span className="text-insight-muted italic">null</span> : String(val)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-insight-muted font-bold">Query executed successfully. No rows returned.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Library */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-insight-border shadow-sm">
                            <button
                                onClick={() => setActiveView('saved')}
                                className={clsx(
                                    "flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    activeView === 'saved' ? "bg-[#0f172a] text-white shadow-lg" : "text-insight-muted"
                                )}
                            >
                                Saved
                            </button>
                            <button
                                onClick={() => setActiveView('history')}
                                className={clsx(
                                    "flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    activeView === 'history' ? "bg-[#0f172a] text-white shadow-lg" : "text-insight-muted"
                                )}
                            >
                                History
                            </button>
                        </div>

                        <div className="space-y-4">
                            {activeView === 'saved' ? (
                                savedQueries.map((q) => (
                                    <div
                                        key={q.id}
                                        onClick={() => setSql(q.sql)}
                                        className="premium-card p-6 hover:border-brand/40 transition-all cursor-pointer group bg-white"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                                                <FileCode size={20} />
                                            </div>
                                            <div className="flex-1 truncate">
                                                <h4 className="font-black text-[#1e293b] truncate text-sm uppercase tracking-tight">{q.title}</h4>
                                                <p className="text-[10px] font-bold text-insight-muted uppercase tracking-widest mt-1">{q.lastRun} • {q.rows}</p>
                                            </div>
                            {historyLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 size={24} className="animate-spin text-brand" />
                                </div>
                            ) : history.length === 0 ? (
                                <div className="premium-card p-8 text-center">
                                    <AlertCircle size={24} className="mx-auto text-insight-muted mb-3" />
                                    <p className="text-insight-muted font-bold text-sm">No queries yet</p>
                                </div>
                            ) : (
                                history.map((q) => (
                                    <div
                                        key={q.id}
                                        onClick={() => loadQuery(q)}
                                        className="premium-card p-5 hover:border-brand/30 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/5 group-hover:text-brand transition-colors">
                                                <FileCode size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-[#1e293b] truncate text-sm">{q.sql?.substring(0, 40)}...</h4>
                                                <p className="text-[10px] font-black text-insight-muted uppercase tracking-widest mt-1">
                                                    {formatDate(q.executedAt || q.createdAt)} {q.rowCount != null ? `• ${q.rowCount} rows` : ''}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleSave(q.id); }}
                                                className={`p-1 transition-colors ${q.isSaved ? 'text-brand' : 'text-slate-300 hover:text-brand'}`}
                                            >
                                                <BookmarkCheck size={16} />
                                            </button>
                                        </div>
                                        <p className="text-[11px] font-mono text-slate-400 truncate bg-slate-50/50 p-2 rounded-lg">{q.sql}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-4">
                                    {history.map((h, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setSql(h.sql);
                                                if (h.results) setResults(h.results);
                                                setError(null);
                                            }}
                                            className="p-5 rounded-2xl bg-white border border-insight-border hover:border-brand/30 transition-all cursor-pointer group shadow-sm"
                                        >
                                            <p className="text-[11px] font-mono text-[#1e293b] truncate mb-3 group-hover:text-brand transition-colors">{h.sql}</p>
                                            <div className="flex items-center justify-between">
                                                <span className={clsx(
                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                                                    h.status === 'success' ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                                                )}>
                                                    {h.status}
                                                </span>
                                                <span className="text-[9px] font-bold text-insight-muted">{h.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Connection Card */}
                        <div className="bg-[#0f172a] rounded-[32px] p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                            <h4 className="text-sm font-black text-brand uppercase tracking-widest mb-4">Postgres Node</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Status</span>
                                    <span className="flex items-center gap-2 text-green-400 font-bold">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        Online
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Host</span>
                                    <span className="text-slate-200 font-mono">aws-us-east-1.db.insight</span>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
