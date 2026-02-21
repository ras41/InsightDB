import { ChevronLeft, Search, MoreVertical, Fingerprint, User, Calendar, CheckCircle2, Database, AlertTriangle, Sparkles, Table as TableIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TableDetail() {
    const navigate = useNavigate();

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            {/* Header */}
            <div className="bg-white/40 backdrop-blur-xl border-b border-insight-border sticky top-0 z-30 px-6 py-6 flex lg:hidden items-center">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-insight-text">
                    <ChevronLeft size={24} />
                </button>
                <span className="flex-1 text-center font-black">Orders Table</span>
            </div>

            <div className="max-w-6xl mx-auto space-y-10 py-6 px-6 lg:px-0">
                {/* Desktop Title & Actions */}
                <div className="hidden lg:flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-3 text-brand font-black text-xs uppercase tracking-widest mb-3">
                            <TableIcon size={16} fill="currentColor" />
                            Table Information
                        </div>
                        <h1 className="text-5xl font-black text-[#0f172a] tracking-tight">Orders Table</h1>
                        <p className="text-insight-muted font-bold mt-2">12,450 rows ingested • Last updated 2 mins ago</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-white rounded-2xl border border-insight-border font-bold shadow-sm hover:bg-insight-bg transition-colors">Export CSV</button>
                        <button className="px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-bold shadow-elevated hover:scale-105 active:scale-95 transition-all">Edit Schema</button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columns Schema */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Columns Schema</h3>
                            <button className="text-brand font-black text-xs uppercase tracking-widest">Manage All</button>
                        </div>
                        <div className="premium-card p-6 space-y-4">
                            {[
                                { name: 'order_id', type: 'Integer', nulls: '0%', icon: Fingerprint, badge: 'PK', color: 'bg-purple-50 text-purple-600', unique: '100%' },
                                { name: 'customer_id', type: 'UUID', nulls: '0%', icon: User, badge: 'FK', color: 'bg-indigo-50 text-indigo-600', unique: '66%' },
                                { name: 'created_at', type: 'Timestamp', nulls: '2%', icon: Calendar, color: 'bg-blue-50 text-blue-600', unique: '94%' },
                            ].map((col, i) => (
                                <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-[#f8fafc] transition-colors border border-transparent hover:border-insight-border group">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${col.color}`}>
                                        <col.icon size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-lg font-black text-[#1e293b] truncate">{col.name}</h4>
                                            {col.badge && <span className={`${col.color} text-[9px] font-black px-2 py-0.5 rounded-md`}>{col.badge}</span>}
                                        </div>
                                        <p className="text-insight-muted text-xs font-bold mt-1 uppercase tracking-wide">{col.type} • Nullable: {col.nulls}</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Uniqueness</p>
                                        <div className="w-20 h-1.5 bg-brand/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand" style={{ width: col.unique }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quality Insights */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Data Quality</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Completeness', val: '98%', status: 'Excellent', color: 'green' },
                                { label: 'Uniqueness', val: 'High', status: 'Entropy: 0.92', color: 'brand' },
                                { label: 'Anomalies', val: 'Low', status: '240 Nulls', color: 'rose' },
                            ].map((item, i) => (
                                <div key={i} className="premium-card p-6 flex items-center justify-between border-l-[6px]" style={{ borderColor: `var(--${item.color}-500)` }}>
                                    <div>
                                        <p className="text-xs font-black text-insight-muted uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-3xl font-black text-[#0f172a]">{item.val}</p>
                                    </div>
                                    <span className="text-xs font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-600">{item.status}</span>
                                </div>
                            ))}

                            {/* AI Intelligence Card */}
                            <div className="mt-6 bg-[#0f172a] rounded-[32px] p-8 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Sparkles size={24} className="text-brand" fill="currentColor" />
                                        <span className="font-black text-lg tracking-tight">AI Agent Summary</span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed text-slate-300">
                                        Orders table is critical for <span className="text-white font-bold">Revenue Analysis</span>. Recommended to index <code className="bg-white/10 px-2 rounded">customer_id</code> for faster lookup in CLV calculations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
