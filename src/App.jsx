import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TradingChart from './components/TradingChart';
import OrderModal from './components/OrderModal';
import Watchlist from './components/Watchlist';
import { useTradingStore } from './store/useTradingStore';

export default function App() {
  const store = useTradingStore();
  const { 
    selectedStock, 
    theme, 
    positions = [], 
    orders = [], 
    checkAutoTriggers 
  } = store;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('BUY');
  const [timeframe, setTimeframe] = useState('1D');
  const [activeBottomTab, setActiveBottomTab] = useState('positions');
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(true);

  // Safe Trigger Check
  useEffect(() => {
    if (typeof checkAutoTriggers === 'function') {
      const interval = setInterval(() => {
        checkAutoTriggers();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [checkAutoTriggers]);

  const handleOpenOrder = (action) => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  const isDark = theme === 'dark' || theme === 'midnight';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden select-none font-sans ${isDark ? 'bg-[#0B0E14] text-slate-200' : 'bg-white text-slate-800'}`}>
      
      {/* 1. TOP MAIN NAVIGATION */}
      <Navbar 
        onOpenOrder={handleOpenOrder} 
        onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
        isWatchlistOpen={isWatchlistOpen}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />

      {/* 2. MAIN TRADING TERMINAL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Drawing Tools Sidebar (Inline Icons) */}
        <div className="hidden md:flex flex-col border-r border-[#1E293B] bg-[#0E131F] w-12 shrink-0 z-10">
          <div className="flex flex-col items-center py-2 gap-3 text-slate-400 text-sm">
            <span className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Crosshair">✛</span>
            <span className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Trendline">╱</span>
            <span className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Fib Retracement">⌸</span>
            <span className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Text">T</span>
            <span className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Patterns">☺</span>
            <span className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Measure">📏</span>
          </div>
        </div>

        {/* Collapsible Watchlist Sidebar */}
        <div className={`${isWatchlistOpen ? 'w-80' : 'w-0'} transition-all duration-200 ease-in-out border-r border-[#1E293B] bg-[#0E131F] shrink-0 overflow-hidden flex flex-col hidden lg:flex`}>
          {Watchlist ? <Watchlist /> : null}
        </div>

        {/* Center Workspace: Chart + Bottom Dock */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Main Candlestick Chart Area */}
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <TradingChart 
              activeStock={selectedStock} 
              timeframe={timeframe}
              onOpenOrder={handleOpenOrder}
            />
          </div>

          {/* Collapsible Bottom Panel (Positions / Orders / Depth) */}
          <div className={`border-t border-[#1E293B] bg-[#0E131F] transition-all duration-200 flex flex-col ${isBottomOpen ? 'h-56' : 'h-8'}`}>
            <div className="h-8 px-3 flex items-center justify-between bg-[#111726] border-b border-[#1E293B] text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setActiveBottomTab('positions'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1.5 hover:text-white transition ${activeBottomTab === 'positions' && isBottomOpen ? 'text-[#26a69a] border-b-2 border-[#26a69a] h-8' : ''}`}
                >
                  <span>📈 Position</span>
                  <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">{positions?.length || 0}</span>
                </button>
                <button 
                  onClick={() => { setActiveBottomTab('orders'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1.5 hover:text-white transition ${activeBottomTab === 'orders' && isBottomOpen ? 'text-[#26a69a] border-b-2 border-[#26a69a] h-8' : ''}`}
                >
                  <span>📋 Orders</span>
                  <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">{orders?.length || 0}</span>
                </button>
                <button 
                  onClick={() => { setActiveBottomTab('depth'); setIsBottomOpen(true); }}
                  className={`hover:text-white hidden sm:block ${activeBottomTab === 'depth' && isBottomOpen ? 'text-[#26a69a] border-b-2 border-[#26a69a] h-8' : ''}`}
                >
                  📊 Depth
                </button>
              </div>

              <button 
                onClick={() => setIsBottomOpen(!isBottomOpen)}
                className="hover:text-white px-2 py-0.5 text-xs rounded bg-slate-800/60"
              >
                {isBottomOpen ? '▼ Minimize' : '▲ Expand Dock'}
              </button>
            </div>

            {/* Bottom Panel Content */}
            {isBottomOpen && (
              <div className="flex-1 overflow-auto p-2 bg-[#0b0e14]">
                {activeBottomTab === 'positions' && (
                  <div className="text-xs text-slate-400 p-2">
                    {positions?.length ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="p-1.5">Product</th>
                            <th className="p-1.5">Symbol</th>
                            <th className="p-1.5">Qty</th>
                            <th className="p-1.5">Avg Price</th>
                            <th className="p-1.5">LTP</th>
                            <th className="p-1.5">P&L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positions.map((p, idx) => (
                            <tr key={idx} className="border-b border-slate-900">
                              <td className="p-1.5 font-bold text-blue-400">{p.product || 'INTRADAY'}</td>
                              <td className="p-1.5">{p.symbol}</td>
                              <td className="p-1.5">{p.qty}</td>
                              <td className="p-1.5">₹{p.avgPrice || p.price}</td>
                              <td className="p-1.5">₹{selectedStock?.price || p.price}</td>
                              <td className={`p-1.5 font-bold ${(p.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ₹{p.pnl ? p.pnl.toFixed(2) : '0.00'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-6 text-slate-500">No open positions. Use Buy/Sell buttons to trade.</div>
                    )}
                  </div>
                )}
                {activeBottomTab === 'orders' && (
                  <div className="text-xs text-slate-400 p-2">
                    {orders?.length ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="p-1.5">Time</th>
                            <th className="p-1.5">Type</th>
                            <th className="p-1.5">Symbol</th>
                            <th className="p-1.5">Qty</th>
                            <th className="p-1.5">Price</th>
                            <th className="p-1.5">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o, idx) => (
                            <tr key={idx} className="border-b border-slate-900">
                              <td className="p-1.5">{o.time || '10:00'}</td>
                              <td className={`p-1.5 font-bold ${o.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{o.type}</td>
                              <td className="p-1.5">{o.symbol}</td>
                              <td className="p-1.5">{o.qty}</td>
                              <td className="p-1.5">₹{o.price}</td>
                              <td className="p-1.5 text-emerald-400">EXECUTED</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-6 text-slate-500">No order history available</div>
                    )}
                  </div>
                )}
                {activeBottomTab === 'depth' && (
                  <div className="text-xs text-slate-400 p-3 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-emerald-400 font-semibold mb-1">Bid Orders</div>
                      <div className="flex justify-between border-b border-slate-800 py-1"><span>{selectedStock?.price || 2980}</span><span className="text-slate-400">1,250 Qty</span></div>
                      <div className="flex justify-between border-b border-slate-800 py-1"><span>{Number(selectedStock?.price || 2980) - 0.5}</span><span className="text-slate-400">3,400 Qty</span></div>
                    </div>
                    <div>
                      <div className="text-rose-400 font-semibold mb-1">Ask Orders</div>
                      <div className="flex justify-between border-b border-slate-800 py-1"><span>{Number(selectedStock?.price || 2980) + 0.5}</span><span className="text-slate-400">2,100 Qty</span></div>
                      <div className="flex justify-between border-b border-slate-800 py-1"><span>{Number(selectedStock?.price || 2980) + 1.0}</span><span className="text-slate-400">4,800 Qty</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. MOBILE BOTTOM BUY/SELL FIXED ACTION BAR */}
      <div className="md:hidden flex p-2.5 gap-2.5 border-t border-[#1E293B] bg-[#0E131F]">
        <button 
          onClick={() => handleOpenOrder('SELL')}
          className="flex-1 bg-[#ef5350] active:scale-95 transition text-white py-2.5 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-1.5"
        >
          ✕ Sell
        </button>
        <button 
          onClick={() => handleOpenOrder('BUY')}
          className="flex-1 bg-[#26a69a] active:scale-95 transition text-white py-2.5 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-1.5"
        >
          + Buy
        </button>
      </div>

      {/* 4. ORDER EXECUTION MODAL */}
      {OrderModal && (
        <OrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialType={modalAction}
          stock={selectedStock}
        />
      )}
    </div>
  );
}