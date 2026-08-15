// Permanent Live NSE Stock Directory & Market Feed Service

export const NSE_STOCKS_DIRECTORY = [
  { id: 'HDFCBANK.NS', symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1640.50, change: 0.85 },
  { id: 'RELIANCE.NS', symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2980.00, change: 1.20 },
  { id: 'INFY.NS', symbol: 'INFY', name: 'Infosys Ltd.', price: 1820.75, change: -0.45 },
  { id: 'TCS.NS', symbol: 'TCS', name: 'Tata Consultancy Services', price: 4210.00, change: 0.30 },
  { id: 'ICICIBANK.NS', symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1195.40, change: 1.10 },
  { id: 'AWFIS.NS', symbol: 'AWFIS', name: 'Awfis Space Solutions Ltd.', price: 785.60, change: 2.40 },
  { id: 'ZAGGLE.NS', symbol: 'ZAGGLE', name: 'Zaggle Prepaid Ocean Services', price: 442.10, change: 3.15 },
  { id: 'TATAMOTORS.NS', symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 1015.30, change: -0.80 },
  { id: 'SBIN.NS', symbol: 'SBIN', name: 'State Bank of India', price: 830.25, change: 0.65 },
  { id: 'BHARTIARTL.NS', symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1540.00, change: 1.45 },
  { id: 'ITC.NS', symbol: 'ITC', name: 'ITC Ltd.', price: 495.20, change: 0.10 },
  { id: 'MARUTI.NS', symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', price: 12450.00, change: -0.25 }
];

// Fetch Real-time Live Price (Permanent No-Token Endpoint)
export async function fetchLiveMarketData(tickerId) {
  if (!tickerId) return null;
  const symbol = tickerId.includes('.NS') ? tickerId : `${tickerId}.NS`;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) return null;

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (meta && meta.regularMarketPrice) {
      const regularPrice = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose || meta.previousClose || regularPrice;
      const changePercent = prevClose ? Number((((regularPrice - prevClose) / prevClose) * 100).toFixed(2)) : 0;

      return {
        price: regularPrice,
        change: changePercent
      };
    }
    return null;
  } catch (error) {
    console.error('Live feed fetch error:', error);
    return null;
  }
}