import { Settings as SettingsIcon, Bell, Palette, Globe, Shield, CreditCard, ChevronRight, Moon } from 'lucide-react';

export default function Settings() {
    const options = [
        { icon: Bell, label: 'Notifications', desc: 'Manage alerts and delivery settings' },
        { icon: Palette, label: 'Appearance', desc: 'Customize themes and interface colors' },
        { icon: Globe, label: 'Integrations', desc: 'Connect third-party data platforms' },
        { icon: CreditCard, label: 'Billing', desc: 'Manage your subscription and usage' },
        { icon: Moon, label: 'System Mode', desc: 'Switch between light and dark themes' },
    ];

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            <div className="max-w-4xl mx-auto space-y-10 px-6 lg:px-0">
                <div>
                    <h1 className="text-4xl font-black text-[#0f172a] tracking-tight mb-2">Workspace Settings</h1>
                    <p className="text-insight-muted font-bold">Configure your personal and workspace preferences.</p>
                </div>

                <div className="premium-card overflow-hidden">
                    {options.map((opt, i) => (
                        <div key={i} className={`p-8 flex items-center justify-between hover:bg-[#fcfdfe] transition-all cursor-pointer group ${i !== options.length - 1 ? 'border-b border-insight-border' : ''}`}>
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-slate-100 rounded-[20px] text-slate-500 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                                    <opt.icon size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-[#1e293b] tracking-tight">{opt.label}</h4>
                                    <p className="text-insight-muted font-bold text-sm mt-1">{opt.desc}</p>
                                </div>
                            </div>
                            <ChevronRight size={24} className="text-slate-300 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                        </div>
                    ))}
                </div>

                <div className="p-10 premium-card bg-[#0f172a] text-white flex flex-col md:flex-row items-center justify-between gap-8 border-none overflow-hidden relative">
                    <div className="absolute inset-0 bg-brand/5 blur-3xl rounded-full"></div>
                    <div className="relative z-10 text-center md:text-left">
                        <h3 className="text-2xl font-black mb-2 tracking-tight">Need Enterprise Support?</h3>
                        <p className="text-slate-400 font-medium">Get dedicated agents and custom integration workflows.</p>
                    </div>
                    <button className="relative z-10 px-10 py-5 bg-brand text-white rounded-2xl font-black shadow-elevated hover:bg-brand-dark transition-all whitespace-nowrap">Talk to Sales</button>
                </div>
            </div>
        </div>
    );
}
