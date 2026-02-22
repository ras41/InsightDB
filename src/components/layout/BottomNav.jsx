import { useNavigate, useLocation } from 'react-router-dom';
import { Database, BarChart3, LayoutGrid, Sparkles, User } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const items = [
        { icon: LayoutGrid, label: 'Explorer', path: '/explorer' },
        { icon: Database, label: 'Connect', path: '/' },
        { icon: Sparkles, label: 'AI Chat', path: '/ai-chat' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-insight-border px-6 py-4 flex justify-between items-center z-50">
            {items.map((item) => {
                const active = location.pathname === item.path;
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={twMerge(
                            "flex flex-col items-center gap-1 transition-all duration-300",
                            active ? "text-brand scale-110" : "text-insight-muted"
                        )}
                    >
                        <item.icon size={24} fill={active ? "currentColor" : "none"} className={twMerge(active ? "text-brand" : "text-insight-muted")} />
                        <span className={twMerge("text-[10px] uppercase font-black tracking-tighter", active ? "opacity-100" : "opacity-60")}>
                            {item.label}
                        </span>
                        {active && <div className="w-1 h-1 bg-brand rounded-full mt-0.5" />}
                    </button>
                );
            })}
        </nav>
    );
}
