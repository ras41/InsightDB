import { Table, User as UserIcon, LayoutGrid, GitFork, MessageSquare, Eye, FileCode, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

const ICON_MAP = {
    table: Table,
    user: UserIcon,
    'layout-grid': LayoutGrid,
    'git-fork': GitFork,
    'message-square': MessageSquare,
    view: Eye,
    function: FileCode,
};

export default function TableCard({ object }) {
    const navigate = useNavigate();
    const Icon = ICON_MAP[object.icon] || Table;

    const handleNavigate = () => {
        navigate('/table-detail', { state: { tableName: object.name, schema: object.schema, rows: object.rows, size: object.size, type: object.type } });
    };

    return (
        <div
            onClick={handleNavigate}
            className={clsx(
                "premium-card overflow-hidden group cursor-pointer flex flex-col p-6 h-full transition-all duration-300",
                "bg-white hover:border-brand/40 hover:shadow-elevated lg:hover:-translate-y-1"
            )}
        >
            <div className="flex items-center gap-5 mb-6">
                <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors bg-[#eff6ff] text-insight-muted group-hover:text-brand"
                )}>
                    <Icon size={28} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xl font-black truncate tracking-tight text-[#0f172a]">{object.name}</h4>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-slate-100 text-slate-500">
                                {object.schema}
                            </span>
                            {object.badge && (
                                <span className="bg-[#f3e8ff] text-[#7c3aed] text-[8px] font-black px-2 py-1 rounded-md shrink-0">{object.badge}</span>
                            )}
                        </div>
                    </div>
                    <p className="text-xs font-bold mt-1 text-insight-muted">
                        {object.rows ? `${object.rows} rows • ${object.size}` : `${object.type} object`}
                    </p>
                </div>
            </div>

            <div className="mt-auto">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-insight-muted truncate mr-4">
                        {object.description || 'No description available'}
                    </p>
                    <ChevronRight size={16} className="ml-auto text-insight-muted transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </div>
    );
}
