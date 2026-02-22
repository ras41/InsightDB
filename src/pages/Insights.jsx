import { useState, useEffect } from 'react';
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
            <div className="max-w-6xl mx-auto space-y-10 px-6 lg:px-0">
                <div>
                    <h1 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight">Data Insights</h1>
                    <p className="text-insight-muted font-bold">AI-generated intelligence from <span className="text-brand">{activeConnection?.database}</span></p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cards.map((card, i) => (
                        <div key={i} className="premium-card p-8 flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500">
                            <div className="flex items-start justify-between mb-8">
                                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center ${card.color}`}>
                                    <card.icon size={28} />
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
                        </div>
                    ))}
                </div>

                {/* Chart Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="premium-card p-8 space-y-6">
                        <div className="flex items-center justify-between">
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
