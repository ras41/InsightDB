import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight, Loader2, Sparkles, RefreshCcw, AlertCircle, Database, Table as TableIcon, HardDrive, Shield, Columns, PieChart, Activity, ChevronRight } from 'lucide-react';
import { insightsAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

export default function Insights() {
    const navigate = useNavigate();
    const { activeConnection } = useConnection();
    const connId = activeConnection?.id;
    const [overview, setOverview] = useState(null);
    const [autoInsights, setAutoInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    useEffect(() => {
        if (!connId) { setIsLoading(false); return; }
        fetchInsights();
    }, [connId]);

    const fetchInsights = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        setHasFailed(false);
        try {
            const [overviewRes, autoRes] = await Promise.all([
                insightsAPI.getOverview(connId),
                insightsAPI.getAutoInsights(connId),
            ]);
            setOverview(overviewRes.data.data);
            setAutoInsights(autoRes.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load insights');
            setHasFailed(true);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // --- No connection ---
    if (!connId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] p-8">
                <div className="premium-card p-12 text-center max-w-md">
                    <div className="w-20 h-20 bg-brand/5 rounded-[28px] flex items-center justify-center text-brand mx-auto mb-6"><BarChart3 size={40} /></div>
                    <h2 className="text-2xl font-black text-[#0f172a] mb-3">No Database Connected</h2>
                    <p className="text-insight-muted font-bold mb-8">Connect to a database to see insights.</p>
                    <button onClick={() => navigate('/')} className="px-10 py-4 bg-brand text-white rounded-2xl font-bold shadow-elevated hover:scale-105 active:scale-95 transition-all">Connect Database</button>
                </div>
            </div>
        );
    }

    // --- Loading ---
    if (isLoading) {
        return (
            <div className="flex-1 min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <Loader2 className="animate-spin text-brand" size={48} />
                        <Sparkles className="absolute -top-2 -right-2 text-brand animate-pulse" size={20} fill="currentColor" />
                    </div>
                    <div className="text-center">
                        <p className="text-insight-muted font-black uppercase tracking-[0.2em] text-[10px] mb-2">Analyzing Intelligence</p>
                        <p className="text-[#0f172a] font-bold text-sm">Scanning tables, columns & data quality...</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- Error ---
    if (hasFailed && !overview) {
        return (
            <div className="flex-1 min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6"><AlertCircle size={40} /></div>
                <h2 className="text-2xl font-black text-[#0f172a] mb-2">Intelligence Offline</h2>
                <p className="text-insight-muted font-bold max-w-sm mb-8">Could not fetch insights. Check your connection and try again.</p>
                <button onClick={() => fetchInsights()} className="px-10 py-4 bg-[#0f172a] text-white rounded-2xl font-black text-sm shadow-elevated hover:scale-105 active:scale-95 transition-all flex items-center gap-3"><RefreshCcw size={18} />Retry</button>
            </div>
        );
    }

    // --- Derived data ---
    const tables = autoInsights?.tableInsights || [];
    const typeDist = autoInsights?.columnTypeDistribution || [];
    const overallCompleteness = autoInsights?.overallCompleteness ?? 0;
    const totalColumns = autoInsights?.totalColumns ?? 0;
    const totalNullable = autoInsights?.totalNullable ?? 0;

    const sortedTables = [...tables].sort((a, b) => b.rows - a.rows);
    const maxRows = Math.max(...sortedTables.map(t => t.rows), 1);
    const maxTypeCnt = Math.max(...typeDist.map(t => t.count), 1);

    // Quality colour
    const qualityColor = overallCompleteness >= 90 ? 'text-green-500' : overallCompleteness >= 70 ? 'text-amber-500' : 'text-rose-500';
    const qualityBg = overallCompleteness >= 90 ? 'bg-green-50' : overallCompleteness >= 70 ? 'bg-amber-50' : 'bg-rose-50';
    const qualityLabel = overallCompleteness >= 90 ? 'Excellent' : overallCompleteness >= 70 ? 'Good' : 'Needs Attention';

    // Find tables with growth trends
    const tablesWithTrends = tables.filter(t => t.growthTrend && t.growthTrend.length > 1);

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            <div className="max-w-7xl mx-auto space-y-10 px-6 lg:px-0">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-brand font-black text-[10px] uppercase tracking-[0.2em]">
                            <Target size={14} fill="currentColor" />
                            Real-Time Intelligence
                        </div>
                        <h1 className="text-5xl font-black text-[#0f172a] tracking-tight">Data Insights</h1>
                        <p className="text-insight-muted font-bold text-lg">Live analysis of <span className="text-brand">{activeConnection?.database}</span></p>
                    </div>
                    <button
                        onClick={() => fetchInsights(true)}
                        disabled={isRefreshing}
                        className={clsx(
                            "p-5 bg-[#0f172a] text-white rounded-2xl shadow-elevated hover:scale-105 active:scale-95 transition-all",
                            isRefreshing && "opacity-70"
                        )}
                    >
                        <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* ─── KPI Cards ─── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Tables', value: overview?.totalTables ?? 0, icon: TableIcon, color: 'text-brand bg-brand/5' },
                        { label: 'Total Records', value: overview?.totalRows ? Number(overview.totalRows).toLocaleString() : '0', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
                        { label: 'Database Size', value: overview?.databaseSize || 'N/A', icon: HardDrive, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Columns', value: totalColumns, icon: Columns, color: 'text-rose-600 bg-rose-50' },
                    ].map((kpi, i) => {
                        const Icon = kpi.icon;
                        return (
                            <div key={i} className="premium-card p-8 space-y-4 hover:scale-[1.02] transition-all">
                                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center", kpi.color)}>
                                    <Icon size={22} />
                                </div>
                                <p className="text-[10px] font-black text-insight-muted uppercase tracking-[0.2em]">{kpi.label}</p>
                                <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">{kpi.value}</h2>
                            </div>
                        );
                    })}
                </div>

                {/* ─── Data Quality Score + Column Type Distribution ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Quality Score */}
                    <div className="lg:col-span-2 premium-card p-10 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 blur-[80px] rounded-full translate-x-10 -translate-y-10"></div>
                        <div className="relative">
                            <svg viewBox="0 0 120 120" className="w-36 h-36">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                <circle
                                    cx="60" cy="60" r="52" fill="none"
                                    stroke={overallCompleteness >= 90 ? '#22c55e' : overallCompleteness >= 70 ? '#f59e0b' : '#ef4444'}
                                    strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${(overallCompleteness / 100) * 327} 327`}
                                    transform="rotate(-90 60 60)"
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={clsx("text-4xl font-black", qualityColor)}>{overallCompleteness}%</span>
                                <span className="text-[10px] font-black text-insight-muted uppercase tracking-widest">Completeness</span>
                            </div>
                        </div>
                        <div className={clsx("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest", qualityBg, qualityColor)}>
                            <Shield size={12} className="inline mr-1.5 -mt-0.5" />
                            {qualityLabel}
                        </div>
                        <p className="text-xs text-insight-muted font-bold max-w-[240px]">
                            {totalNullable} of {totalColumns} columns allow nulls across {tables.length} tables.
                        </p>
                    </div>

                    {/* Column Type Distribution */}
                    <div className="lg:col-span-3 premium-card p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Column Types</h3>
                                <p className="text-xs font-bold text-insight-muted mt-1 uppercase tracking-widest">Distribution across all tables</p>
                            </div>
                            <div className="flex items-center gap-2 text-brand font-black text-xs bg-brand/5 px-4 py-2 rounded-xl">
                                <PieChart size={14} />
                                {typeDist.length} types
                            </div>
                        </div>
                        <div className="space-y-4">
                            {typeDist.map((td, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <span className="w-28 text-xs font-bold text-insight-muted truncate uppercase tracking-wider">{td.type}</span>
                                    <div className="flex-1 h-8 bg-slate-50 rounded-xl overflow-hidden relative">
                                        <div
                                            className="h-full bg-brand/10 group-hover:bg-brand/20 transition-all duration-500 rounded-xl flex items-center"
                                            style={{ width: `${Math.max((td.count / maxTypeCnt) * 100, 8)}%` }}
                                        >
                                            <span className="text-[11px] font-black text-brand ml-3">{td.count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Table Health Grid ─── */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Table Health Overview</h3>
                        <span className="text-xs font-black text-insight-muted uppercase tracking-widest">{tables.length} tables analyzed</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedTables.map((t, i) => {
                            const isSelected = selectedTable === t.name;
                            const barWidth = maxRows > 0 ? Math.max((t.rows / maxRows) * 100, 4) : 4;
                            const compColor = t.completeness >= 90 ? 'text-green-500' : t.completeness >= 70 ? 'text-amber-500' : 'text-rose-500';
                            return (
                                <div
                                    key={i}
                                    onClick={() => setSelectedTable(isSelected ? null : t.name)}
                                    className={clsx(
                                        "premium-card p-6 cursor-pointer transition-all duration-300 hover:shadow-elevated group",
                                        isSelected && "ring-2 ring-brand/30 shadow-elevated"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand shrink-0">
                                                <TableIcon size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-[#0f172a] truncate text-sm">{t.name}</h4>
                                                <p className="text-[10px] font-bold text-insight-muted uppercase tracking-widest">{t.columnCount} cols • {t.size || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/table-detail?table=${encodeURIComponent(t.name)}`); }}
                                            className="p-1.5 text-slate-300 hover:text-brand transition-colors"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    {/* Row bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-[10px] font-black text-insight-muted uppercase tracking-widest mb-1.5">
                                            <span>Rows</span>
                                            <span>{Number(t.rows).toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand rounded-full transition-all duration-700" style={{ width: `${barWidth}%` }} />
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div className="bg-[#f8fafc] rounded-xl p-2.5">
                                            <p className={clsx("text-lg font-black", compColor)}>{t.completeness}%</p>
                                            <p className="text-[9px] font-bold text-insight-muted uppercase">Complete</p>
                                        </div>
                                        <div className="bg-[#f8fafc] rounded-xl p-2.5">
                                            <p className="text-lg font-black text-[#0f172a]">{t.pkCount}</p>
                                            <p className="text-[9px] font-bold text-insight-muted uppercase">PKs</p>
                                        </div>
                                        <div className="bg-[#f8fafc] rounded-xl p-2.5">
                                            <p className="text-lg font-black text-[#0f172a]">{t.fkCount}</p>
                                            <p className="text-[9px] font-bold text-insight-muted uppercase">FKs</p>
                                        </div>
                                    </div>

                                    {/* Growth mini-trend (if available) */}
                                    {isSelected && t.growthTrend && t.growthTrend.length > 1 && (
                                        <div className="mt-4 pt-4 border-t border-insight-border space-y-2">
                                            <p className="text-[10px] font-black text-insight-muted uppercase tracking-widest flex items-center gap-2">
                                                <Activity size={12} /> Monthly Growth ({t.dateColumns[0]})
                                            </p>
                                            <div className="flex items-end gap-1 h-16">
                                                {t.growthTrend.map((g, gi) => {
                                                    const trendMax = Math.max(...t.growthTrend.map(x => Number(x.count)), 1);
                                                    const h = Math.max((Number(g.count) / trendMax) * 100, 6);
                                                    return (
                                                        <div key={gi} className="flex-1 flex flex-col items-center gap-1 group/bar">
                                                            <div className="w-full bg-brand/10 hover:bg-brand/30 rounded-md transition-all relative" style={{ height: `${h}%` }}>
                                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-insight-muted opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                                                    {Number(g.count).toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ─── AI Summary Card ─── */}
                <div className="premium-card p-10 bg-[#0f172a] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand/20 blur-[120px] rounded-full translate-x-20 -translate-y-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -translate-x-20 translate-y-20"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="p-4 bg-brand rounded-2xl shadow-elevated">
                                <Sparkles className="text-white" size={28} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em] block mb-1">AI Summary</span>
                                <span className="text-xl font-black tracking-tight">Database Intelligence</span>
                            </div>
                        </div>
                        <div className="flex-1 text-slate-300 font-medium leading-relaxed text-[15px]">
                            Your <strong className="text-white">{activeConnection?.database}</strong> database contains{' '}
                            <strong className="text-brand">{overview?.totalTables || 0}</strong> tables with{' '}
                            <strong className="text-brand">{overview?.totalRows ? Number(overview.totalRows).toLocaleString() : 0}</strong> total records.
                            {' '}Data completeness is at <strong className={clsx(overallCompleteness >= 90 ? 'text-green-400' : overallCompleteness >= 70 ? 'text-amber-400' : 'text-rose-400')}>{overallCompleteness}%</strong>.
                            {sortedTables[0] && <> The largest table is <strong className="text-white">"{sortedTables[0].name}"</strong> with <strong className="text-brand">{Number(sortedTables[0].rows).toLocaleString()}</strong> rows.</>}
                            {tablesWithTrends.length > 0 && <> {tablesWithTrends.length} table{tablesWithTrends.length > 1 ? 's have' : ' has'} temporal data with detectable growth patterns.</>}
                        </div>
                    </div>
                </div>

                {/* ─── All Tables Data ─── */}
                {overview?.tables?.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-[#0f172a] tracking-tight">All Tables</h3>
                        <div className="premium-card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-insight-border bg-[#f8fafc]">
                                        <th className="text-left p-4 text-[10px] font-black text-insight-muted uppercase tracking-widest">Table</th>
                                        <th className="text-left p-4 text-[10px] font-black text-insight-muted uppercase tracking-widest">Est. Rows</th>
                                        <th className="text-left p-4 text-[10px] font-black text-insight-muted uppercase tracking-widest">Size</th>
                                        <th className="text-left p-4 text-[10px] font-black text-insight-muted uppercase tracking-widest hidden md:table-cell">Cols</th>
                                        <th className="text-left p-4 text-[10px] font-black text-insight-muted uppercase tracking-widest hidden md:table-cell">Completeness</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedTables.map((t, i) => {
                                        const compColor = t.completeness >= 90 ? 'text-green-600 bg-green-50' : t.completeness >= 70 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';
                                        return (
                                            <tr
                                                key={i}
                                                onClick={() => navigate(`/table-detail?table=${encodeURIComponent(t.name)}`)}
                                                className="border-b border-insight-border/50 hover:bg-[#f8fafc] cursor-pointer transition-colors"
                                            >
                                                <td className="p-4 font-bold text-[#1e293b]">
                                                    <div className="flex items-center gap-3">
                                                        <TableIcon size={14} className="text-brand shrink-0" />
                                                        {t.name}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-medium text-insight-muted">{Number(t.rows).toLocaleString()}</td>
                                                <td className="p-4 font-medium text-insight-muted">{t.size || 'N/A'}</td>
                                                <td className="p-4 font-medium text-insight-muted hidden md:table-cell">{t.columnCount}</td>
                                                <td className="p-4 hidden md:table-cell">
                                                    <span className={clsx("text-xs font-black px-3 py-1 rounded-lg", compColor)}>
                                                        {t.completeness}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── Bottom Source Card ─── */}
                <div className="premium-card p-8 bg-white/50 border border-insight-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center text-brand">
                            <Database size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[#0f172a]">Intelligence Source</p>
                            <p className="text-xs font-bold text-insight-muted">{activeConnection?.name || 'Database'} ({activeConnection?.host || 'localhost'})</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-insight-muted uppercase">Type</p>
                            <p className="text-sm font-black text-brand">{activeConnection?.dbType === 'mysql' ? 'MySQL' : 'PostgreSQL'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-insight-muted uppercase">Quality</p>
                            <p className={clsx("text-sm font-black", qualityColor)}>{overallCompleteness}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-insight-muted uppercase">Tables</p>
                            <p className="text-sm font-black text-green-500">{overview?.totalTables || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
