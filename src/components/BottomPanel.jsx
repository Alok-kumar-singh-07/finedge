import { useState } from 'react';
import { History, Clock, Layers, ShieldAlert, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

export default function BottomPanel({ stocks }) {
  const [activeTab, setActiveTab] = useState('positions');
  const { holdings, orders, closedTrades, squareOffPosition, theme } = useTradingStore();
  const isDark = theme === 'dark' || theme === 'midnight';

  // Portfolio Analytics Calculation
  let totalInvested = 0;
  let totalCurrentVal = 0;

  holdings.forEach((h) => {
    const liveStock = stocks.find((s) => s.symbol === h.symbol);
    const ltp = liveStock ? liveStock.price : h.avgPrice;
    const absQty = Math.abs(h.quantity);
    totalInvested += absQty * h.avgPrice;
    totalCurrentVal += absQty * ltp;
  });

  const totalUnrealizedPnL = totalCurrentVal - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;
  const isUnrealizedPositive = totalUnrealizedPnL >= 0;

  const totalRealizedPnL = closedTrades.reduce((acc, trade) => acc + trade.realizedPnl, 0);
  const isRealizedPositive = totalRealizedPnL >= 0;

  const handleSquareOffClick = (holding) => {
    const liveStock = stocks.find((s) => s.symbol === holding.symbol);
    const currentPrice = liveStock ? liveStock.price : holding.avgPrice;
    squareOffPosition(holding.symbol, holding.productType || 'Trading', currentPrice);
  };

  return (
    <div
      style={{
        backgroundColor: theme === 'midnight' ? '#000000' : theme === 'dark' ? '#151922' : '#ffffff',
        color: isDark ? '#ffffff' : '#131722',
      }}
      className="h-full flex flex-col font-sans select-none overflow-hidden transition-colors"
    >
      {/* Top Header & Analytics Metric Bar */}
      <div
        style={{
          backgroundColor: isDark ? '#0B0E14' : '#fafbfc',
          borderColor: isDark ? '#232936' : '#e0e3eb',
        }}
        className="flex items-center justify-between px-3 border-b h-8 shrink-0"
      >
        {/* Left Navigation Tabs */}
        <div className="flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'positions'
                ? 'text-[#2962ff] border-b-2 border-[#2962ff] font-bold'
                : 'text-gray-400 hover:text-inherit'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Positions ({holdings.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'text-[#2962ff] border-b-2 border-[#2962ff] font-bold'
                : 'text-gray-400 hover:text-inherit'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'text-[#2962ff] border-b-2 border-[#2962ff] font-bold'
                : 'text-gray-400 hover:text-inherit'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Closed P&L ({closedTrades.length})
          </button>
        </div>

        {/* Right Portfolio Summary Widgets */}
        {activeTab === 'positions' && holdings.length > 0 && (
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div>
              <span className="text-gray-400 font-sans">Invested: </span>
              <span className="font-bold">₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-gray-400 font-sans">Current: </span>
              <span className="font-bold">₹{totalCurrentVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div
              className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                isUnrealizedPositive ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
              }`}
            >
              {isUnrealizedPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>Unrealized P&L: {isUnrealizedPositive ? '+' : ''}₹{totalUnrealizedPnL.toFixed(2)} ({isUnrealizedPositive ? '+' : ''}{totalReturnPercent.toFixed(2)}%)</span>
            </div>
          </div>
        )}

        {activeTab === 'history' && closedTrades.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-gray-400 font-sans">Total Realized P&L:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                isRealizedPositive ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
              }`}
            >
              {isRealizedPositive ? '+' : ''}₹{totalRealizedPnL.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Main Table Body */}
      <div className="flex-1 overflow-auto p-2 text-xs">
        {/* TAB 1: POSITIONS & HOLDINGS */}
        {activeTab === 'positions' && (
          holdings.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-sans text-[11px]">
              No active positions in your portfolio. Click Buy or Sell to start trading!
            </div>
          ) : (
            <table className="w-full text-left font-mono">
              <thead
                className={`border-b ${isDark ? 'border-[#232936] text-gray-400' : 'border-[#e0e3eb] text-[#787b86]'} text-[10px] uppercase font-sans`}
              >
                <tr>
                  <th className="pb-1 pl-2">Stock</th>
                  <th className="pb-1">Product</th>
                  <th className="pb-1">Qty</th>
                  <th className="pb-1">Avg. Price</th>
                  <th className="pb-1">LTP</th>
                  <th className="pb-1">SL / Target</th>
                  <th className="pb-1">Current Val</th>
                  <th className="pb-1">Live P&L</th>
                  <th className="pb-1 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#232936]' : 'divide-[#f0f3fa]'}`}>
                {holdings.map((h, index) => {
                  const liveStock = stocks.find((s) => s.symbol === h.symbol);
                  const ltp = liveStock ? liveStock.price : h.avgPrice;
                  const absQty = Math.abs(h.quantity);
                  const isShort = h.quantity < 0;
                  const invested = absQty * h.avgPrice;
                  const currentVal = absQty * ltp;
                  const pnl = isShort ? invested - currentVal : currentVal - invested;
                  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
                  const isProfit = pnl >= 0;

                  return (
                    <tr key={index} className={isDark ? 'hover:bg-[#1E2533]/50' : 'hover:bg-[#f8f9fd]'}>
                      <td className="py-1.5 pl-2 font-bold font-sans flex items-center gap-1.5">
                        <span>{h.symbol}</span>
                        <span className="text-[9px] bg-gray-500/15 text-gray-400 px-1 py-0.2 rounded font-mono">NSE</span>
                      </td>
                      <td className="py-1.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold ${
                            isShort ? 'bg-[#f23645]/15 text-[#f23645]' : 'bg-[#089981]/15 text-[#089981]'
                          }`}
                        >
                          {isShort ? 'SHORT' : 'LONG'} ({h.productType || 'Trading'})
                        </span>
                      </td>
                      <td className="py-1.5 font-bold">{absQty}</td>
                      <td className="py-1.5 text-gray-400">₹{h.avgPrice.toFixed(2)}</td>
                      <td className="py-1.5 font-bold text-inherit">₹{ltp.toFixed(2)}</td>

                      {/* SL & Target Indicators */}
                      <td className="py-1.5">
                        <div className="flex items-center gap-1 text-[10px]">
                          {h.stopLossPrice ? (
                            <span className="flex items-center gap-0.5 text-[#f23645] bg-[#f23645]/10 px-1 rounded font-bold" title="Stop Loss">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              ₹{h.stopLossPrice}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                          {h.targetPrice ? (
                            <span className="flex items-center gap-0.5 text-[#089981] bg-[#089981]/10 px-1 rounded font-bold" title="Target Price">
                              <Target className="w-2.5 h-2.5" />
                              ₹{h.targetPrice}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="py-1.5 text-gray-400">₹{currentVal.toFixed(2)}</td>
                      <td className={`py-1.5 font-bold ${isProfit ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {isProfit ? '+' : ''}₹{pnl.toFixed(2)} ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                      </td>
                      <td className="py-1.5 text-right pr-2">
                        <button
                          onClick={() => handleSquareOffClick(h)}
                          className="bg-[#f23645]/10 hover:bg-[#f23645] text-[#f23645] hover:text-white border border-[#f23645]/30 px-2 py-0.5 rounded text-[10px] font-sans font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          Square Off
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {/* TAB 2: EXECUTED ORDERS LOG */}
        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-sans text-[11px]">
              No executed orders yet.
            </div>
          ) : (
            <table className="w-full text-left font-mono">
              <thead
                className={`border-b ${isDark ? 'border-[#232936] text-gray-400' : 'border-[#e0e3eb] text-[#787b86]'} text-[10px] uppercase font-sans`}
              >
                <tr>
                  <th className="pb-1 pl-2">Time</th>
                  <th className="pb-1">Stock</th>
                  <th className="pb-1">Action</th>
                  <th className="pb-1">Product</th>
                  <th className="pb-1">Qty</th>
                  <th className="pb-1">Execution Price</th>
                  <th className="pb-1 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#232936]' : 'divide-[#f0f3fa]'}`}>
                {orders.map((o) => (
                  <tr key={o.id} className={isDark ? 'hover:bg-[#1E2533]/50' : 'hover:bg-[#f8f9fd]'}>
                    <td className="py-1.5 pl-2 text-gray-400 text-[10px]">{o.time}</td>
                    <td className="py-1.5 font-bold font-sans">{o.symbol}</td>
                    <td className="py-1.5">
                      <span
                        className={`text-[10px] font-bold ${
                          o.type.includes('BUY') ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {o.type}
                      </span>
                    </td>
                    <td className="py-1.5 text-gray-400 font-sans text-[10px]">{o.productType || 'Trading'}</td>
                    <td className="py-1.5">{o.quantity}</td>
                    <td className="py-1.5 font-bold">₹{o.price.toFixed(2)}</td>
                    <td className="py-1.5 text-right pr-2">
                      <span className="bg-[#089981]/15 text-[#089981] border border-[#089981]/30 text-[9px] px-1.5 py-0.5 rounded font-sans font-bold">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* TAB 3: CLOSED P&L TRADES */}
        {activeTab === 'history' && (
          closedTrades.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-sans text-[11px]">
              No closed trade records yet.
            </div>
          ) : (
            <table className="w-full text-left font-mono">
              <thead
                className={`border-b ${isDark ? 'border-[#232936] text-gray-400' : 'border-[#e0e3eb] text-[#787b86]'} text-[10px] uppercase font-sans`}
              >
                <tr>
                  <th className="pb-1 pl-2">Stock</th>
                  <th className="pb-1">Side</th>
                  <th className="pb-1">Qty</th>
                  <th className="pb-1">Entry Price</th>
                  <th className="pb-1">Exit Price</th>
                  <th className="pb-1">Time</th>
                  <th className="pb-1 text-right pr-2">Realized P&L</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#232936]' : 'divide-[#f0f3fa]'}`}>
                {closedTrades.map((t) => {
                  const isProfit = t.realizedPnl >= 0;
                  return (
                    <tr key={t.id} className={isDark ? 'hover:bg-[#1E2533]/50' : 'hover:bg-[#f8f9fd]'}>
                      <td className="py-1.5 pl-2 font-bold font-sans">{t.symbol}</td>
                      <td className="py-1.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold ${
                            t.type === 'LONG' ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-1.5">{t.quantity}</td>
                      <td className="py-1.5 text-gray-400">₹{t.entryPrice.toFixed(2)}</td>
                      <td className="py-1.5 font-bold">₹{t.exitPrice.toFixed(2)}</td>
                      <td className="py-1.5 text-gray-400 text-[10px]">
                        {t.entryTime} → {t.exitTime}
                      </td>
                      <td className="py-1.5 text-right pr-2">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded ${
                            isProfit ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                          }`}
                        >
                          {isProfit ? '+' : ''}₹{t.realizedPnl.toFixed(2)} ({isProfit ? '+' : ''}{t.returnPercent.toFixed(2)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}