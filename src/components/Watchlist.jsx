import { useTradingStore } from '../store/useTradingStore';

export default function Watchlist({ stocks, tickChanges }) {
  const { selectedStock, setSelectedStock } = useTradingStore();

  return (
    <div className="h-full flex flex-col bg-[#151922] font-sans select-none overflow-hidden">
      {/* Header */}
      <div className="h-10 px-3 border-b border-[#232936] flex items-center justify-between bg-[#0B0E14]/40 shrink-0">
        <span className="font-bold text-xs text-gray-300 tracking-wide truncate">
          WATCHLIST ({stocks.length})
        </span>
        <button className="text-[11px] text-[#00D09C] hover:underline font-semibold shrink-0 cursor-pointer">
          + Add
        </button>
      </div>

      {/* Stock Items List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-[#232936]/60">
        {stocks.map((stock) => {
          const isSelected = selectedStock.symbol === stock.symbol;
          const isPositive = (stock.change || 0) >= 0;
          const tickStatus = tickChanges?.[stock.symbol];

          return (
            <div
              key={stock.symbol}
              onClick={() => setSelectedStock(stock)}
              className={`px-3 py-2.5 flex items-center justify-between cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#1E2533] border-l-2 border-[#00D09C]'
                  : 'hover:bg-[#1E2533]/40'
              } ${
                tickStatus === 'up'
                  ? 'bg-[#00D09C]/10'
                  : tickStatus === 'down'
                  ? 'bg-[#EB5757]/10'
                  : ''
              }`}
            >
              {/* Left: Symbol & Exchange */}
              <div className="min-w-0 pr-2 flex-1">
                <div className="font-bold text-xs text-white truncate tracking-wide">
                  {stock.symbol}
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate">
                  {stock.exchange || 'NSE'} • EQ
                </div>
              </div>

              {/* Right: Price & Percentage (Never clips, auto-scales) */}
              <div className="text-right font-mono shrink-0 pl-1">
                <div
                  className={`font-bold text-xs transition-colors ${
                    isPositive ? 'text-[#00D09C]' : 'text-[#EB5757]'
                  }`}
                >
                  ₹{stock.price.toFixed(2)}
                </div>
                <div
                  className={`text-[10px] font-semibold flex items-center justify-end ${
                    isPositive ? 'text-[#00D09C]' : 'text-[#EB5757]'
                  }`}
                >
                  {isPositive ? '↗ +' : '↘ '}
                  {stock.changePercent ? stock.changePercent.toFixed(2) : '0.00'}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}