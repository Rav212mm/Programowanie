export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  mentionCount: number;
  sentiment: number; // 0-100
  trendScore: number;
  topTradersMentioned: string[];
  priceHistory: number[];
  logoColor: string;
  logoEmoji: string;
}

export interface TwitterTrader {
  handle: string;
  name: string;
  followers: number;
  mentioned: string[];
}

export interface TrendScanResult {
  topCryptos: CryptoAsset[];
  traders: TwitterTrader[];
  scanTime: Date;
  totalMentions: number;
}

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface TradingSignal {
  assetId: string;
  type: SignalType;
  strength: number; // 0-100
  reason: string;
}
