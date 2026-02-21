import { FileCode, Play, History, Save, Search, Plus } from 'lucide-react';

export default function Queries() {
    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-6 lg:px-0">
                    <div>
                        <h1 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight">SQL Queries</h1>
                        <p className="text-insight-muted font-bold">Write and manage your custom database queries.</p>
                    </div>
                    <button className="flex items-center justify-center gap-3 px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-bold shadow-elevated hover:scale-105 active:scale-95 transition-all">
                        <Plus size={20} />
                        New Query
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 lg:px-0">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="premium-card p-8 min-h-[400px] flex flex-col">
                            <div className="flex items-center justify-between mb-6 border-b border-insight-border pb-4 font-mono text-sm text-insight-muted">
                                <span>query_editor.sql</span>
                                <div className="flex gap-4">
                                    <span className="text-brand font-bold underline">PostgreSQL</span>
                                    <span className="opacity-40 tracking-tighter cursor-not-allowed">v14.2</span>
                                </div>
                            </div>
                            <div className="flex-1 font-mono text-[16px] leading-relaxed text-[#0f172a] focus:outline-none bg-[#fdfdfe] p-4 rounded-xl border border-slate-50 shadow-inner">
                                <span className="text-brand">SELECT</span> * <span className="text-brand">FROM</span> orders <br />
                                <span className="text-brand">WHERE</span> status = <span className="text-indigo-600">'completed'</span> <br />
                                <span className="text-brand">ORDER BY</span> created_at <span className="text-brand">DESC</span> <br />
                                <span className="text-brand">LIMIT</span> 10;
                            </div>
                            <div className="mt-8 flex items-center justify-between">
                                <div className="flex gap-3">
                                    <button className="p-4 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                                        <Save size={20} />
                                    </button>
                                    <button className="p-4 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                                        <History size={20} />
                                    </button>
                                </div>
                                <button className="flex items-center gap-3 px-10 py-5 bg-brand text-white rounded-2xl font-black text-lg shadow-elevated hover:bg-brand-dark transition-all">
                                    <Play size={22} fill="currentColor" />
                                    Run Query
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-[#0f172a] tracking-tight ml-1">Recent Queries</h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Top Customers 2024', date: '2h ago', items: '14 rows' },
                                { title: 'Revenue by Category', date: 'Yesterday', items: '8 rows' },
                                { title: 'Update inv_stock', date: '3 days ago', items: 'Modified 120' },
                            ].map((q, i) => (
                                <div key={i} className="premium-card p-5 hover:border-brand/30 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/5 group-hover:text-brand transition-colors">
                                            <FileCode size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-[#1e293b]">{q.title}</h4>
                                            <p className="text-[10px] font-black text-insight-muted uppercase tracking-widest mt-1">{q.date} • {q.items}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
