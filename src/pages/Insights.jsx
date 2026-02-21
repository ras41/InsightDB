import { BarChart3, TrendingUp, Users, Target, Zap, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

export default function Insights() {
    const cards = [
        { title: 'Total Revenue', value: '$84,230.12', trend: '+12.4%', up: true, icon: Zap, color: 'text-brand bg-brand/5' },
        { title: 'Active Users', value: '1,240', trend: '+4.2%', up: true, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
        { title: 'Churn Rate', value: '0.8%', trend: '-2.1%', up: false, icon: Target, color: 'text-rose-600 bg-rose-50' },
    ];

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            <div className="max-w-6xl mx-auto space-y-10 px-6 lg:px-0">
                <div>
                    <h1 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight">Data Insights</h1>
                    <p className="text-insight-muted font-bold">AI-generated business intelligence from your connected sources.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cards.map((card, i) => (
                        <div key={i} className="premium-card p-8 flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500">
                            <div className="flex items-start justify-between mb-8">
                                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center ${card.color}`}>
                                    <card.icon size={28} />
                                </div>
                                <button className="p-2 text-insight-muted hover:text-[#0f172a] transition-colors">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-insight-muted uppercase tracking-widest">{card.title}</p>
                                <div className="flex items-baseline gap-4">
                                    <h2 className="text-3xl font-black text-[#0f172a]">{card.value}</h2>
                                    <div className={`flex items-center text-xs font-black px-2 py-0.5 rounded-md ${card.up ? 'text-green-500 bg-green-50' : 'text-rose-500 bg-rose-50'}`}>
                                        {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {card.trend}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="premium-card p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#0f172a]">Intelligence Trends</h3>
                            <TrendingUp size={20} className="text-brand" />
                        </div>
                        <div className="aspect-[16/9] bg-[#f8fafc] rounded-3xl border border-slate-100 relative flex items-center justify-center overflow-hidden">
                            <div className="flex items-end gap-3 w-3/4 h-1/2">
                                {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                                    <div key={i} className="flex-1 bg-brand/10 hover:bg-brand rounded-t-lg transition-all duration-700 cursor-pointer" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 flex justify-around px-8">
                                {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'].map(m => (
                                    <span key={m} className="text-[9px] font-black text-insight-muted">{m}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-8 flex flex-col justify-center gap-8 bg-[#0f172a] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] rounded-full"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="text-brand" size={24} />
                                <span className="text-lg font-black tracking-tight">AI Forecasting</span>
                            </div>
                            <h4 className="text-3xl font-black leading-tight">Next month revenue projected to grow by <span className="text-brand underline decoration-brand/30 underline-offset-8">8.2%</span>.</h4>
                            <p className="text-slate-400 font-medium leading-relaxed">Based on current ingestion patterns, your high-value customers are increasing frequency but decreasing basket size.</p>
                            <button className="w-full py-4 bg-brand text-white rounded-2xl font-black shadow-elevated hover:bg-brand-dark transition-all">Generate Full Report</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
