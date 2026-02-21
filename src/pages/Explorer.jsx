import { useState } from 'react';
import { Search, SlidersHorizontal, Terminal, Loader2, RefreshCw, ChevronDown, SortAsc } from 'lucide-react';
import { useExplorer } from '../hooks/useExplorer';
import TableCard from '../components/explorer/TableCard';
import TerminalDrawer from '../components/explorer/TerminalDrawer';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Explorer() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    activeTab,
    setActiveTab,
    objects,
    isLoading,
    searchQuery,
    setSearchQuery,
    stats,
    schemas,
    selectedSchema,
    setSelectedSchema,
    sortBy,
    setSortBy
  } = useExplorer();

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] lg:p-8">
      {/* Page Header */}
      <div className="px-6 lg:px-0 pt-8 lg:pt-0 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight">Explorer</h1>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
            <span className="text-insight-muted font-bold">Connected:</span>
            <span className="text-brand font-black underline decoration-brand/20 underline-offset-4">ecommerce_db</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 bg-white p-1 rounded-2xl border border-insight-border shadow-sm">
            {['tables', 'views', 'functions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 capitalize",
                  activeTab === tab
                    ? "bg-brand text-white shadow-elevated"
                    : "text-insight-muted hover:text-insight-text"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={handleManualRefresh}
            className={clsx(
              "p-3.5 bg-white border border-insight-border rounded-xl text-insight-muted hover:text-brand transition-all shadow-sm",
              (isLoading || isRefreshing) && "animate-spin text-brand"
            )}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white lg:rounded-[40px] border-t lg:border border-insight-border p-6 lg:p-10 shadow-premium overflow-hidden flex flex-col">
        {/* Controls Layer */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-brand/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center bg-[#f8fafc] rounded-2xl px-5 border border-transparent focus-within:border-brand/20 focus-within:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <Search className="text-insight-muted shrink-0" size={20} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search schemas, tables, or columns..."
                  className="w-full bg-transparent py-5 px-4 focus:outline-none text-[15px] font-medium"
                />
                {isLoading && searchQuery && <Loader2 className="animate-spin text-brand" size={18} />}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#f1f5f9] px-6 py-5 pr-12 rounded-2xl text-[15px] font-black text-insight-text outline-none hover:bg-[#e2e8f0] transition-colors cursor-pointer border-none"
                >
                  <option value="name">Sort: Name</option>
                  <option value="rows">Sort: Rows</option>
                  <option value="size">Sort: Size</option>
                </select>
                <SortAsc className="absolute right-5 top-1/2 -translate-y-1/2 text-insight-muted pointer-events-none" size={16} />
              </div>

              <button className="flex items-center justify-center gap-3 px-8 py-5 bg-[#0f172a] text-white rounded-2xl font-bold text-[15px] hover:scale-105 active:scale-95 transition-all shadow-elevated">
                <SlidersHorizontal size={20} />
                Filters
              </button>
            </div>
          </div>

          {/* Schema Selector Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar scrollbar-hide">
            {['all', ...schemas].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSchema(s)}
                className={clsx(
                  "px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 shadow-sm border whitespace-nowrap",
                  selectedSchema === s
                    ? "bg-brand text-white border-transparent shadow-elevated scale-105"
                    : "bg-white text-insight-muted border-insight-border hover:border-brand/40"
                )}
              >
                {s === 'all' ? 'All Schemas' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-insight-muted uppercase tracking-[0.2em]">
              {searchQuery ? `Search Results (${objects.length})` : `${stats.schema} (${stats.count} objects)`}
            </h3>
            {(isLoading || isRefreshing) && <span className="w-2 h-2 bg-brand rounded-full animate-ping"></span>}
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] font-black text-insight-muted uppercase tracking-widest">
            <span>Name</span>
            <div className="w-px h-3 bg-slate-200"></div>
            <span>Status</span>
            <div className="w-px h-3 bg-slate-200"></div>
            <span>Metadata</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-24">
            {isLoading && !isRefreshing && objects.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="premium-card p-6 h-48 bg-slate-50 animate-pulse border-none shadow-none"></div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                  {objects.map((obj) => (
                    <TableCard key={`${obj.schema}-${obj.name}`} object={obj} />
                  ))}
                </div>

                {!isLoading && objects.length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <h4 className="text-2xl font-black text-[#0f172a] mb-2 tracking-tight">No objects found</h4>
                    <p className="text-insight-muted font-bold max-w-sm mx-auto">
                      We couldn't find anything matching your filters in the <span className="text-brand font-black underline">{selectedSchema}</span> schema.
                    </p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedSchema('all'); }}
                      className="mt-8 px-10 py-4 bg-[#f1f5f9] rounded-2xl text-insight-text font-black text-xs uppercase tracking-[0.2em] hover:bg-[#e2e8f0] transition-all"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}

                {!isLoading && objects.length > 0 && objects.length < stats.count && (
                  <div className="py-10 border-t border-dashed border-insight-border flex justify-center">
                    <button className="text-xs font-black text-brand uppercase tracking-widest hover:underline">Load More Objects</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Terminal Drawer & FAB */}
      <TerminalDrawer isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />

      <button
        onClick={() => setIsTerminalOpen(true)}
        className="fixed bottom-10 right-10 lg:bottom-12 lg:right-12 w-16 h-16 bg-[#0f172a] text-white rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <Terminal size={28} />
        <span className="absolute right-22 bg-[#0f172a] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all pointer-events-none shadow-2xl">
          SQL Terminal
        </span>
      </button>
    </div>
  );
}
