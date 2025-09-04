export const API_ENDPOINTS = {
  STOCK_QUOTE: (symbol: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`,
  CRYPTO_PRICES: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,polkadot,chainlink&vs_currencies=usd&include_24hr_change=true',
  CRYPTO_LIST: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1',
  STOCK_NEWS: 'https://jsonplaceholder.typicode.com/posts?_limit=5',
  MARKET_DATA: 'https://api.coingecko.com/api/v3/global',
};

function generateMockChartData(basePrice: number, days: number) {
  const data = [];
  let currentPrice = basePrice;
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const change = (Math.random() - 0.5) * (basePrice * 0.05); // 5% max daily change
    currentPrice = Math.max(currentPrice + change, basePrice * 0.5); // Don't go below 50% of base

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Number(currentPrice.toFixed(2)),
      fullDate: date.toISOString().split('T')[0],
    });
  }

  return data;
}

export const MOCK_DATA = {
  COMPANY_OVERVIEW: {
    'AAPL': {
      Symbol: 'AAPL',
      Name: 'Apple Inc.',
      MarketCapitalization: '3024000000000',
      EBITDA: '123456000000',
      PERatio: '28.54',
      DividendYield: '0.0044',
      '52WeekHigh': '199.62',
      '52WeekLow': '164.08',
      Beta: '1.24',
      Revenue: '394328000000',
      GrossProfitTTM: '169148000000',
    },
    'MSFT': {
      Symbol: 'MSFT',
      Name: 'Microsoft Corporation',
      MarketCapitalization: '2800000000000',
      EBITDA: '89035000000',
      PERatio: '32.17',
      DividendYield: '0.0072',
      '52WeekHigh': '384.30',
      '52WeekLow': '309.45',
      Beta: '0.90',
      Revenue: '211915000000',
      GrossProfitTTM: '146052000000',
    },
    'GOOGL': {
      Symbol: 'GOOGL',
      Name: 'Alphabet Inc.',
      MarketCapitalization: '2100000000000',
      EBITDA: '73795000000',
      PERatio: '25.84',
      DividendYield: '0.0000',
      '52WeekHigh': '191.75',
      '52WeekLow': '129.40',
      Beta: '1.06',
      Revenue: '282836000000',
      GrossProfitTTM: '157633000000',
    },
  },

  CHART_DATA: {
    'AAPL': generateMockChartData(180.50, 30),
    'MSFT': generateMockChartData(374.20, 30),
    'GOOGL': generateMockChartData(168.90, 30),
    'TSLA': generateMockChartData(248.42, 30),
  },

  CRYPTO_TABLE: [
    { currency: 'USD', rate: '1.0000', name: 'US Dollar' },
    { currency: 'EUR', rate: '0.8500', name: 'Euro' },
    { currency: 'GBP', rate: '0.7800', name: 'British Pound' },
    { currency: 'JPY', rate: '149.5000', name: 'Japanese Yen' },
    { currency: 'AUD', rate: '1.5200', name: 'Australian Dollar' },
    { currency: 'CAD', rate: '1.3500', name: 'Canadian Dollar' },
    { currency: 'CHF', rate: '0.9100', name: 'Swiss Franc' },
    { currency: 'CNY', rate: '7.2400', name: 'Chinese Yuan' },
  ],

  FINANCE_CARDS: {
    watchlist: [
      { symbol: 'AAPL', price: '180.50', change: '+2.45%', name: 'Apple Inc.' },
      { symbol: 'MSFT', price: '374.20', change: '+1.82%', name: 'Microsoft' },
      { symbol: 'GOOGL', price: '168.90', change: '-0.75%', name: 'Alphabet' },
      { symbol: 'TSLA', price: '248.42', change: '+3.21%', name: 'Tesla Inc.' },
      { symbol: 'AMZN', price: '151.94', change: '+0.95%', name: 'Amazon' },
    ],
    gainers: [
      { symbol: 'NVDA', price: '875.28', change: '+5.67%', volume: '45.2M' },
      { symbol: 'AMD', price: '184.30', change: '+4.23%', volume: '32.1M' },
      { symbol: 'TSLA', price: '248.42', change: '+3.21%', volume: '28.9M' },
      { symbol: 'META', price: '496.73', change: '+2.85%', volume: '19.7M' },
      { symbol: 'NFLX', price: '543.11', change: '+2.44%', volume: '15.3M' },
    ],
    performance: [
      { metric: 'Portfolio Value', value: '$125,430', change: '+2.34%' },
      { metric: 'Day Gain/Loss', value: '+$2,890', change: '+2.36%' },
      { metric: 'Total Return', value: '+$25,430', change: '+25.4%' },
      { metric: 'Buying Power', value: '$8,750', change: '0.00%' },
    ],
    financial: [
      { indicator: 'S&P 500', value: '4,567.89', change: '+0.45%' },
      { indicator: 'Dow Jones', value: '35,431.24', change: '+0.23%' },
      { indicator: 'NASDAQ', value: '14,283.92', change: '+0.67%' },
      { indicator: 'VIX', value: '18.45', change: '-2.34%' },
    ],
  },
};

export const transformApiData = {
  companyOverview: (data: any, symbol: string) => {
    if (!data || data.error || !data.Symbol) {
      return MOCK_DATA.COMPANY_OVERVIEW[symbol as keyof typeof MOCK_DATA.COMPANY_OVERVIEW] || MOCK_DATA.COMPANY_OVERVIEW['AAPL'];
    }
    return data;
  },

  chartData: (data: any, symbol: string) => {
    if (data && data.chart && data.chart.result && data.chart.result[0]) {
      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const prices = result.indicators.quote[0].close;

      if (timestamps && prices) {
        return timestamps.slice(-30).map((timestamp: number, index: number) => ({
          date: new Date(timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: Number(prices[prices.length - 30 + index]?.toFixed(2) || 0),
          fullDate: new Date(timestamp * 1000).toISOString().split('T')[0],
        }));
      }
    }

    return MOCK_DATA.CHART_DATA[symbol as keyof typeof MOCK_DATA.CHART_DATA] || MOCK_DATA.CHART_DATA['AAPL'];
  },

  tableData: (data: any, type: 'crypto' | 'currency' = 'crypto') => {
    if (type === 'crypto' && data && Array.isArray(data)) {
      return data.map(coin => ({
        currency: coin.symbol?.toUpperCase() || coin.name,
        rate: coin.current_price?.toFixed(6) || '0.000000',
        name: coin.name || 'Unknown',
        change: coin.price_change_percentage_24h?.toFixed(2) + '%' || '0.00%',
      }));
    }

    return MOCK_DATA.CRYPTO_TABLE;
  },

  financeCardData: (data: any, category: string) => {
    return MOCK_DATA.FINANCE_CARDS[category as keyof typeof MOCK_DATA.FINANCE_CARDS] || MOCK_DATA.FINANCE_CARDS.watchlist;
  },
};

export const enhancedFetcher = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.contents) {
      return JSON.parse(data.contents);
    }

    return data;
  } catch (error) {
    console.warn('API fetch failed, using fallback data:', error);
    throw error;
  }
};