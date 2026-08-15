import { useState } from 'react';
import { X, ShieldCheck, Zap } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

export default function OrderModal({ isOpen, onClose, initialType = 'BUY', stock }) {
  const store = useTradingStore();
  const executeOrder = store?.executeOrder || (() => {});
  const rawCash = store?.cash ?? 1000000;
  const cash = typeof rawCash === 'number' ? rawCash : parseFloat(rawCash) || 1000000;

  const [orderType, setOrderType] = useState(initialType);
  const [productType, setProductType] = useState('INTRADAY'); // INTRADAY | DELIVERY | MTF
  const [orderCategory, setOrderCategory] = useState('MARKET'); // MARKET | LIMIT
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState('');

  if (!isOpen) return null;

  const currentPrice = Number(stock?.price || 1000);
  const effectivePrice = orderCategory === 'LIMIT' && customPrice !== '' ? Number(customPrice) : currentPrice;

  // Multiplier based on selected product type
  const leverageMultiplier = productType === 'INTRADAY' ? 5 : productType === 'MTF' ? 4 : 1;
  const effectiveBuyingPower = cash * leverageMultiplier;

  // Max Quantity calculated automatically
  const maxAffordableQty = effectivePrice > 0 ? Math.max(1, Math.floor(effectiveBuyingPower / effectivePrice)) : 1;

  // Margin required after leverage
  const requiredMargin = (Number(quantity || 1) * effectivePrice) / leverageMultiplier;
  const isBuy = orderType === 'BUY';

  const handleSetMaxQuantity = () => {
    setQuantity(maxAffordableQty);
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    executeOrder({
      type: orderType,
      symbol: stock?.symbol || 'STOCK',
      qty: Number(quantity) || 1,
      price: effectivePrice,
      product: productType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="bg-[#111726] border border-[#1E293B] w-full max-w-md rounded-xl shadow-2xl overflow-hidden text-slate-200 text-xs">
        
        {/* Modal Header */}
        <div className={`px-4 py-3 flex items-center justify-between border-b border-[#1E293B] ${isBuy ? 'bg-[#00897B]/10' : 'bg-[#EF5350]/10'}`}>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold text-white ${isBuy ? 'bg-[#00897B]' : 'bg-[#EF5350]'}`}>
              {orderType}
            </span>
            <div>
              <span className="font-bold text-sm text-white">{stock?.symbol || 'STOCK'}</span>
              <span className="text-[11px] text-slate-400 ml-1.5">NSE • ₹{currentPrice.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleOrderSubmit} className="p-4 space-y-4">
          {/* Order Type Toggle (BUY / SELL) */}
          <div className="grid grid-cols-2 gap-2 bg-[#0B0E14] p-1 rounded-lg border border-[#1E293B]">
            <button
              type="button"
              onClick={() => setOrderType('BUY')}
              className={`py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                isBuy ? 'bg-[#00897B] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setOrderType('SELL')}
              className={`py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                !isBuy ? 'bg-[#EF5350] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              SELL
            </button>
          </div>

          {/* Product Tabs (Intraday, Delivery, MTF) */}
          <div>
            <label className="text-[11px] text-slate-400 mb-1.5 block font-semibold">Product Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'INTRADAY', label: 'Intraday', sub: 'MIS • 5x' },
                { id: 'DELIVERY', label: 'Delivery', sub: 'CNC • 1x' },
                { id: 'MTF', label: 'MTF', sub: 'Pay 25%' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProductType(p.id)}
                  className={`p-2 rounded border text-left cursor-pointer transition ${
                    productType === p.id 
                      ? 'border-blue-500 bg-blue-500/10 text-white' 
                      : 'border-[#1E293B] bg-[#0B0E14] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{p.label}</div>
                  <div className="text-[9px] text-slate-500">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Order Category (Market / Limit) */}
          <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3">
            {['MARKET', 'LIMIT'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setOrderCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition ${
                  orderCategory === cat ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quantity & Price Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-400 font-semibold">Quantity (Qty)</label>
                {/* Clickable Maximum Quantity Button */}
                <button
                  type="button"
                  onClick={handleSetMaxQuantity}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-mono bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/30 flex items-center gap-0.5 cursor-pointer"
                  title="Click to set max quantity based on funds"
                >
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  <span>Max: {maxAffordableQty.toLocaleString('en-IN')}</span>
                </button>
              </div>
              <input
                type="number"
                min="1"
                max={maxAffordableQty}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-[#0B0E14] border border-[#1E293B] focus:border-blue-500 rounded p-2 text-white font-mono text-xs outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block font-semibold">Price (₹)</label>
              <input
                type="number"
                step="0.05"
                disabled={orderCategory === 'MARKET'}
                value={orderCategory === 'MARKET' ? currentPrice : (customPrice || currentPrice)}
                onChange={(e) => setCustomPrice(e.target.value)}
                className={`w-full bg-[#0B0E14] border border-[#1E293B] focus:border-blue-500 rounded p-2 text-white font-mono text-xs outline-none ${
                  orderCategory === 'MARKET' ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          {/* Margin & Cash Summary */}
          <div className="bg-[#0B0E14] p-2.5 rounded-lg border border-[#1E293B] flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-400">Required Margin: </span>
              <span className="font-bold text-white font-mono">₹{requiredMargin.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400">Available: </span>
              <span className="font-bold text-emerald-400 font-mono">₹{cash.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            className={`w-full py-2.5 rounded-lg font-bold text-white text-xs shadow-lg transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5 ${
              isBuy ? 'bg-[#00897B] hover:bg-[#00796B]' : 'bg-[#EF5350] hover:bg-[#E53935]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>INSTANT {orderType} ({stock?.symbol || 'STOCK'})</span>
          </button>
        </form>
      </div>
    </div>
  );
}