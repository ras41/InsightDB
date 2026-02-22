import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, Zap, ArrowUpRight, ArrowDownRight, MoreHorizontal, Loader2, Sparkles, Calendar, RefreshCcw, AlertCircle, Database } from 'lucide-react';
import { dbService } from '../services/dbService';
import { clsx } from 'clsx';

const ICON_MAP = {
    zap: Zap,
    users: Users,
    target: Target
};

export default function Insights() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const result = await dbService.getInsights();
            setData(result);
        } catch (e) {
            console.error("Failed to load insights");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

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
                        <p className="text-[#0f172a] font-bold text-sm">Synthesizing backend data patterns...</p>
                    </div>
import { BarChart3, TrendingUp, Users, Target, Zap, ArrowUpRight, ArrowDownRight, MoreHorizontal, Loader2, Database, Table as TableIcon, HardDrive } from 'lucide-react';
import { insightsAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Insights() {
    const navigate = useNavigate();
    const { activeConnection } = useConnection();
    const connId = activeConnection?.id;
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!connId) {
            setLoading(false);
            return;
        }
        fetchInsights();
    }, [connId]);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const [overviewRes, trendsRes] = await Promise.all([
                insightsAPI.getOverview(connId),
                insightsAPI.getTrends(connId),
            ]);
            setOverview(overviewRes.data.data);
            setTrends(trendsRes.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load insights');
        } finally {
            setLoading(false);
        }
    };

    if (!connId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] p-8">
                <div className="premium-card p-12 text-center max-w-md">
                    <div className="w-20 h-20 bg-brand/5 rounded-[28px] flex items-center justify-center text-brand mx-auto mb-6">
                        <BarChart3 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-[#0f172a] mb-3">No Database Connected</h2>
                    <p className="text-insight-muted font-bold mb-8">Connect to a database to see insights.</p>
                    <button onClick={() => navigate('/')} className="px-10 py-4 bg-brand text-white rounded-2xl font-bold shadow-elevated hover:scale-105 active:scale-95 transition-all">
                        Connect Database
                    </button>
                </div>
            </div>
        );
    }

    // Safety guard to prevent render crashes if data failed to load
    if (!data) {
        return (
            <div className="flex-1 min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-black text-[#0f172a] mb-2">Intelligence Offline</h2>
                <p className="text-insight-muted font-bold max-w-sm mb-8">Calculations failed to resolve. Please try refreshing the engine.</p>
                <button
                    onClick={() => loadInsights()}
                    className="px-10 py-4 bg-[#0f172a] text-white rounded-2xl font-black text-sm shadow-elevated hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                    <RefreshCcw size={18} />
                    Reset Engine
                </button>
            </div>
        );
    }
    if (loading) {
        return (
            <div className="flex-1 min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <Loader2 size={40} className="animate-spin text-brand" />
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Tables',
            value: overview?.tableCount?.toString() || '0',
            trend: '',
            up: true,
            icon: TableIcon,
            color: 'text-brand bg-brand/5',
        },
        {
            title: 'Database Size',
            value: overview?.databaseSize || 'N/A',
            trend: '',
            up: true,
            icon: HardDrive,
            color: 'text-indigo-600 bg-indigo-50',
        },
        {
            title: 'Total Records',
            value: overview?.totalRows ? Number(overview.totalRows).toLocaleString() : '0',
            trend: '',
            up: true,
            icon: Users,
            color: 'text-rose-600 bg-rose-50',
        },
    ];

    const tableSizes = overview?.tables?.slice(0, 8) || [];
    const maxRows = Math.max(...tableSizes.map(t => Number(t.estimated_rows || 0)), 1);

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            <div className="max-w-7xl mx-auto space-y-12 px-6 lg:px-0">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-brand font-black text-[10px] uppercase tracking-[0.2em]">
                            <Target size={14} fill="currentColor" />
                            Business Intelligence
                        </div>
                        <h1 className="text-5xl font-black text-[#0f172a] tracking-tight">Data Insights</h1>
                        <p className="text-insight-muted font-bold text-lg">Autonomous AI summaries from your connected infrastructure.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white border border-insight-border rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm">
                            <Calendar size={20} className="text-insight-muted" />
                            <div className="text-left">
                                <p className="text-[10px] font-black text-insight-muted uppercase tracking-widest leading-none mb-1">Period</p>
                                <p className="text-sm font-black text-[#0f172a] leading-none">Last 30 Days</p>
                            </div>
                        </div>
                        <button
                            onClick={() => loadInsights(true)}
                            className={clsx(
                                "p-5 bg-[#0f172a] text-white rounded-2xl shadow-elevated hover:scale-105 active:scale-95 transition-all",
                                isRefreshing && "animate-spin"
                            )}
                        >
                            <RefreshCcw size={20} />
                        </button>
                    </div>
            <div className="max-w-6xl mx-auto space-y-10 px-6 lg:px-0">
                <div>
                    <h1 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight">Data Insights</h1>
                    <p className="text-insight-muted font-bold">AI-generated intelligence from <span className="text-brand">{activeConnection?.database}</span></p>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.kpis?.map((card, i) => {
                        const Icon = ICON_MAP[card.icon] || Zap;
                        return (
                            <div key={i} className="premium-card p-10 flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500 bg-white border-none shadow-premium relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full translate-x-10 -translate-y-10 group-hover:bg-brand/5 transition-colors duration-500"></div>
                                <div className="relative z-10 flex items-start justify-between mb-10">
                                    <div className={clsx("w-16 h-16 rounded-[24px] flex items-center justify-center shadow-sm", card.color)}>
                                        <Icon size={28} />
                                    </div>
                                    <button className="p-2 text-slate-300 hover:text-[#0f172a] transition-colors">
                                        <MoreHorizontal size={24} />
                                    </button>
                                </div>
                                <div className="relative z-10 space-y-2">
                                    <p className="text-[11px] font-black text-insight-muted uppercase tracking-[0.2em]">{card.title}</p>
                                    <div className="flex items-baseline gap-4">
                                        <h2 className="text-5xl font-black text-[#0f172a] tracking-tight">{card.value}</h2>
                                        <div className={clsx(
                                            "flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-lg",
                                            card.up ? 'text-green-600 bg-green-50' : 'text-rose-600 bg-rose-50'
                                        )}>
                                            {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                            {card.trend}
                                        </div>
                                    </div>
                                <button onClick={fetchInsights} className="p-2 text-insight-muted hover:text-[#0f172a] transition-colors">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-insight-muted uppercase tracking-widest">{card.title}</p>
                                <div className="flex items-baseline gap-4">
                                    <h2 className="text-3xl font-black text-[#0f172a]">{card.value}</h2>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Analytical Visuals */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    <div className="lg:col-span-3 premium-card p-12 bg-white border-none shadow-premium space-y-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">Intelligence Trends</h3>
                                <p className="text-xs font-bold text-insight-muted mt-1 uppercase tracking-widest">Aggregated across all schemas</p>
                            </div>
                            <div className="flex items-center gap-2 text-brand font-black text-xs uppercase tracking-widest bg-brand/5 px-4 py-2 rounded-xl">
                                <TrendingUp size={16} />
                                High Accuracy
                            </div>
                        </div>

                        <div className="aspect-[21/9] flex items-end gap-4 relative">
                            {data.trends?.map((t, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div
                                        className="w-full bg-slate-50 hover:bg-brand rounded-2xl transition-all duration-1000 cursor-help relative group/bar"
                                        style={{ height: `${t.value}%` }}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                            {t.value}% Performance
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-insight-muted uppercase tracking-[0.1em]">{t.month}</span>
                                </div>
                            ))}
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between py-10 opacity-5 pointer-events-none">
                                <div className="border-t-2 border-slate-900 w-full"></div>
                                <div className="border-t-2 border-slate-900 w-full"></div>
                                <div className="border-t-2 border-slate-900 w-full"></div>
                            <h3 className="text-xl font-black text-[#0f172a]">Table Size Distribution</h3>
                            <TrendingUp size={20} className="text-brand" />
                        </div>
                        <div className="aspect-[16/9] bg-[#f8fafc] rounded-3xl border border-slate-100 relative flex items-center justify-center overflow-hidden">
                            <div className="flex items-end gap-3 w-3/4 h-1/2">
                                {tableSizes.map((t, i) => {
                                    const height = maxRows > 0 ? (Number(t.estimated_rows || 0) / maxRows) * 100 : 10;
                                    return (
                                        <div
                                            key={i}
                                            className="flex-1 bg-brand/10 hover:bg-brand rounded-t-lg transition-all duration-700 cursor-pointer relative group/bar"
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[9px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                                {Number(t.estimated_rows || 0).toLocaleString()} rows
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 flex justify-around px-8">
                                {tableSizes.map((t, i) => (
                                    <span key={i} className="text-[9px] font-black text-insight-muted truncate max-w-[60px]">
                                        {(t.table_name || t.name || '').substring(0, 6).toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 premium-card p-12 flex flex-col justify-between bg-[#0f172a] text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/20 blur-[120px] rounded-full translate-x-20 -translate-y-20 group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -translate-x-20 translate-y-20"></div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-brand rounded-2xl shadow-elevated">
                                    <BarChart3 className="text-white" size={28} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em] block mb-1">Next Cycle</span>
                                    <span className="text-xl font-black tracking-tight">AI Forecasting</span>
                                </div>
                            </div>

                            <h4 className="text-4xl font-black leading-[1.1] tracking-tight">
                                Next month revenue projected to grow by <span className="text-brand italic underline decoration-brand/30 underline-offset-[12px]"> {data.aiProjection?.growth}</span>.
                            </h4>

                            <p className="text-slate-400 font-medium leading-relaxed text-lg">
                                {data.aiProjection?.summary}
                            </p>
                        </div>

                        <div className="relative z-10 pt-12">
                            <button className="w-full py-6 bg-white text-[#0f172a] rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-elevated hover:scale-105 active:scale-95 transition-all">
                                Generate Intelligence Hub
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Source Card */}
                <div className="premium-card p-8 bg-white/50 border border-insight-border flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center text-brand">
                            <Database size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[#0f172a]">Intelligence Source</p>
                            <p className="text-xs font-bold text-insight-muted">Primary Production Cluster (aws-us-east-1)</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-insight-muted uppercase">Accuracy</p>
                            <p className="text-sm font-black text-green-500">99.8%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-insight-muted uppercase">Last Run</p>
                            <p className="text-sm font-black text-[#0f172a]">Just now</p>
                    <div className="premium-card p-8 flex flex-col justify-center gap-8 bg-[#0f172a] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] rounded-full"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="text-brand" size={24} />
                                <span className="text-lg font-black tracking-tight">AI Summary</span>
                            </div>
                            <h4 className="text-3xl font-black leading-tight">
                                Your database has <span className="text-brand underline decoration-brand/30 underline-offset-8">{overview?.tableCount || 0}</span> tables
                                with <span className="text-brand underline decoration-brand/30 underline-offset-8">{overview?.totalRows ? Number(overview.totalRows).toLocaleString() : 0}</span> total records.
                            </h4>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                {overview?.tables?.length > 0
                                    ? `The largest table is "${overview.tables[0]?.table_name || overview.tables[0]?.name}" with ${Number(overview.tables[0]?.estimated_rows || 0).toLocaleString()} rows.`
                                    : 'Connect a database with tables to see detailed analytics.'
                                }
                            </p>
                            <button onClick={fetchInsights} className="w-full py-4 bg-brand text-white rounded-2xl font-black shadow-elevated hover:bg-brand-dark transition-all">
                                Refresh Insights
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tables Overview */}
                {overview?.tables?.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-[#0f172a] tracking-tight">All Tables Overview</h3>
                        <div className="premium-card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-insight-border bg-[#f8fafc]">
                                        <th className="text-left p-4 text-[10px] font-black text-insight-muted uppercase tracking-widest">Table Name</th>
                                        <th className="text-left p-4 text-[10px] font-black text-insight-muted uppercase tracking-widest">Est. Rows</th>
                                        <th className="text-left p-4 text-[10px] font-black text-insight-muted uppercase tracking-widest">Size</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overview.tables.map((t, i) => (
                                        <tr
                                            key={i}
                                            onClick={() => navigate(`/table-detail?table=${encodeURIComponent(t.table_name || t.name)}`)}
                                            className="border-b border-insight-border/50 hover:bg-[#f8fafc] cursor-pointer"
                                        >
                                            <td className="p-4 font-bold text-[#1e293b]">{t.table_name || t.name}</td>
                                            <td className="p-4 font-medium text-insight-muted">{Number(t.estimated_rows || 0).toLocaleString()}</td>
                                            <td className="p-4 font-medium text-insight-muted">{t.total_size || 'N/A'}</td>
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
