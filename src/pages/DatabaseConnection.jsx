import { useState } from 'react';
import { ChevronLeft, Database, Globe, Hash, User, Lock, Eye, EyeOff, Zap, Shield, BarChart3, Settings, Loader2 } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { connectionAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import toast from 'react-hot-toast';

export default function DatabaseConnection() {
    const navigate = useNavigate();
    const { setConnection } = useConnection();
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        host: '',
        port: '5432',
        database: '',
        username: '',
        password: '',
        dbType: 'postgresql',
        name: '',
    });

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
            });
            setConnection(res.data.data);
            toast.success('Database connected successfully!');
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
                </div>
            </div>
        </div>
    );
}
