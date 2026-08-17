import { create } from 'zustand';
import { NSE_STOCKS_DIRECTORY } from '../dhanApi';

export const useTradingStore = create((set, get) => ({
  // Stock Selection
  selectedStock: NSE_STOCKS_DIRECTORY?.[0] || {
    id: 'HDFCBANK.NS',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    price: 1640.50,
    change: 0.85
  },
  setSelectedStock: (stock) => set({ selectedStock: stock }),

  // Modal State (Managed globally so all Buy/Sell buttons work 100%)
  isOrderModalOpen: false,
  orderModalAction: 'BUY',
  openOrderModal: (action = 'BUY') => set({ isOrderModalOpen: true, orderModalAction: action }),
  closeOrderModal: () => set({ isOrderModalOpen: false }),

  // Chart Timeframe
  timeframe: '1D',
  setTimeframe: (tf) => set({ timeframe: tf }),

  // Watchlist
  watchlist: NSE_STOCKS_DIRECTORY || [],
  setWatchlist: (list) => set({ watchlist: list }),

  // Wallet & Portfolio State
  cash: 1000000,
  orders: [],
  positions: [],
  realizedPnLList: [],

  // Theme
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  // 1. ORDER EXECUTION (BUY / SELL)
  executeOrder: ({ type, symbol, qty, price, product = 'INTRADAY' }) => {
    const state = get();
    const currentPrice = Number(price) || state.selectedStock?.price || 1000;
    const orderQty = Number(qty) || 1;
    const leverage = product === 'INTRADAY' ? 5 : product === 'MTF' ? 4 : 1;
    const totalValue = currentPrice * orderQty;
    const requiredCash = totalValue / leverage;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newOrder = {
      id: Date.now().toString(),
      time,
      type,
      symbol,
      qty: orderQty,
      price: currentPrice,
      product
    };

    if (type === 'BUY') {
      if (state.cash < requiredCash) {
        alert('Insufficient cash balance to place this buy order!');
        return;
      }

      const existingPosIndex = state.positions.findIndex(
        (p) => p.symbol === symbol && p.product === product
      );

      let updatedPositions = [...state.positions];

      if (existingPosIndex >= 0) {
        const existing = updatedPositions[existingPosIndex];
        const newTotalQty = existing.qty + orderQty;
        const newAvgPrice = (existing.avgPrice * existing.qty + currentPrice * orderQty) / newTotalQty;
        updatedPositions[existingPosIndex] = {
          ...existing,
          qty: newTotalQty,
          avgPrice: newAvgPrice
        };
      } else {
        updatedPositions.unshift({
          symbol,
          product,
          qty: orderQty,
          avgPrice: currentPrice
        });
      }

      set({
        cash: state.cash - requiredCash,
        orders: [newOrder, ...state.orders],
        positions: updatedPositions
      });
    } else if (type === 'SELL') {
      const posIndex = state.positions.findIndex(
        (p) => p.symbol === symbol && p.product === product
      );

      if (posIndex >= 0) {
        const pos = state.positions[posIndex];
        const sellQty = Math.min(orderQty, pos.qty);
        const pnl = (currentPrice - pos.avgPrice) * sellQty;

        const closedRecord = {
          time,
          symbol,
          qty: sellQty,
          buyPrice: pos.avgPrice,
          sellPrice: currentPrice,
          pnl
        };

        let updatedPositions = [...state.positions];
        if (pos.qty <= sellQty) {
          updatedPositions.splice(posIndex, 1);
        } else {
          updatedPositions[posIndex] = {
            ...pos,
            qty: pos.qty - sellQty
          };
        }

        const marginRefund = (pos.avgPrice * sellQty) / leverage;

        set({
          cash: state.cash + marginRefund + pnl,
          orders: [newOrder, ...state.orders],
          positions: updatedPositions,
          realizedPnLList: [closedRecord, ...state.realizedPnLList]
        });
      } else {
        set({
          orders: [newOrder, ...state.orders]
        });
      }
    }
  },

  // 2. CLOSE / EXIT POSITION ACTION
  closePosition: (symbol, product) => {
    const state = get();
    const pos = state.positions.find((p) => p.symbol === symbol && p.product === product);
    if (!pos) return;

    const currentStock = state.watchlist.find((s) => s.symbol === symbol) || state.selectedStock;
    const currentPrice = Number(currentStock?.price || pos.avgPrice);
    const leverage = product === 'INTRADAY' ? 5 : product === 'MTF' ? 4 : 1;
    const pnl = (currentPrice - pos.avgPrice) * pos.qty;
    const marginRefund = (pos.avgPrice * pos.qty) / leverage;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const closedRecord = {
      time,
      symbol,
      qty: pos.qty,
      buyPrice: pos.avgPrice,
      sellPrice: currentPrice,
      pnl
    };

    const newOrder = {
      id: Date.now().toString(),
      time,
      type: 'EXIT',
      symbol,
      qty: pos.qty,
      price: currentPrice,
      product
    };

    set({
      cash: state.cash + marginRefund + pnl,
      positions: state.positions.filter((p) => !(p.symbol === symbol && p.product === product)),
      orders: [newOrder, ...state.orders],
      realizedPnLList: [closedRecord, ...state.realizedPnLList]
    });
  }
}));

export default useTradingStore;