import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegister) {
                if (!form.fullName || !form.email || !form.password) {
                    toast.error('All fields are required');
                    setLoading(false);
                    return;
                }
                if (form.password.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    setLoading(false);
                    return;
                }
                await register(form.fullName, form.email, form.password);
                toast.success('Account created successfully!');
            } else {
                if (!form.email || !form.password) {
                    toast.error('Email and password are required');
                    setLoading(false);
                    return;
                }
                await login(form.email, form.password);
                toast.success('Welcome back!');
            }
            navigate('/');
        } catch (err) {
            const message = err.response?.data?.message || 'Something went wrong';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc]">
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="max-w-md w-full">
                    {/* Logo */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-white shadow-elevated mx-auto mb-6">
                            <Database size={32} fill="currentColor" />
                        </div>
                        <h1 className="text-4xl font-black text-[#0f172a] tracking-tight mb-2">InsightDB</h1>
                        <p className="text-insight-muted font-bold">
                            {isRegister ? 'Create your account to get started' : 'Sign in to your data workspace'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="premium-card p-8 lg:p-10 space-y-6">
                        {isRegister && (
                            <Input
                                label="Full Name"
                                icon={User}
                                name="fullName"
                                placeholder="John Doe"
                                value={form.fullName}
                                onChange={handleChange}
                            />
                        )}

                        <Input
                            label="Email Address"
                            icon={Mail}
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                icon={Lock}
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••••••"
                                value={form.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[38px] text-insight-muted hover:text-brand transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full text-lg py-5 rounded-2xl"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isRegister ? 'Create Account' : 'Sign In'}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Toggle */}
                    <div className="text-center mt-8">
                        <p className="text-insight-muted font-bold text-sm">
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                onClick={() => setIsRegister(!isRegister)}
                                className="text-brand font-black ml-2 hover:underline"
                            >
                                {isRegister ? 'Sign In' : 'Create Account'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
