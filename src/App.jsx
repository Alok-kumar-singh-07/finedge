import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
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
    watchlist = [],
    realizedPnLList = [],
    closePosition 
  } = store;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('BUY');
  const [timeframe, setTimeframe] = useState('1D');
  const [activeBottomTab, setActiveBottomTab] = useState('positions');
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(true);

  const handleOpenOrder = (action) => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  const isDark = theme === 'dark' || theme === 'midnight';

  // Unrealized P&L across all active open positions
  const unrealizedPnL = positions.reduce((acc, pos) => {
    const currentStock = watchlist.find((s) => s.symbol === pos.symbol) || selectedStock;
    const ltp = currentStock?.price || pos.avgPrice;
    return acc + (ltp - pos.avgPrice) * pos.qty;
  }, 0);

  // Total Realized Profit / Loss from closed trades
  const totalRealizedPnL = realizedPnLList.reduce((acc, item) => acc + (item.pnl || 0), 0);
  const winningTrades = realizedPnLList.filter((item) => item.pnl > 0).length;
  const losingTrades = realizedPnLList.filter((item) => item.pnl < 0).length;

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
        
        {/* Left Drawing Tools */}
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
        <div className={`${isWatchlistOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out border-r border-[#1E293B] bg-[#0E131F] shrink-0 overflow-hidden flex flex-col hidden lg:flex relative`}>
          <Watchlist onMinimize={() => setIsWatchlistOpen(false)} />
        </div>

        {/* Re-open Floating Arrow Tab */}
        {!isWatchlistOpen && (
          <button
            onClick={() => setIsWatchlistOpen(true)}
            title="Open Watchlist"
            className="hidden lg:flex absolute top-14 left-12 z-40 bg-[#151C2C] hover:bg-blue-600 text-slate-300 hover:text-white px-1 py-2 rounded-r-md border-y border-r border-slate-700 shadow-xl cursor-pointer transition-all items-center justify-center"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Center Workspace: Chart + Bottom Dock */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Candlestick Chart Area */}
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <TradingChart 
              activeStock={selectedStock} 
              timeframe={timeframe}
              onOpenOrder={handleOpenOrder}
            />
          </div>

          {/* Bottom Panel (Positions / Orders / P&L History / Depth) */}
          <div className={`border-t border-[#1E293B] bg-[#0E131F] transition-all duration-200 flex flex-col ${isBottomOpen ? 'h-60' : 'h-8'}`}>
            <div className="h-8 px-3 flex items-center justify-between bg-[#111726] border-b border-[#1E293B] text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setActiveBottomTab('positions'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1.5 hover:text-white transition ${activeBottomTab === 'positions' && isBottomOpen ? 'text-[#26a69a] border-b-2 border-[#26a69a] h-8' : ''}`}
                >
                  <span>📈 Position</span>
                  <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">{positions.length}</span>
                </button>
                <button 
                  onClick={() => { setActiveBottomTab('orders'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1.5 hover:text-white transition ${activeBottomTab === 'orders' && isBottomOpen ? 'text-[#26a69a] border-b-2 border-[#26a69a] h-8' : ''}`}
                >
                  <span>📋 Orders</span>
                  <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">{orders.length}</span>
                </button>
                <button 
                  onClick={() => { setActiveBottomTab('pnl'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1.5 hover:text-white transition ${activeBottomTab === 'pnl' && isBottomOpen ? 'text-[#26a69a] border-b-2 border-[#26a69a] h-8' : ''}`}
                >
                  <span>💰 Realized P&L</span>
                  <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">{realizedPnLList.length}</span>
                </button>
                <button 
                  onClick={() => { setActiveBottomTab('depth'); setIsBottomOpen(true); }}
                  className={`hover:text-white hidden sm:block ${activeBottomTab === 'depth' && isBottomOpen ? 'text-[#26a69a] border-b-2 border-[#26a69a] h-8' : ''}`}
                >
                  📊 Depth
                </button>
              </div>

              <div className="flex items-center gap-3">
                {positions.length > 0 ? (
                  <span className={`text-[11px] font-mono font-bold ${unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Open P&L: {unrealizedPnL >= 0 ? '+' : ''}₹{unrealizedPnL.toFixed(2)}
                  </span>
                ) : (
                  <span className={`text-[11px] font-mono font-bold ${totalRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Realized P&L: {totalRealizedPnL >= 0 ? '+' : ''}₹{totalRealizedPnL.toFixed(2)}
                  </span>
                )}
                <button 
                  onClick={() => setIsBottomOpen(!isBottomOpen)}
                  className="hover:text-white px-2 py-0.5 text-xs rounded bg-slate-800/60"
                >
                  {isBottomOpen ? '▼ Minimize' : '▲ Expand Dock'}
                </button>
              </div>
            </div>

            {/* Bottom Dock Content */}
            {isBottomOpen && (
              <div className="flex-1 overflow-auto p-2 bg-[#0b0e14]">
                {/* 1. OPEN POSITIONS TAB */}
                {activeBottomTab === 'positions' && (
                  <div className="text-xs text-slate-400">
                    {positions.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="p-2">Product</th>
                            <th className="p-2">Symbol</th>
                            <th className="p-2">Qty</th>
                            <th className="p-2">Avg. Buy Price</th>
                            <th className="p-2">LTP</th>
                            <th className="p-2">P&L</th>
                            <th className="p-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positions.map((p, idx) => {
                            const currentStock = watchlist.find((s) => s.symbol === p.symbol) || selectedStock;
                            const ltp = currentStock?.price || p.avgPrice;
                            const pnl = (ltp - p.avgPrice) * p.qty;
                            const isProfit = pnl >= 0;

                            return (
                              <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/50">
                                <td className="p-2 font-bold text-blue-400">{p.product}</td>
                                <td className="p-2 font-bold text-white">{p.symbol}</td>
                                <td className="p-2 font-mono">{p.qty}</td>
                                <td className="p-2 font-mono">₹{p.avgPrice.toFixed(2)}</td>
                                <td className="p-2 font-mono">₹{ltp.toFixed(2)}</td>
                                <td className={`p-2 font-mono font-bold ${isProfit ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                                  {isProfit ? '+' : ''}₹{pnl.toFixed(2)} ({isProfit ? '+' : ''}{((pnl / (p.avgPrice * Math.abs(p.qty))) * 100).toFixed(2)}%)
                                </td>
                                <td className="p-2 text-right">
                                  <button
                                    onClick={() => closePosition(p.symbol, p.product)}
                                    className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer"
                                  >
                                    Square Off
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-500">
                        No open positions. Use Buy/Sell buttons to execute trades.
                      </div>
                    )}
                  </div>
                )}

                {/* 2. REALIZED P&L / CLOSED TRADES STATEMENT TAB */}
                {activeBottomTab === 'pnl' && (
                  <div className="text-xs text-slate-400">
                    <div className="flex items-center gap-4 mb-3 bg-[#111726] p-2.5 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-500 text-[10px] block">TOTAL NET REALIZED P&L</span>
                        <span className={`text-sm font-bold font-mono ${totalRealizedPnL >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                          {totalRealizedPnL >= 0 ? '+' : ''}₹{totalRealizedPnL.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-l border-slate-800 pl-3">
                        <span className="text-slate-500 text-[10px] block">PROFITABLE TRADES</span>
                        <span className="text-xs font-bold text-[#089981]">{winningTrades} Wins</span>
                      </div>
                      <div className="border-l border-slate-800 pl-3">
                        <span className="text-slate-500 text-[10px] block">LOSING TRADES</span>
                        <span className="text-xs font-bold text-[#f23645]">{losingTrades} Losses</span>
                      </div>
                    </div>

                    {realizedPnLList.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="p-2">Time</th>
                            <th className="p-2">Symbol</th>
                            <th className="p-2">Product</th>
                            <th className="p-2">Qty</th>
                            <th className="p-2">Buy Price</th>
                            <th className="p-2">Sell Price</th>
                            <th className="p-2 text-right">Realized P&L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {realizedPnLList.map((item, idx) => {
                            const isWin = item.pnl >= 0;
                            return (
                              <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/50">
                                <td className="p-2 font-mono text-slate-400">{item.time}</td>
                                <td className="p-2 font-bold text-white">{item.symbol}</td>
                                <td className="p-2 text-blue-400 font-semibold">{item.product}</td>
                                <td className="p-2 font-mono">{item.qty}</td>
                                <td className="p-2 font-mono">₹{item.buyPrice.toFixed(2)}</td>
                                <td className="p-2 font-mono">₹{item.sellPrice.toFixed(2)}</td>
                                <td className={`p-2 font-mono font-bold text-right ${isWin ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                                  {isWin ? '+' : ''}₹{item.pnl.toFixed(2)} ({isWin ? '+' : ''}{item.pnlPercent}%)
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-6 text-slate-500">No closed trades yet. Square off a position to see realized earnings.</div>
                    )}
                  </div>
                )}

                {/* 3. ORDER HISTORY TAB */}
                {activeBottomTab === 'orders' && (
                  <div className="text-xs text-slate-400">
                    {orders.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="p-2">Time</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Symbol</th>
                            <th className="p-2">Qty</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o, idx) => (
                            <tr key={idx} className="border-b border-slate-900">
                              <td className="p-2 font-mono">{o.time}</td>
                              <td className={`p-2 font-bold ${o.type === 'BUY' ? 'text-[#089981]' : 'text-[#f23645]'}`}>{o.type}</td>
                              <td className="p-2 font-bold text-white">{o.symbol}</td>
                              <td className="p-2 font-mono">{o.qty}</td>
                              <td className="p-2 font-mono">₹{o.price.toFixed(2)}</td>
                              <td className="p-2 text-[#089981] font-semibold">{o.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8 text-slate-500">No order history available</div>
                    )}
                  </div>
                )}

                {/* 4. MARKET DEPTH TAB */}
                {activeBottomTab === 'depth' && (
                  <div className="text-xs text-slate-400 p-3 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[#089981] font-semibold mb-1">Bid Orders</div>
                      <div className="flex justify-between border-b border-slate-800 py-1 font-mono"><span>₹{selectedStock?.price || 1000}</span><span className="text-slate-400">1,250 Qty</span></div>
                      <div className="flex justify-between border-b border-slate-800 py-1 font-mono"><span>₹{(Number(selectedStock?.price || 1000) - 0.5).toFixed(2)}</span><span className="text-slate-400">3,400 Qty</span></div>
                    </div>
                    <div>
                      <div className="text-[#f23645] font-semibold mb-1">Ask Orders</div>
                      <div className="flex justify-between border-b border-slate-800 py-1 font-mono"><span>₹{(Number(selectedStock?.price || 1000) + 0.5).toFixed(2)}</span><span className="text-slate-400">2,100 Qty</span></div>
                      <div className="flex justify-between border-b border-slate-800 py-1 font-mono"><span>₹{(Number(selectedStock?.price || 1000) + 1.0).toFixed(2)}</span><span className="text-slate-400">4,800 Qty</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. ORDER EXECUTION MODAL */}
      {isModalOpen && (
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