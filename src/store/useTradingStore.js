import { create } from 'zustand';

const INITIAL_STOCKS = [
  { id: '1', symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2993.75, change: 12.45, changePercent: 0.42, sector: 'Nifty 50' },
  { id: '2', symbol: 'TCS', name: 'Tata Consultancy Services', price: 4180.50, change: -18.20, changePercent: -0.43, sector: 'Nifty 50' },
  { id: '3', symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1640.10, change: 8.90, changePercent: 0.55, sector: 'Bank' },
  { id: '4', symbol: 'INFY', name: 'Infosys Ltd', price: 1785.00, change: -5.60, changePercent: -0.31, sector: 'Nifty 50' },
  { id: '5', symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1190.25, change: 14.30, changePercent: 1.22, sector: 'Bank' },
  { id: '6', symbol: 'SBIN', name: 'State Bank of India', price: 835.40, change: 3.10, changePercent: 0.37, sector: 'Bank' },
  { id: '7', symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1420.80, change: -2.40, changePercent: -0.17, sector: 'F&O' },
  { id: '8', symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 1045.60, change: 16.80, changePercent: 1.63, sector: 'F&O' },
];

export const useTradingStore = create((set, get) => ({
  theme: 'dark',
  cash: 1000000.00, // ₹10,00,000 standard virtual capital
  watchlist: INITIAL_STOCKS,
  selectedStock: INITIAL_STOCKS[2], // Default HDFC Bank
  positions: [],
  orders: [],

  setSelectedStock: (stock) => set({ selectedStock: stock }),
  
  executeOrder: ({ type, symbol, qty, price, product = 'INTRADAY' }) => {
    const numQty = Math.max(1, parseInt(qty, 10) || 1);
    const numPrice = parseFloat(price) || get().selectedStock?.price || 1000;
    const orderCost = numQty * numPrice;
    const currentCash = get().cash;
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Validate Fund for BUY
    if (type === 'BUY' && currentCash < orderCost) {
      alert(`Insufficient Funds! Required: ₹${orderCost.toLocaleString('en-IN')}, Available: ₹${currentCash.toLocaleString('en-IN')}`);
      return;
    }

    // 1. Order Log Record
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

    // 2. Position Handling
    let updatedPositions = [...get().positions];
    const posIndex = updatedPositions.findIndex((p) => p.symbol === symbol && p.product === product);

    if (type === 'BUY') {
      if (posIndex > -1) {
        const exist = updatedPositions[posIndex];
        const totalCost = (exist.avgPrice * exist.qty) + orderCost;
        const totalQty = exist.qty + numQty;
        updatedPositions[posIndex] = {
          ...exist,
          qty: totalQty,
          avgPrice: parseFloat((totalCost / totalQty).toFixed(2)),
        };
      } else {
        updatedPositions.push({
          id: Date.now().toString(),
          symbol,
          product,
          qty: numQty,
          avgPrice: numPrice,
        });
      }
      set((state) => ({
        cash: state.cash - orderCost,
        orders: [newOrder, ...state.orders],
        positions: updatedPositions,
      }));
    } else {
      // SELL Handling
      if (posIndex > -1) {
        const exist = updatedPositions[posIndex];
        if (exist.qty > numQty) {
          updatedPositions[posIndex] = {
            ...exist,
            qty: exist.qty - numQty,
          };
          set((state) => ({
            cash: state.cash + orderCost,
            orders: [newOrder, ...state.orders],
            positions: updatedPositions,
          }));
        } else {
          // Closed completely
          const actualSoldCost = exist.qty * numPrice;
          updatedPositions.splice(posIndex, 1);
          set((state) => ({
            cash: state.cash + actualSoldCost,
            orders: [newOrder, ...state.orders],
            positions: updatedPositions,
          }));
        }
      } else {
        // Intraday Short Sell
        updatedPositions.push({
          id: Date.now().toString(),
          symbol,
          product,
          qty: -numQty,
          avgPrice: numPrice,
        });
        set((state) => ({
          orders: [newOrder, ...state.orders],
          positions: updatedPositions,
        }));
      }
    }
  },

  closePosition: (symbol, product) => {
    const pos = get().positions.find((p) => p.symbol === symbol && p.product === product);
    if (!pos) return;
    const stock = get().watchlist.find((s) => s.symbol === symbol) || get().selectedStock;
    const ltp = stock?.price || pos.avgPrice;
    
    get().executeOrder({
      type: pos.qty > 0 ? 'SELL' : 'BUY',
      symbol: pos.symbol,
      qty: Math.abs(pos.qty),
      price: ltp,
      product: pos.product,
    });
  },

  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));