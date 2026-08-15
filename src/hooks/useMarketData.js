import { useState, useEffect } from 'react';

export const INITIAL_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2980.50, change: 35.40, changePercent: 1.20, exchange: 'NSE' },
  { symbol: 'ZAGGLE', name: 'Zaggle Prepaid Ocean', price: 425.10, change: -3.65, changePercent: -0.85, exchange: 'NSE' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 1045.80, change: 12.30, changePercent: 1.19, exchange: 'NSE' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1640.25, change: -8.10, changePercent: -0.49, exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys Ltd.', price: 1820.60, change: 22.40, changePercent: 1.25, exchange: 'NSE' },
];

export function useMarketData() {
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [tickChanges, setTickChanges] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prevStocks) => {
        const randomIndex = Math.floor(Math.random() * prevStocks.length);
        const target = prevStocks[randomIndex];

        const deltaFactor = (Math.random() * 0.008) - 0.004;
        const newPrice = Math.max(1, Number((target.price * (1 + deltaFactor)).toFixed(2)));
        const priceDiff = Number((newPrice - target.price).toFixed(2));
        const isUp = priceDiff >= 0;

        const updatedChange = Number((target.change + priceDiff).toFixed(2));
        const updatedPercent = Number(((updatedChange / (newPrice - updatedChange)) * 100).toFixed(2));

        setTickChanges((prev) => ({
          ...prev,
          [target.symbol]: isUp ? 'up' : 'down',
        }));

        setTimeout(() => {
          setTickChanges((prev) => ({ ...prev, [target.symbol]: null }));
        }, 600);

        return prevStocks.map((s, idx) =>
          idx === randomIndex
            ? { ...s, price: newPrice, change: updatedChange, changePercent: updatedPercent }
            : s
        );
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return { stocks, tickChanges };
}