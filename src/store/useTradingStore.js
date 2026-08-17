import { create } from 'zustand';
import { NSE_STOCKS_DIRECTORY } from '../dhanApi';

export const useTradingStore = create((set, get) => ({
  // Stock Selection
  selectedStock: NSE_STOCKS_DIRECTORY?.[0] || {
    id: 'RELIANCE.NS',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 2980.68,
    change: 1.63
  },
  setSelectedStock: (stock) => set({ selectedStock: stock }),

  // Live Price Ticker (Chant se live LTP update karega)
  updateLivePrice: (symbol, newPrice) => {
    const state = get();
    const priceNum = Number(newPrice);
    if (!priceNum) return;

    // Update selected stock price
    if (state.selectedStock?.symbol === symbol) {
      set({
        selectedStock: { ...state.selectedStock, price: priceNum }
      });
    }

    // Update watchlist price
    const updatedWatchlist = state.watchlist.map((s) =>
      s.symbol === symbol ? { ...s, price: priceNum } : s
    );
    set({ watchlist: updatedWatchlist });
  },

  // Modal State
  isOrderModalOpen: false,
  orderModalAction: 'BUY',
  openOrderModal: (action = 'BUY') => set({ isOrderModalOpen: true, orderModalAction: action }),
  closeOrderModal: () => set({ isOrderModalOpen: false }),

  // Timeframe & Watchlist
  timeframe: '1D',
  setTimeframe: (tf) => set({ timeframe: tf }),
  watchlist: NSE_STOCKS_DIRECTORY || [],
  setWatchlist: (list) => set({ watchlist: list }),

  // Portfolio State
  cash: 1000000,
  orders: [],
  positions: [],
  realizedPnLList: [],

  // Theme
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  // 1. ORDER EXECUTION (BUY & SELL / SHORT SELLING)
  executeOrder: ({ type, symbol, qty, price, product = 'INTRADAY' }) => {
    const state = get();
    const currentPrice = Number(price) || state.selectedStock?.price || 2980;
    const orderQty = Number(qty) || 1;
    const leverage = product === 'INTRADAY' ? 5 : product === 'MTF' ? 4 : 1;
    const totalValue = currentPrice * orderQty;
    const requiredMargin = totalValue / leverage;

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

    let updatedPositions = [...state.positions];
    const existingIndex = updatedPositions.findIndex(
      (p) => p.symbol === symbol && p.product === product
    );

    if (type === 'BUY') {
      // Agar pehle se Short (SELL) position hai, toh use Buy karke cover/close karein
      if (existingIndex >= 0 && updatedPositions[existingIndex].type === 'SELL') {
        const pos = updatedPositions[existingIndex];
        const closeQty = Math.min(orderQty, pos.qty);
        const pnl = (pos.avgPrice - currentPrice) * closeQty; // Short profit logic
        const marginRefund = (pos.avgPrice * closeQty) / leverage;

        const closedRecord = { time, symbol, qty: closeQty, pnl, type: 'SHORT_COVER' };

        if (pos.qty <= closeQty) {
          updatedPositions.splice(existingIndex, 1);
        } else {
          updatedPositions[existingIndex].qty -= closeQty;
        }

        set({
          cash: state.cash + marginRefund + pnl,
          orders: [newOrder, ...state.orders],
          positions: updatedPositions,
          realizedPnLList: [closedRecord, ...state.realizedPnLList]
        });
        return;
      }

      // Normal BUY execution
      if (state.cash < requiredMargin) {
        alert('Insufficient Cash Balance!');
        return;
      }

      if (existingIndex >= 0 && updatedPositions[existingIndex].type === 'BUY') {
        const existing = updatedPositions[existingIndex];
        const newTotalQty = existing.qty + orderQty;
        const newAvg = (existing.avgPrice * existing.qty + currentPrice * orderQty) / newTotalQty;
        updatedPositions[existingIndex] = { ...existing, qty: newTotalQty, avgPrice: newAvg };
      } else {
        updatedPositions.unshift({
          symbol,
          product,
          type: 'BUY',
          qty: orderQty,
          avgPrice: currentPrice
        });
      }

      set({
        cash: Math.max(0, state.cash - requiredMargin),
        orders: [newOrder, ...state.orders],
        positions: updatedPositions
      });

    } else if (type === 'SELL') {
      // Agar pehle se BUY position hai, toh sell karke exit/square-off karein
      if (existingIndex >= 0 && updatedPositions[existingIndex].type === 'BUY') {
        const pos = updatedPositions[existingIndex];
        const closeQty = Math.min(orderQty, pos.qty);
        const pnl = (currentPrice - pos.avgPrice) * closeQty;
        const marginRefund = (pos.avgPrice * closeQty) / leverage;

        const closedRecord = { time, symbol, qty: closeQty, pnl, type: 'LONG_EXIT' };

        if (pos.qty <= closeQty) {
          updatedPositions.splice(existingIndex, 1);
        } else {
          updatedPositions[existingIndex].qty -= closeQty;
        }

        set({
          cash: state.cash + marginRefund + pnl,
          orders: [newOrder, ...state.orders],
          positions: updatedPositions,
          realizedPnLList: [closedRecord, ...state.realizedPnLList]
        });
      } else {
        // Direct INTRADAY SHORT SELLING
        if (state.cash < requiredMargin) {
          alert('Insufficient Margin to Short Sell!');
          return;
        }

        if (existingIndex >= 0 && updatedPositions[existingIndex].type === 'SELL') {
          const existing = updatedPositions[existingIndex];
          const newTotalQty = existing.qty + orderQty;
          const newAvg = (existing.avgPrice * existing.qty + currentPrice * orderQty) / newTotalQty;
          updatedPositions[existingIndex] = { ...existing, qty: newTotalQty, avgPrice: newAvg };
        } else {
          updatedPositions.unshift({
            symbol,
            product,
            type: 'SELL',
            qty: orderQty,
            avgPrice: currentPrice
          });
        }

        set({
          cash: Math.max(0, state.cash - requiredMargin),
          orders: [newOrder, ...state.orders],
          positions: updatedPositions
        });
      }
    }
  },

  // 2. ONE-CLICK EXIT POSITION
  closePosition: (symbol, product) => {
    const state = get();
    const pos = state.positions.find((p) => p.symbol === symbol && p.product === product);
    if (!pos) return;

    const currentPrice = Number(state.selectedStock?.price || pos.avgPrice);
    const leverage = product === 'INTRADAY' ? 5 : product === 'MTF' ? 4 : 1;
    const isLong = pos.type === 'BUY';
    const pnl = isLong ? (currentPrice - pos.avgPrice) * pos.qty : (pos.avgPrice - currentPrice) * pos.qty;
    const marginRefund = (pos.avgPrice * pos.qty) / leverage;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const closedRecord = {
      time,
      symbol,
      qty: pos.qty,
      pnl,
      type: isLong ? 'LONG_EXIT' : 'SHORT_COVER'
    };

    const newOrder = {
      id: Date.now().toString(),
      time,
      type: isLong ? 'SELL (EXIT)' : 'BUY (COVER)',
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