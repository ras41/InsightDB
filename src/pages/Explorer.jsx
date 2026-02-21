import { Search, SlidersHorizontal, Table, ChevronRight, Sparkles, MessageSquare, LayoutGrid, User as UserIcon, GitFork, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export default function Explorer() {
    const navigate = useNavigate();

    const tables = [
        { id: 'orders', name: 'orders', rows: '1,240', size: '4.2 MB', active: true },
        { id: 'customers', name: 'customers', rows: '850', size: '1.8 MB' },
        { id: 'products', name: 'products', rows: '320', size: '0.5 MB' },
        { id: 'categories', name: 'categories', rows: '12', size: '0.1 MB' },
        { id: 'reviews', name: 'reviews', rows: '4,102', size: '8.4 MB', badge: 'AI INSIGHT' },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] lg:p-8">
            {/* Page Header */}
            <div className="px-6 lg:px-0 pt-8 lg:pt-0 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight">Explorer</h1>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                        <span className="text-insight-muted font-bold">Connected:</span>
                        <span className="text-brand font-black underline decoration-brand/20 underline-offset-4">ecommerce_db</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-1 rounded-2xl border border-insight-border shadow-sm">
                    <button className="px-6 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-elevated">Tables</button>
                    <button className="px-6 py-2.5 text-insight-muted font-bold text-sm hover:text-insight-text">Views</button>
                    <button className="px-6 py-2.5 text-insight-muted font-bold text-sm hover:text-insight-text">Functions</button>
                </div>
            </div>

            <div className="flex-1 bg-white lg:rounded-[40px] border-t lg:border border-insight-border p-6 lg:p-10 shadow-premium overflow-hidden flex flex-col">
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-6 mb-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-insight-muted" size={20} />
                        <input
                            placeholder="Search schemas, tables, or columns..."
                            className="w-full bg-[#f8fafc] rounded-2xl py-5 pl-14 pr-6 border-none focus:ring-2 focus:ring-brand/10 focus:outline-none transition-all text-[15px] font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-3 px-8 py-5 bg-[#f1f5f9] rounded-2xl text-insight-text font-bold text-[15px] hover:bg-[#e2e8f0] transition-colors shrink-0">
                        <SlidersHorizontal size={20} />
                        Filters
                    </button>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-insight-muted uppercase tracking-[0.2em] ml-1">Public Schema (12)</h3>
                    <div className="flex gap-2">
                        <div className="w-32 h-1 bg-brand/10 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-brand"></div>
                        </div>
                    </div>
                </div>

                {/* Grid of Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    {tables.map((table) => (
                        <div
                            key={table.id}
                            onClick={() => table.id === 'orders' && navigate('/table-detail')}
                            className={clsx(
                                "premium-card overflow-hidden group cursor-pointer flex flex-col p-6 h-full transition-all duration-300",
                                table.active
                                    ? "bg-brand text-white border-transparent shadow-elevated scale-[1.02] ring-4 ring-brand/5"
                                    : "bg-white hover:border-brand/40 hover:shadow-elevated lg:hover:-translate-y-1"
                            )}
                        >
                            <div className="flex items-center gap-5 mb-6">
                                <div className={clsx(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                                    table.active ? "bg-white/20" : "bg-[#eff6ff] text-insight-muted group-hover:text-brand"
                                )}>
                                    {table.id === 'orders' && <Table size={28} fill={table.active ? "white" : "currentColor"} />}
                                    {table.id === 'customers' && <UserIcon size={28} fill="currentColor" />}
                                    {table.id === 'products' && <LayoutGrid size={28} fill="currentColor" />}
                                    {table.id === 'categories' && <GitFork size={28} fill="currentColor" />}
                                    {table.id === 'reviews' && <MessageSquare size={28} fill="currentColor" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-xl font-black truncate tracking-tight">{table.name}</h4>
                                        {table.badge && (
                                            <span className="bg-[#f3e8ff] text-[#7c3aed] text-[8px] font-black px-2 py-1 rounded-md shrink-0">{table.badge}</span>
                                        )}
                                    </div>
                                    <p className={clsx("text-xs font-bold mt-1", table.active ? "text-white/60" : "text-insight-muted")}>
                                        {table.rows} rows • {table.size}
                                    </p>
                                </div>
                            </div>

                            {table.active ? (
                                <div className="mt-auto flex gap-3">
                                    <button className="flex-1 bg-white/10 hover:bg-white/20 py-3.5 rounded-xl text-xs font-bold transition-colors">Schema</button>
                                    <button className="flex-1 bg-white text-brand py-3.5 rounded-xl text-xs font-bold shadow-sm">View Data</button>
                                </div>
                            ) : (
                                <div className="mt-auto flex items-center gap-2 text-insight-muted group-hover:text-brand transition-colors">
                                    <span className="text-xs font-black uppercase tracking-widest">Explore Settings</span>
                                    <ChevronRight size={16} className="ml-auto" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Action FAB (Desktop friendly) */}
            <button className="fixed bottom-10 right-10 lg:bottom-12 lg:right-12 w-16 h-16 bg-[#0f172a] text-white rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group">
                <Terminal size={28} />
                <span className="absolute right-20 bg-[#0f172a] text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Open SQL Terminal</span>
            </button>
        </div>
    );
}
