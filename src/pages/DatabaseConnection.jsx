import { useState, useEffect } from 'react';
import { ChevronLeft, Database, Globe, Hash, User, Lock, Eye, EyeOff, Zap, Shield, BarChart3, Settings, Loader2, Trash2, PlugZap, Clock } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { connectionAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import toast from 'react-hot-toast';

export default function DatabaseConnection() {
    const navigate = useNavigate();
    const { activeConnection, setConnection } = useConnection();
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [savedConnections, setSavedConnections] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(true);
    const [connectingId, setConnectingId] = useState(null);

    const [form, setForm] = useState({
        host: '',
        port: '5432',
        database: '',
        username: '',
        password: '',
        dbType: 'postgresql',
        name: '',
        ssl: true,
    });

    useEffect(() => {
        fetchSavedConnections();
    }, []);

    const fetchSavedConnections = async () => {
        setLoadingSaved(true);
        try {
            const res = await connectionAPI.getAll();
            setSavedConnections(res.data.data || []);
        } catch (err) {
            // silent — user may not have any saved connections yet
        } finally {
            setLoadingSaved(false);
        }
    };

    const handleReconnect = async (conn) => {
        setConnectingId(conn.id);
        try {
            // Test the saved connection first
            const res = await connectionAPI.getById(conn.id);
            const connData = res.data.data;
            setConnection(connData);
            toast.success(`Connected to ${connData.name}`);
            navigate('/explorer');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reconnect');
        } finally {
            setConnectingId(null);
        }
    };

    const handleDeleteConnection = async (id) => {
        try {
            await connectionAPI.delete(id);
            setSavedConnections(prev => prev.filter(c => c.id !== id));
            if (activeConnection?.id === id) {
                setConnection(null);
            }
            toast.success('Connection removed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTestConnection = async () => {
        if (!form.host || !form.database || !form.username || !form.password) {
            toast.error('Please fill in all fields');
            return;
        }
        setTesting(true);
        try {
            await connectionAPI.test({
                dbType: form.dbType,
                host: form.host,
                port: parseInt(form.port),
                database: form.database,
                username: form.username,
                password: form.password,
                ssl: form.ssl,
            });
            toast.success('Connection successful!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Connection failed');
        } finally {
            setTesting(false);
        }
    };

    const handleConnect = async () => {
        if (!form.host || !form.database || !form.username || !form.password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await connectionAPI.create({
                name: form.name || `${form.database}@${form.host}`,
                dbType: form.dbType,
                host: form.host,
                port: parseInt(form.port),
                database: form.database,
                username: form.username,
                password: form.password,
                ssl: form.ssl,
            });
            setConnection(res.data.data);
            toast.success('Database connected successfully!');
            fetchSavedConnections();
            navigate('/explorer');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save connection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center px-6 py-8">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-insight-bg rounded-lg transition-colors">
                    <ChevronLeft size={24} className="text-insight-text" />
                </button>
                <h1 className="flex-1 text-center font-bold text-lg text-insight-text mr-4">Database Connection</h1>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
                <div className="max-w-xl w-full">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-[#0f172a] mb-4 tracking-tight">Connect Your Database</h2>
                        <p className="text-insight-muted text-lg leading-relaxed max-w-[320px] mx-auto">
                            Your gateway to AI-powered data intelligence.
                        </p>
                    </div>

                    <div className="premium-card p-10 space-y-8 bg-white/40 backdrop-blur-xl">
                        {/* Connection Name */}
                        <Input
                            label="Connection Name"
                            icon={Database}
                            name="name"
                            placeholder="My Production DB"
                            value={form.name}
                            onChange={handleChange}
                        />

                        {/* Database Type */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-insight-muted uppercase tracking-wider ml-1">Database Type</label>
                            <div className="flex gap-3">
                                {['postgresql', 'mysql'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setForm(prev => ({ ...prev, dbType: type, port: type === 'postgresql' ? '5432' : '3306' }))}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${form.dbType === type ? 'bg-brand text-white border-brand shadow-elevated' : 'bg-[#f8fafc] text-insight-muted border-insight-border hover:border-brand/40'}`}
                                    >
                                        {type === 'postgresql' ? 'PostgreSQL' : 'MySQL'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input label="Host" icon={Database} name="host" placeholder="db.example.com" value={form.host} onChange={handleChange} />

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            <Input label="Port" name="port" placeholder="5432" value={form.port} onChange={handleChange} className="lg:col-span-1" />
                            <Input label="Database" name="database" placeholder="production_db" value={form.database} onChange={handleChange} className="lg:col-span-2" />
                        </div>

                        <Input label="Username" icon={User} name="username" placeholder="admin_user" value={form.username} onChange={handleChange} />

                        <div className="relative">
                            <Input label="Password" icon={Lock} name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••••••" value={form.password} onChange={handleChange} />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-insight-muted hover:text-brand">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* SSL Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-insight-border bg-[#f8fafc]">
                            <div className="flex items-center gap-3">
                                <Shield size={18} className={form.ssl ? 'text-green-500' : 'text-insight-muted'} />
                                <div>
                                    <p className="text-sm font-bold text-[#0f172a]">SSL Mode</p>
                                    <p className="text-[10px] font-bold text-insight-muted uppercase tracking-widest">Required for cloud databases (Neon, Supabase, etc.)</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setForm(prev => ({ ...prev, ssl: !prev.ssl }))}
                                className={`relative w-12 h-7 rounded-full transition-all duration-300 ${form.ssl ? 'bg-green-500' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${form.ssl ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-10">
                        <Button
                            variant="secondary"
                            className="flex-1 text-base py-6 rounded-[24px]"
                            onClick={handleTestConnection}
                            disabled={testing}
                        >
                            {testing ? <Loader2 size={20} className="animate-spin" /> : 'Test Connection'}
                        </Button>
                        <Button
                            className="flex-[2] text-xl py-6 rounded-[24px]"
                            onClick={handleConnect}
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={22} className="animate-spin" /> : (
                                <>Launch Explorer <Zap size={22} fill="currentColor" /></>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-3 mt-8">
                        <div className="h-px bg-insight-border flex-1"></div>
                        <div className="flex items-center gap-2 text-insight-muted text-sm font-bold bg-[#f8fafc] px-4">
                            <Shield size={16} fill="currentColor" className="text-insight-muted/20" />
                            <span>AES-256 Encrypted Connection</span>
                        </div>
                        <div className="h-px bg-insight-border flex-1"></div>
                    </div>

                    {/* Saved Connections */}
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-[#0f172a] tracking-tight">Saved Connections</h3>
                            <span className="text-xs font-bold text-insight-muted uppercase tracking-widest">
                                {savedConnections.length} saved
                            </span>
                        </div>

                        {loadingSaved ? (
                            <div className="flex justify-center py-10">
                                <Loader2 size={28} className="animate-spin text-brand" />
                            </div>
                        ) : savedConnections.length === 0 ? (
                            <div className="premium-card p-8 text-center bg-white/40 backdrop-blur-xl">
                                <Database size={32} className="mx-auto text-insight-muted/40 mb-3" />
                                <p className="text-insight-muted font-bold text-sm">No saved connections yet</p>
                                <p className="text-insight-muted text-xs mt-1">Create a connection above and it will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {savedConnections.map(conn => (
                                    <div
                                        key={conn.id}
                                        className={`premium-card p-6 bg-white/60 backdrop-blur-xl transition-all hover:shadow-elevated group ${activeConnection?.id === conn.id ? 'ring-2 ring-brand border-brand' : 'hover:border-brand/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${activeConnection?.id === conn.id
                                                ? 'bg-brand text-white'
                                                : 'bg-[#eff6ff] text-brand'
                                                }`}>
                                                <Database size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-[#1e293b] truncate">{conn.name}</h4>
                                                    {activeConnection?.id === conn.id && (
                                                        <span className="text-[9px] font-black bg-brand/10 text-brand px-2 py-0.5 rounded-md uppercase tracking-widest shrink-0">Active</span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-insight-muted mt-1 truncate">
                                                    {conn.dbType === 'postgresql' ? 'PostgreSQL' : 'MySQL'} • {conn.host}:{conn.port} / {conn.database}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {activeConnection?.id === conn.id ? (
                                                    <button
                                                        onClick={() => navigate('/explorer')}
                                                        className="px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        Open Explorer
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReconnect(conn)}
                                                        disabled={connectingId === conn.id}
                                                        className="px-5 py-2.5 bg-[#0f172a] text-white rounded-xl text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {connectingId === conn.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <PlugZap size={14} />
                                                        )}
                                                        Connect
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteConnection(conn.id)}
                                                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Delete connection"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
