import { useEffect, useRef, useState } from 'react';
import * as LightweightCharts from 'lightweight-charts';
import { X } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

function parseNum(val, fallback = 0) {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

function calculateAccurateEMA(data, period) {
  if (!data || data.length < period) return [];
  const k = 2 / (period + 1);

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let prevEMA = sum / period;

  const emaArray = [];
  emaArray.push({
    time: data[period - 1].time,
    value: parseFloat(prevEMA.toFixed(2)),
  });

  for (let i = period; i < data.length; i++) {
    const currentEMA = data[i].close * k + prevEMA * (1 - k);
    emaArray.push({
      time: data[i].time,
      value: parseFloat(currentEMA.toFixed(2)),
    });
    prevEMA = currentEMA;
  }
  return emaArray;
}

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateCandleData(stockPrice, timeframe) {
  let currentWalkPrice = stockPrice;
  const generatedReversed = [];
  const volumeData = [];
  const now = new Date();
  const totalBars = timeframe === '1M' ? 100 : timeframe === '1W' ? 150 : 200;

  for (let i = 0; i < totalBars; i++) {
    let time;
    if (timeframe === '1M') {
      time = formatDate(new Date(now.getFullYear(), now.getMonth() - i, 1));
    } else if (timeframe === '1W') {
      time = formatDate(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    } else if (timeframe === '1D') {
      time = formatDate(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
    } else {
      const sec = timeframe === '1m' ? 60 : timeframe === '5m' ? 300 : 900;
      time = Math.floor(now.getTime() / 1000) - i * sec;
    }

    const pseudoRand1 = Math.random();
    const pseudoRand2 = Math.random();
    const pseudoRand3 = Math.random();

    const stepChange = (pseudoRand1 - 0.49) * (currentWalkPrice * 0.012);
    const open = parseFloat((currentWalkPrice - stepChange).toFixed(2));
    const close = parseFloat(currentWalkPrice.toFixed(2));
    const high = parseFloat((Math.max(open, close) + pseudoRand2 * (currentWalkPrice * 0.008)).toFixed(2));
    const low = parseFloat((Math.min(open, close) - pseudoRand3 * (currentWalkPrice * 0.008)).toFixed(2));

    generatedReversed.push({ time, open, high, low, close });
    currentWalkPrice = open;
  }

  const formattedData = generatedReversed.reverse();

  formattedData.forEach((bar) => {
    volumeData.push({
      time: bar.time,
      value: Math.floor(Math.random() * 500000) + 100000,
      color: bar.close >= bar.open ? '#08998144' : '#f2364544',
    });
  });

  return { formattedData, volumeData };
}

export default function TradingChart({ activeStock, timeframe = '1D' }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const ema9SeriesRef = useRef(null);
  const ema21SeriesRef = useRef(null);
  const ema50SeriesRef = useRef(null);
  const currentCandleRef = useRef(null);
  const positionLineRef = useRef(null);

  const [showEMA9, setShowEMA9] = useState(true);
  const [showEMA21, setShowEMA21] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [pillTop, setPillTop] = useState(null);

  const store = useTradingStore();
  const { theme, updateLivePrice, positions = [], closePosition } = store;
  
  const stockSymbol = activeStock?.symbol || 'RELIANCE';
  const stockName = activeStock?.name || stockSymbol;
  const stockPrice = parseNum(activeStock?.price, 2980.68);
  const stockChange = parseNum(activeStock?.change, 1.63);
  const stockPercent = parseNum(activeStock?.changePercent, 1.63);

  // Active Position Details for this specific stock
  const currentStockPosition = positions.find((p) => p.symbol === stockSymbol && p.qty > 0);
  const positionAvgPrice = currentStockPosition?.avgPrice || 0;
  const positionQty = currentStockPosition?.qty || 0;
  const isLong = currentStockPosition?.type !== 'SELL';
  const productType = currentStockPosition?.product || 'INTRADAY';

  // Live P&L: Long (LTP - Avg) or Short (Avg - LTP)
  const positionPnL = currentStockPosition 
    ? (isLong ? (stockPrice - positionAvgPrice) : (positionAvgPrice - stockPrice)) * positionQty 
    : 0;
  const isPosPnL = positionPnL >= 0;

  const isDailyOrAbove = ['1D', '1W', '1M', '1Y'].includes(timeframe);
  const isDark = theme === 'dark' || theme === 'midnight';
  const bgColor = theme === 'midnight' ? '#000000' : isDark ? '#0B0E14' : '#ffffff';
  const textColor = isDark ? '#8E9AA8' : '#131722';
  const gridColor = theme === 'midnight' ? '#141414' : isDark ? '#1E2533' : '#f0f3fa';
  const borderColor = isDark ? '#232936' : '#e0e3eb';

  const syncPillYCoordinate = () => {
    if (!candleSeriesRef.current || !positionAvgPrice) {
      setPillTop(null);
      return;
    }
    try {
      const y = candleSeriesRef.current.priceToCoordinate(positionAvgPrice);
      if (y !== null && !isNaN(y)) {
        setPillTop(y);
      }
    } catch {
      setPillTop(null);
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartContainerRef.current.innerHTML = '';

    const width = chartContainerRef.current.clientWidth || 360;
    const height = chartContainerRef.current.clientHeight || 450;

    let chartInstance;
    try {
      chartInstance = LightweightCharts.createChart(chartContainerRef.current, {
        width,
        height,
        layout: {
          background: { color: bgColor },
          textColor: textColor,
        },
        grid: {
          vertLines: { color: gridColor },
          horzLines: { color: gridColor },
        },
        crosshair: { mode: 1 },
        rightPriceScale: {
          borderColor: borderColor,
          autoScale: true,
          scaleMargins: { top: 0.12, bottom: 0.2 },
          alignLabels: true,
        },
        timeScale: {
          borderColor: borderColor,
          timeVisible: !isDailyOrAbove,
          secondsVisible: false,
          barSpacing: timeframe === '1M' ? 14 : timeframe === '1W' ? 10 : 8,
          minBarSpacing: 2,
          rightOffset: 15,
          fixLeftEdge: false,
          fixRightEdge: false,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: { time: true, price: true },
          mouseWheel: true,
          pinch: true,
        },
      });
    } catch (e) {
      console.error("Chart creation error:", e);
      return;
    }

    const addSeriesHelper = (type, options) => {
      if (type === 'Candlestick') {
        if (typeof chartInstance.addCandlestickSeries === 'function') {
          return chartInstance.addCandlestickSeries(options);
        }
        if (LightweightCharts.CandlestickSeries && typeof chartInstance.addSeries === 'function') {
          return chartInstance.addSeries(LightweightCharts.CandlestickSeries, options);
        }
      }
      if (type === 'Histogram') {
        if (typeof chartInstance.addHistogramSeries === 'function') {
          return chartInstance.addHistogramSeries(options);
        }
        if (LightweightCharts.HistogramSeries && typeof chartInstance.addSeries === 'function') {
          return chartInstance.addSeries(LightweightCharts.HistogramSeries, options);
        }
      }
      if (type === 'Line') {
        if (typeof chartInstance.addLineSeries === 'function') {
          return chartInstance.addLineSeries(options);
        }
        if (LightweightCharts.LineSeries && typeof chartInstance.addSeries === 'function') {
          return chartInstance.addSeries(LightweightCharts.LineSeries, options);
        }
      }
      return null;
    };

    const candleSeries = addSeriesHelper('Candlestick', {
      upColor: '#089981',
      downColor: '#f23645',
      borderVisible: true,
      borderUpColor: '#089981',
      borderDownColor: '#f23645',
      wickUpColor: '#089981',
      wickDownColor: '#f23645',
      priceLineVisible: true,
      priceLineColor: '#f23645',
      priceLineWidth: 1,
      priceLineStyle: 2,
    });

    const volumeSeries = addSeriesHelper('Histogram', {
      color: '#089981',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    if (volumeSeries && typeof volumeSeries.priceScale === 'function') {
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.84, bottom: 0 },
      });
    }

    const ema9 = addSeriesHelper('Line', { color: '#2962ff', lineWidth: 1.5, title: 'EMA 9', priceLineVisible: false, lastValueVisible: false });
    const ema21 = addSeriesHelper('Line', { color: '#f5b041', lineWidth: 1.5, title: 'EMA 21', priceLineVisible: false, lastValueVisible: false });
    const ema50 = addSeriesHelper('Line', { color: '#e74c3c', lineWidth: 1.5, title: 'EMA 50', priceLineVisible: false, lastValueVisible: false });

    const { formattedData, volumeData } = generateCandleData(stockPrice, timeframe);
    const lastCandle = formattedData[formattedData.length - 1];
    currentCandleRef.current = lastCandle;

    if (candleSeries) candleSeries.setData(formattedData);
    if (volumeSeries) volumeSeries.setData(volumeData);
    if (ema9) ema9.setData(calculateAccurateEMA(formattedData, 9));
    if (ema21) ema21.setData(calculateAccurateEMA(formattedData, 21));
    if (ema50) ema50.setData(calculateAccurateEMA(formattedData, 50));

    chartInstance.subscribeCrosshairMove(() => {
      syncPillYCoordinate();
    });

    if (chartInstance.timeScale()) {
      chartInstance.timeScale().subscribeVisibleLogicalRangeChange(() => {
        syncPillYCoordinate();
      });
    }

    chartRef.current = chartInstance;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ema9SeriesRef.current = ema9;
    ema21SeriesRef.current = ema21;
    ema50SeriesRef.current = ema50;

    // Real-Time Live Ticker to update Stock Price & Live PnL across app
    const tickInterval = setInterval(() => {
      if (!currentCandleRef.current || !candleSeriesRef.current) return;
      const delta = (Math.random() - 0.48) * 0.9;
      const newClose = parseFloat((currentCandleRef.current.close + delta).toFixed(2));
      const newHigh = Math.max(currentCandleRef.current.high, newClose);
      const newLow = Math.min(currentCandleRef.current.low, newClose);

      const tickCandle = {
        ...currentCandleRef.current,
        high: newHigh,
        low: newLow,
        close: newClose,
      };
      currentCandleRef.current = tickCandle;
      candleSeriesRef.current.update(tickCandle);

      if (typeof updateLivePrice === 'function') {
        updateLivePrice(stockSymbol, newClose);
      }
      syncPillYCoordinate();
    }, 1200);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        chartRef.current.applyOptions({ width: w, height: h });
        syncPillYCoordinate();
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    setTimeout(syncPillYCoordinate, 150);

    return () => {
      clearInterval(tickInterval);
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockSymbol, timeframe, theme]);

  // Sync Chart Dynamic Price Line with Position Entry
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    if (positionLineRef.current) {
      candleSeriesRef.current.removePriceLine(positionLineRef.current);
      positionLineRef.current = null;
    }

    if (currentStockPosition && positionAvgPrice > 0) {
      const lineColor = isPosPnL ? '#089981' : '#f23645';
      positionLineRef.current = candleSeriesRef.current.createPriceLine({
        price: positionAvgPrice,
        color: lineColor,
        lineWidth: 1.5,
        lineStyle: 0,
        axisLabelVisible: true,
        title: `${isLong ? 'BUY' : 'SELL'} @ ₹${positionAvgPrice.toFixed(2)}`,
      });
      syncPillYCoordinate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStockPosition, positionAvgPrice, isLong, isPosPnL]);

  useEffect(() => {
    if (ema9SeriesRef.current) ema9SeriesRef.current.applyOptions({ visible: showEMA9 });
    if (ema21SeriesRef.current) ema21SeriesRef.current.applyOptions({ visible: showEMA21 });
    if (ema50SeriesRef.current) ema50SeriesRef.current.applyOptions({ visible: showEMA50 });
  }, [showEMA9, showEMA21, showEMA50]);

  const isPos = stockChange >= 0;

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="w-full h-full relative overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <div className="absolute top-1.5 left-2 right-2 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 font-sans text-[11px] sm:text-xs">
          <span className={`font-bold ${isDark ? 'text-white' : 'text-[#131722]'}`}>{stockName}</span>
          <span className="text-gray-400">• {timeframe}</span>
          <span className={`font-bold font-mono text-[10px] sm:text-[11px] ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
            ₹{stockPrice.toFixed(2)} ({isPos ? '+' : ''}{stockPercent.toFixed(2)}%)
          </span>
        </div>

        {/* EMA Control Pills */}
        <div className="flex items-center gap-1 pointer-events-auto text-[9px] font-mono">
          <button
            onClick={() => setShowEMA9(!showEMA9)}
            className={`px-1.5 py-0.2 rounded transition cursor-pointer font-bold ${
              showEMA9 ? 'bg-[#2962ff] text-white' : 'bg-slate-800/80 text-gray-500 line-through'
            }`}
          >
            9
          </button>
          <button
            onClick={() => setShowEMA21(!showEMA21)}
            className={`px-1.5 py-0.2 rounded transition cursor-pointer font-bold ${
              showEMA21 ? 'bg-[#f5b041] text-black' : 'bg-slate-800/80 text-gray-500 line-through'
            }`}
          >
            21
          </button>
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`px-1.5 py-0.2 rounded transition cursor-pointer font-bold ${
              showEMA50 ? 'bg-[#e74c3c] text-white' : 'bg-slate-800/80 text-gray-500 line-through'
            }`}
          >
            50
          </button>
        </div>
      </div>

      {/* ULTRA-COMPACT ON-CHART POSITION PILL */}
      {currentStockPosition && pillTop !== null && pillTop > 0 && (
        <div
          style={{
            top: `${pillTop - 11}px`,
            right: '75px',
          }}
          className={`absolute z-30 flex items-center gap-1.5 px-2 py-0.5 rounded-full shadow-lg border text-[10px] font-mono backdrop-blur-md transition-all duration-75 ${
            isPosPnL 
              ? 'bg-[#089981]/95 border-[#089981] text-white' 
              : 'bg-[#f23645]/95 border-[#f23645] text-white'
          }`}
        >
          <span className="font-bold tracking-tight">
            {isLong ? 'BUY' : 'SELL'} [{productType.slice(0, 3)}] {positionQty}
          </span>

          <span className="font-bold border-l border-white/30 pl-1">
            {isPosPnL ? '+' : ''}₹{positionPnL.toFixed(2)}
          </span>

          <button
            onClick={() => closePosition(stockSymbol, currentStockPosition.product)}
            title="Exit Position"
            className="ml-0.5 p-0.5 rounded-full bg-black/30 hover:bg-black/70 text-white transition cursor-pointer flex items-center justify-center active:scale-90"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="w-full h-full cursor-crosshair" ref={chartContainerRef} />
    </div>
  );
}