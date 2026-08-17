import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
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
    closePosition,
    openOrderModal
  } = store;

  const [timeframe, setTimeframe] = useState('1D');
  const [activeBottomTab, setActiveBottomTab] = useState('positions');
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);

  const isDark = theme === 'dark' || theme === 'midnight';

  // Unrealized P&L Calculation
  const unrealizedPnL = positions.reduce((acc, pos) => {
    const currentStock = watchlist.find((s) => s.symbol === pos.symbol) || selectedStock;
    const ltp = currentStock?.price || pos.avgPrice;
    return acc + (ltp - pos.avgPrice) * pos.qty;
  }, 0);

  // Total Realized Profit / Loss
  const totalRealizedPnL = realizedPnLList.reduce((acc, item) => acc + (item.pnl || 0), 0);
  const winningTrades = realizedPnLList.filter((item) => item.pnl > 0).length;
  const losingTrades = realizedPnLList.filter((item) => item.pnl < 0).length;

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden select-none font-sans ${isDark ? 'bg-[#0B0E14] text-slate-200' : 'bg-white text-slate-800'}`}>
      
      {/* 1. TOP MAIN NAVIGATION */}
      <Navbar 
        onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />

      {/* 2. MAIN TRADING TERMINAL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Drawing Tools (Desktop Only) */}
        <div className="hidden md:flex flex-col border-r border-[#1E293B] bg-[#0E131F] w-10 shrink-0 z-10">
          <div className="flex items-center flex-col py-2 gap-3 text-slate-400 text-xs">
            <span className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Crosshair">✛</span>
            <span className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Trendline">╱</span>
            <span className="p-1.5 hover:bg-slate-800 rounded cursor-pointer" title="Measure">📏</span>
          </div>
        </div>

        {/* Collapsible Watchlist Sidebar */}
        <div className={`${isWatchlistOpen ? 'w-72 sm:w-80' : 'w-0'} transition-all duration-300 ease-in-out border-r border-[#1E293B] bg-[#0E131F] shrink-0 overflow-hidden flex flex-col absolute sm:relative h-full z-40`}>
          <Watchlist onMinimize={() => setIsWatchlistOpen(false)} />
        </div>

        {/* Center Workspace: Chart + Bottom Dock */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Candlestick Chart Area */}
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <TradingChart 
              activeStock={selectedStock} 
              timeframe={timeframe}
              onOpenOrder={openOrderModal}
            />
          </div>

          {/* Bottom Mobile Action Bar */}
          <div className="sm:hidden grid grid-cols-2 gap-2 p-1.5 bg-[#0E131F] border-t border-[#1E293B] z-30">
            <button
              onClick={() => openOrderModal('BUY')}
              className="bg-[#00897B] text-white py-1.5 rounded font-bold text-xs active:scale-98 transition cursor-pointer shadow"
            >
              BUY ({selectedStock?.symbol})
            </button>
            <button
              onClick={() => openOrderModal('SELL')}
              className="bg-[#EF5350] text-white py-1.5 rounded font-bold text-xs active:scale-98 transition cursor-pointer shadow"
            >
              SELL ({selectedStock?.symbol})
            </button>
          </div>

          {/* Bottom Panel Dock */}
          <div className={`border-t border-[#1E293B] bg-[#0E131F] transition-all duration-200 flex flex-col shrink-0 z-30 ${isBottomOpen ? 'h-52 sm:h-60' : 'h-8'}`}>
            <div className="h-8 px-2 sm:px-3 flex items-center justify-between bg-[#111726] border-b border-[#1E293B] text-[11px] font-semibold text-slate-400">
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
                <button 
                  onClick={() => { setActiveBottomTab('positions'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1 hover:text-white transition whitespace-nowrap ${activeBottomTab === 'positions' && isBottomOpen ? 'text-[#26a69a] border-b-2 border-[#26a69a] h-8' : ''}`}
                >
                  <span>Position</span>
                  <span className="bg-slate-800 px-1 py-0.2 rounded text-[9px] font-mono">{positions.length}</span>
                </button>
                <button 
                  onClick={() => { setActiveBottomTab('orders'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1 hover:text-white transition whitespace-nowrap ${activeBottomTab === 'orders' && isBottomOpen ? 'text-[#26a69a] border-b-2 border-[#26a69a] h-8' : ''}`}
                >
                  <span>Orders</span>
                  <span className="bg-slate-800 px-1 py-0.2 rounded text-[9px] font-mono">{orders.length}</span>
                </button>
                <button 
                  onClick={() => { setActiveBottomTab('pnl'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1 hover:text-white transition whitespace-nowrap ${activeBottomTab === 'pnl' && isBottomOpen ? 'text-[#26a69a] border-b-2 border-[#26a69a] h-8' : ''}`}
                >
                  <span>P&L</span>
                  <span className="bg-slate-800 px-1 py-0.2 rounded text-[9px] font-mono">{realizedPnLList.length}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <span className={`text-[10px] sm:text-[11px] font-mono font-bold ${unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {unrealizedPnL !== 0 
                    ? `P&L: ${unrealizedPnL >= 0 ? '+' : ''}₹${unrealizedPnL.toFixed(0)}` 
                    : `Net: ${totalRealizedPnL >= 0 ? '+' : ''}₹${totalRealizedPnL.toFixed(0)}`
                  }
                </span>
                <button 
                  onClick={() => setIsBottomOpen(!isBottomOpen)}
                  className="hover:text-white p-1 rounded bg-slate-800/80 text-slate-300 cursor-pointer flex items-center gap-0.5"
                >
                  {isBottomOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Bottom Dock Content */}
            {isBottomOpen && (
              <div className="flex-1 overflow-auto p-2 bg-[#0b0e14]">
                {/* 1. OPEN POSITIONS */}
                {activeBottomTab === 'positions' && (
                  <div className="text-[11px] text-slate-400">
                    {positions.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                            <th className="p-1.5">Symbol</th>
                            <th className="p-1.5">Qty</th>
                            <th className="p-1.5">Avg</th>
                            <th className="p-1.5">LTP</th>
                            <th className="p-1.5">P&L</th>
                            <th className="p-1.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positions.map((p, idx) => {
                            const currentStock = watchlist.find((s) => s.symbol === p.symbol) || selectedStock;
                            const ltp = currentStock?.price || p.avgPrice;
                            const pnl = (ltp - p.avgPrice) * p.qty;
                            const isProfit = pnl >= 0;

                            return (
                              <tr key={idx} className="border-b border-slate-900">
                                <td className="p-1.5 font-bold text-white">
                                  {p.symbol}
                                  <span className="block text-[9px] text-blue-400">{p.product}</span>
                                </td>
                                <td className="p-1.5 font-mono">{p.qty}</td>
                                <td className="p-1.5 font-mono">₹{p.avgPrice.toFixed(1)}</td>
                                <td className="p-1.5 font-mono">₹{ltp.toFixed(1)}</td>
                                <td className={`p-1.5 font-mono font-bold ${isProfit ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                                  {isProfit ? '+' : ''}₹{pnl.toFixed(1)}
                                </td>
                                <td className="p-1.5 text-right">
                                  <button
                                    onClick={() => closePosition(p.symbol, p.product)}
                                    className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    Exit
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-6 text-[11px] text-slate-500">No open positions</div>
                    )}
                  </div>
                )}

                {/* 2. REALIZED P&L */}
                {activeBottomTab === 'pnl' && (
                  <div className="text-[11px] text-slate-400">
                    <div className="flex items-center gap-3 mb-2 bg-[#111726] p-2 rounded border border-slate-800 text-[10px]">
                      <div>
                        <span className="text-slate-500 block">TOTAL P&L</span>
                        <span className={`text-xs font-bold font-mono ${totalRealizedPnL >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                          {totalRealizedPnL >= 0 ? '+' : ''}₹{totalRealizedPnL.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-l border-slate-800 pl-2">
                        <span className="text-slate-500 block">STATS</span>
                        <span className="text-emerald-400 font-bold">{winningTrades}W</span> / <span className="text-rose-400 font-bold">{losingTrades}L</span>
                      </div>
                    </div>

                    {realizedPnLList.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                            <th className="p-1">Time</th>
                            <th className="p-1">Symbol</th>
                            <th className="p-1">Qty</th>
                            <th className="p-1 text-right">P&L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {realizedPnLList.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-900">
                              <td className="p-1 font-mono text-slate-500 text-[9px]">{item.time}</td>
                              <td className="p-1 font-bold text-white">{item.symbol}</td>
                              <td className="p-1 font-mono">{item.qty}</td>
                              <td className={`p-1 font-mono font-bold text-right ${item.pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                                {item.pnl >= 0 ? '+' : ''}₹{item.pnl.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-4 text-slate-500 text-[11px]">No closed trades yet</div>
                    )}
                  </div>
                )}

                {/* 3. ORDER HISTORY */}
                {activeBottomTab === 'orders' && (
                  <div className="text-[11px] text-slate-400">
                    {orders.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                            <th className="p-1">Time</th>
                            <th className="p-1">Type</th>
                            <th className="p-1">Symbol</th>
                            <th className="p-1">Qty</th>
                            <th className="p-1">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o, idx) => (
                            <tr key={idx} className="border-b border-slate-900">
                              <td className="p-1 font-mono text-slate-500 text-[9px]">{o.time}</td>
                              <td className={`p-1 font-bold ${o.type === 'BUY' ? 'text-[#089981]' : 'text-[#f23645]'}`}>{o.type}</td>
                              <td className="p-1 font-bold text-white">{o.symbol}</td>
                              <td className="p-1 font-mono">{o.qty}</td>
                              <td className="p-1 font-mono">₹{o.price.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-4 text-slate-500 text-[11px]">No orders yet</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. ORDER EXECUTION MODAL */}
      <OrderModal />
    </div>
  );
}