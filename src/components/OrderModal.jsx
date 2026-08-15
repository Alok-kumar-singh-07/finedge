import { useState } from 'react';
import { X, ShieldAlert, Target } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

export default function OrderModal({ isOpen, onClose, initialType = 'BUY', stock }) {
  const [orderType] = useState(initialType);
  const [productType, setProductType] = useState('Trading'); // 'Trading' (Intraday) | 'Investing' (Delivery) | 'MTF'
  const [quantity, setQuantity] = useState(50);
  const [priceType, setPriceType] = useState('Market');
  const [limitPrice, setLimitPrice] = useState(stock?.price || 0);

  // Stop-Loss & Target Toggles and Values
  const [isSLActive, setIsSLActive] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState(
    stock?.price ? (initialType === 'BUY' ? (stock.price * 0.985).toFixed(2) : (stock.price * 1.015).toFixed(2)) : ''
  );
  const [isTargetActive, setIsTargetActive] = useState(false);
  const [targetPrice, setTargetPrice] = useState(
    stock?.price ? (initialType === 'BUY' ? (stock.price * 1.025).toFixed(2) : (stock.price * 0.975).toFixed(2)) : ''
  );

  const { walletBalance, buyStock, sellStock, theme } = useTradingStore();
  const isDark = theme === 'dark' || theme === 'midnight';

  if (!isOpen || !stock) return null;

  const currentPrice = priceType === 'Market' ? stock.price : parseFloat(limitPrice) || stock.price;
  const leverage = productType === 'Trading' ? 0.20 : productType === 'MTF' ? 0.25 : 1.0;
  const requiredMargin = quantity * currentPrice * leverage;

  const handleExecuteOrder = (e) => {
    e.preventDefault();
    const finalSL = isSLActive ? parseFloat(stopLossPrice) : null;
    const finalTarget = isTargetActive ? parseFloat(targetPrice) : null;

    const isExecuted =
      orderType === 'BUY'
        ? buyStock(stock.symbol, stock.name, Number(quantity), currentPrice, productType, finalTarget, finalSL)
        : sellStock(stock.symbol, stock.name, Number(quantity), currentPrice, productType, finalTarget, finalSL);

    if (isExecuted) {
      onClose();
    }
  };

  const isBuy = orderType === 'BUY';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs font-sans">
      <div
        style={{
          backgroundColor: isDark ? '#151922' : '#ffffff',
          borderColor: isDark ? '#232936' : '#e0e3eb',
          color: isDark ? '#ffffff' : '#131722',
        }}
        className="w-[420px] rounded-xl border shadow-2xl overflow-hidden text-xs"
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: isBuy ? '#2962ff' : '#f23645',
          }}
          className="p-3 text-white flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">{orderType}</span>
            <span className="font-bold text-sm">{stock.symbol}</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">₹{stock.price.toFixed(2)}</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleExecuteOrder} className="p-4 space-y-3">
          {/* Product Type (Trading vs Investing) */}
          <div
            style={{ backgroundColor: isDark ? '#0B0E14' : '#f0f3fa' }}
            className="grid grid-cols-3 p-1 rounded-lg font-semibold"
          >
            {['Trading', 'Investing', 'MTF'].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setProductType(tab)}
                className={`py-1.5 rounded text-center transition-all cursor-pointer ${
                  productType === tab
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-gray-400 hover:text-inherit'
                }`}
              >
                {tab === 'Trading' ? 'Intraday 5X' : tab === 'Investing' ? 'Delivery' : 'MTF 4X'}
              </button>
            ))}
          </div>

          {/* Quantity & Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 block mb-1 font-medium">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  backgroundColor: isDark ? '#0B0E14' : '#f0f3fa',
                  borderColor: isDark ? '#232936' : '#e0e3eb',
                }}
                className="w-full border rounded-lg px-3 py-1.5 font-mono font-bold text-sm outline-none focus:border-[#2962ff]"
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1 font-medium">Order Type</label>
              <div
                style={{ backgroundColor: isDark ? '#0B0E14' : '#f0f3fa' }}
                className="grid grid-cols-2 p-1 rounded-lg font-medium"
              >
                <button
                  type="button"
                  onClick={() => setPriceType('Market')}
                  className={`py-1 rounded cursor-pointer ${
                    priceType === 'Market' ? 'bg-white text-black font-bold shadow-xs' : 'text-gray-400'
                  }`}
                >
                  Market
                </button>
                <button
                  type="button"
                  onClick={() => setPriceType('Limit')}
                  className={`py-1 rounded cursor-pointer ${
                    priceType === 'Limit' ? 'bg-white text-black font-bold shadow-xs' : 'text-gray-400'
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>
          </div>

          {/* Limit Price Input if Limit selected */}
          {priceType === 'Limit' && (
            <div>
              <label className="text-gray-400 block mb-1 font-medium">Limit Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                style={{
                  backgroundColor: isDark ? '#0B0E14' : '#f0f3fa',
                  borderColor: isDark ? '#232936' : '#e0e3eb',
                }}
                className="w-full border rounded-lg px-3 py-1.5 font-mono font-bold text-sm outline-none focus:border-[#2962ff]"
              />
            </div>
          )}

          {/* STAGE 7: AUTO STOP-LOSS & TARGET TOGGLES */}
          <div
            style={{
              backgroundColor: isDark ? '#0B0E14' : '#fafbfc',
              borderColor: isDark ? '#232936' : '#e0e3eb',
            }}
            className="p-2.5 rounded-lg border space-y-2"
          >
            {/* Stop-Loss Row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSLActive}
                  onChange={(e) => setIsSLActive(e.target.checked)}
                  className="accent-[#f23645] rounded"
                />
                <ShieldAlert className="w-3.5 h-3.5 text-[#f23645]" />
                <span>Stop-Loss (SL)</span>
              </label>
              {isSLActive && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 font-mono">₹</span>
                  <input
                    type="number"
                    step="0.05"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    className="w-24 px-2 py-0.5 rounded border border-[#f23645]/40 font-mono font-bold text-right outline-none bg-transparent"
                  />
                </div>
              )}
            </div>

            {/* Target Row */}
            <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: isDark ? '#232936' : '#e0e3eb' }}>
              <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTargetActive}
                  onChange={(e) => setIsTargetActive(e.target.checked)}
                  className="accent-[#089981] rounded"
                />
                <Target className="w-3.5 h-3.5 text-[#089981]" />
                <span>Target (Take Profit)</span>
              </label>
              {isTargetActive && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 font-mono">₹</span>
                  <input
                    type="number"
                    step="0.05"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-24 px-2 py-0.5 rounded border border-[#089981]/40 font-mono font-bold text-right outline-none bg-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Margin Calculation Summary */}
          <div
            style={{ borderColor: isDark ? '#232936' : '#e0e3eb' }}
            className="border-t pt-2 space-y-1 font-mono text-[11px]"
          >
            <div className="flex justify-between text-gray-400 font-sans">
              <span>Required Margin:</span>
              <span className="font-bold text-inherit">₹{requiredMargin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400 font-sans">
              <span>Available Cash:</span>
              <span className="font-bold text-[#089981]">₹{walletBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            style={{
              backgroundColor: isBuy ? '#2962ff' : '#f23645',
            }}
            className="w-full py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-all hover:opacity-90 active:scale-98 shadow-md cursor-pointer"
          >
            {orderType} {quantity} Qty
          </button>
        </form>
      </div>
    </div>
  );
}