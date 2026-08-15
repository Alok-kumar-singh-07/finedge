import { create } from 'zustand';

const INITIAL_STOCKS = [
  { id: '1', symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2993.75, change: 12.45, changePercent: 0.42 },
  { id: '2', symbol: 'TCS', name: 'Tata Consultancy Services', price: 4180.50, change: -18.20, changePercent: -0.43 },
  { id: '3', symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1640.10, change: 8.90, changePercent: 0.55 },
  { id: '4', symbol: 'INFY', name: 'Infosys Ltd', price: 1785.00, change: -5.60, changePercent: -0.31 },
  { id: '5', symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1190.25, change: 14.30, changePercent: 1.22 },
  { id: '6', symbol: 'SBIN', name: 'State Bank of India', price: 835.40, change: 3.10, changePercent: 0.37 },
  { id: '7', symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1420.80, change: -2.40, changePercent: -0.17 },
  { id: '8', symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 1045.60, change: 16.80, changePercent: 1.63 },
];

export const useTradingStore = create((set, get) => ({
  theme: 'dark',
  cash: 989544.00,
  watchlist: INITIAL_STOCKS,
  selectedStock: INITIAL_STOCKS[7], // Default Tata Motors
  positions: [],
  orders: [],

  setSelectedStock: (stock) => set({ selectedStock: stock }),
  
  executeOrder: ({ type, symbol, qty, price, product = 'INTRADAY' }) => {
    const numQty = parseInt(qty, 10) || 1;
    const numPrice = parseFloat(price) || get().selectedStock?.price || 1000;
    const orderCost = numQty * numPrice;
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. Add Order to Log
    const newOrder = {
      id: Date.now().toString(),
      time,
      type,
      symbol,
      qty: numQty,
      price: numPrice,
      product,
      status: 'EXECUTED',
    };

    // 2. Update Positions
    let updatedPositions = [...get().positions];
    const existingIndex = updatedPositions.findIndex((p) => p.symbol === symbol && p.product === product);

    if (existingIndex > -1) {
      const existing = updatedPositions[existingIndex];
      let newQty = type === 'BUY' ? existing.qty + numQty : existing.qty - numQty;

      if (newQty <= 0) {
        updatedPositions.splice(existingIndex, 1);
      } else {
        const totalCost = type === 'BUY' 
          ? (existing.avgPrice * existing.qty) + orderCost 
          : existing.avgPrice * newQty;
        const avgPrice = parseFloat((totalCost / (type === 'BUY' ? existing.qty + numQty : newQty)).toFixed(2));
        
        updatedPositions[existingIndex] = {
          ...existing,
          qty: newQty,
          avgPrice: type === 'BUY' ? avgPrice : existing.avgPrice,
        };
      }
    } else if (type === 'BUY') {
      updatedPositions.push({
        id: Date.now().toString(),
        symbol,
        product,
        qty: numQty,
        avgPrice: numPrice,
      });
    }

    set((state) => ({
      orders: [newOrder, ...state.orders],
      positions: updatedPositions,
      cash: type === 'BUY' ? state.cash - orderCost : state.cash + orderCost,
    }));
  },

  closePosition: (symbol, product) => {
    const pos = get().positions.find((p) => p.symbol === symbol && p.product === product);
    if (!pos) return;
    const stock = get().watchlist.find((s) => s.symbol === symbol) || get().selectedStock;
    const ltp = stock?.price || pos.avgPrice;
    
    get().executeOrder({
      type: 'SELL',
      symbol: pos.symbol,
      qty: pos.qty,
      price: ltp,
      product: pos.product,
    });
  },

  checkAutoTriggers: () => {},
}));