import { TrendingUp, TrendingDown, Users, Star, Zap } from 'lucide-react';
import type { CryptoAsset } from '../types';
import { MiniChart } from './MiniChart';

interface CryptoCardProps {
  asset: CryptoAsset;
  rank: number;
  delay: number;
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`;
  return `$${vol.toLocaleString()}`;
}

function SentimentBar({ value }: { value: number }) {
  const color = value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 8px ${color}66`,
        }}
      />
    </div>
  );
}

export function CryptoCard({ asset, rank, delay }: CryptoCardProps) {
  const isPositive = asset.change24h >= 0;
  const rankColors = ['#f59e0b', '#94a3b8', '#cd7c2f', '#3b82f6', '#8b5cf6'];
  const rankColor = rankColors[rank - 1] || '#3b82f6';
  const chartColor = isPositive ? '#10b981' : '#ef4444';

  const sentimentLabel = asset.sentiment >= 75 ? 'Bardzo Bycze' : asset.sentiment >= 55 ? 'Bycze' : asset.sentiment >= 45 ? 'Neutralne' : 'Niedźwiedzie';

  return (
    <div
      className="glass rounded-2xl p-5 flex flex-col gap-4 opacity-0 animate-card-pop relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
        border: `1px solid ${rankColor}28`,
        boxShadow: `0 0 20px ${rankColor}15, 0 4px 24px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${rankColor}12 0%, transparent 70%)` }}
      />

      {/* Rank badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <Star size={10} style={{ color: rankColor, fill: rankColor }} />
        <span className="text-xs font-bold" style={{ color: rankColor }}>#{rank}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0"
          style={{
            background: `radial-gradient(circle, ${asset.logoColor}33, ${asset.logoColor}11)`,
            border: `1px solid ${asset.logoColor}44`,
            color: asset.logoColor,
            textShadow: `0 0 10px ${asset.logoColor}`,
          }}
        >
          {asset.logoEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-lg leading-none">{asset.symbol}</div>
          <div className="text-xs mt-1" style={{ color: '#64748b' }}>{asset.name}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-white text-base">{formatPrice(asset.price)}</div>
          <div className={`flex items-center gap-1 justify-end text-sm font-semibold mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <MiniChart data={asset.priceHistory} color={chartColor} height={55} />
      </div>

      {/* Trend Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-yellow-400" />
          <span className="text-xs text-slate-400">Trend Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${asset.trendScore}%`,
                background: `linear-gradient(90deg, ${rankColor}88, ${rankColor})`,
                boxShadow: `0 0 6px ${rankColor}66`,
              }}
            />
          </div>
          <span className="text-sm font-bold" style={{ color: rankColor }}>{asset.trendScore}</span>
        </div>
      </div>

      {/* Sentiment */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400">Sentyment rynku</span>
          <span className="text-xs font-semibold" style={{ color: asset.sentiment >= 70 ? '#10b981' : asset.sentiment >= 50 ? '#f59e0b' : '#ef4444' }}>
            {sentimentLabel} {asset.sentiment}%
          </span>
        </div>
        <SentimentBar value={asset.sentiment} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="text-xs text-slate-500 mb-1">Wolumen 24h</div>
          <div className="text-sm font-semibold text-white">{formatVolume(asset.volume24h)}</div>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="text-xs text-slate-500 mb-1">Wzmianki</div>
          <div className="text-sm font-semibold text-white">{asset.mentionCount} pkt</div>
        </div>
      </div>

      {/* Traders */}
      {asset.topTradersMentioned.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Users size={12} className="text-slate-500" />
            <span className="text-xs text-slate-500">Top traderzy</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {asset.topTradersMentioned.slice(0, 4).map((trader) => (
              <span
                key={trader}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: `${rankColor}15`,
                  color: rankColor,
                  border: `1px solid ${rankColor}30`,
                }}
              >
                {trader}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
