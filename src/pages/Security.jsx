import { Shield, Lock, Key, Eye, EyeOff, Smartphone, FileCheck, LifeBuoy } from 'lucide-react';

export default function Security() {
    const securityFeatures = [
        { icon: Key, title: 'API Management', status: '3 Active Keys', desc: 'Secure access to your data resources via API.' },
        { icon: Smartphone, title: '2FA Auth', status: 'Configured', desc: 'Adding an extra layer of security to your account.' },
        { icon: FileCheck, title: 'Audit Logs', status: 'Last: 12m ago', desc: 'Detailed history of all system activities and accesses.' },
    ];

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            <div className="max-w-4xl mx-auto space-y-10 px-6 lg:px-0">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-brand rounded-[28px] flex items-center justify-center text-white shadow-elevated">
                        <Shield size={40} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Security & Access</h1>
                        <p className="text-insight-muted font-bold">Monitor and secure your data workspace.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {securityFeatures.map((f, i) => (
                        <div key={i} className="premium-card p-8 group hover:scale-[1.05] transition-all duration-500 cursor-pointer">
                            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-brand/5 group-hover:text-brand transition-colors mb-6 inline-block">
                                <f.icon size={24} />
                            </div>
                            <h4 className="text-xl font-black text-[#0f172a] mb-2">{f.title}</h4>
                            <div className="inline-block px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-md mb-4">{f.status}</div>
                            <p className="text-insight-muted font-bold text-xs leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="premium-card p-10 space-y-8">
                    <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">Encryption & Privacy</h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-6 p-6 bg-[#f8fafc] rounded-3xl border border-slate-100">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Lock size={20} className="text-brand" />
                            </div>
                            <div className="flex-1">
                                <h5 className="font-black text-[#1e293b]">End-to-End Encryption</h5>
                                <p className="text-sm font-medium text-insight-muted mt-2 leading-relaxed">All data in transit is encrypted using AES-256. Connection strings are never stored in plain text and are isolated for each session.</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-6 border border-insight-border rounded-3xl">
                            <div className="flex items-center gap-4">
                                <LifeBuoy size={20} className="text-indigo-500" />
                                <span className="font-bold text-[#1e293b]">Request Data Erasure</span>
                            </div>
                            <button className="text-rose-600 font-black text-xs uppercase tracking-widest hover:underline">Start Process</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
