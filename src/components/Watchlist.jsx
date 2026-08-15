import { useState, useEffect } from 'react';
import useTradingStore from '../store/useTradingStore';
import { NSE_STOCKS_DIRECTORY, fetchLiveMarketData } from '../dhanApi';

export default function Watchlist() {
  const { selectedStock, setSelectedStock } = useTradingStore();
  const [stocks, setStocks] = useState(NSE_STOCKS_DIRECTORY || []);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;

    const updatePrices = async () => {
      if (!selectedStock?.id) return;
      try {
        const liveData = await fetchLiveMarketData(selectedStock.id);
        if (liveData && liveData.price && isMounted) {
          setStocks((prev) =>
            prev.map((s) =>
              s.id === selectedStock.id
                ? { ...s, price: liveData.price, change: liveData.change }
                : s
            )
          );
        }
      } catch (err) {
        console.error('Price update error:', err);
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedStock]);

  const filteredStocks = (stocks || []).filter(
    (stock) =>
      stock?.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      <div className="p-2 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search NSE stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredStocks.map((stock) => {
          const isSelected = selectedStock?.symbol === stock.symbol;
          const isPositive = (stock.change || 0) >= 0;

          return (
            <div
              key={stock.id || stock.symbol}
              onClick={() => setSelectedStock(stock)}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-gray-900">{stock.symbol}</div>
                <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{stock.name}</div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-medium text-gray-900">
                  ₹{Number(stock.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-[10px] font-mono font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPositive ? '+' : ''}{stock.change || 0}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}