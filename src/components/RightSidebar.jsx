import { useTradingStore } from '../store/useTradingStore';

export default function RightSidebar({ onOpenOrder }) {
  const { selectedStock } = useTradingStore();

  const stockSymbol = selectedStock?.symbol || 'TATAMOTORS';
  const stockPrice = Number(selectedStock?.price || 1048.37);
  const isPos = Number(selectedStock?.change || 0) >= 0;

  return (
    <div className="w-64 h-full bg-[#0E131F] border-l border-[#1E293B] flex flex-col select-none text-xs text-slate-300">
      {/* Quick Trade Header */}
      <div className="p-3 border-b border-[#1E293B]">
        <div className="font-bold text-white text-sm">{stockSymbol}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono font-bold text-white">₹{stockPrice.toFixed(2)}</span>
          <span className={`font-mono text-[11px] font-semibold ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
            {isPos ? '+' : ''}{Number(selectedStock?.changePercent || 0).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 grid grid-cols-2 gap-2 border-b border-[#1E293B]">
        <button
          onClick={() => onOpenOrder && onOpenOrder('BUY')}
          className="bg-[#00897B] hover:bg-[#00796B] text-white py-2 rounded font-bold transition cursor-pointer"
        >
          BUY
        </button>
        <button
          onClick={() => onOpenOrder && onOpenOrder('SELL')}
          className="bg-[#EF5350] hover:bg-[#E53935] text-white py-2 rounded font-bold transition cursor-pointer"
        >
          SELL
        </button>
      </div>

      {/* Market Stats */}
      <div className="p-3 space-y-2 text-[11px]">
        <div className="text-slate-500 font-semibold uppercase text-[10px]">Market Overview</div>
        <div className="flex justify-between py-1 border-b border-slate-900">
          <span className="text-slate-400">Open</span>
          <span className="font-mono text-white">₹{(stockPrice * 0.995).toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-900">
          <span className="text-slate-400">High</span>
          <span className="font-mono text-white">₹{(stockPrice * 1.012).toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-900">
          <span className="text-slate-400">Low</span>
          <span className="font-mono text-white">₹{(stockPrice * 0.988).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}