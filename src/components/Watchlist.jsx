import { useState } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

const DEFAULT_STOCKS = [
  { id: '1', symbol: 'RELIANCE', name: 'Reliance Industries', price: 2993.75, change: 12.45, changePercent: 0.42 },
  { id: '2', symbol: 'TCS', name: 'Tata Consultancy Services', price: 4180.50, change: -18.20, changePercent: -0.43 },
  { id: '3', symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1640.10, change: 8.90, changePercent: 0.55 },
  { id: '4', symbol: 'INFY', name: 'Infosys Ltd', price: 1785.00, change: -5.60, changePercent: -0.31 },
  { id: '5', symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1190.25, change: 14.30, changePercent: 1.22 },
  { id: '6', symbol: 'SBIN', name: 'State Bank of India', price: 835.40, change: 3.10, changePercent: 0.37 },
  { id: '7', symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1420.80, change: -2.40, changePercent: -0.17 },
  { id: '8', symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 1045.60, change: 16.80, changePercent: 1.63 },
];

export default function Watchlist() {
  const store = useTradingStore();
  const rawList = store?.watchlist || store?.stocks || DEFAULT_STOCKS;
  const watchlist = Array.isArray(rawList) ? rawList : DEFAULT_STOCKS;
  
  const selectedStock = store?.selectedStock || watchlist[0] || DEFAULT_STOCKS[0];
  const setSelectedStock = store?.setSelectedStock || store?.setActiveStock || (() => {});

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredStocks = watchlist.filter((stock) => {
    if (!stock) return false;
    const nameMatch = (stock.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const symbolMatch = (stock.symbol || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || symbolMatch;
  });

  return (
    <div className="flex flex-col h-full bg-[#0E131F] text-slate-200 border-r border-[#1E293B] select-none text-xs">
      {/* Top Search Bar */}
      <div className="p-2 border-b border-[#1E293B]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search stock, index (e.g. RELIANCE, NIFTY)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#151C2C] text-slate-200 pl-8 pr-3 py-1.5 rounded text-xs outline-none border border-transparent focus:border-blue-500 placeholder-slate-500"
          />
        </div>

        {/* Watchlist Tabs */}
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
            {filteredStocks.length} / 50
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
            No stocks found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}