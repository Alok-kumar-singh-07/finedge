import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DrawingToolbar from './components/DrawingToolbar';
import TradingChart from './components/TradingChart';
import RightSidebar from './components/RightSidebar';
import BottomPanel from './components/BottomPanel';
import OrderModal from './components/OrderModal';
import { useMarketData } from './hooks/useMarketData';
import { useTradingStore } from './store/useTradingStore';
import { LayoutDashboard, BarChart3, ListOrdered } from 'lucide-react';

export default function App() {
  const { stocks, addStockToWatchlist, removeStockFromWatchlist } = useMarketData();
  const { selectedStock, theme, checkAutoTriggers } = useTradingStore();

  const [timeframe, setTimeframe] = useState('1D');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('BUY');
  
  // Mobile View Switcher
  const [mobileTab, setMobileTab] = useState('chart'); 

  const activeStock = (stocks && stocks.find((s) => s?.symbol === selectedStock?.symbol)) || selectedStock;
  const isDark = theme === 'dark' || theme === 'midnight';

  useEffect(() => {
    if (stocks && stocks.length > 0) checkAutoTriggers(stocks);
  }, [stocks, checkAutoTriggers]);

  const handleOpenOrder = (action) => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  return (
    <div
      style={{
        backgroundColor: theme === 'midnight' ? '#000000' : theme === 'dark' ? '#0B0E14' : '#ffffff',
        color: isDark ? '#ffffff' : '#131722',
      }}
      className="h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors"
    >
      <Navbar
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        onOpenOrder={handleOpenOrder}
        onAddStock={addStockToWatchlist}
        watchlistStocks={stocks}
      />

      {/* Main Content Area: Responsive Layout */}
      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* Sidebar Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex">
          <DrawingToolbar />
        </div>

        {/* Center Panel */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Mobile view logic */}
          <div className={`flex-1 relative ${mobileTab === 'chart' ? 'flex' : 'hidden'} md:flex`}>
            <TradingChart activeStock={activeStock} timeframe={timeframe} onOpenOrder={handleOpenOrder} />
          </div>

          {/* Right Sidebar visible on mobile if mobileTab is 'sidebar' */}
          <div className={`flex-1 ${mobileTab === 'sidebar' ? 'flex' : 'hidden'} md:hidden`}>
             <RightSidebar stocks={stocks} onRemoveStock={removeStockFromWatchlist} />
          </div>

          {/* Bottom Panel visible on mobile if mobileTab is 'orders' */}
          <div className={`flex-1 ${mobileTab === 'orders' ? 'flex' : 'hidden'} md:hidden`}>
             <BottomPanel stocks={stocks} />
          </div>

          {/* Desktop Bottom Panel always visible */}
          <div className="hidden md:flex h-44 border-t">
            <BottomPanel stocks={stocks} />
          </div>
        </div>

        {/* Desktop Sidebar always visible */}
        <div className="hidden md:flex">
          <RightSidebar stocks={stocks} onRemoveStock={removeStockFromWatchlist} />
        </div>
      </div>

      {/* Mobile Tab Switcher Navigation */}
      <div className="md:hidden flex justify-around p-2 border-t bg-[#151922] text-white">
        <button onClick={() => setMobileTab('chart')} className="flex flex-col items-center">
            <BarChart3 className="w-5 h-5"/> <span className="text-[9px]">Chart</span>
        </button>
        <button onClick={() => setMobileTab('sidebar')} className="flex flex-col items-center">
            <LayoutDashboard className="w-5 h-5"/> <span className="text-[9px]">Watchlist</span>
        </button>
        <button onClick={() => setMobileTab('orders')} className="flex flex-col items-center">
            <ListOrdered className="w-5 h-5"/> <span className="text-[9px]">Orders</span>
        </button>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={modalAction}
        stock={activeStock}
      />
    </div>
  );
}