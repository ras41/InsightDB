import { useState, useEffect } from 'react';
import { X, Play, Copy, Save, Sparkles, Terminal, Loader2, Database, AlertCircle, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dbService } from '../../services/dbService';
import { clsx } from 'clsx';

export default function TerminalDrawer({ isOpen, onClose }) {
    const [sql, setSql] = useState('SELECT * FROM orders\nWHERE status = \'Delivered\'\nORDER BY created_at DESC;');
    const [results, setResults] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    const loadHistory = async () => {
        const data = await dbService.getHistory();
        setHistory(data);
    };

    const handleExecute = async () => {
        setIsExecuting(true);
        setError(null);
        try {
            const data = await dbService.executeQuery(sql);
            setResults(data);
            await loadHistory();
        } catch (err) {
            setError(err.message);
            await loadHistory();
        } finally {
            setIsExecuting(false);
        }
    };

    const handleAIFormat = async () => {
        setIsFormatting(true);
        try {
            const formatted = await dbService.formatSQL(sql);
            setSql(formatted);
        } catch (e) {
            console.error("Formatting failed");
        } finally {
            setIsFormatting(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(sql);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white border-t border-insight-border z-[101] h-[85vh] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[40px]"
                    >
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />

                        <div className="flex items-center justify-between px-10 py-6 border-b border-insight-border shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand/10 text-brand rounded-2xl">
                                    <Terminal size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#0f172a]">SQL Terminal</h2>
                                    <p className="text-[10px] font-black text-insight-muted uppercase tracking-widest">Connected to ecommerce_db</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            <div className="flex-1 flex flex-col p-10 bg-[#f8fafc]/50 overflow-y-auto custom-scrollbar">
                                {/* SQL Editor Area */}
                                <div className="min-h-[240px] flex flex-col mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-insight-muted uppercase tracking-widest">Editor</span>
                                        <div className="flex gap-4">
                                            <button onClick={handleCopy} className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline">Copy SQL</button>
                                            <button onClick={() => setSql('')} className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline">Clear</button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={sql}
                                        onChange={(e) => setSql(e.target.value)}
                                        spellCheck={false}
                                        className="flex-1 font-mono text-sm leading-relaxed text-[#1e293b] p-8 bg-white rounded-3xl border border-insight-border shadow-inner focus:ring-4 ring-brand/5 focus:border-brand/20 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleAIFormat}
                                            disabled={isFormatting || isExecuting}
                                            className="flex items-center gap-2 px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] font-black text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {isFormatting ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} fill="currentColor" />}
                                            {isFormatting ? 'Formatting...' : 'AI Format'}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleExecute}
                                        disabled={isExecuting || isFormatting}
                                        className="flex items-center gap-3 px-10 py-4 bg-brand text-white rounded-2xl font-black text-sm shadow-elevated hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {isExecuting ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                                        Execute Query
                                    </button>
                                </div>

                                {/* Results Area */}
                                <div className="flex-1 flex flex-col min-h-[300px]">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-insight-muted uppercase tracking-widest">Results</span>
                                        {results && !error && (
                                            <span className="text-[10px] font-bold text-insight-muted">{results.rowCount} rows • {results.executionTime}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 bg-white rounded-3xl border border-insight-border overflow-hidden shadow-sm flex flex-col">
                                        {isExecuting ? (
                                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                                <Loader2 className="animate-spin text-brand" size={32} />
                                                <p className="text-xs font-black text-insight-muted uppercase tracking-widest">Running query...</p>
                                            </div>
                                        ) : error ? (
                                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                                                    <AlertCircle size={32} />
                                                </div>
                                                <h4 className="text-lg font-black text-[#0f172a] mb-2">Query Failed</h4>
                                                <p className="text-sm font-medium text-rose-600 font-mono leading-relaxed bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                                                    {error}
                                                </p>
                                            </div>
                                        ) : results ? (
                                            <div className="flex-1 overflow-auto custom-scrollbar">
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="sticky top-0 bg-slate-50 border-b border-insight-border z-10">
                                                        <tr>
                                                            {results.columns.map(col => (
                                                                <th key={col} className="px-6 py-4 text-[10px] font-black text-insight-muted uppercase tracking-widest">{col}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {results.rows.map((row, i) => (
                                                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                                {row.map((cell, j) => (
                                                                    <td key={j} className="px-6 py-4 text-sm font-medium text-[#1e293b]">{cell}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                                <Database size={48} className="text-slate-200 mb-4" />
                                                <p className="text-sm font-bold text-slate-400">Run a query to see results</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar: History */}
                            <div className="w-80 border-l border-insight-border bg-white p-10 overflow-y-auto shrink-0 hidden xl:block">
                                <div className="flex items-center gap-3 mb-6">
                                    <Clock size={16} className="text-insight-muted" />
                                    <h3 className="text-xs font-black text-insight-muted uppercase tracking-[0.2em]">Execution History</h3>
                                </div>
                                <div className="space-y-4">
                                    {history.map((h, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setSql(h.sql);
                                                setResults(h.results || null);
                                                setError(null);
                                            }}
                                            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 group"
                                        >
                                            <p className="text-xs font-mono text-[#1e293b] truncate mb-2 group-hover:text-brand">{h.sql}</p>
                                            <div className="flex items-center justify-between">
                                                <span className={clsx(
                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                                                    h.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                                                )}>
                                                    {h.status}
                                                </span>
                                                <span className="text-[9px] font-bold text-insight-muted">{h.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
