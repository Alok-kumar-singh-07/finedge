import { Search, Sun, Moon, Maximize2, RotateCcw, Camera, ShieldCheck, Zap } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

export default function Navbar({ 
  onOpenOrder, 
  onToggleWatchlist, 
  isWatchlistOpen = true, 
  timeframe = '1D', 
  setTimeframe = () => {} 
}) {
  const store = useTradingStore();
  const selectedStock = store?.selectedStock || { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.' };
  const rawCash = store?.cash ?? store?.funds ?? 1000000;
  const cash = typeof rawCash === 'number' ? rawCash : parseFloat(rawCash) || 1000000;
  const theme = store?.theme || 'dark';
  const toggleTheme = store?.toggleTheme || (() => {});

  const isDark = theme === 'dark' || theme === 'midnight';
  const timeframesList = ['1m', '5m', '10m', '15m', '1D', '1W', '1M'];

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <header className="h-11 border-b border-[#1E293B] bg-[#0E131F] text-slate-200 flex items-center justify-between px-2 text-xs select-none shrink-0 z-40">
      {/* Left Section: Logo, Stock Search & Timeframes */}
      <div className="flex items-center gap-2">
        {/* Dhan Logo & Watchlist Toggle */}
        <button
          onClick={onToggleWatchlist}
          title={isWatchlistOpen ? "Close Watchlist" : "Open Watchlist"}
          className={`w-7 h-7 rounded flex items-center justify-center font-bold text-sm cursor-pointer transition ${
            isWatchlistOpen ? 'bg-[#00897B] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          ध
        </button>

        {/* Active Stock Search Capsule */}
        <div className="flex items-center gap-1.5 bg-[#151C2C] px-2.5 py-1 rounded border border-[#1E293B] hover:border-slate-600 cursor-pointer">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-100 uppercase tracking-wide text-xs">
            {selectedStock?.symbol || 'STOCK'}
          </span>
          <span className="text-slate-500 font-bold ml-1">+</span>
        </div>

        {/* Timeframe Selector Bar */}
        <div className="hidden md:flex items-center gap-0.5 ml-1 bg-[#111726] p-0.5 rounded border border-[#1E293B]">
          {timeframesList.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                timeframe === tf 
                  ? 'bg-blue-600 text-white font-bold shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicators and Layout Icons */}
        <div className="hidden lg:flex items-center gap-2 text-slate-400 text-sm ml-2 border-l border-[#1E293B] pl-2">
          <span className="hover:text-white cursor-pointer px-1 py-0.5" title="Indicators">fx</span>
          <span className="hover:text-white cursor-pointer px-1 py-0.5" title="Layout">⊞</span>
        </div>
      </div>

      {/* Right Section: Quick Order, Scalper, Cash & Settings */}
      <div className="flex items-center gap-2">
        {/* Quick Buy/Sell Buttons */}
        <div className="flex items-center gap-1.5 mr-1">
          <button
            onClick={() => onOpenOrder && onOpenOrder('SELL')}
            className="bg-[#ef5350] hover:bg-[#e53935] active:scale-95 text-white px-3 py-1 rounded font-bold text-xs cursor-pointer transition shadow"
          >
            Sell
          </button>
          <button
            onClick={() => onOpenOrder && onOpenOrder('BUY')}
            className="bg-[#26a69a] hover:bg-[#00897b] active:scale-95 text-white px-3 py-1 rounded font-bold text-xs cursor-pointer transition shadow"
          >
            Buy
          </button>
        </div>

        {/* Scalper Mode */}
        <button className="hidden sm:flex items-center gap-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-xs font-semibold hover:bg-blue-600/30 cursor-pointer">
          <Zap className="w-3 h-3" />
          <span>Scalper</span>
        </button>

        {/* Option Chain */}
        <button className="hidden sm:flex items-center gap-1 bg-slate-800 text-slate-300 border border-[#1E293B] px-2 py-1 rounded text-xs font-semibold hover:bg-slate-700 cursor-pointer">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Option Chain</span>
        </button>

        {/* Available Cash Pill (Safe formatting) */}
        <div className="flex items-center gap-1 bg-[#151C2C] px-2.5 py-1 rounded border border-[#1E293B] font-mono text-[11px]">
          <span className="text-slate-400 font-sans">Cash:</span>
          <span className="font-bold text-emerald-400">
            ₹{Number(cash).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Quick Toolbar Utilities */}
        <div className="flex items-center gap-1 text-slate-400 border-l border-[#1E293B] pl-2">
          <button 
            onClick={toggleTheme} 
            className="p-1 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="p-1 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition"
            title="Reload Chart"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button 
            className="p-1 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition hidden sm:block"
            title="Screenshot"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={toggleFullScreen} 
            className="p-1 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition"
            title="Full Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}