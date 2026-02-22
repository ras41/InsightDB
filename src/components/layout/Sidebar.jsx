import { useNavigate, useLocation } from 'react-router-dom';
import { Database, BarChart3, Shield, Settings, LayoutGrid, FileCode, Sparkles, User, LogOut } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../context/AuthContext';
import { useConnection } from '../../context/ConnectionContext';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { activeConnection, clearConnection } = useConnection();

    const menuItems = [
        { icon: LayoutGrid, label: 'Explorer', path: '/explorer' },
        { icon: FileCode, label: 'Queries', path: '/queries' },
        { icon: BarChart3, label: 'Insights', path: '/insights' },
        { icon: Sparkles, label: 'AI Chat', path: '/ai-chat' },
    ];

    const bottomItems = [
        { icon: Shield, label: 'Security', path: '/security' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        clearConnection();
        logout();
        navigate('/login');
    };

    return (
        <aside className="hidden lg:flex w-72 bg-white border-r border-insight-border flex-col h-screen sticky top-0 z-50">
            <div className="p-8 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-elevated">
                    <Database size={24} fill="currentColor" />
                </div>
                <span className="text-xl font-black tracking-tight text-[#0f172a]">InsightDB</span>
            </div>

            {/* Connection indicator */}
            {activeConnection && (
                <div className="mx-4 mb-4 px-4 py-3 bg-green-50 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                        <span className="text-xs font-black text-green-700 truncate">{activeConnection.database || activeConnection.name}</span>
                    </div>
                    <button
                        onClick={() => { clearConnection(); navigate('/'); }}
                        className="text-[10px] font-bold text-green-600 hover:underline mt-1 ml-4"
                    >
                        Disconnect
                    </button>
                </div>
            )}

            <nav className="flex-1 px-4 space-y-2 mt-4">
                <p className="px-4 text-[10px] font-bold text-insight-muted uppercase tracking-widest mb-4">Main Menu</p>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={twMerge(
                                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                                active
                                    ? "bg-brand/5 text-brand shadow-[inset_0_0_0_1px_rgba(109,40,217,0.1)]"
                                    : "text-insight-muted hover:bg-insight-bg hover:text-insight-text"
                            )}
                        >
                            <item.icon size={22} className={twMerge(active ? "text-brand" : "text-insight-muted group-hover:text-insight-text")} />
                            <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            {active && <div className="ml-auto w-1.5 h-1.5 bg-brand rounded-full shadow-[0_0_8px_rgba(109,40,217,0.4)]" />}
                        </button>
                    );
                })}
            </nav>

            <div className="px-4 py-8 space-y-2 border-t border-insight-border">
                <p className="px-4 text-[10px] font-bold text-insight-muted uppercase tracking-widest mb-4">System</p>
                {bottomItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={twMerge(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-insight-muted hover:bg-insight-bg hover:text-insight-text",
                                active && "bg-insight-bg text-insight-text"
                            )}
                        >
                            <item.icon size={20} />
                            <span className="font-bold text-xs tracking-tight">{item.label}</span>
                        </button>
                    );
                })}

                <div className="mt-8 px-4 py-4 bg-[#f8fafc] rounded-2xl flex items-center gap-3">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`}
                        className="w-10 h-10 rounded-full bg-white border border-insight-border cursor-pointer"
                        alt="Avatar"
                        onClick={() => navigate('/profile')}
                    />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate('/profile')}>
                        <p className="text-xs font-black text-[#0f172a] truncate">{user?.fullName || 'User'}</p>
                        <p className="text-[10px] font-bold text-insight-muted truncate">{user?.email || ''}</p>
                    </div>
                    <button onClick={handleLogout} className="text-insight-muted hover:text-rose-500 transition-colors" title="Sign out">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
