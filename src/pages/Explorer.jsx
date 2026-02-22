import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Table, ChevronRight, ChevronDown, ChevronLeft, LayoutGrid, User as UserIcon, GitFork, MessageSquare, Terminal, Loader2, Database, AlertCircle, X, ArrowUpDown, ExternalLink, Columns } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { explorerAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import toast from 'react-hot-toast';

const PAGE_SIZE = 25;

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

    // Expanded table data preview state
    const [expandedTable, setExpandedTable] = useState(null);
    const [tableData, setTableData] = useState({ rows: [], fields: [], total: 0 });
    const [tableColumns, setTableColumns] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const connId = activeConnection?.id;
    const dbName = activeConnection?.database || 'database';

    useEffect(() => {
        if (!connId) { setLoading(false); return; }
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

    // Fetch table data (rows + columns) for inline preview
    const fetchTableData = useCallback(async (tableName, page = 0) => {
        setDataLoading(true);
        try {
            const [dataRes, colsRes] = await Promise.all([
                explorerAPI.getData(connId, tableName, { limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
                explorerAPI.getColumns(connId, tableName),
            ]);
            setTableData(dataRes.data.data || { rows: [], fields: [], total: 0 });
            setTableColumns(colsRes.data.data || []);
            setCurrentPage(page);
        } catch (err) {
            toast.error('Failed to load table data');
        } finally {
            setDataLoading(false);
        }
    }, [connId]);

    // Page change — only fetch data, not columns again
    const changePage = async (tableName, page) => {
        setDataLoading(true);
        try {
            const res = await explorerAPI.getData(connId, tableName, { limit: PAGE_SIZE, offset: page * PAGE_SIZE });
            setTableData(res.data.data || { rows: [], fields: [], total: 0 });
            setCurrentPage(page);
        } catch (err) {
            toast.error('Failed to load page');
        } finally {
            setDataLoading(false);
        }
    };

    const handleTableClick = (tableName) => {
        if (expandedTable === tableName) {
            setExpandedTable(null);
            return;
        }
        setExpandedTable(tableName);
        setSortCol(null);
        setSortDir('asc');
        fetchTableData(tableName, 0);
    };

    // Client-side sort on current page rows
    const sortedRows = (() => {
        if (!sortCol || !tableData.rows?.length) return tableData.rows || [];
        const sorted = [...tableData.rows].sort((a, b) => {
            const va = a[sortCol], vb = b[sortCol];
            if (va == null && vb == null) return 0;
            if (va == null) return 1;
            if (vb == null) return -1;
            if (typeof va === 'number' && typeof vb === 'number') return va - vb;
            return String(va).localeCompare(String(vb), undefined, { numeric: true });
        });
        return sortDir === 'desc' ? sorted.reverse() : sorted;
    })();

    const totalPages = Math.max(1, Math.ceil((tableData.total || 0) / PAGE_SIZE));

    // Truncate display values
    const formatCell = (val) => {
        if (val === null || val === undefined) return <span className="text-slate-300 italic">NULL</span>;
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'object') {
            const s = JSON.stringify(val);
            return s.length > 80 ? s.slice(0, 80) + '…' : s;
        }
        const s = String(val);
        return s.length > 120 ? s.slice(0, 120) + '…' : s;
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

    // Determine column names from the first loaded data row (or columns endpoint)
    const columnNames = tableColumns.length > 0
        ? tableColumns.map(c => c.column_name)
        : tableData.rows?.length > 0
            ? Object.keys(tableData.rows[0])
            : [];

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
                            onClick={() => { setActiveTab(tab); setExpandedTable(null); }}
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
                                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredTables.map((table, idx) => {
                                            const name = table.table_name || table.name;
                                            const isExpanded = expandedTable === name;
                                            const IconComp = iconMap[idx % 5] || Table;
                                            return (
                                                <div key={name} className="premium-card overflow-hidden transition-all duration-300">
                                                    {/* Table Card Header */}
                                                    <div
                                                        onClick={() => handleTableClick(name)}
                                                        className={clsx(
                                                            "flex items-center gap-5 p-6 cursor-pointer transition-all group",
                                                            isExpanded ? "bg-brand text-white" : "bg-white hover:bg-[#f8fafc]"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0",
                                                            isExpanded ? "bg-white/20" : "bg-[#eff6ff] text-insight-muted group-hover:text-brand"
                                                        )}>
                                                            <IconComp size={24} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-lg font-black truncate tracking-tight">{name}</h4>
                                                            <p className={clsx("text-xs font-bold mt-0.5", isExpanded ? "text-white/60" : "text-insight-muted")}>
                                                                {table.estimatedRows ? `${Number(table.estimatedRows).toLocaleString()} rows` : 'Table'} {table.size ? `• ${table.size}` : ''}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigate(`/table-detail?table=${encodeURIComponent(name)}`); }}
                                                                className={clsx("p-2 rounded-xl transition-colors", isExpanded ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-400")}
                                                                title="Open full detail"
                                                            >
                                                                <ExternalLink size={16} />
                                                            </button>
                                                            <div className={clsx("transition-transform duration-300", isExpanded && "rotate-180")}>
                                                                <ChevronDown size={20} className={isExpanded ? "text-white/60" : "text-slate-400"} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Data Preview */}
                                                    {isExpanded && (
                                                        <div className="border-t border-insight-border">
                                                            {dataLoading && currentPage === 0 ? (
                                                                <div className="flex items-center justify-center py-16">
                                                                    <Loader2 size={32} className="animate-spin text-brand" />
                                                                    <span className="ml-3 text-sm font-bold text-insight-muted">Loading data...</span>
                                                                </div>
                                                            ) : sortedRows.length === 0 ? (
                                                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                                                    <Table size={32} className="text-slate-300 mb-3" />
                                                                    <p className="text-insight-muted font-bold text-sm">Table is empty</p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {/* Column info bar */}
                                                                    <div className="flex items-center justify-between px-6 py-3 bg-[#f8fafc] border-b border-insight-border/50">
                                                                        <div className="flex items-center gap-2 text-[10px] font-black text-insight-muted uppercase tracking-widest">
                                                                            <Columns size={12} />
                                                                            {columnNames.length} columns • {tableData.total?.toLocaleString()} total rows
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-[10px] font-black text-insight-muted uppercase tracking-widest">
                                                                            Page {currentPage + 1} of {totalPages}
                                                                        </div>
                                                                    </div>

                                                                    {/* Data table */}
                                                                    <div className="overflow-x-auto relative">
                                                                        {dataLoading && (
                                                                            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                                                                                <Loader2 size={24} className="animate-spin text-brand" />
                                                                            </div>
                                                                        )}
                                                                        <table className="w-full text-sm">
                                                                            <thead>
                                                                                <tr className="border-b border-insight-border bg-[#f8fafc]">
                                                                                    <th className="text-left px-4 py-3 text-[10px] font-black text-insight-muted uppercase tracking-widest w-12">#</th>
                                                                                    {columnNames.map(col => {
                                                                                        const colMeta = tableColumns.find(c => c.column_name === col);
                                                                                        const isSorted = sortCol === col;
                                                                                        return (
                                                                                            <th
                                                                                                key={col}
                                                                                                onClick={() => {
                                                                                                    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                                                                                    else { setSortCol(col); setSortDir('asc'); }
                                                                                                }}
                                                                                                className="text-left px-4 py-3 text-[10px] font-black text-insight-muted uppercase tracking-widest cursor-pointer hover:text-brand transition-colors select-none whitespace-nowrap"
                                                                                            >
                                                                                                <div className="flex items-center gap-1.5">
                                                                                                    <span>{col}</span>
                                                                                                    {colMeta && <span className="text-[9px] font-medium text-slate-300 normal-case">({colMeta.data_type})</span>}
                                                                                                    <ArrowUpDown size={10} className={clsx(isSorted ? "text-brand" : "text-slate-300")} />
                                                                                                </div>
                                                                                            </th>
                                                                                        );
                                                                                    })}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {sortedRows.map((row, ri) => (
                                                                                    <tr key={ri} className="border-b border-insight-border/30 hover:bg-[#f8fafc] transition-colors">
                                                                                        <td className="px-4 py-2.5 text-[11px] text-slate-300 font-mono">{currentPage * PAGE_SIZE + ri + 1}</td>
                                                                                        {columnNames.map(col => (
                                                                                            <td key={col} className="px-4 py-2.5 text-[13px] text-[#1e293b] font-medium max-w-[300px] truncate">
                                                                                                {formatCell(row[col])}
                                                                                            </td>
                                                                                        ))}
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>

                                                                    {/* Pagination */}
                                                                    {totalPages > 1 && (
                                                                        <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-t border-insight-border/50">
                                                                            <button
                                                                                onClick={() => changePage(name, currentPage - 1)}
                                                                                disabled={currentPage === 0 || dataLoading}
                                                                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-insight-border hover:border-brand/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                                            >
                                                                                <ChevronLeft size={14} /> Previous
                                                                            </button>
                                                                            <div className="flex items-center gap-1">
                                                                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                                                                    let page;
                                                                                    if (totalPages <= 7) page = i;
                                                                                    else if (currentPage < 4) page = i;
                                                                                    else if (currentPage > totalPages - 5) page = totalPages - 7 + i;
                                                                                    else page = currentPage - 3 + i;
                                                                                    return (
                                                                                        <button
                                                                                            key={page}
                                                                                            onClick={() => changePage(name, page)}
                                                                                            disabled={dataLoading}
                                                                                            className={clsx(
                                                                                                "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                                                                                page === currentPage
                                                                                                    ? "bg-brand text-white shadow-sm"
                                                                                                    : "text-insight-muted hover:bg-slate-100"
                                                                                            )}
                                                                                        >
                                                                                            {page + 1}
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                            <button
                                                                                onClick={() => changePage(name, currentPage + 1)}
                                                                                disabled={currentPage >= totalPages - 1 || dataLoading}
                                                                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-insight-border hover:border-brand/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                                            >
                                                                                Next <ChevronRight size={14} />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
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
