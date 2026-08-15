import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, TrendingUp, Newspaper, Layers } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

export default function RightSidebar({ stocks }) {
  const { selectedStock, setSelectedStock, theme } = useTradingStore();
  const active = stocks.find((s) => s.symbol === selectedStock.symbol) || selectedStock;
  const isPos = (active.change || 0) >= 0;
  const isDark = theme === 'dark' || theme === 'midnight';

  // Dynamic Day's Low & High
  const lowPrice = active.price * 0.985;
  const highPrice = active.price * 1.015;
  const rangePercent = Math.min(100, Math.max(0, ((active.price - lowPrice) / (highPrice - lowPrice)) * 100));

  // Resizable Section Heights
  const [watchlistHeight, setWatchlistHeight] = useState(200);
  const [overviewHeight, setOverviewHeight] = useState(165);

  const isDraggingH1 = useRef(false);
  const isDraggingH2 = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingH1.current) {
        setWatchlistHeight((prev) => Math.max(120, Math.min(320, prev + e.movementY)));
      } else if (isDraggingH2.current) {
        setOverviewHeight((prev) => Math.max(140, Math.min(260, prev + e.movementY)));
      }
    };

    const handleMouseUp = () => {
      isDraggingH1.current = false;
      isDraggingH2.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const newsItems = [
    {
      id: 1,
      time: '19:38 • Aug 12 • Scannx',
      headline: `${active.name || active.symbol} Q4/FY26 Earnings Call Scheduled`,
      summary: `${active.name || active.symbol} held its earnings conference call on August 12, 2026, to discuss quarterly financial results.`,
    },
    {
      id: 2,
      time: '14:20 • Aug 11 • Wire',
      headline: 'Board approves strategic expansion and capital expenditure',
      summary: 'Management announces new infrastructural scaling and positive forward outlook for institutional investors.',
    },
    {
      id: 3,
      time: '11:05 • Aug 10 • Pulse',
      headline: 'Trading volume surges past 30-day moving average',
      summary: 'Strong delivery volumes observed alongside multi-broker buy ratings in the current trading session.',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: theme === 'midnight' ? '#000000' : theme === 'dark' ? '#151922' : '#ffffff',
        borderColor: isDark ? '#232936' : '#e0e3eb',
        color: isDark ? '#ffffff' : '#131722',
      }}
      className="w-[330px] h-full border-l flex flex-col font-sans select-none overflow-hidden shrink-0 transition-colors"
    >
      {/* BOX 1: WATCHLIST SECTION */}
      <div style={{ height: `${watchlistHeight}px` }} className="flex flex-col border-b overflow-hidden shrink-0" style-border={isDark ? '#232936' : '#e0e3eb'}>
        <div
          style={{
            backgroundColor: isDark ? '#0B0E14' : '#fafbfc',
            borderColor: isDark ? '#232936' : '#e0e3eb',
          }}
          className="h-9 px-3 border-b flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-1 cursor-pointer font-bold text-xs">
            <Layers className="w-3.5 h-3.5 text-[#2962ff]" />
            <span>Nifty 50</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <Plus className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white" />
        </div>

        <div
          style={{ borderColor: isDark ? '#232936' : '#e0e3eb' }}
          className="px-3 py-1 border-b grid grid-cols-12 text-[10px] font-bold text-[#787b86] uppercase shrink-0"
        >
          <span className="col-span-5">Symbol</span>
          <span className="col-span-3 text-right">Last</span>
          <span className="col-span-2 text-right">Chg</span>
          <span className="col-span-2 text-right">Chg%</span>
        </div>

        <div className={`flex-1 overflow-y-auto divide-y ${isDark ? 'divide-[#232936]' : 'divide-[#f0f3fa]'}`}>
          {stocks.map((stock) => {
            const isSelected = selectedStock.symbol === stock.symbol;
            const pos = (stock.change || 0) >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => setSelectedStock(stock)}
                className={`px-3 py-1.5 grid grid-cols-12 items-center text-xs font-mono cursor-pointer transition-colors ${
                  isSelected
                    ? isDark
                      ? 'bg-[#1E2533] border-l-4 border-[#00D09C]'
                      : 'bg-[#e8f0fe] border-l-4 border-[#2962ff]'
                    : isDark
                    ? 'hover:bg-[#1E2533]/50'
                    : 'hover:bg-[#f8f9fd]'
                }`}
              >
                <div className="col-span-5 font-sans font-bold truncate">{stock.symbol}</div>
                <div className="col-span-3 text-right font-semibold">{stock.price.toFixed(2)}</div>
                <div className={`col-span-2 text-right font-medium ${pos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {pos ? '+' : ''}{stock.change ? stock.change.toFixed(2) : '0.00'}
                </div>
                <div className={`col-span-2 text-right font-semibold ${pos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {pos ? '+' : ''}{stock.changePercent ? stock.changePercent.toFixed(2) : '0.00'}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resize Handle 1 */}
      <div
        onMouseDown={() => {
          isDraggingH1.current = true;
          document.body.style.cursor = 'row-resize';
        }}
        className="h-1.5 hover:h-2 bg-[#e0e3eb] dark:bg-[#232936] hover:bg-[#2962ff] cursor-row-resize transition-all shrink-0"
        title="Drag to resize Watchlist box"
      />

      {/* BOX 2: STOCK OVERVIEW & DYNAMIC DAY RANGE */}
      <div
        style={{
          height: `${overviewHeight}px`,
          backgroundColor: isDark ? '#0B0E14' : '#fafbfc',
          borderColor: isDark ? '#232936' : '#e0e3eb',
        }}
        className="p-3 border-b flex flex-col justify-between shrink-0"
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold truncate">
            <TrendingUp className="w-3.5 h-3.5 text-[#2962ff]" />
            <span>{active.name || active.symbol}</span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            {active.symbol} • NSE • EQ
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono">{active.price.toFixed(2)}</span>
            <span className={`text-xs font-semibold font-mono ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {isPos ? '+' : ''}{active.change ? active.change.toFixed(2) : '0.00'} ({isPos ? '+' : ''}{active.changePercent ? active.changePercent.toFixed(2) : '0.00'}%)
            </span>
          </div>
          <span className="text-[10px] text-gray-400 block">• Market open (Live)</span>
        </div>

        {/* Dynamic Day's Range with Low/High & Glowing Gradient */}
        <div className="pt-2 border-t" style={{ borderColor: isDark ? '#232936' : '#e0e3eb' }}>
          <div className="flex justify-between items-center text-[10px] font-mono mb-1">
            <div className="flex items-center gap-1 text-[#f23645]">
              <span className="font-bold uppercase text-[9px] bg-[#f23645]/10 px-1 rounded">L</span>
              <span>₹{lowPrice.toFixed(2)}</span>
            </div>
            <span className="font-bold text-[9px] text-gray-500 uppercase tracking-wider">Day's Range</span>
            <div className="flex items-center gap-1 text-[#089981]">
              <span>₹{highPrice.toFixed(2)}</span>
              <span className="font-bold uppercase text-[9px] bg-[#089981]/10 px-1 rounded">H</span>
            </div>
          </div>

          {/* Animated Gradient Bar */}
          <div className="w-full h-1.5 bg-[#e0e3eb] dark:bg-[#232936] rounded-full relative overflow-visible">
            <div
              className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#f23645] via-[#f5b041] to-[#089981]"
              style={{ width: '100%' }}
            />
            {/* Glowing Range Pointer */}
            <div
              className={`absolute top-[-3.5px] w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${
                isPos ? 'bg-[#089981] shadow-[#089981]/50' : 'bg-[#f23645] shadow-[#f23645]/50'
              }`}
              style={{ left: `${rangePercent}%`, transform: 'translateX(-50%)' }}
            />
          </div>
        </div>
      </div>

      {/* Resize Handle 2 */}
      <div
        onMouseDown={() => {
          isDraggingH2.current = true;
          document.body.style.cursor = 'row-resize';
        }}
        className="h-1.5 hover:h-2 bg-[#e0e3eb] dark:bg-[#232936] hover:bg-[#2962ff] cursor-row-resize transition-all shrink-0"
        title="Drag to resize Overview box"
      />

      {/* BOX 3: LATEST NEWS STORIES */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          style={{
            borderColor: isDark ? '#232936' : '#e0e3eb',
            backgroundColor: theme === 'midnight' ? '#000000' : theme === 'dark' ? '#151922' : '#ffffff',
          }}
          className="px-3 py-1.5 border-b text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <Newspaper className="w-3.5 h-3.5 text-[#2962ff]" />
          <span>Latest News Stories</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {newsItems.map((n) => (
            <div
              key={n.id}
              style={{ borderColor: isDark ? '#232936' : '#f0f3fa' }}
              className="border-b pb-2 last:border-0 cursor-pointer group"
            >
              <div className="text-[10px] text-gray-400 font-mono">{n.time}</div>
              <h4 className="text-xs font-bold group-hover:text-[#2962ff] transition-colors leading-snug">
                {n.headline}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                {n.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}