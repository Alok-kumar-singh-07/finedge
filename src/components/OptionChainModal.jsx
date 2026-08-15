import { useState } from 'react';
import { X } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

export default function OptionChainModal({ isOpen, onClose }) {
  const [selectedExpiry, setSelectedExpiry] = useState('Current Week');
  const { buyStock } = useTradingStore();

  if (!isOpen) return null;

  const spotPrice = 24350.20; // Nifty Spot
  const strikes = [
    { strike: 24150, cePrice: 245.50, pePrice: 32.10, ceOI: '85.4L', peOI: '18.2L' },
    { strike: 24200, cePrice: 202.80, pePrice: 45.40, ceOI: '92.1L', peOI: '29.5L' },
    { strike: 24250, cePrice: 165.20, pePrice: 62.90, ceOI: '110.5L', peOI: '48.1L' },
    { strike: 24300, cePrice: 130.40, pePrice: 85.30, ceOI: '145.2L', peOI: '76.8L' },
    { strike: 24350, cePrice: 101.10, pePrice: 112.50, ceOI: '180.6L', peOI: '120.4L', atm: true },
    { strike: 24400, cePrice: 75.60, pePrice: 148.20, ceOI: '135.8L', peOI: '160.2L' },
    { strike: 24450, cePrice: 54.30, pePrice: 188.70, ceOI: '98.3L', peOI: '105.1L' },
    { strike: 24500, cePrice: 38.10, pePrice: 232.00, ceOI: '160.4L', peOI: '82.6L' },
  ];

  const handleTradeOption = (symbol, price) => {
    const lotSize = 25; // Nifty Lot Size
    const success = buyStock(symbol, `NIFTY Option ${symbol}`, lotSize, price, 'Trading');
    if (success) {
      alert(`Bought 1 Lot (${lotSize} Qty) of ${symbol} at ₹${price}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-xs">
      <div className="w-[820px] bg-[#151922] border border-[#232936] rounded-xl text-white shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 border-b border-[#232936] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-base">NIFTY Option Chain</h3>
            <span className="bg-[#0B0E14] border border-[#232936] text-[#00D09C] px-2 py-0.5 rounded text-xs font-mono font-bold">
              Spot: ₹{spotPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className="bg-[#0B0E14] border border-[#232936] text-xs px-2.5 py-1 rounded text-gray-300 focus:outline-none"
            >
              <option>Current Week Expiry</option>
              <option>Next Week Expiry</option>
              <option>Monthly Expiry</option>
            </select>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Option Chain Table */}
        <div className="max-h-[420px] overflow-auto p-3 text-xs font-mono">
          <table className="w-full text-center">
            <thead>
              <tr className="border-b border-[#232936] text-gray-400 font-sans text-[11px]">
                <th colSpan="3" className="text-[#00D09C] bg-[#00D09C]/10 py-1.5 rounded-tl">CALLS (CE)</th>
                <th className="bg-[#0B0E14] py-1.5 font-bold text-white">STRIKE</th>
                <th colSpan="3" className="text-[#EB5757] bg-[#EB5757]/10 py-1.5 rounded-tr">PUTS (PE)</th>
              </tr>
              <tr className="border-b border-[#232936] text-gray-500 text-[10px] bg-[#0B0E14]/40">
                <th className="py-1">OI</th>
                <th className="py-1">LTP</th>
                <th className="py-1">Action</th>
                <th className="py-1 bg-[#1E2533] text-gray-300">Price</th>
                <th className="py-1">Action</th>
                <th className="py-1">LTP</th>
                <th className="py-1">OI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {strikes.map((row) => (
                <tr
                  key={row.strike}
                  className={`hover:bg-[#1E2533]/60 transition-colors ${
                    row.atm ? 'bg-[#2F80ED]/10 border-y border-[#2F80ED]/40' : ''
                  }`}
                >
                  {/* Calls */}
                  <td className="py-2 text-gray-400">{row.ceOI}</td>
                  <td className="py-2 font-bold text-[#00D09C]">₹{row.cePrice.toFixed(2)}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleTradeOption(`NIFTY ${row.strike} CE`, row.cePrice)}
                      className="bg-[#00D09C] text-black font-sans font-bold px-2 py-0.5 rounded text-[10px] hover:opacity-90 active:scale-95"
                    >
                      BUY CE
                    </button>
                  </td>

                  {/* Strike */}
                  <td className={`py-2 font-bold text-sm ${row.atm ? 'bg-[#2F80ED] text-white' : 'bg-[#0B0E14] text-gray-200'}`}>
                    {row.strike} {row.atm && <span className="text-[9px] font-normal block text-blue-200">ATM</span>}
                  </td>

                  {/* Puts */}
                  <td className="py-2">
                    <button
                      onClick={() => handleTradeOption(`NIFTY ${row.strike} PE`, row.pePrice)}
                      className="bg-[#EB5757] text-white font-sans font-bold px-2 py-0.5 rounded text-[10px] hover:opacity-90 active:scale-95"
                    >
                      BUY PE
                    </button>
                  </td>
                  <td className="py-2 font-bold text-[#EB5757]">₹{row.pePrice.toFixed(2)}</td>
                  <td className="py-2 text-gray-400">{row.peOI}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}