import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

export default function Watchlist({ onMinimize }) {
  const store = useTradingStore();
  const watchlist = Array.isArray(store?.watchlist) ? store.watchlist : [];
  const selectedStock = store?.selectedStock || watchlist[0];
  const setSelectedStock = store?.setSelectedStock || (() => {});

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredStocks = watchlist.filter((stock) => {
    if (!stock) return false;
    const matchesSearch = 
      (stock.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.symbol || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && stock.sector === activeTab;
  });

  return (
    <div className="flex flex-col h-full bg-[#0E131F] text-slate-200 border-r border-[#1E293B] select-none text-xs">
      {/* Search Header with Minimize Button */}
      <div className="p-2 border-b border-[#1E293B]">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1 flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search stock, index..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#151C2C] text-slate-200 pl-8 pr-2 py-1.5 rounded text-xs outline-none border border-transparent focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Minimize / Collapse Button */}
          {onMinimize && (
            <button
              onClick={onMinimize}
              title="Minimize Watchlist"
              className="p-1.5 rounded bg-[#151C2C] hover:bg-slate-700 text-slate-400 hover:text-white border border-[#1E293B] transition cursor-pointer flex items-center justify-center"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categorized Filter Tabs */}
        <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-slate-400 overflow-x-auto pb-0.5">
          {['All', 'Nifty 50', 'Bank', 'F&O'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-0.5 rounded cursor-pointer transition ${
                activeTab === tab ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-slate-500 px-1 font-mono">
            {filteredStocks.length} / {watchlist.length}
          </span>
        </div>
      </div>

      {/* Stock Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1A2234]">
        {filteredStocks.length > 0 ? (
          filteredStocks.map((stock) => {
            const isSelected = selectedStock?.symbol === stock?.symbol;
            const isPos = (stock?.change || 0) >= 0;

            return (
              <div
                key={stock.id || stock.symbol}
                onClick={() => setSelectedStock(stock)}
                className={`flex items-center justify-between p-2.5 cursor-pointer transition-all hover:bg-[#151C2C] ${
                  isSelected ? 'bg-[#151C2C] border-l-2 border-blue-500' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-100 text-xs">{stock.symbol}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {stock.name || stock.symbol}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`font-mono font-bold text-xs ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    ₹{Number(stock.price || 0).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-0.5 text-[10px] font-mono">
                    {isPos ? (
                      <TrendingUp className="w-2.5 h-2.5 text-[#089981]" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5 text-[#f23645]" />
                    )}
                    <span className={isPos ? 'text-[#089981]' : 'text-[#f23645]'}>
                      {isPos ? '+' : ''}{Number(stock.change || 0).toFixed(2)} ({isPos ? '+' : ''}{Number(stock.changePercent || 0).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-slate-500 text-xs">
            No stocks found in "{activeTab}"
          </div>
        )}
      </div>
    </div>
  );
}