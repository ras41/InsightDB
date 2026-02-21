import { ChevronLeft, Database, Globe, Hash, User, Lock, Eye, Zap, Shield, BarChart3, Settings } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useNavigate } from 'react-router-dom';

export default function DatabaseConnection() {
    const navigate = useNavigate();

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
                        <Input label="Host" icon={Database} placeholder="db.example.com" defaultValue="db.example.com" />

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            <Input label="Port" placeholder="5432" defaultValue="5432" className="lg:col-span-1" />
                            <Input label="Database" placeholder="production_db" defaultValue="production_db" className="lg:col-span-2" />
                        </div>

                        <Input label="Username" icon={User} placeholder="admin_user" defaultValue="admin_user" />

                        <div className="relative">
                            <Input label="Password" icon={Lock} type="password" placeholder="••••••••••••" defaultValue="admin123" />
                            <button className="absolute right-4 top-[38px] text-insight-muted hover:text-brand">
                                <Eye size={18} />
                            </button>
                        </div>
                    </div>

                    <Button
                        className="w-full mt-10 text-xl py-6 rounded-[24px]"
                        onClick={() => navigate('/explorer')}
                    >
                        Launch Explorer <Zap size={22} fill="currentColor" />
                    </Button>

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
