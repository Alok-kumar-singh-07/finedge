import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTradingStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' | 'dark' | 'midnight'
      walletBalance: 1000000.0,
      usedMargin: 0.0,
      selectedStock: {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd.',
        price: 2980.50,
        change: 35.40,
        changePercent: 1.20,
        exchange: 'NSE',
      },
      holdings: [],
      orders: [],
      closedTrades: [],

      setTheme: (theme) => set({ theme }),
      setSelectedStock: (stock) => set({ selectedStock: stock }),

      // BUY EXECUTION
      buyStock: (symbol, name, quantity, price, productType = 'Trading') => {
        const { walletBalance, usedMargin, holdings, orders, closedTrades } = get();
        const leverage = productType === 'Trading' ? 0.20 : productType === 'MTF' ? 0.25 : 1.0;
        const requiredMargin = quantity * price * leverage;

        const existingIndex = holdings.findIndex(
          (h) => h.symbol === symbol && (h.productType || 'Trading') === productType
        );
        let updatedHoldings = [...holdings];

        // Short Position Cover/Exit
        if (existingIndex > -1 && updatedHoldings[existingIndex].quantity < 0) {
          const current = updatedHoldings[existingIndex];
          const shortQty = Math.abs(current.quantity);
          const closeQty = Math.min(quantity, shortQty);

          const realizedPnl = (current.avgPrice - price) * closeQty;
          const blockedMargin = closeQty * current.avgPrice * leverage;
          const returnPercent = ((current.avgPrice - price) / current.avgPrice) * 100;

          const remainingQty = current.quantity + closeQty;
          if (remainingQty === 0) {
            updatedHoldings.splice(existingIndex, 1);
          } else {
            updatedHoldings[existingIndex] = { ...current, quantity: remainingQty };
          }

          const newWalletBalance = parseFloat((walletBalance + blockedMargin + realizedPnl).toFixed(2));
          const newUsedMargin = Math.max(0, parseFloat((usedMargin - blockedMargin).toFixed(2)));

          const tradeRecord = {
            id: Date.now(),
            symbol,
            type: 'SHORT',
            productType,
            quantity: closeQty,
            entryPrice: current.avgPrice,
            exitPrice: price,
            realizedPnl: parseFloat(realizedPnl.toFixed(2)),
            returnPercent: parseFloat(returnPercent.toFixed(2)),
            entryTime: current.openedAt || new Date().toLocaleTimeString(),
            exitTime: new Date().toLocaleTimeString(),
          };

          set({
            walletBalance: newWalletBalance,
            usedMargin: newUsedMargin,
            holdings: updatedHoldings,
            closedTrades: [tradeRecord, ...closedTrades],
            orders: [
              {
                id: Date.now(),
                symbol,
                type: 'BUY (COVER)',
                productType,
                quantity: closeQty,
                price,
                time: new Date().toLocaleTimeString(),
                status: 'EXECUTED',
              },
              ...orders,
            ],
          });
          return true;
        }

        // Fresh Long Buy
        if (walletBalance < requiredMargin) {
          alert('Insufficient funds to place this order!');
          return false;
        }

        if (existingIndex > -1) {
          const current = updatedHoldings[existingIndex];
          const newQty = current.quantity + quantity;
          const newAvg = (current.quantity * current.avgPrice + quantity * price) / newQty;
          updatedHoldings[existingIndex] = {
            ...current,
            quantity: newQty,
            avgPrice: newAvg,
          };
        } else {
          updatedHoldings.push({
            symbol,
            name: name || symbol,
            quantity,
            avgPrice: price,
            productType,
            openedAt: new Date().toLocaleTimeString(),
          });
        }

        const newWalletBalance = parseFloat((walletBalance - requiredMargin).toFixed(2));
        const newUsedMargin = parseFloat((usedMargin + requiredMargin).toFixed(2));

        set({
          walletBalance: newWalletBalance,
          usedMargin: newUsedMargin,
          holdings: updatedHoldings,
          orders: [
            {
              id: Date.now(),
              symbol,
              type: 'BUY',
              productType,
              quantity,
              price,
              time: new Date().toLocaleTimeString(),
              status: 'EXECUTED',
            },
            ...orders,
          ],
        });
        return true;
      },

      // SELL EXECUTION
      sellStock: (symbol, name, quantity, price, productType = 'Trading') => {
        const { walletBalance, usedMargin, holdings, orders, closedTrades } = get();
        const leverage = productType === 'Trading' ? 0.20 : productType === 'MTF' ? 0.25 : 1.0;
        const requiredMargin = quantity * price * leverage;

        const existingIndex = holdings.findIndex(
          (h) => h.symbol === symbol && (h.productType || 'Trading') === productType
        );
        let updatedHoldings = [...holdings];

        // Long Exit
        if (existingIndex > -1 && updatedHoldings[existingIndex].quantity > 0) {
          const current = updatedHoldings[existingIndex];
          const closeQty = Math.min(quantity, current.quantity);

          const realizedPnl = (price - current.avgPrice) * closeQty;
          const blockedMargin = closeQty * current.avgPrice * leverage;
          const returnPercent = ((price - current.avgPrice) / current.avgPrice) * 100;

          const remainingQty = current.quantity - closeQty;
          if (remainingQty === 0) {
            updatedHoldings.splice(existingIndex, 1);
          } else {
            updatedHoldings[existingIndex] = { ...current, quantity: remainingQty };
          }

          const newWalletBalance = parseFloat((walletBalance + blockedMargin + realizedPnl).toFixed(2));
          const newUsedMargin = Math.max(0, parseFloat((usedMargin - blockedMargin).toFixed(2)));

          const tradeRecord = {
            id: Date.now(),
            symbol,
            type: 'LONG',
            productType,
            quantity: closeQty,
            entryPrice: current.avgPrice,
            exitPrice: price,
            realizedPnl: parseFloat(realizedPnl.toFixed(2)),
            returnPercent: parseFloat(returnPercent.toFixed(2)),
            entryTime: current.openedAt || new Date().toLocaleTimeString(),
            exitTime: new Date().toLocaleTimeString(),
          };

          set({
            walletBalance: newWalletBalance,
            usedMargin: newUsedMargin,
            holdings: updatedHoldings,
            closedTrades: [tradeRecord, ...closedTrades],
            orders: [
              {
                id: Date.now(),
                symbol,
                type: 'SELL (EXIT)',
                productType,
                quantity: closeQty,
                price,
                time: new Date().toLocaleTimeString(),
                status: 'EXECUTED',
              },
              ...orders,
            ],
          });
          return true;
        }

        if (productType === 'Investing') {
          alert('Delivery Sell Error: You do not have delivery shares to sell!');
          return false;
        }

        // Fresh Short
        if (walletBalance < requiredMargin) {
          alert('Insufficient margin for Intraday Short Selling!');
          return false;
        }

        updatedHoldings.push({
          symbol,
          name: name || symbol,
          quantity: -quantity,
          avgPrice: price,
          productType,
          openedAt: new Date().toLocaleTimeString(),
        });

        const newWalletBalance = parseFloat((walletBalance - requiredMargin).toFixed(2));
        const newUsedMargin = parseFloat((usedMargin + requiredMargin).toFixed(2));

        set({
          walletBalance: newWalletBalance,
          usedMargin: newUsedMargin,
          holdings: updatedHoldings,
          orders: [
            {
              id: Date.now(),
              symbol,
              type: 'SELL (SHORT)',
              productType,
              quantity,
              price,
              time: new Date().toLocaleTimeString(),
              status: 'EXECUTED',
            },
            ...orders,
          ],
        });
        return true;
      },

      squareOffPosition: (symbol, productType, currentLtp) => {
        const { holdings, sellStock, buyStock } = get();
        const position = holdings.find(
          (h) => h.symbol === symbol && (h.productType || 'Trading') === productType
        );
        if (!position) return;

        const absQty = Math.abs(position.quantity);
        if (position.quantity > 0) {
          sellStock(position.symbol, position.name, absQty, currentLtp, position.productType || 'Trading');
        } else {
          buyStock(position.symbol, position.name, absQty, currentLtp, position.productType || 'Trading');
        }
      },

      resetWallet: () => {
        set({
          walletBalance: 1000000.0,
          usedMargin: 0.0,
          holdings: [],
          orders: [],
          closedTrades: [],
        });
      },
    }),
    {
      name: 'finedge-trading-storage',
    }
  )
);