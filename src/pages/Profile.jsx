import { User, Mail, Bell, Shield, Palette, Globe, ChevronRight, Camera } from 'lucide-react';

export default function Profile() {
    const sections = [
        {
            title: 'Information', items: [
                { icon: User, label: 'Full Name', value: 'Felix Admin' },
                { icon: Mail, label: 'Email Address', value: 'felix@insightdb.io' },
            ]
        },
        {
            title: 'Security', items: [
                { icon: Shield, label: 'Two-Factor Auth', value: 'Enabled', active: true },
                { icon: Globe, label: 'Active Sessions', value: '3 Active' },
            ]
        }
    ];

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            <div className="max-w-4xl mx-auto space-y-10 px-6 lg:px-0">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Account Profile</h1>
                    <button className="px-6 py-3 bg-white border border-insight-border rounded-xl font-bold text-sm shadow-sm hover:bg-insight-bg transition-colors">Edit Profile</button>
                </div>

                {/* Profile Card */}
                <div className="premium-card p-10 flex flex-col md:flex-row items-center gap-10 bg-gradient-to-br from-white to-slate-50">
                    <div className="relative">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-32 h-32 rounded-[40px] bg-indigo-50 border-4 border-white shadow-xl" alt="Avatar" />
                        <button className="absolute -bottom-2 -right-2 p-3 bg-[#0f172a] text-white rounded-2xl shadow-elevated hover:scale-110 active:scale-95 transition-all">
                            <Camera size={20} />
                        </button>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-black text-[#0f172a] tracking-tight mb-2">Felix Admin</h2>
                        <p className="text-insight-muted font-bold text-lg mb-6">Senior Data Architect • Since Feb 2024</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="px-4 py-2 bg-brand/5 border border-brand/10 rounded-xl text-brand text-xs font-black uppercase">Admin Access</div>
                            <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 text-xs font-black uppercase">Verified</div>
                        </div>
                    </div>
                </div>

                {/* Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((sec, i) => (
                        <div key={i} className="space-y-6">
                            <h3 className="text-xs font-black text-insight-muted uppercase tracking-[0.2em] ml-1">{sec.title}</h3>
                            <div className="premium-card overflow-hidden">
                                {sec.items.map((item, j) => (
                                    <div key={j} className={`p-6 flex items-center justify-between hover:bg-[#f8fafc] transition-colors cursor-pointer ${j !== sec.items.length - 1 ? 'border-b border-insight-border' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                <item.icon size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-insight-muted uppercase tracking-widest">{item.label}</p>
                                                <p className="font-bold text-[#1e293b]">{item.value}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
