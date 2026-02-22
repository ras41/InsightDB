import { useState, useEffect } from 'react';
import { ChevronLeft, Fingerprint, Calendar, CheckCircle2, Database, Sparkles, Table as TableIcon, Loader2, Hash, Key, Type } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { explorerAPI } from '../services/api';
import { useConnection } from '../context/ConnectionContext';
import toast from 'react-hot-toast';

const typeIcons = {
    integer: Hash, bigint: Hash, int4: Hash, int8: Hash, serial: Hash,
    uuid: Fingerprint,
    text: Type, varchar: Type, 'character varying': Type, char: Type,
    timestamp: Calendar, 'timestamp without time zone': Calendar, 'timestamp with time zone': Calendar, date: Calendar,
    boolean: CheckCircle2, bool: CheckCircle2,
};

const typeColors = {
    integer: 'bg-purple-50 text-purple-600', bigint: 'bg-purple-50 text-purple-600', int4: 'bg-purple-50 text-purple-600', int8: 'bg-purple-50 text-purple-600', serial: 'bg-purple-50 text-purple-600',
    uuid: 'bg-indigo-50 text-indigo-600',
    text: 'bg-blue-50 text-blue-600', varchar: 'bg-blue-50 text-blue-600', 'character varying': 'bg-blue-50 text-blue-600', char: 'bg-blue-50 text-blue-600',
    timestamp: 'bg-sky-50 text-sky-600', 'timestamp without time zone': 'bg-sky-50 text-sky-600', 'timestamp with time zone': 'bg-sky-50 text-sky-600', date: 'bg-sky-50 text-sky-600',
    boolean: 'bg-green-50 text-green-600', bool: 'bg-green-50 text-green-600',
};

export default function TableDetail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableName = searchParams.get('table') || 'orders';
    const { activeConnection } = useConnection();
    const connId = activeConnection?.id;

    const [columns, setColumns] = useState([]);
    const [stats, setStats] = useState(null);
    const [dataPreview, setDataPreview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showData, setShowData] = useState(false);

    useEffect(() => {
        if (!connId) return;
        fetchTableInfo();
    }, [connId, tableName]);

    const fetchTableInfo = async () => {
        setLoading(true);
        try {
            const [colRes, statsRes] = await Promise.all([
                explorerAPI.getColumns(connId, tableName),
                explorerAPI.getStats(connId, tableName),
            ]);
            setColumns(colRes.data.data || []);
            setStats(statsRes.data.data || null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch table info');
        } finally {
            setLoading(false);
        }
    };

    const fetchDataPreview = async () => {
        try {
            const res = await explorerAPI.getData(connId, tableName, { limit: 20 });
            setDataPreview(res.data.data?.rows || []);
            setShowData(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch data');
        }
    };

    const getIcon = (dataType) => typeIcons[dataType?.toLowerCase()] || Type;
    const getColor = (dataType) => typeColors[dataType?.toLowerCase()] || 'bg-slate-50 text-slate-600';

    if (loading) {
        return (
            <div className="flex-1 min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <Loader2 size={40} className="animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] lg:p-10 pb-32">
            {/* Mobile Header */}
            <div className="bg-white/40 backdrop-blur-xl border-b border-insight-border sticky top-0 z-30 px-6 py-6 flex lg:hidden items-center">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-insight-text">
                    <ChevronLeft size={24} />
                </button>
                <span className="flex-1 text-center font-black capitalize">{tableName} Table</span>
            </div>

            <div className="max-w-7xl mx-auto space-y-10 py-6 px-6 lg:px-0">
                {/* Desktop Header */}
                <div className="hidden lg:flex items-start justify-between">
                    <div className="flex gap-8 items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-16 h-16 bg-white border border-insight-border rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ChevronLeft size={28} className="text-[#0f172a]" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 text-brand font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                                <TableIcon size={14} fill="currentColor" />
                                Table Detail
                            </div>
                            <h1 className="text-5xl font-black text-[#0f172a] tracking-tight capitalize">{tableName} Table</h1>
                            <p className="text-insight-muted font-bold mt-2">
                                {stats?.totalRows ? `${Number(stats.totalRows).toLocaleString()} rows` : ''} {stats?.columnCount ? `• ${stats.columnCount} columns` : ''} {stats?.completeness ? `• Completeness: ${stats.completeness}` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchDataPreview} className="px-8 py-4 bg-white rounded-2xl border border-insight-border font-bold shadow-sm hover:bg-insight-bg transition-colors">
                            Preview Data
                        </button>
                        <button onClick={() => navigate(-1)} className="px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-bold shadow-elevated hover:scale-105 active:scale-95 transition-all">
                            Back to Explorer
                        </button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columns Schema */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Columns Schema ({columns.length})</h3>
                        </div>
                        <div className="premium-card p-6 space-y-4">
                            {columns.length === 0 ? (
                                <p className="text-insight-muted font-bold text-center py-8">No columns found</p>
                            ) : (
                                columns.map((col, i) => {
                                    const IconComp = getIcon(col.data_type);
                                    const colorClass = getColor(col.data_type);
                                    return (
                                        <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-[#f8fafc] transition-colors border border-transparent hover:border-insight-border group">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
                                                <IconComp size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-lg font-black text-[#1e293b] truncate">{col.column_name}</h4>
                                                    {col.is_primary_key && <span className="bg-purple-50 text-purple-600 text-[9px] font-black px-2 py-0.5 rounded-md">PK</span>}
                                                    {col.is_foreign_key && <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-md">FK</span>}
                                                </div>
                                                <p className="text-insight-muted text-xs font-bold mt-1 uppercase tracking-wide">
                                                    {col.data_type} {col.character_maximum_length ? `(${col.character_maximum_length})` : ''} • Nullable: {col.is_nullable || 'NO'}
                                                </p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                {col.column_default && (
                                                    <>
                                                        <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Default</p>
                                                        <p className="text-xs font-bold text-insight-muted truncate max-w-[120px]">{col.column_default}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Stats & AI Summary */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Table Stats</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Total Rows', val: stats?.totalRows ? Number(stats.totalRows).toLocaleString() : 'N/A', status: stats?.completeness || '', color: 'green' },
                                { label: 'Columns', val: columns.length.toString(), status: `${columns.filter(c => c.is_nullable === 'YES').length} nullable`, color: 'brand' },
                                { label: 'Data Quality', val: stats?.completeness || 'N/A', status: stats?.totalNulls != null ? `${stats.totalNulls} nulls` : '', color: 'rose' },
                            ].map((item, i) => (
                                <div key={i} className="premium-card p-6 flex items-center justify-between border-l-[6px]" style={{ borderColor: item.color === 'brand' ? '#6d28d9' : item.color === 'green' ? '#22c55e' : '#f43f5e' }}>
                                    <div>
                                        <p className="text-xs font-black text-insight-muted uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-3xl font-black text-[#0f172a]">{item.val}</p>
                                    </div>
                                    <span className="text-xs font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-600">{item.status}</span>
                                </div>
                            ))}
                        </div>

                        {/* AI Summary Card */}
                        <div className="bg-[#0f172a] rounded-[32px] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-brand/10 blur-[80px] rounded-full"></div>
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="text-brand" size={20} />
                                    <span className="text-sm font-black tracking-tight">AI Summary</span>
                                </div>
                                <p className="text-sm font-medium leading-relaxed text-slate-300">
                                    The <span className="text-white font-bold capitalize">{tableName}</span> table has {columns.length} columns
                                    with {columns.filter(c => c.is_primary_key).length} primary key{columns.filter(c => c.is_primary_key).length !== 1 ? 's' : ''}.
                                    {stats?.totalRows ? ` Contains ${Number(stats.totalRows).toLocaleString()} records.` : ''}
                                    {columns.filter(c => c.is_nullable === 'YES').length > 0 ? ` ${columns.filter(c => c.is_nullable === 'YES').length} columns allow null values.` : ' All columns are non-nullable.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Preview */}
                {showData && dataPreview.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#0f172a] tracking-tight">Data Preview ({dataPreview.length} rows)</h3>
                            <button onClick={() => setShowData(false)} className="text-brand font-black text-xs uppercase tracking-widest">Hide</button>
                        </div>
                        <div className="premium-card overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-insight-border">
                                        {Object.keys(dataPreview[0]).map(key => (
                                            <th key={key} className="text-left p-4 text-[10px] font-black text-insight-muted uppercase tracking-widest whitespace-nowrap">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataPreview.map((row, i) => (
                                        <tr key={i} className="border-b border-insight-border/50 hover:bg-[#f8fafc]">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="p-4 font-medium text-[#1e293b] whitespace-nowrap max-w-[200px] truncate">
                                                    {val === null ? <span className="text-insight-muted italic">null</span> : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
