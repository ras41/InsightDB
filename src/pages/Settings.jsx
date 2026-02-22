import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Palette, Globe, Shield, CreditCard, ChevronRight, Moon, Loader2, Check } from 'lucide-react';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await settingsAPI.getAll();
            const data = res.data.data || {};
            // Convert array to object if needed
            if (Array.isArray(data)) {
                const obj = {};
                data.forEach(s => { obj[s.key] = s.value; });
                setSettings(obj);
            } else {
                setSettings(data);
            }
        } catch (err) {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const isEnabled = (val) => {
        if (val === null || val === undefined || val === false || val === 'false') return false;
        if (val === true || val === 'true') return true;
        if (typeof val === 'object') return Object.keys(val).length > 0;
        if (typeof val === 'string') return val === 'dark'; // for systemMode
        return false;
    };

    const handleToggleSetting = async (key) => {
        const currentValue = settings[key];
        const enabled = isEnabled(currentValue);
        let newValue;
        if (key === 'systemMode') {
            newValue = enabled ? 'light' : 'dark';
        } else {
            newValue = !enabled;
        }
        try {
            await settingsAPI.update(key, newValue);
            setSettings(prev => ({ ...prev, [key]: newValue }));
            toast.success(`${key} updated`);
        } catch (err) {
            toast.error('Failed to update setting');
        }
    };

    const handleResetSettings = async () => {
        try {
            await settingsAPI.reset();
            toast.success('Settings reset to defaults');
            fetchSettings();
        } catch (err) {
            toast.error('Failed to reset settings');
        }
    };

    const options = [
        { icon: Bell, label: 'Notifications', desc: 'Manage alerts and delivery settings', key: 'notifications' },
        { icon: Palette, label: 'Appearance', desc: 'Customize themes and interface colors', key: 'appearance' },
        { icon: Globe, label: 'Integrations', desc: 'Connect third-party data platforms', key: 'integrations' },
        { icon: CreditCard, label: 'Billing', desc: 'Manage your subscription and usage', key: 'billing' },
        { icon: Moon, label: 'System Mode', desc: 'Switch between light and dark themes', key: 'systemMode' },
    ];

    if (loading) {
        return (
            <div className="flex-1 min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <Loader2 size={40} className="animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            <div className="max-w-4xl mx-auto space-y-10 px-6 lg:px-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-[#0f172a] tracking-tight mb-2">Workspace Settings</h1>
                        <p className="text-insight-muted font-bold">Configure your personal and workspace preferences.</p>
                    </div>
                    <button
                        onClick={handleResetSettings}
                        className="px-6 py-3 bg-white border border-insight-border rounded-xl font-bold text-sm shadow-sm hover:bg-insight-bg transition-colors"
                    >
                        Reset All
                    </button>
                </div>

                <div className="premium-card overflow-hidden">
                    {options.map((opt, i) => (
                        <div
                            key={i}
                            onClick={() => handleToggleSetting(opt.key)}
                            className={`p-8 flex items-center justify-between hover:bg-[#fcfdfe] transition-all cursor-pointer group ${i !== options.length - 1 ? 'border-b border-insight-border' : ''}`}
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-slate-100 rounded-[20px] text-slate-500 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                                    <opt.icon size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-[#1e293b] tracking-tight">{opt.label}</h4>
                                    <p className="text-insight-muted font-bold text-sm mt-1">{opt.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {isEnabled(settings[opt.key]) ? (
                                    <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg">ON</span>
                                ) : (
                                    <span className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">OFF</span>
                                )}
                                <ChevronRight size={24} className="text-slate-300 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                            </div>
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
