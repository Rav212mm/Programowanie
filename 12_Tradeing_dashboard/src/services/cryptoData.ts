import type { CryptoAsset } from '../types';
import type { CryptoListEntry } from '../data/cryptoList';
import type { LivePrice, PriceMap } from './priceService';

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

export function buildCryptoAsset(entry: CryptoListEntry, live?: LivePrice): CryptoAsset {
  const price = live?.price ?? entry.basePrice;
  const change = live?.change24h ?? parseFloat(((Math.random() - 0.45) * 12).toFixed(2));
  const volume24h = live?.volume24h ?? entry.baseVolume24h;
  const marketCap = live?.marketCap ?? entry.baseMarketCap;
  const priceHistory =
    live?.sparkline && live.sparkline.length >= 4
      ? live.sparkline
      : generatePriceHistory(price, change);

  const trendScore = Math.min(100, Math.round(
    entry.baseSentiment * 0.5 + Math.abs(change) * 3 + Math.random() * 15
  ));

  return {
    id: entry.id,
    symbol: entry.symbol,
    name: entry.name,
    price,
    change24h: change,
    volume24h,
    marketCap,
    mentionCount: Math.floor(Math.random() * 80 + 5),
    sentiment: entry.baseSentiment + Math.floor((Math.random() - 0.5) * 10),
    trendScore,
    topTradersMentioned: [],
    priceHistory,
    logoColor: entry.logoColor,
    logoEmoji: entry.logoEmoji,
  };
}

export function applyPricesToAsset(asset: CryptoAsset, prices: PriceMap): CryptoAsset {
  const live = prices.get(asset.id);
  if (!live) return asset;
  return {
    ...asset,
    price: live.price,
    change24h: live.change24h,
    volume24h: live.volume24h,
    marketCap: live.marketCap,
    priceHistory: live.sparkline.length >= 4 ? live.sparkline : asset.priceHistory,
  };
}
