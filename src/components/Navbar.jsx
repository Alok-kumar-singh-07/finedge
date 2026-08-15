import { Search, Moon, Sun } from 'lucide-react';
import useTradingStore from '../store/useTradingStore';

export default function Navbar({ onOpenOrder, onToggleWatchlist, timeframe, setTimeframe }) {
  const store = useTradingStore();
  const { theme, toggleTheme, cash = 1000000, selectedStock } = store;
  const isDark = theme === 'dark' || theme === 'midnight';

  const timeframes = ['1m', '5m', '15m', '1D', '1W', '1M'];

  return (
    <header className="h-12 border-b border-[#1E293B] bg-[#0E131F] text-slate-200 px-2 flex items-center select-none shrink-0 z-40 overflow-x-auto no-scrollbar touch-pan-x">
      <div className="flex items-center justify-between w-full min-w-max gap-2">
        {/* Left: Brand + Stock Selector + Timeframe Selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleWatchlist}
            title="Toggle Watchlist"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span className="text-sm">ध</span>
          </button>

          <div 
            onClick={onToggleWatchlist}
            className="flex items-center bg-[#151C2C] hover:bg-[#1C263B] border border-[#1E293B] rounded px-2 py-1 gap-1.5 text-xs text-slate-300 cursor-pointer shrink-0"
          >
            <Search className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-bold font-mono text-[11px] sm:text-xs">
              {selectedStock?.symbol || 'STOCK'}
            </span>
          </div>

          {/* Timeframe Chips */}
          <div className="flex items-center bg-[#151C2C] border border-[#1E293B] rounded p-0.5 text-[10px] sm:text-xs shrink-0">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition font-mono ${
                  timeframe === tf ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Quick Buy/Sell + Fully Visible Cash Card + Theme Toggle */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <button
            onClick={() => onOpenOrder('SELL')}
            className="bg-[#f23645] hover:bg-[#d82c3b] text-white px-2 py-1 rounded text-xs font-bold transition cursor-pointer shadow active:scale-95"
          >
            Sell
          </button>
          <button
            onClick={() => onOpenOrder('BUY')}
            className="bg-[#00897B] hover:bg-[#00796B] text-white px-2 py-1 rounded text-xs font-bold transition cursor-pointer shadow active:scale-95"
          >
            Buy
          </button>

          {/* Full Cash Balance Card */}
          <div className="bg-[#151C2C] border border-emerald-500/30 px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 font-bold whitespace-nowrap shadow-inner">
            Cash: ₹{Number(cash).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>

          {/* Theme Button */}
          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}