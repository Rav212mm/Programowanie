import { Activity, Globe, Users, TrendingUp } from 'lucide-react';
import type { TrendScanResult } from '../types';
import type { PriceMap } from '../services/priceService';

interface StatsBarProps {
  result: TrendScanResult | null;
  prices: PriceMap;
}

function sumMarketCap(prices: PriceMap): number {
  let total = 0;
  for (const [, p] of prices) total += p.marketCap;
  return total;
}

function formatCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(0)}B`;
  return `$${n.toLocaleString()}`;
}

export function StatsBar({ result, prices }: StatsBarProps) {
  const hasPrices = prices.size > 0;

  const btcPrice = prices.get('bitcoin');
  const totalMcap = hasPrices ? sumMarketCap(prices) : null;

  // BTC dominance: BTC mcap / total mcap of top 200
  const btcDom = totalMcap && btcPrice
    ? ((btcPrice.marketCap / totalMcap) * 100).toFixed(1)
    : null;

  const stats = [
    {
      icon: Globe,
      label: 'Kapitalizacja top 200',
      value: totalMcap ? formatCap(totalMcap) : '—',
      sub: hasPrices ? 'na żywo' : 'brak danych',
      color: '#3b82f6',
      positive: true,
    },
    {
      icon: Activity,
      label: 'Fear & Greed',
      value: '72',
      sub: 'Chciwość',
      color: '#10b981',
      positive: true,
    },
    {
      icon: Users,
      label: 'Traderzy przeskanowani',
      value: result ? '15' : '—',
      sub: result ? `${result.totalMentions} pkt wzm.` : 'Brak skanu',
      color: '#8b5cf6',
      positive: true,
    },
    {
      icon: TrendingUp,
      label: 'Dominacja BTC',
      value: btcDom ? `${btcDom}%` : '—',
      sub: btcPrice ? `BTC ${btcPrice.change24h >= 0 ? '+' : ''}${btcPrice.change24h.toFixed(2)}% 24h` : 'brak danych',
      color: '#f59e0b',
      positive: (btcPrice?.change24h ?? 0) >= 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="glass rounded-xl p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}
            >
              <Icon size={16} style={{ color: stat.color }} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-500 truncate">{stat.label}</div>
              <div className="font-bold text-white text-sm">{stat.value}</div>
              <div className="text-xs" style={{ color: stat.positive ? '#10b981' : '#ef4444' }}>{stat.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
