import type { CryptoAsset, TwitterTrader, TrendScanResult } from '../types';

const TOP_CRYPTO_TRADERS: TwitterTrader[] = [
  { handle: '@PlanB', name: 'PlanB', followers: 1800000, mentioned: [] },
  { handle: '@CryptoCred', name: 'CryptoCred', followers: 420000, mentioned: [] },
  { handle: '@AltcoinSherpa', name: 'Altcoin Sherpa', followers: 380000, mentioned: [] },
  { handle: '@Pentoshi', name: 'Pentoshi', followers: 560000, mentioned: [] },
  { handle: '@WClementeIII', name: 'Will Clemente', followers: 320000, mentioned: [] },
  { handle: '@RaoulGMI', name: 'Raoul Pal', followers: 1100000, mentioned: [] },
  { handle: '@CryptoKaleo', name: 'Kaleo', followers: 650000, mentioned: [] },
  { handle: '@inversebrah', name: 'Inversebrah', followers: 290000, mentioned: [] },
  { handle: '@CryptoBull2019', name: 'CryptoBull', followers: 210000, mentioned: [] },
  { handle: '@DonAlt', name: 'DonAlt', followers: 440000, mentioned: [] },
  { handle: '@TheCryptoLark', name: 'Lark Davis', followers: 430000, mentioned: [] },
  { handle: '@crypto_birb', name: 'Birb', followers: 175000, mentioned: [] },
  { handle: '@IamNomad', name: 'Nomad', followers: 280000, mentioned: [] },
  { handle: '@CredibleCrypto', name: 'CredibleCrypto', followers: 360000, mentioned: [] },
  { handle: '@CryptoWendyO', name: 'Crypto Wendy O', followers: 245000, mentioned: [] },
];

const CRYPTO_POOL: Omit<CryptoAsset, 'mentionCount' | 'trendScore' | 'topTradersMentioned' | 'priceHistory'>[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67420, change24h: 2.34, volume24h: 28500000000, marketCap: 1320000000000, sentiment: 78, logoColor: '#f7931a', logoEmoji: '₿' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3540, change24h: 3.12, volume24h: 14200000000, marketCap: 425000000000, sentiment: 72, logoColor: '#627eea', logoEmoji: 'Ξ' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 178.4, change24h: 5.67, volume24h: 3800000000, marketCap: 82000000000, sentiment: 85, logoColor: '#9945ff', logoEmoji: '◎' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 612, change24h: 1.23, volume24h: 2100000000, marketCap: 91000000000, sentiment: 65, logoColor: '#f3ba2f', logoEmoji: 'B' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.628, change24h: -1.45, volume24h: 1900000000, marketCap: 34000000000, sentiment: 58, logoColor: '#346aa9', logoEmoji: 'X' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.485, change24h: 4.21, volume24h: 820000000, marketCap: 17200000000, sentiment: 69, logoColor: '#0033ad', logoEmoji: 'A' },
  { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', price: 38.7, change24h: 6.89, volume24h: 1200000000, marketCap: 15900000000, sentiment: 80, logoColor: '#e84142', logoEmoji: '▲' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 16.8, change24h: 3.44, volume24h: 780000000, marketCap: 10100000000, sentiment: 74, logoColor: '#2a5ada', logoEmoji: '⬡' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 7.92, change24h: 2.18, volume24h: 520000000, marketCap: 10800000000, sentiment: 62, logoColor: '#e6007a', logoEmoji: '●' },
  { id: 'sui', symbol: 'SUI', name: 'Sui', price: 1.84, change24h: 8.92, volume24h: 1450000000, marketCap: 5200000000, sentiment: 88, logoColor: '#4da2ff', logoEmoji: 'S' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol', price: 6.34, change24h: 7.23, volume24h: 620000000, marketCap: 7400000000, sentiment: 76, logoColor: '#00c08b', logoEmoji: 'N' },
  { id: 'injective', symbol: 'INJ', name: 'Injective', price: 28.4, change24h: 9.12, volume24h: 890000000, marketCap: 2800000000, sentiment: 83, logoColor: '#00a3ff', logoEmoji: 'I' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', price: 0.94, change24h: 4.56, volume24h: 510000000, marketCap: 3900000000, sentiment: 71, logoColor: '#28a0f0', logoEmoji: 'Ⓐ' },
];

function generatePriceHistory(basePrice: number, change: number): number[] {
  const points = 24;
  const history: number[] = [];
  let price = basePrice * (1 - change / 100);
  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.48) * basePrice * 0.012;
    price += noise + (change / 100 / points) * basePrice;
    history.push(Math.max(price, basePrice * 0.85));
  }
  return history;
}

function assignMentions(traders: TwitterTrader[], cryptos: typeof CRYPTO_POOL): Map<string, { count: number; traders: string[] }> {
  const mentionMap = new Map<string, { count: number; traders: string[] }>();
  cryptos.forEach(c => mentionMap.set(c.id, { count: 0, traders: [] }));

  const weightedCryptos = ['bitcoin', 'ethereum', 'solana', 'sui', 'injective', 'avalanche', 'near', 'chainlink'];

  traders.forEach(trader => {
    const numMentions = Math.floor(Math.random() * 4) + 1;
    const pool = [...cryptos].sort(() => {
      const aWeight = weightedCryptos.includes(cryptos[0].id) ? 0.7 : 0.3;
      return Math.random() - aWeight;
    });
    const picks = pool.slice(0, numMentions);
    picks.forEach(crypto => {
      const entry = mentionMap.get(crypto.id)!;
      const weight = Math.ceil(trader.followers / 200000);
      entry.count += weight;
      entry.traders.push(trader.handle);
    });
  });

  return mentionMap;
}

export async function scanTwitterTrends(): Promise<TrendScanResult> {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 2800));

  const traders = TOP_CRYPTO_TRADERS.map(t => ({ ...t }));
  const mentionMap = assignMentions(traders, CRYPTO_POOL);

  const scored = CRYPTO_POOL.map(crypto => {
    const mentions = mentionMap.get(crypto.id)!;
    const trendScore = Math.min(100, Math.round(
      (mentions.count * 0.4) +
      (crypto.sentiment * 0.35) +
      (Math.abs(crypto.change24h) * 2.5)
    ));

    return {
      ...crypto,
      mentionCount: mentions.count,
      trendScore,
      topTradersMentioned: [...new Set(mentions.traders)].slice(0, 5),
      priceHistory: generatePriceHistory(crypto.price, crypto.change24h),
    } as CryptoAsset;
  });

  scored.sort((a, b) => b.trendScore - a.trendScore);
  const top5 = scored.slice(0, 5);

  const totalMentions = Array.from(mentionMap.values()).reduce((sum, v) => sum + v.count, 0);

  return {
    topCryptos: top5,
    traders,
    scanTime: new Date(),
    totalMentions,
  };
}
