import { create } from 'zustand';
import { NSE_STOCKS_DIRECTORY } from '../dhanApi';

export const useTradingStore = create((set) => ({
  selectedStock: NSE_STOCKS_DIRECTORY?.[0] || {
    id: 'HDFCBANK.NS',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    price: 1640.50,
    change: 0.85
  },
  setSelectedStock: (stock) => set({ selectedStock: stock }),
  timeframe: '1D',
  setTimeframe: (tf) => set({ timeframe: tf }),
  orders: [],
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  cash: 1000000,
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }))
}));

export default useTradingStore;