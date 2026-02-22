import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Table, ChevronRight, LayoutGrid, User as UserIcon, GitFork, MessageSquare, Terminal, Loader2, Database, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { explorerAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import toast from 'react-hot-toast';

const iconMap = {
    0: Table, 1: UserIcon, 2: LayoutGrid, 3: GitFork, 4: MessageSquare,
};

export default function Explorer() {
    const navigate = useNavigate();
    const { activeConnection } = useConnection();
    const [activeTab, setActiveTab] = useState('tables');
    const [tables, setTables] = useState([]);
    const [views, setViews] = useState([]);
    const [functions, setFunctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const connId = activeConnection?.id;
    const dbName = activeConnection?.database || 'database';

    useEffect(() => {
        if (!connId) {
            setLoading(false);
            return;
        }
        fetchData();
    }, [connId, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'tables') {
                const res = await explorerAPI.getTables(connId);
                setTables(res.data.data || []);
            } else if (activeTab === 'views') {
                const res = await explorerAPI.getViews(connId);
                setViews(res.data.data || []);
            } else {
                const res = await explorerAPI.getFunctions(connId);
                setFunctions(res.data.data || []);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to fetch ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTableClick = (tableName) => {
        navigate(`/table-detail?table=${encodeURIComponent(tableName)}`);
    };

    if (!connId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] p-8">
                <div className="premium-card p-12 text-center max-w-md">
                    <div className="w-20 h-20 bg-brand/5 rounded-[28px] flex items-center justify-center text-brand mx-auto mb-6">
                        <Database size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-[#0f172a] mb-3">No Database Connected</h2>
                    <p className="text-insight-muted font-bold mb-8">Connect to a database first to explore your schemas.</p>
                    <button onClick={() => navigate('/')} className="px-10 py-4 bg-brand text-white rounded-2xl font-bold shadow-elevated hover:scale-105 active:scale-95 transition-all">
                        Connect Database
                    </button>
                </div>
            </div>
        );
    }

    const filteredTables = tables.filter(t => (t.table_name || t.name || '').toLowerCase().includes(search.toLowerCase()));
    const filteredViews = views.filter(v => (v.view_name || v.name || '').toLowerCase().includes(search.toLowerCase()));
    const filteredFunctions = functions.filter(f => (f.function_name || f.name || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] lg:p-8">
            {/* Page Header */}
            <div className="px-6 lg:px-0 pt-8 lg:pt-0 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight">Explorer</h1>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                        <span className="text-insight-muted font-bold">Connected:</span>
                        <span className="text-brand font-black underline decoration-brand/20 underline-offset-4">{dbName}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-1 rounded-2xl border border-insight-border shadow-sm">
                    {['tables', 'views', 'functions'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-6 py-2.5 font-bold text-sm rounded-xl transition-all capitalize",
                                activeTab === tab ? "bg-brand text-white shadow-elevated" : "text-insight-muted hover:text-insight-text"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-white lg:rounded-[40px] border-t lg:border border-insight-border p-6 lg:p-10 shadow-premium overflow-hidden flex flex-col">
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-6 mb-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-insight-muted" size={20} />
                        <input
                            placeholder="Search schemas, tables, or columns..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#f8fafc] rounded-2xl py-5 pl-14 pr-6 border-none focus:ring-2 focus:ring-brand/10 focus:outline-none transition-all text-[15px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                        />
                    </div>
                    <button onClick={fetchData} className="flex items-center justify-center gap-3 px-8 py-5 bg-[#f1f5f9] rounded-2xl text-insight-text font-bold text-[15px] hover:bg-[#e2e8f0] transition-colors shrink-0">
                        <SlidersHorizontal size={20} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={40} className="animate-spin text-brand" />
                    </div>
                ) : (
                    <>
                        {/* Tables Tab */}
                        {activeTab === 'tables' && (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xs font-black text-insight-muted uppercase tracking-[0.2em] ml-1">
                                        Public Schema ({filteredTables.length})
                                    </h3>
                                </div>
                                {filteredTables.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                                        <AlertCircle size={40} className="text-insight-muted mb-4" />
                                        <p className="text-insight-muted font-bold">No tables found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredTables.map((table, idx) => {
                                            const name = table.table_name || table.name;
                                            const isActive = idx === 0;
                                            const IconComp = iconMap[idx % 5] || Table;
                                            return (
                                                <div
                                                    key={name}
                                                    onClick={() => handleTableClick(name)}
                                                    className={clsx(
                                                        "premium-card overflow-hidden group cursor-pointer flex flex-col p-6 h-full transition-all duration-300",
                                                        isActive
                                                            ? "bg-brand text-white border-transparent shadow-elevated scale-[1.02] ring-4 ring-brand/5"
                                                            : "bg-white hover:border-brand/40 hover:shadow-elevated lg:hover:-translate-y-1"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-5 mb-6">
                                                        <div className={clsx(
                                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                                                            isActive ? "bg-white/20" : "bg-[#eff6ff] text-insight-muted group-hover:text-brand"
                                                        )}>
                                                            <IconComp size={28} fill={isActive ? "white" : "currentColor"} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h4 className="text-xl font-black truncate tracking-tight">{name}</h4>
                                                            </div>
                                                            <p className={clsx("text-xs font-bold mt-1", isActive ? "text-white/60" : "text-insight-muted")}>
                                                                {table.estimatedRows ? `${Number(table.estimatedRows).toLocaleString()} rows` : 'Table'} {table.size ? `• ${table.size}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {isActive ? (
                                                        <div className="mt-auto flex gap-3">
                                                            <button className="flex-1 bg-white/10 hover:bg-white/20 py-3.5 rounded-xl text-xs font-bold transition-colors">Schema</button>
                                                            <button className="flex-1 bg-white text-brand py-3.5 rounded-xl text-xs font-bold shadow-sm">View Data</button>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-auto flex items-center gap-2 text-insight-muted group-hover:text-brand transition-colors">
                                                            <span className="text-xs font-black uppercase tracking-widest">Explore</span>
                                                            <ChevronRight size={16} className="ml-auto" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Views Tab */}
                        {activeTab === 'views' && (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xs font-black text-insight-muted uppercase tracking-[0.2em] ml-1">Views ({filteredViews.length})</h3>
                                </div>
                                {filteredViews.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                                        <AlertCircle size={40} className="text-insight-muted mb-4" />
                                        <p className="text-insight-muted font-bold">No views found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredViews.map((view, idx) => {
                                            const name = view.view_name || view.name;
                                            return (
                                                <div key={name} className="premium-card p-6 hover:border-brand/40 hover:shadow-elevated transition-all cursor-pointer group">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                            <LayoutGrid size={28} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-black text-[#1e293b] truncate">{name}</h4>
                                                            <p className="text-xs font-bold text-insight-muted mt-1">View</p>
                                                        </div>
                                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-brand" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Functions Tab */}
                        {activeTab === 'functions' && (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xs font-black text-insight-muted uppercase tracking-[0.2em] ml-1">Functions ({filteredFunctions.length})</h3>
                                </div>
                                {filteredFunctions.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                                        <AlertCircle size={40} className="text-insight-muted mb-4" />
                                        <p className="text-insight-muted font-bold">No functions found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredFunctions.map((fn, idx) => {
                                            const name = fn.function_name || fn.name;
                                            return (
                                                <div key={name + idx} className="premium-card p-6 hover:border-brand/40 hover:shadow-elevated transition-all cursor-pointer group">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                                            <Terminal size={28} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-black text-[#1e293b] truncate">{name}</h4>
                                                            <p className="text-xs font-bold text-insight-muted mt-1">{fn.return_type || 'Function'}</p>
                                                        </div>
                                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-brand" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Quick Action FAB */}
            <button
                onClick={() => navigate('/queries')}
                className="fixed bottom-10 right-10 lg:bottom-12 lg:right-12 w-16 h-16 bg-[#0f172a] text-white rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
            >
                <Terminal size={28} />
                <span className="absolute right-20 bg-[#0f172a] text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Open SQL Terminal</span>
            </button>
        </div>
    );
}
