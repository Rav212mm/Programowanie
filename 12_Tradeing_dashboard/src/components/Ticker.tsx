import { TrendingUp, TrendingDown } from 'lucide-react';
import { CRYPTO_TOP_200 } from '../data/cryptoList';
import type { PriceMap } from '../services/priceService';

const TICKER_IDS = [
  'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple',
  'cardano', 'avalanche', 'chainlink', 'polkadot', 'sui',
  'near', 'injective',
];

function formatTickerPrice(price: number): string {
  if (price >= 10000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 1)     return `$${price.toFixed(2)}`;
  if (price >= 0.01)  return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

interface TickerProps {
  prices: PriceMap;
}

export function Ticker({ prices }: TickerProps) {
  const items = TICKER_IDS.map(id => {
    const entry = CRYPTO_TOP_200.find(c => c.id === id)!;
    const live = prices.get(id);
    const price = live?.price ?? entry.basePrice;
    const change = live?.change24h ?? 0;
    return { symbol: entry.symbol, price, change };
  });

  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden py-2" style={{ borderBottom: '1px solid rgba(59,130,246,0.1)', background: 'rgba(0,0,0,0.3)' }}>
      <div className="flex gap-8 animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-300">{item.symbol}</span>
            <span className="text-xs text-slate-400">{formatTickerPrice(item.price)}</span>
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
            <span className="text-slate-700">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
