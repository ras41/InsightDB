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
                            </div>
                        </div>
                    </div>
                </div>
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
