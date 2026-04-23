import { CRYPTO_TOP_200 } from '../data/cryptoList';

export interface LivePrice {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  sparkline: number[];
  source: string; // which API delivered this price
}

export type PriceMap = Map<string, LivePrice>;

// ─── helpers ───────────────────────────────────────────────────────────────

const STABLECOINS = new Set(['tether', 'usd-coin', 'dai', 'frax']);

function stablecoinPrice(_id: string): LivePrice {
  return { price: 1.0, change24h: 0.01, volume24h: 0, marketCap: 0, sparkline: [], source: 'stable' };
}

function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return isFinite(n) ? n : fallback;
}

// 200 coins split into 10 groups of 20 (by array index / rank order)
const GROUPS: string[][] = Array.from({ length: 10 }, (_, g) =>
  CRYPTO_TOP_200.slice(g * 20, g * 20 + 20).map(c => c.id)
);

// symbol lookup:  coingeckoId → trading symbol
const SYM = Object.fromEntries(CRYPTO_TOP_200.map(c => [c.id, c.symbol]));

// ─── source 0 : CoinGecko  (ranks 1-20, with sparkline) ──────────────────

async function fetchCoinGecko(ids: string[]): Promise<PriceMap> {
  const url =
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd` +
    `&ids=${ids.join(',')}` +
    `&sparkline=true&price_change_percentage=24h&per_page=${ids.length}&page=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

  const data: {
    id: string; current_price: number; price_change_percentage_24h: number;
    total_volume: number; market_cap: number; sparkline_in_7d?: { price: number[] };
  }[] = await res.json();

  const map: PriceMap = new Map();
  for (const c of data) {
    const full = c.sparkline_in_7d?.price ?? [];
    map.set(c.id, {
      price: safeNum(c.current_price),
      change24h: safeNum(c.price_change_percentage_24h),
      volume24h: safeNum(c.total_volume),
      marketCap: safeNum(c.market_cap),
      sparkline: full.length >= 24 ? full.slice(-24) : full,
      source: 'CoinGecko',
    });
  }
  return map;
}

// ─── source 1 : Binance  (ranks 21-40) ───────────────────────────────────

async function fetchBinance(ids: string[]): Promise<PriceMap> {
  const pairs = ids
    .filter(id => !STABLECOINS.has(id))
    .map(id => `"${SYM[id]}USDT"`);

  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=[${pairs.join(',')}]`
  );
  if (!res.ok) throw new Error(`Binance ${res.status}`);

  const data: { symbol: string; lastPrice: string; priceChangePercent: string; quoteVolume: string }[] =
    await res.json();

  // build lookup: SYMBOLUSDT → data
  const lookup = new Map(data.map(d => [d.symbol, d]));
  const map: PriceMap = new Map();

  for (const id of ids) {
    if (STABLECOINS.has(id)) { map.set(id, stablecoinPrice(id)); continue; }
    const d = lookup.get(`${SYM[id]}USDT`);
    if (!d) continue;
    map.set(id, {
      price: safeNum(d.lastPrice),
      change24h: safeNum(d.priceChangePercent),
      volume24h: safeNum(d.quoteVolume),
      marketCap: 0,
      sparkline: [],
      source: 'Binance',
    });
  }
  return map;
}

// ─── source 2 : CoinPaprika  (ranks 41-60) ───────────────────────────────
// Fetches all tickers (one bulk call), filters by symbol client-side

async function fetchCoinPaprika(ids: string[]): Promise<PriceMap> {
  const res = await fetch('https://api.coinpaprika.com/v1/tickers?quotes=USD');
  if (!res.ok) throw new Error(`CoinPaprika ${res.status}`);

  const all: { symbol: string; quotes: { USD: { price: number; percent_change_24h: number; volume_24h: number; market_cap: number } } }[] =
    await res.json();

  // build symbol → data
  const lookup = new Map(all.map(t => [t.symbol.toUpperCase(), t]));
  const map: PriceMap = new Map();

  for (const id of ids) {
    if (STABLECOINS.has(id)) { map.set(id, stablecoinPrice(id)); continue; }
    const t = lookup.get(SYM[id].toUpperCase());
    if (!t) continue;
    const q = t.quotes.USD;
    map.set(id, {
      price: safeNum(q.price),
      change24h: safeNum(q.percent_change_24h),
      volume24h: safeNum(q.volume_24h),
      marketCap: safeNum(q.market_cap),
      sparkline: [],
      source: 'CoinPaprika',
    });
  }
  return map;
}

// ─── source 3 : Bybit spot  (ranks 61-80) ────────────────────────────────
// GET /v5/market/tickers?category=spot  → all spot tickers

async function fetchBybit(ids: string[]): Promise<PriceMap> {
  const res = await fetch('https://api.bybit.com/v5/market/tickers?category=spot');
  if (!res.ok) throw new Error(`Bybit ${res.status}`);

  const json: { result: { list: { symbol: string; lastPrice: string; price24hPcnt: string; volume24h: string }[] } } =
    await res.json();

  const lookup = new Map(
    (json.result?.list ?? []).map(d => [d.symbol, d])
  );
  const map: PriceMap = new Map();

  for (const id of ids) {
    if (STABLECOINS.has(id)) { map.set(id, stablecoinPrice(id)); continue; }
    const d = lookup.get(`${SYM[id]}USDT`);
    if (!d) continue;
    map.set(id, {
      price: safeNum(d.lastPrice),
      change24h: safeNum(d.price24hPcnt) * 100,
      volume24h: safeNum(d.volume24h),
      marketCap: 0,
      sparkline: [],
      source: 'Bybit',
    });
  }
  return map;
}

// ─── source 4 : OKX  (ranks 81-100) ──────────────────────────────────────
// GET /api/v5/market/tickers?instType=SPOT

async function fetchOKX(ids: string[]): Promise<PriceMap> {
  const res = await fetch('https://www.okx.com/api/v5/market/tickers?instType=SPOT');
  if (!res.ok) throw new Error(`OKX ${res.status}`);

  const json: { data: { instId: string; last: string; sodUtc0: string; volCcy24h: string }[] } =
    await res.json();

  // OKX pair format: SYMBOL-USDT
  const lookup = new Map((json.data ?? []).map(d => [d.instId, d]));
  const map: PriceMap = new Map();

  for (const id of ids) {
    if (STABLECOINS.has(id)) { map.set(id, stablecoinPrice(id)); continue; }
    const d = lookup.get(`${SYM[id]}-USDT`);
    if (!d) continue;
    const price = safeNum(d.last);
    const open = safeNum(d.sodUtc0);
    const change24h = open > 0 ? ((price - open) / open) * 100 : 0;
    map.set(id, {
      price,
      change24h,
      volume24h: safeNum(d.volCcy24h),
      marketCap: 0,
      sparkline: [],
      source: 'OKX',
    });
  }
  return map;
}

// ─── source 5 : HTX (Huobi)  (ranks 101-120) ────────────────────────────
// GET /market/tickers  → returns all spot tickers (symbol = "btcusdt")

async function fetchHTX(ids: string[]): Promise<PriceMap> {
  const res = await fetch('https://api.huobi.pro/market/tickers');
  if (!res.ok) throw new Error(`HTX ${res.status}`);

  const json: { status: string; data: { symbol: string; close: number; open: number; vol: number }[] } =
    await res.json();

  if (json.status !== 'ok') throw new Error('HTX status not ok');

  // HTX format: symbolusdt (all lowercase)
  const lookup = new Map((json.data ?? []).map(d => [d.symbol, d]));
  const map: PriceMap = new Map();

  for (const id of ids) {
    if (STABLECOINS.has(id)) { map.set(id, stablecoinPrice(id)); continue; }
    const d = lookup.get(`${SYM[id].toLowerCase()}usdt`);
    if (!d) continue;
    const change24h = d.open > 0 ? ((d.close - d.open) / d.open) * 100 : 0;
    map.set(id, {
      price: safeNum(d.close),
      change24h,
      volume24h: safeNum(d.vol),
      marketCap: 0,
      sparkline: [],
      source: 'HTX',
    });
  }
  return map;
}

// ─── source 6 : Gate.io  (ranks 121-140) ─────────────────────────────────
// GET /api/v4/spot/tickers  → returns all

async function fetchGateIO(ids: string[]): Promise<PriceMap> {
  const res = await fetch('https://api.gateio.ws/api/v4/spot/tickers');
  if (!res.ok) throw new Error(`Gate.io ${res.status}`);

  const data: { currency_pair: string; last: string; change_percentage: string; quote_volume: string }[] =
    await res.json();

  // Gate.io format: SYMBOL_USDT
  const lookup = new Map(data.map(d => [d.currency_pair, d]));
  const map: PriceMap = new Map();

  for (const id of ids) {
    if (STABLECOINS.has(id)) { map.set(id, stablecoinPrice(id)); continue; }
    const d = lookup.get(`${SYM[id]}_USDT`);
    if (!d) continue;
    map.set(id, {
      price: safeNum(d.last),
      change24h: safeNum(d.change_percentage),
      volume24h: safeNum(d.quote_volume),
      marketCap: 0,
      sparkline: [],
      source: 'Gate.io',
    });
  }
  return map;
}

// ─── source 7 : KuCoin  (ranks 141-160) ──────────────────────────────────
// GET /api/v1/market/allTickers

async function fetchKuCoin(ids: string[]): Promise<PriceMap> {
  const res = await fetch('https://api.kucoin.com/api/v1/market/allTickers');
  if (!res.ok) throw new Error(`KuCoin ${res.status}`);

  const json: { data: { ticker: { symbol: string; last: string; changeRate: string; volValue: string }[] } } =
    await res.json();

  // KuCoin format: SYMBOL-USDT
  const lookup = new Map((json.data?.ticker ?? []).map(d => [d.symbol, d]));
  const map: PriceMap = new Map();

  for (const id of ids) {
    if (STABLECOINS.has(id)) { map.set(id, stablecoinPrice(id)); continue; }
    const d = lookup.get(`${SYM[id]}-USDT`);
    if (!d) continue;
    map.set(id, {
      price: safeNum(d.last),
      change24h: safeNum(d.changeRate) * 100,
      volume24h: safeNum(d.volValue),
      marketCap: 0,
      sparkline: [],
      source: 'KuCoin',
    });
  }
  return map;
}

// ─── source 8 : MEXC  (ranks 161-180) ────────────────────────────────────
// GET /api/v3/ticker/24hr  → all tickers when no symbol param

async function fetchMEXC(ids: string[]): Promise<PriceMap> {
  const res = await fetch('https://api.mexc.com/api/v3/ticker/24hr');
  if (!res.ok) throw new Error(`MEXC ${res.status}`);

  const data: { symbol: string; lastPrice: string; priceChangePercent: string; quoteVolume: string }[] =
    await res.json();

  const lookup = new Map(data.map(d => [d.symbol, d]));
  const map: PriceMap = new Map();

  for (const id of ids) {
    if (STABLECOINS.has(id)) { map.set(id, stablecoinPrice(id)); continue; }
    const d = lookup.get(`${SYM[id]}USDT`);
    if (!d) continue;
    map.set(id, {
      price: safeNum(d.lastPrice),
      change24h: safeNum(d.priceChangePercent),
      volume24h: safeNum(d.quoteVolume),
      marketCap: 0,
      sparkline: [],
      source: 'MEXC',
    });
  }
  return map;
}

// ─── source 9 : Bitfinex  (ranks 181-200) ────────────────────────────────
// GET /v2/tickers?symbols=tBTCUSD,...

async function fetchBitfinex(ids: string[]): Promise<PriceMap> {
  const pairs = ids
    .filter(id => !STABLECOINS.has(id))
    .map(id => `t${SYM[id]}USD`)
    .join(',');

  const res = await fetch(`https://api-pub.bitfinex.com/v2/tickers?symbols=${pairs}`);
  if (!res.ok) throw new Error(`Bitfinex ${res.status}`);

  // Response: [[symbol, bid, bidSize, ask, askSize, dailyChange, dailyChangePct, lastPrice, volume, high, low], ...]
  const data: [string, number, number, number, number, number, number, number, number, number, number][] =
    await res.json();

  // build lookup: tSYMBOLUSD → row
  const lookup = new Map(data.map(row => [row[0], row]));
  const map: PriceMap = new Map();

  for (const id of ids) {
    if (STABLECOINS.has(id)) { map.set(id, stablecoinPrice(id)); continue; }
    const row = lookup.get(`t${SYM[id]}USD`);
    if (!row) continue;
    map.set(id, {
      price: safeNum(row[7]),
      change24h: safeNum(row[6]) * 100,
      volume24h: safeNum(row[8]),
      marketCap: 0,
      sparkline: [],
      source: 'Bitfinex',
    });
  }
  return map;
}

// ─── dispatcher ───────────────────────────────────────────────────────────

const FETCHERS = [
  fetchCoinGecko,    // group 0 – ranks   1-20  (sparkline included)
  fetchBinance,      // group 1 – ranks  21-40
  fetchCoinPaprika,  // group 2 – ranks  41-60
  fetchBybit,        // group 3 – ranks  61-80
  fetchOKX,          // group 4 – ranks  81-100
  fetchHTX,          // group 5 – ranks 101-120
  fetchGateIO,       // group 6 – ranks 121-140
  fetchKuCoin,       // group 7 – ranks 141-160
  fetchMEXC,         // group 8 – ranks 161-180
  fetchBitfinex,     // group 9 – ranks 181-200
] as const;

export interface FetchReport {
  source: string;
  status: 'ok' | 'error';
  count: number;
  error?: string;
}

export interface PriceFetchResult {
  prices: PriceMap;
  reports: FetchReport[];
}

const SOURCE_NAMES = [
  'CoinGecko', 'Binance', 'CoinPaprika', 'Bybit', 'OKX',
  'HTX', 'Gate.io', 'KuCoin', 'MEXC', 'Bitfinex',
];

export async function fetchAllPrices(
  _ids: string[], // kept for API compatibility; we use GROUPS internally
  prevPrices: PriceMap = new Map()
): Promise<PriceFetchResult> {
  const settled = await Promise.allSettled(
    FETCHERS.map((fn, g) => fn(GROUPS[g]))
  );

  const prices: PriceMap = new Map(prevPrices); // start from previous
  const reports: FetchReport[] = [];

  for (let g = 0; g < settled.length; g++) {
    const result = settled[g];
    const name = SOURCE_NAMES[g];

    if (result.status === 'fulfilled') {
      let count = 0;
      for (const [id, lp] of result.value) {
        // Preserve sparkline from CoinGecko if this source has none
        const existing = prices.get(id);
        prices.set(id, {
          ...lp,
          sparkline: lp.sparkline.length > 0 ? lp.sparkline : (existing?.sparkline ?? []),
          marketCap: lp.marketCap > 0 ? lp.marketCap : (existing?.marketCap ?? 0),
        });
        count++;
      }
      reports.push({ source: name, status: 'ok', count });
    } else {
      reports.push({
        source: name,
        status: 'error',
        count: 0,
        error: (result.reason as Error)?.message ?? 'unknown',
      });
    }
  }

  return { prices, reports };
}
