import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ className, children, variant = 'primary', ...props }) {
    const baseStyles = 'flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-2xl transition-all active:scale-95';

    const variants = {
        primary: 'bg-brand text-white shadow-elevated hover:bg-brand-dark',
        secondary: 'bg-white text-insight-text border border-insight-border hover:bg-insight-bg',
        outline: 'bg-transparent text-brand border border-brand hover:bg-brand/5',
        ghost: 'bg-transparent text-insight-muted hover:bg-insight-bg',
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
}

export function Input({ label, icon: Icon, error, className, ...props }) {
    return (
        <div className={twMerge("flex flex-col gap-1.5", className)}>
            {label && <label className="text-[10px] font-bold text-insight-muted uppercase tracking-wider ml-1">{label}</label>}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-insight-muted group-focus-within:text-brand transition-colors">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    className={clsx(
                        "w-full bg-[#f8fafc] border border-insight-border rounded-xl py-4 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-medium placeholder:text-insight-muted/50",
                        Icon ? "pl-12 pr-4" : "px-4"
                    )}
                    {...props}
                />
            </div>
            {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
        </div>
    );
}
