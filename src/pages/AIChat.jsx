import { ChevronLeft, Info, Bot, User, PlusCircle, Send, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIChat() {
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex flex-col h-screen bg-white">
            {/* Mobile Header */}
            <div className="flex lg:hidden items-center px-6 py-8 border-b border-insight-border bg-white sticky top-0 z-20">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-insight-text">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="flex-1 text-center font-black text-lg text-insight-text">Data Intelligence</h1>
            </div>

            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto px-6 py-8 lg:p-12 space-y-10 custom-scrollbar pb-40">
                    {/* AI Message */}
                    <div className="flex gap-5 max-w-[85%]">
                        <div className="w-12 h-12 shrink-0 bg-brand rounded-[20px] flex items-center justify-center text-white shadow-elevated">
                            <Bot size={28} fill="currentColor" />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-insight-muted uppercase tracking-[0.2em] ml-1">Insight AI Agent</p>
                            <div className="bg-[#f1f5f9] rounded-[28px] rounded-tl-none p-6 text-[#1e293b] text-[16px] font-medium leading-relaxed shadow-sm">
                                Hello! I'm your data assistant. I can help you analyze schemas, write SQL, or interpret trends. What's on your mind?
                            </div>
                        </div>
                    </div>

                    {/* User Message */}
                    <div className="flex flex-row-reverse gap-5 ml-auto max-w-[85%]">
                        <div className="w-12 h-12 shrink-0">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="user" className="w-12 h-12 rounded-full border-2 border-white shadow-md ring-4 ring-brand/5" />
                        </div>
                        <div className="space-y-3 flex flex-col items-end">
                            <p className="text-[10px] font-black text-insight-muted uppercase tracking-[0.2em] mr-1">Current User</p>
                            <div className="bg-brand rounded-[28px] rounded-tr-none p-6 text-white text-[16px] font-medium leading-relaxed shadow-elevated">
                                Can you show me the total sales trends for the last 3 months?
                            </div>
                        </div>
                    </div>

                    {/* AI Response Card */}
                    <div className="flex gap-5 max-w-[90%]">
                        <div className="w-12 h-12 shrink-0 bg-brand rounded-[20px] flex items-center justify-center text-white shadow-elevated">
                            <Bot size={28} fill="currentColor" />
                        </div>
                        <div className="space-y-3 w-full">
                            <p className="text-[10px] font-black text-insight-muted uppercase tracking-[0.2em] ml-1">Analysis Complete</p>
                            <div className="bg-[#f1f5f9] rounded-[32px] rounded-tl-none p-8 text-[#1e293b] space-y-6 shadow-sm border border-slate-100">
                                <p className="text-[16px] font-medium leading-relaxed">
                                    I've analyzed the <span className="px-2 py-0.5 bg-brand/10 text-brand rounded-lg font-black text-xs">orders</span> and <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg font-black text-xs">products</span> tables.
                                </p>

                                <div className="bg-white/60 p-6 rounded-3xl border border-[#e2e8f0] backdrop-blur-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-black text-insight-muted uppercase tracking-widest">Growth Velocity</span>
                                        <span className="text-sm font-black text-green-500 bg-green-50 px-3 py-1 rounded-full">+24.8% YoY</span>
                                    </div>
                                    <div className="h-3 bg-[#f1f5f9] rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-brand w-[82%] rounded-full shadow-[0_0_12px_rgba(109,40,217,0.3)] transition-all duration-1000 ease-out"></div>
                                    </div>
                                    <p className="mt-4 text-xs font-bold text-insight-muted leading-tight">Sales are trending upwards primarily driven by the 'Electronics' category.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Dock */}
                <div className="p-6 lg:p-10 bg-gradient-to-t from-white via-white/95 to-transparent pt-20">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                            <button className="flex items-center gap-3 px-6 py-3 bg-white border border-insight-border rounded-2xl whitespace-nowrap text-xs font-black uppercase tracking-wider hover:bg-insight-bg transition-all shadow-sm">
                                <MessageSquare size={16} className="text-brand" fill="currentColor" />
                                Table Schema Insight
                            </button>
                            <button className="flex items-center gap-3 px-6 py-3 bg-white border border-insight-border rounded-2xl whitespace-nowrap text-xs font-black uppercase tracking-wider hover:bg-insight-bg transition-all shadow-sm">
                                <Bot size={16} className="text-indigo-600" fill="currentColor" />
                                Optimization Tips
                            </button>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-brand/5 blur-2xl rounded-3xl group-focus-within:bg-brand/10 transition-colors"></div>
                            <div className="relative premium-card !rounded-[28px] flex items-center p-3 bg-white border border-insight-border shadow-xl">
                                <button className="p-4 text-[#94a3b8] hover:text-brand transition-colors">
                                    <PlusCircle size={32} />
                                </button>
                                <input
                                    placeholder="Ask InsightDB anything about your data..."
                                    className="flex-1 bg-transparent py-5 px-3 focus:outline-none text-[16px] font-bold text-insight-text placeholder:text-slate-400 placeholder:font-medium"
                                />
                                <button className="w-16 h-16 bg-[#0f172a] text-white rounded-[22px] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none ring-4 ring-brand/5">
                                    <Send size={28} className="ml-1" fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
