import { useEffect, useRef, useState } from 'react';
import * as LightweightCharts from 'lightweight-charts';
import { GripVertical } from 'lucide-react';
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

export default function TradingChart({ activeStock, timeframe = '1D', onOpenOrder }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const ema9SeriesRef = useRef(null);
  const ema21SeriesRef = useRef(null);
  const ema50SeriesRef = useRef(null);
  const currentCandleRef = useRef(null);

  const [showEMA9, setShowEMA9] = useState(true);
  const [showEMA21, setShowEMA21] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);

  const [emaPos, setEmaPos] = useState({ x: 0, y: 10 });
  const isDraggingWidget = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [ohlc, setOhlc] = useState({ open: 0, high: 0, low: 0, close: 0 });

  const { theme } = useTradingStore();
  const stockSymbol = activeStock?.symbol || 'HDFCBANK';
  const stockName = activeStock?.name || stockSymbol;
  const stockPrice = parseNum(activeStock?.price, 1640);
  const stockChange = parseNum(activeStock?.change, 8.9);
  const stockPercent = parseNum(activeStock?.changePercent, 0.55);

  const isDailyOrAbove = ['1D', '1W', '1M', '1Y'].includes(timeframe);
  const isDark = theme === 'dark' || theme === 'midnight';
  const bgColor = theme === 'midnight' ? '#000000' : isDark ? '#0B0E14' : '#ffffff';
  const textColor = isDark ? '#8E9AA8' : '#131722';
  const gridColor = theme === 'midnight' ? '#141414' : isDark ? '#1E2533' : '#f0f3fa';
  const borderColor = isDark ? '#232936' : '#e0e3eb';

  const handleWidgetMouseDown = (e) => {
    isDraggingWidget.current = true;
    dragOffset.current = {
      x: e.clientX - emaPos.x,
      y: e.clientY - emaPos.y,
    };
  };

  useEffect(() => {
    const handleWidgetMouseMove = (e) => {
      if (!isDraggingWidget.current) return;
      setEmaPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const handleWidgetMouseUp = () => {
      isDraggingWidget.current = false;
    };
    window.addEventListener('mousemove', handleWidgetMouseMove);
    window.addEventListener('mouseup', handleWidgetMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWidgetMouseMove);
      window.removeEventListener('mouseup', handleWidgetMouseUp);
    };
  }, [emaPos]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartContainerRef.current.innerHTML = '';

    const width = chartContainerRef.current.clientWidth || 700;
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
          scaleMargins: { top: 0.08, bottom: 0.2 },
          alignLabels: true,
        },
        timeScale: {
          borderColor: borderColor,
          timeVisible: !isDailyOrAbove,
          secondsVisible: false,
          barSpacing: timeframe === '1M' ? 14 : timeframe === '1W' ? 10 : 8,
          minBarSpacing: 3,
          rightOffset: 20,
        },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true },
        handleScale: { axisPressedMouseMove: { time: true, price: true }, mouseWheel: true, pinch: true },
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
        scaleMargins: { top: 0.82, bottom: 0 },
      });
    }

    const ema9 = addSeriesHelper('Line', { color: '#2962ff', lineWidth: 1.5, title: 'EMA 9', priceLineVisible: false, lastValueVisible: true });
    const ema21 = addSeriesHelper('Line', { color: '#f5b041', lineWidth: 1.5, title: 'EMA 21', priceLineVisible: false, lastValueVisible: true });
    const ema50 = addSeriesHelper('Line', { color: '#e74c3c', lineWidth: 1.5, title: 'EMA 50', priceLineVisible: false, lastValueVisible: true });

    let currentWalkPrice = stockPrice;
    const generatedReversed = [];
    const volumeData = [];
    const now = new Date();
    // Warmup buffer ensures EMA50 renders completely
    const totalBars = timeframe === '1M' ? 120 : timeframe === '1W' ? 200 : 250;

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

      const stepChange = (Math.random() - 0.49) * (currentWalkPrice * 0.012);
      const open = parseFloat((currentWalkPrice - stepChange).toFixed(2));
      const close = parseFloat(currentWalkPrice.toFixed(2));
      const high = parseFloat((Math.max(open, close) + Math.random() * (currentWalkPrice * 0.008)).toFixed(2));
      const low = parseFloat((Math.min(open, close) - Math.random() * (currentWalkPrice * 0.008)).toFixed(2));

      generatedReversed.push({ time, open, high, low, close });
      currentWalkPrice = open;
    }

    const formattedData = generatedReversed.reverse();
    const lastCandle = formattedData[formattedData.length - 1];
    currentCandleRef.current = lastCandle;

    if (lastCandle) {
      requestAnimationFrame(() => {
        setOhlc(lastCandle);
      });
    }

    formattedData.forEach((bar) => {
      volumeData.push({
        time: bar.time,
        value: Math.floor(Math.random() * 600000) + 100000,
        color: bar.close >= bar.open ? '#08998144' : '#f2364544',
      });
    });

    if (candleSeries) candleSeries.setData(formattedData);
    if (volumeSeries) volumeSeries.setData(volumeData);
    if (ema9) ema9.setData(calculateAccurateEMA(formattedData, 9));
    if (ema21) ema21.setData(calculateAccurateEMA(formattedData, 21));
    if (ema50) ema50.setData(calculateAccurateEMA(formattedData, 50));

    chartInstance.subscribeCrosshairMove((param) => {
      if (param && param.time && param.seriesData && candleSeries) {
        const data = param.seriesData.get(candleSeries);
        if (data) setOhlc(data);
      } else if (currentCandleRef.current) {
        setOhlc(currentCandleRef.current);
      }
    });

    chartRef.current = chartInstance;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ema9SeriesRef.current = ema9;
    ema21SeriesRef.current = ema21;
    ema50SeriesRef.current = ema50;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        chartRef.current.applyOptions({ width: w, height: h });
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockSymbol, timeframe, theme]);

  useEffect(() => {
    if (!candleSeriesRef.current || !stockPrice || !currentCandleRef.current) return;
    const updatedCandle = {
      ...currentCandleRef.current,
      high: parseFloat(Math.max(currentCandleRef.current.high, stockPrice).toFixed(2)),
      low: parseFloat(Math.min(currentCandleRef.current.low, stockPrice).toFixed(2)),
      close: parseFloat(stockPrice.toFixed(2)),
    };
    currentCandleRef.current = updatedCandle;
    candleSeriesRef.current.update(updatedCandle);
    setOhlc(updatedCandle);
  }, [stockPrice]);

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
      {/* Floating Buy/Sell Order Pill */}
      <div className="absolute top-2 left-3 z-30 flex items-center gap-1 shadow-md font-sans">
        <button
          onClick={() => onOpenOrder && onOpenOrder('SELL')}
          className="bg-[#f23645] hover:bg-[#d82c3b] text-white px-2.5 py-1 rounded-l text-[11px] font-bold flex flex-col items-center leading-tight cursor-pointer transition-all active:scale-95 shadow"
        >
          <span>{stockPrice.toFixed(2)}</span>
          <span className="text-[8px] font-normal opacity-90">SELL</span>
        </button>

        <div
          style={{
            backgroundColor: isDark ? '#151922' : '#f0f3fa',
            borderColor: borderColor,
            color: isDark ? '#ffffff' : '#131722',
          }}
          className="px-2 py-1 text-[11px] font-bold border-y flex items-center justify-center font-mono"
        >
          0.00
        </div>

        <button
          onClick={() => onOpenOrder && onOpenOrder('BUY')}
          className="bg-[#2962ff] hover:bg-[#1e53e5] text-white px-2.5 py-1 rounded-r text-[11px] font-bold flex flex-col items-center leading-tight cursor-pointer transition-all active:scale-95 shadow"
        >
          <span>{stockPrice.toFixed(2)}</span>
          <span className="text-[8px] font-normal opacity-90">BUY</span>
        </button>
      </div>

      {/* Top Legend Bar (Proper 210px margin to completely avoid overlap) */}
      <div className="absolute top-2.5 left-52 z-20 flex items-center gap-3 font-sans text-xs pointer-events-none">
        <div className="flex items-center gap-1 font-bold">
          <span className={isDark ? 'text-white' : 'text-[#131722]'}>{stockName}</span>
          <span className="text-gray-400">• {timeframe} • NSE</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-gray-500">O<span className="text-gray-400 ml-0.5">{parseNum(ohlc.open).toFixed(2)}</span></span>
          <span className="text-gray-500">H<span className="text-gray-400 ml-0.5">{parseNum(ohlc.high).toFixed(2)}</span></span>
          <span className="text-gray-500">L<span className="text-gray-400 ml-0.5">{parseNum(ohlc.low).toFixed(2)}</span></span>
          <span className="text-gray-500">C<span className="text-gray-400 ml-0.5">{parseNum(ohlc.close).toFixed(2)}</span></span>
          <span className={`font-bold ml-1 ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
            {isPos ? '+' : ''}{stockChange.toFixed(2)} ({isPos ? '+' : ''}{stockPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* DRAGGABLE EMA WIDGET */}
      <div
        style={{
          transform: `translate(${emaPos.x}px, ${emaPos.y}px)`,
          right: '85px',
          backgroundColor: isDark ? '#151922' : '#ffffff',
          borderColor: borderColor,
        }}
        className="absolute top-2 z-30 flex items-center gap-1 border px-2 py-0.5 rounded shadow-md text-[10px] font-mono cursor-move"
      >
        <div onMouseDown={handleWidgetMouseDown} className="text-gray-400 hover:text-white cursor-grab pr-0.5">
          <GripVertical className="w-3 h-3" />
        </div>
        <button
          onClick={() => setShowEMA9(!showEMA9)}
          className={`px-1.5 py-0.5 rounded cursor-pointer font-bold transition-all ${
            showEMA9 ? 'bg-[#2962ff] text-white' : 'bg-transparent text-gray-500 line-through'
          }`}
        >
          EMA 9
        </button>
        <button
          onClick={() => setShowEMA21(!showEMA21)}
          className={`px-1.5 py-0.5 rounded cursor-pointer font-bold transition-all ${
            showEMA21 ? 'bg-[#f5b041] text-black' : 'bg-transparent text-gray-500 line-through'
          }`}
        >
          EMA 21
        </button>
        <button
          onClick={() => setShowEMA50(!showEMA50)}
          className={`px-1.5 py-0.5 rounded cursor-pointer font-bold transition-all ${
            showEMA50 ? 'bg-[#e74c3c] text-white' : 'bg-transparent text-gray-500 line-through'
          }`}
        >
          EMA 50
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-full cursor-crosshair" ref={chartContainerRef} />
    </div>
  );
}