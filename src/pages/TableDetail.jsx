import { useState, useEffect } from 'react';
import { ChevronLeft, Search, MoreVertical, Fingerprint, User, Calendar, CheckCircle2, Database, AlertTriangle, Sparkles, Table as TableIcon, Loader2, Key, Layers, RefreshCw, FileText, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { clsx } from 'clsx';

export default function TableDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('schema');
    const [detail, setDetail] = useState(null);
    const [sampleData, setSampleData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const tableMeta = location.state || {
        tableName: 'Orders',
        schema: 'public',
        rows: 12450,
        size: '4.2 MB',
        type: 'table'
    };

    const loadPageData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const [schemaData, rowsData] = await Promise.all([
                dbService.getTableDetail(tableMeta.tableName),
                dbService.getTableData(tableMeta.tableName)
            ]);
            setDetail(schemaData);
            setSampleData(rowsData);
        } catch (e) {
            console.error("Failed to load table details");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadPageData();
    }, [tableMeta.tableName]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await dbService.exportTableData(tableMeta.tableName);
            if (result.success) {
                alert(`Export successful! File: ${result.fileName}`);
            }
        } catch (e) {
            console.error("Export failed");
        } finally {
            setIsExporting(false);
        }
    };

    const displayTitle = tableMeta.tableName.charAt(0).toUpperCase() + tableMeta.tableName.slice(1);

    if (isLoading) {
        return (
            <div className="flex-1 min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-brand" size={48} />
                    <p className="text-insight-muted font-black uppercase tracking-widest text-xs">Accessing Database...</p>
                </div>
import { ChevronLeft, Search, MoreVertical, Fingerprint, User, Calendar, CheckCircle2, Database, AlertTriangle, Sparkles, Table as TableIcon, Loader2, Hash, Key, Clock, Type } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { explorerAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import toast from 'react-hot-toast';

const typeIcons = {
    integer: Hash, bigint: Hash, int4: Hash, int8: Hash, serial: Hash,
    uuid: Fingerprint,
    text: Type, varchar: Type, 'character varying': Type, char: Type,
    timestamp: Calendar, 'timestamp without time zone': Calendar, 'timestamp with time zone': Calendar, date: Calendar,
    boolean: CheckCircle2, bool: CheckCircle2,
};

const typeColors = {
    integer: 'bg-purple-50 text-purple-600', bigint: 'bg-purple-50 text-purple-600', int4: 'bg-purple-50 text-purple-600', int8: 'bg-purple-50 text-purple-600', serial: 'bg-purple-50 text-purple-600',
    uuid: 'bg-indigo-50 text-indigo-600',
    text: 'bg-blue-50 text-blue-600', varchar: 'bg-blue-50 text-blue-600', 'character varying': 'bg-blue-50 text-blue-600', char: 'bg-blue-50 text-blue-600',
    timestamp: 'bg-sky-50 text-sky-600', 'timestamp without time zone': 'bg-sky-50 text-sky-600', 'timestamp with time zone': 'bg-sky-50 text-sky-600', date: 'bg-sky-50 text-sky-600',
    boolean: 'bg-green-50 text-green-600', bool: 'bg-green-50 text-green-600',
};

export default function TableDetail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableName = searchParams.get('table') || 'orders';
    const { activeConnection } = useConnection();
    const connId = activeConnection?.id;

    const [columns, setColumns] = useState([]);
    const [stats, setStats] = useState(null);
    const [dataPreview, setDataPreview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showData, setShowData] = useState(false);

    useEffect(() => {
        if (!connId) return;
        fetchTableInfo();
    }, [connId, tableName]);

    const fetchTableInfo = async () => {
        setLoading(true);
        try {
            const [colRes, statsRes] = await Promise.all([
                explorerAPI.getColumns(connId, tableName),
                explorerAPI.getStats(connId, tableName),
            ]);
            setColumns(colRes.data.data || []);
            setStats(statsRes.data.data || null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch table info');
        } finally {
            setLoading(false);
        }
    };

    const fetchDataPreview = async () => {
        try {
            const res = await explorerAPI.getData(connId, tableName, { limit: 20 });
            setDataPreview(res.data.data?.rows || []);
            setShowData(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch data');
        }
    };

    const getIcon = (dataType) => typeIcons[dataType?.toLowerCase()] || Type;
    const getColor = (dataType) => typeColors[dataType?.toLowerCase()] || 'bg-slate-50 text-slate-600';

    if (loading) {
        return (
            <div className="flex-1 min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <Loader2 size={40} className="animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            {/* Header / Mobile Breadcrumbs */}
            <div className="bg-white/40 backdrop-blur-xl border-b border-insight-border sticky top-0 z-30 px-6 py-6 flex lg:hidden items-center">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-insight-text">
                    <ChevronLeft size={24} />
                </button>
                <span className="flex-1 text-center font-black">{displayTitle}</span>
                <button onClick={() => loadPageData(true)} className={clsx("p-2", isRefreshing && "animate-spin text-brand")}>
                    <RefreshCw size={20} />
                </button>
                <span className="flex-1 text-center font-black capitalize">{tableName} Table</span>
            </div>

            <div className="max-w-7xl mx-auto space-y-10 py-6 px-6 lg:px-0">
                {/* Desktop Header Section */}
                <div className="hidden lg:flex items-start justify-between">
                    <div className="flex gap-8 items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-16 h-16 bg-white border border-insight-border rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ChevronLeft size={28} className="text-[#0f172a]" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 text-brand font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                                <TableIcon size={14} fill="currentColor" />
                                {tableMeta.type === 'table' ? 'Table Detail' : 'View Detail'}
                            </div>
                            <h1 className="text-5xl font-black text-[#0f172a] tracking-tight flex items-center gap-4">
                                {displayTitle}
                                <span className="bg-slate-100 text-slate-500 text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest">{tableMeta.schema}</span>
                            </h1>
                            <p className="text-insight-muted font-bold mt-2">
                                {tableMeta.rows ? `${tableMeta.rows.toLocaleString()} rows` : 'Virtual mapping'} • {tableMeta.size} •
                                <span className="ml-2 inline-flex items-center gap-1.5 text-brand">
                                    <Clock size={12} />
                                    Last synced 2m ago
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => loadPageData(true)}
                            className={clsx(
                                "p-4 bg-white border border-insight-border rounded-2xl text-insight-muted hover:text-brand transition-all shadow-sm",
                                isRefreshing && "animate-spin text-brand"
                            )}
                        >
                            <RefreshCw size={24} />
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="px-10 py-5 bg-[#0f172a] text-white rounded-2xl font-black text-sm shadow-elevated hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                            {isExporting ? 'Preparing...' : 'Export Data'}
                        <h1 className="text-5xl font-black text-[#0f172a] tracking-tight capitalize">{tableName} Table</h1>
                        <p className="text-insight-muted font-bold mt-2">
                            {stats?.row_count ? `${Number(stats.row_count).toLocaleString()} rows` : ''} {stats?.total_size ? `• ${stats.total_size}` : ''} {stats?.last_analyzed ? `• Last analyzed: ${new Date(stats.last_analyzed).toLocaleDateString()}` : ''}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchDataPreview} className="px-8 py-4 bg-white rounded-2xl border border-insight-border font-bold shadow-sm hover:bg-insight-bg transition-colors">
                            Preview Data
                        </button>
                        <button onClick={() => navigate(-1)} className="px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-bold shadow-elevated hover:scale-105 active:scale-95 transition-all">
                            Back to Explorer
                        </button>
                    </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-insight-border w-fit shadow-sm">
                    {[
                        { id: 'schema', label: 'Schema Design', icon: Layers },
                        { id: 'data', label: 'Sample Data', icon: Database },
                        { id: 'insights', label: 'Health Insights', icon: Sparkles }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center gap-3 px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                                activeTab === tab.id
                                    ? "bg-[#0f172a] text-white shadow-lg"
                                    : "text-insight-muted hover:text-insight-text"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'schema' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">Column Inventory</h3>
                                    <span className="text-xs font-black text-insight-muted uppercase tracking-widest">{detail?.columns.length} columns defined</span>
                                </div>
                                <div className="premium-card p-6 space-y-4">
                                    {detail?.columns.map((col, i) => (
                                        <div key={i} className="flex items-center gap-6 p-5 rounded-2xl hover:bg-[#f8fafc] transition-all border border-transparent hover:border-insight-border group cursor-default">
                                            <div className={clsx(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                                col.color || 'bg-slate-50 text-slate-400'
                                            )}>
                                                {col.badge === 'PK' ? <Fingerprint size={28} /> : col.badge === 'FK' ? <Key size={28} /> : <Layers size={28} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-xl font-black text-[#1e293b] truncate tracking-tight">{col.name}</h4>
                                                    {col.badge && <span className={clsx(
                                                        "text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.1em]",
                                                        col.color
                                                    )}>{col.badge}</span>}
                                                </div>
                                                <p className="text-insight-muted text-[11px] font-black mt-1 uppercase tracking-widest opacity-60">
                                                    {col.type} • Nullable: <span className="text-insight-text">{col.nulls}</span>
                                                </p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1.5">Uniqueness</p>
                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                    <div className="h-full bg-brand rounded-full" style={{ width: col.unique }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'data' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">Recent Sample Data</h3>
                                    <span className="text-xs font-black text-brand uppercase tracking-widest">{sampleData?.rows.length} rows previewed</span>
                                </div>
                                <div className="premium-card overflow-hidden bg-white border-none shadow-premium">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-[#f8fafc] border-b border-insight-border">
                                                <tr>
                                                    {sampleData?.columns.map(col => (
                                                        <th key={col} className="px-8 py-5 text-[11px] font-black text-insight-muted uppercase tracking-widest">{col}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sampleData?.rows.map((row, i) => (
                                                    <tr key={i} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="px-8 py-5 text-[15px] font-medium text-[#1e293b]">{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-8 bg-[#0f172a] text-white flex items-center justify-between rounded-b-[40px]">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/10 rounded-xl">
                                                <Sparkles size={20} className="text-brand" fill="currentColor" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-300 max-w-sm">This is a dynamic preview of your data. Connect your backend to stream production insights.</p>
                                        </div>
                                        <button className="px-8 py-3 bg-white text-[#0f172a] rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                                            Open in SQL Hub
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'insights' && (
                            <div className="py-20 flex flex-col items-center justify-center text-center premium-card bg-white animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-brand/5 rounded-[40px] flex items-center justify-center mb-8 rotate-12">
                                    <Sparkles size={48} className="text-brand" />
                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columns Schema */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Columns Schema ({columns.length})</h3>
                        </div>
                        <div className="premium-card p-6 space-y-4">
                            {columns.length === 0 ? (
                                <p className="text-insight-muted font-bold text-center py-8">No columns found</p>
                            ) : (
                                columns.map((col, i) => {
                                    const IconComp = getIcon(col.data_type);
                                    const colorClass = getColor(col.data_type);
                                    return (
                                        <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-[#f8fafc] transition-colors border border-transparent hover:border-insight-border group">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
                                                <IconComp size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-lg font-black text-[#1e293b] truncate">{col.column_name}</h4>
                                                    {col.is_primary_key && <span className="bg-purple-50 text-purple-600 text-[9px] font-black px-2 py-0.5 rounded-md">PK</span>}
                                                    {col.is_foreign_key && <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-md">FK</span>}
                                                </div>
                                                <p className="text-insight-muted text-xs font-bold mt-1 uppercase tracking-wide">
                                                    {col.data_type} {col.character_maximum_length ? `(${col.character_maximum_length})` : ''} • Nullable: {col.is_nullable || 'NO'}
                                                </p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                {col.column_default && (
                                                    <>
                                                        <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Default</p>
                                                        <p className="text-xs font-bold text-insight-muted truncate max-w-[120px]">{col.column_default}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Stats & Quality */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Table Stats</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Total Rows', val: stats?.row_count ? Number(stats.row_count).toLocaleString() : 'N/A', status: stats?.total_size || '', color: 'green' },
                                { label: 'Columns', val: columns.length.toString(), status: `${columns.filter(c => c.is_nullable === 'YES').length} nullable`, color: 'brand' },
                                { label: 'Indexes', val: stats?.index_count?.toString() || '0', status: stats?.indexes_size || '', color: 'rose' },
                            ].map((item, i) => (
                                <div key={i} className="premium-card p-6 flex items-center justify-between border-l-[6px]" style={{ borderColor: item.color === 'brand' ? '#6d28d9' : item.color === 'green' ? '#22c55e' : '#f43f5e' }}>
                                    <div>
                                        <p className="text-xs font-black text-insight-muted uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-3xl font-black text-[#0f172a]">{item.val}</p>
                                    </div>
                                    <span className="text-xs font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-600">{item.status}</span>
                                </div>
                                <h4 className="text-3xl font-black text-[#0f172a] mb-4 tracking-tight">AI Audit Pending</h4>
                                <p className="text-insight-muted font-bold max-w-md mx-auto leading-relaxed">
                                    We're ready to perform a deep analysis on your <span className="text-brand">{displayTitle}</span> data. Connect your production database to enable automated quality checks.
                                </p>
                                <button className="mt-10 px-12 py-5 bg-[#0f172a] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-elevated hover:scale-105 active:scale-95 transition-all">
                                    Configure Data Agent
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column Checklist / Summary */}
                    <div className="space-y-10">
                        {/* Summary Card */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Health Status</h3>
                            <div className="space-y-4">
                                {detail?.quality.map((item, i) => (
                                    <div key={i} className="premium-card p-6 flex items-center justify-between border-l-[6px]" style={{ borderColor: `var(--${item.color}-500)` }}>
                                        <div>
                                            <p className="text-xs font-black text-insight-muted uppercase tracking-widest mb-1">{item.label}</p>
                                            <p className="text-4xl font-black text-[#0f172a]">{item.val}</p>
                                        </div>
                                        <span className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 uppercase tracking-widest">{item.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Connection Card */}
                        <div className="bg-[#eff6ff] rounded-[40px] p-10 border border-blue-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-44 h-44 bg-blue-400/10 blur-[80px] rounded-full translate-x-10 -translate-y-10"></div>
                            <div className="relative z-10">
                                <h4 className="text-lg font-black text-brand mb-6 flex items-center gap-3">
                                    <Database size={20} />
                                    BE Readiness Hub
                                </h4>
                                <ul className="space-y-6">
                                    {[
                                        { label: 'Schema Mapping', done: true },
                                        { label: 'API Endpoint Setup', done: true },
                                        { label: 'Real-time Event Stream', done: false }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-4">
                                            <div className={clsx(
                                                "w-6 h-6 rounded-lg flex items-center justify-center shadow-sm",
                                                item.done ? "bg-green-500 text-white" : "bg-white text-slate-300"
                                            )}>
                                                {item.done ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>}
                                            </div>
                                            <span className={clsx("text-sm font-bold", item.done ? "text-slate-700" : "text-slate-400 italic")}>{item.label}</span>
                                        </li>
                                    ))}
                                </ul>
                                    <p className="text-sm font-medium leading-relaxed text-slate-300">
                                        The <span className="text-white font-bold capitalize">{tableName}</span> table has {columns.length} columns
                                        with {columns.filter(c => c.is_primary_key).length} primary key{columns.filter(c => c.is_primary_key).length !== 1 ? 's' : ''}.
                                        {stats?.row_count ? ` Contains ${Number(stats.row_count).toLocaleString()} records.` : ''}
                                        {columns.filter(c => c.is_nullable === 'YES').length > 0 ? ` ${columns.filter(c => c.is_nullable === 'YES').length} columns allow null values.` : ' All columns are non-nullable.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Preview */}
                {showData && dataPreview.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Data Preview ({dataPreview.length} rows)</h3>
                            <button onClick={() => setShowData(false)} className="text-brand font-black text-xs uppercase tracking-widest">Hide</button>
                        </div>
                        <div className="premium-card overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-insight-border">
                                        {Object.keys(dataPreview[0]).map(key => (
                                            <th key={key} className="text-left p-4 text-[10px] font-black text-insight-muted uppercase tracking-widest whitespace-nowrap">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataPreview.map((row, i) => (
                                        <tr key={i} className="border-b border-insight-border/50 hover:bg-[#f8fafc]">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="p-4 font-medium text-[#1e293b] whitespace-nowrap max-w-[200px] truncate">
                                                    {val === null ? <span className="text-insight-muted italic">null</span> : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const Clock = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
