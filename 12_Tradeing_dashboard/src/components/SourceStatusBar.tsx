import { X, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { FetchReport } from '../services/priceService';

const SOURCE_ICONS: Record<string, string> = {
  'CoinGecko':   '🦎',
  'Binance':     '🟡',
  'CoinPaprika': '🌶️',
  'Bybit':       '🔵',
  'OKX':         '⬛',
  'HTX':         '🔶',
  'Gate.io':     '🚪',
  'KuCoin':      '🐨',
  'MEXC':        '⚡',
  'Bitfinex':    '🦊',
};

const RANK_RANGES: Record<string, string> = {
  'CoinGecko':   '1–20',
  'Binance':     '21–40',
  'CoinPaprika': '41–60',
  'Bybit':       '61–80',
  'OKX':         '81–100',
  'HTX':         '101–120',
  'Gate.io':     '121–140',
  'KuCoin':      '141–160',
  'MEXC':        '161–180',
  'Bitfinex':    '181–200',
};

interface Props {
  reports: FetchReport[];
  lastUpdate: Date | null;
  onClose: () => void;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function SourceStatusBar({ reports, lastUpdate, onClose }: Props) {
  const okCount = reports.filter(r => r.status === 'ok').length;
  const total = reports.length;

  return (
    <div
      className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 animate-rise-in"
    >
      <div
        className="glass rounded-xl p-4"
        style={{ border: '1px solid rgba(59,130,246,0.15)' }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Źródła danych cenowych</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: okCount === total ? 'rgba(16,185,129,0.15)' : okCount > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: okCount === total ? '#10b981' : okCount > 0 ? '#f59e0b' : '#ef4444',
              }}
            >
              {okCount}/{total} aktywnych
            </span>
            {lastUpdate && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
                <Clock size={10} /> {formatTime(lastUpdate)}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
            <X size={14} />
          </button>
        </div>

        {/* Source grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {reports.map(r => (
            <div
              key={r.source}
              className="flex items-center gap-2 p-2 rounded-lg"
              style={{
                background: r.status === 'ok'
                  ? 'rgba(16,185,129,0.06)'
                  : 'rgba(239,68,68,0.06)',
                border: `1px solid ${r.status === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
              }}
            >
              <span className="text-base leading-none">{SOURCE_ICONS[r.source] ?? '🔗'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-white truncate">{r.source}</span>
                  {r.status === 'ok'
                    ? <CheckCircle size={11} className="shrink-0" style={{ color: '#10b981' }} />
                    : <XCircle size={11} className="shrink-0" style={{ color: '#ef4444' }} />
                  }
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {r.status === 'ok'
                    ? `rangi ${RANK_RANGES[r.source] ?? '?'} · ${r.count} monet`
                    : <span style={{ color: '#ef4444' }} title={r.error}>błąd</span>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Traffic note */}
        <p className="text-xs text-slate-600 mt-3 text-center">
          10 równoległych requestów · każde źródło obsługuje ~20 kryptowalut · mały ruch sieciowy
        </p>
      </div>
    </div>
  );
}
