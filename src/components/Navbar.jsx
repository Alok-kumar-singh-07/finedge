import { useState } from 'react';
import { 
  Search, Plus, BarChart2, Zap, RotateCcw, 
  Camera, Maximize2, LayoutGrid, Layers, Sun, Moon, Sparkles 
} from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import OptionChainModal from './OptionChainModal';

export default function Navbar({ timeframe, setTimeframe, onOpenOrder }) {
  const { selectedStock, walletBalance, resetWallet, theme, setTheme } = useTradingStore();
  const [isOptionChainOpen, setIsOptionChainOpen] = useState(false);

  const timeframes = ['1m', '5m', '10m', '15m', '1D', '1W', '1M'];
  const isDark = theme === 'dark' || theme === 'midnight';

  return (
    <>
      <header
        style={{
          backgroundColor: theme === 'midnight' ? '#000000' : theme === 'dark' ? '#151922' : '#ffffff',
          borderColor: isDark ? '#232936' : '#e0e3eb',
          color: isDark ? '#ffffff' : '#131722',
        }}
        className="h-11 border-b px-3 flex items-center justify-between select-none text-xs font-sans transition-colors"
      >
        {/* Left Side */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#089981] flex items-center justify-center font-bold text-white text-xs shadow-xs">
            ध
          </div>

          <div
            style={{
              backgroundColor: isDark ? '#0B0E14' : '#f0f3fa',
              borderColor: isDark ? '#232936' : '#e0e3eb',
            }}
            className="flex items-center gap-1 px-2 py-1 rounded border cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-bold uppercase">{selectedStock.symbol || 'STOCK'}</span>
          </div>

          <button title="Compare Symbol" className="p-1 text-gray-400 hover:text-white rounded">
            <Plus className="w-4 h-4" />
          </button>

          <div className={`h-5 w-px ${isDark ? 'bg-[#232936]' : 'bg-[#e0e3eb]'} mx-1`} />

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-0.5 font-mono">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white font-bold'
                    : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-[#1E2533]'
                    : 'text-[#606266] hover:bg-[#f0f3fa] hover:text-[#131722]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className={`h-5 w-px ${isDark ? 'bg-[#232936]' : 'bg-[#e0e3eb]'} mx-1`} />

          <button title="Candlestick Style" className="p-1 text-gray-400 hover:text-white rounded">
            <BarChart2 className="w-4 h-4" />
          </button>
          <button title="Indicators (fx)" className="px-1.5 py-0.5 font-serif italic text-sm text-gray-400 hover:text-white rounded font-bold">
            fx
          </button>
          <button title="Templates" className="p-1 text-gray-400 hover:text-white rounded">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools & Theme Selector */}
        <div className="flex items-center gap-2">
          {/* Quick Buy & Sell Buttons */}
          <button
            onClick={() => onOpenOrder('SELL')}
            className="bg-[#f23645] hover:bg-[#d82c3b] text-white px-3 py-1 rounded text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Sell
          </button>
          <button
            onClick={() => onOpenOrder('BUY')}
            className="bg-[#2962ff] hover:bg-[#1e53e5] text-white px-3 py-1 rounded text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Buy
          </button>

          {/* Scalper Mode */}
          <button className="flex items-center gap-1 border border-[#2962ff] text-[#2962ff] bg-[#2962ff]/10 px-2 py-0.5 rounded font-bold text-xs hover:bg-[#2962ff] hover:text-white transition-all cursor-pointer">
            <Zap className="w-3.5 h-3.5" />
            Scalper
          </button>

          {/* Option Chain */}
          <button
            onClick={() => setIsOptionChainOpen(true)}
            style={{
              backgroundColor: isDark ? '#0B0E14' : '#fafbfc',
              borderColor: isDark ? '#232936' : '#e0e3eb',
            }}
            className="flex items-center gap-1 border px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#089981]" />
            Option Chain
          </button>

          {/* 3-THEME SWITCHER DROPDOWN */}
          <div
            style={{
              backgroundColor: isDark ? '#0B0E14' : '#f0f3fa',
              borderColor: isDark ? '#232936' : '#e0e3eb',
            }}
            className="flex items-center rounded border p-0.5 gap-0.5"
          >
            <button
              title="Light Theme"
              onClick={() => setTheme('light')}
              className={`p-1 rounded cursor-pointer transition-colors ${
                theme === 'light' ? 'bg-[#ffffff] text-[#131722] shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              title="Dark Dhan Theme"
              onClick={() => setTheme('dark')}
              className={`p-1 rounded cursor-pointer transition-colors ${
                theme === 'dark' ? 'bg-[#232936] text-[#00D09C] shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              title="OLED Midnight Black"
              onClick={() => setTheme('midnight')}
              className={`p-1 rounded cursor-pointer transition-colors ${
                theme === 'midnight' ? 'bg-[#1E2533] text-[#2962ff] shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`h-5 w-px ${isDark ? 'bg-[#232936]' : 'bg-[#e0e3eb]'} mx-0.5`} />

          {/* Virtual Wallet */}
          <div
            style={{
              backgroundColor: isDark ? '#0B0E14' : '#f0f3fa',
              borderColor: isDark ? '#232936' : '#e0e3eb',
            }}
            className="border px-2.5 py-0.5 rounded flex items-center gap-1.5 font-mono"
          >
            <span className="text-[10px] text-gray-500 font-sans">Cash:</span>
            <span className="font-bold text-[#089981]">
              ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={resetWallet}
            title="Reset Virtual Balance"
            className="p-1 text-gray-400 hover:text-white rounded cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button title="Take Snapshot" className="p-1 text-gray-400 hover:text-white rounded">
            <Camera className="w-4 h-4" />
          </button>
          <button title="Fullscreen" className="p-1 text-gray-400 hover:text-white rounded">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <OptionChainModal isOpen={isOptionChainOpen} onClose={() => setIsOptionChainOpen(false)} />
    </>
  );
}