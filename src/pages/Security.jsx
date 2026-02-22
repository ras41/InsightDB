import { useState, useEffect } from 'react';
import { Shield, Lock, Key, Eye, EyeOff, Smartphone, FileCheck, LifeBuoy, Loader2, Plus, Trash2, Copy, Check } from 'lucide-react';
import { securityAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Security() {
    const [apiKeys, setApiKeys] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [showCreateKey, setShowCreateKey] = useState(false);
    const [copiedKey, setCopiedKey] = useState(null);
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);

    useEffect(() => {
        fetchSecurityData();
    }, []);

    const fetchSecurityData = async () => {
        setLoading(true);
        try {
            const [keysRes, logsRes, sessRes] = await Promise.all([
                securityAPI.getApiKeys(),
                securityAPI.getAuditLogs({ limit: 5 }),
                securityAPI.getSessions(),
            ]);
            setApiKeys(keysRes.data.data || []);
            setAuditLogs(logsRes.data.data?.logs || []);
            setSessions(sessRes.data.data || []);
        } catch (err) {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) {
            toast.error('Please enter a key name');
            return;
        }
        setCreating(true);
        try {
            const res = await securityAPI.createApiKey({ name: newKeyName });
            toast.success('API Key created!');
            setNewKeyName('');
            setShowCreateKey(false);
            fetchSecurityData();
            // Show the key to user
            if (res.data.data?.key) {
                navigator.clipboard.writeText(res.data.data.key);
                toast.success('Key copied to clipboard!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create key');
        } finally {
            setCreating(false);
        }
    };

    const handleRevokeKey = async (id) => {
        try {
            await securityAPI.revokeApiKey(id);
            toast.success('API Key revoked');
            fetchSecurityData();
        } catch (err) {
            toast.error('Failed to revoke key');
        }
    };

    const handleToggle2FA = async () => {
        try {
            const res = await securityAPI.toggle2FA();
            setTwoFAEnabled(res.data.data?.twoFactorEnabled || false);
            toast.success(`2FA ${res.data.data?.twoFactorEnabled ? 'enabled' : 'disabled'}`);
        } catch (err) {
            toast.error('Failed to toggle 2FA');
        }
    };

    const handleDataErasure = async () => {
        if (!window.confirm('Are you sure you want to request data erasure? This action cannot be undone.')) return;
        try {
            await securityAPI.requestDataErasure();
            toast.success('Data erasure request submitted');
        } catch (err) {
            toast.error('Failed to submit request');
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return d.toLocaleDateString();
    };

    const securityFeatures = [
        { icon: Key, title: 'API Management', status: `${apiKeys.length} Active Keys`, desc: 'Secure access to your data resources via API.' },
        { icon: Smartphone, title: '2FA Auth', status: twoFAEnabled ? 'Enabled' : 'Disabled', desc: 'Adding an extra layer of security to your account.' },
        { icon: FileCheck, title: 'Audit Logs', status: auditLogs.length > 0 ? `Last: ${formatDate(auditLogs[0]?.createdAt)}` : 'No logs', desc: 'Detailed history of all system activities and accesses.' },
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
                        <div
                            key={i}
                            onClick={() => {
                                if (i === 1) handleToggle2FA();
                            }}
                            className="premium-card p-8 group hover:scale-[1.05] transition-all duration-500 cursor-pointer"
                        >
                            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-brand/5 group-hover:text-brand transition-colors mb-6 inline-block">
                                <f.icon size={24} />
                            </div>
                            <h4 className="text-xl font-black text-[#0f172a] mb-2">{f.title}</h4>
                            <div className="inline-block px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-md mb-4">{f.status}</div>
                            <p className="text-insight-muted font-bold text-xs leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* API Keys Section */}
                <div className="premium-card p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-[#0f172a] tracking-tight">API Keys</h3>
                        <button
                            onClick={() => setShowCreateKey(!showCreateKey)}
                            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-all"
                        >
                            <Plus size={16} /> New Key
                        </button>
                    </div>

                    {showCreateKey && (
                        <div className="flex gap-4 p-4 bg-[#f8fafc] rounded-2xl">
                            <input
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="Key name (e.g. Production API)"
                                className="flex-1 bg-white border border-insight-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                            <button
                                onClick={handleCreateKey}
                                disabled={creating}
                                className="px-6 py-3 bg-[#0f172a] text-white rounded-xl text-sm font-bold"
                            >
                                {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {apiKeys.length === 0 ? (
                            <p className="text-insight-muted font-bold text-center py-6">No API keys created yet</p>
                        ) : (
                            apiKeys.map((key) => (
                                <div key={key.id} className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl">
                                    <div>
                                        <p className="font-bold text-[#1e293b]">{key.name}</p>
                                        <p className="text-xs text-insight-muted font-bold mt-1">
                                            Created: {formatDate(key.createdAt)} • Last used: {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRevokeKey(key.id)}
                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Audit Logs */}
                {auditLogs.length > 0 && (
                    <div className="premium-card p-8 space-y-6">
                        <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Recent Audit Logs</h3>
                        <div className="space-y-3">
                            {auditLogs.map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl">
                                    <div>
                                        <p className="font-bold text-[#1e293b] text-sm">{log.action}</p>
                                        <p className="text-xs text-insight-muted font-bold mt-1">{log.details}</p>
                                    </div>
                                    <span className="text-xs font-bold text-insight-muted">{formatDate(log.createdAt)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                            <button onClick={handleDataErasure} className="text-rose-600 font-black text-xs uppercase tracking-widest hover:underline">
                                Start Process
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
