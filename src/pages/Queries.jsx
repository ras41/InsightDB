import { useState, useEffect, useRef } from 'react';
import { FileCode, Play, History, Save, Plus, Loader2, Database, AlertCircle, BookmarkCheck } from 'lucide-react';
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
            setHistory(res.data.data?.queries || []);
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 lg:px-0">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="premium-card p-8 min-h-[400px] flex flex-col">
                            <div className="flex items-center justify-between mb-6 border-b border-insight-border pb-4 font-mono text-sm text-insight-muted">
                                <span>query_editor.sql</span>
                                <div className="flex gap-4">
                                    <span className="text-brand font-bold underline">
                                        {activeConnection?.dbType === 'mysql' ? 'MySQL' : 'PostgreSQL'}
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
                                    <span className="text-xs font-bold text-insight-muted">{results.duration ? `${results.duration}ms` : ''}</span>
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

                    {/* Sidebar: History */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-insight-muted uppercase tracking-[0.2em]">Query History</h3>
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
                                    <p className="text-[11px] font-mono text-slate-400 truncate bg-slate-50/50 p-2 rounded-lg mt-3">{q.sql}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
