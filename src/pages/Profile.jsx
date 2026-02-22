import { useState, useEffect } from 'react';
import { User, Mail, Bell, Shield, Palette, Globe, ChevronRight, Camera, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
    });

    useEffect(() => {
        if (user) {
            setForm({ fullName: user.fullName || '', email: user.email || '' });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await profileAPI.update({ fullName: form.fullName });
            updateUser(res.data.data);
            toast.success('Profile updated!');
            setEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        {
            title: 'Information', items: [
                { icon: User, label: 'Full Name', value: user?.fullName || 'N/A' },
                { icon: Mail, label: 'Email Address', value: user?.email || 'N/A' },
            ]
        },
        {
            title: 'Security', items: [
                { icon: Shield, label: 'Two-Factor Auth', value: user?.twoFactorEnabled ? 'Enabled' : 'Disabled', active: user?.twoFactorEnabled },
                { icon: Globe, label: 'Account Status', value: user?.isActive !== false ? 'Active' : 'Inactive' },
            ]
        }
    ];

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            <div className="max-w-4xl mx-auto space-y-10 px-6 lg:px-0">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Account Profile</h1>
                    <button
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        disabled={loading}
                        className="px-6 py-3 bg-white border border-insight-border rounded-xl font-bold text-sm shadow-sm hover:bg-insight-bg transition-colors flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : editing ? (
                            <><Save size={16} /> Save</>
                        ) : 'Edit Profile'}
                    </button>
                </div>

                {/* Profile Card */}
                <div className="premium-card p-10 flex flex-col md:flex-row items-center gap-10 bg-gradient-to-br from-white to-slate-50">
                    <div className="relative">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`} className="w-32 h-32 rounded-[40px] bg-indigo-50 border-4 border-white shadow-xl" alt="Avatar" />
                        <button className="absolute -bottom-2 -right-2 p-3 bg-[#0f172a] text-white rounded-2xl shadow-elevated hover:scale-110 active:scale-95 transition-all">
                            <Camera size={20} />
                        </button>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        {editing ? (
                            <div className="space-y-4">
                                <input
                                    value={form.fullName}
                                    onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                                    className="text-3xl font-black text-[#0f172a] tracking-tight bg-white border border-insight-border rounded-xl px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand/20"
                                />
                                <p className="text-insight-muted font-bold text-lg">{user?.email}</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-black text-[#0f172a] tracking-tight mb-2">{user?.fullName || 'User'}</h2>
                                <p className="text-insight-muted font-bold text-lg mb-6">{user?.email}</p>
                            </>
                        )}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
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
