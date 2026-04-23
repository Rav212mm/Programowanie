import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus, X, ChevronDown, Star, Trash2 } from 'lucide-react';
import { CRYPTO_TOP_200, type CryptoListEntry } from '../data/cryptoList';
import { buildCryptoAsset, applyPricesToAsset } from '../services/cryptoData';
import { CryptoCard } from './CryptoCard';
import type { CryptoAsset } from '../types';
import type { PriceMap } from '../services/priceService';

const BTC_ENTRY = CRYPTO_TOP_200[0];

function formatMarketCap(mc: number): string {
  if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`;
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(1)}B`;
  if (mc >= 1e6) return `$${(mc / 1e6).toFixed(0)}M`;
  return `$${mc.toLocaleString()}`;
}

function DropdownItem({ entry, prices, onSelect }: {
  entry: CryptoListEntry;
  prices: PriceMap;
  onSelect: () => void;
}) {
  const live = prices.get(entry.id);
  const mc = live?.marketCap ?? entry.baseMarketCap;
  const change = live?.change24h;

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 hover:bg-white/5 rounded-lg"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black"
        style={{
          background: `${entry.logoColor}22`,
          border: `1px solid ${entry.logoColor}33`,
          color: entry.logoColor,
        }}
      >
        {entry.logoEmoji.length > 2 ? entry.symbol.slice(0, 2) : entry.logoEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{entry.symbol}</span>
          <span className="text-xs text-slate-500 truncate">{entry.name}</span>
        </div>
        <div className="text-xs text-slate-600">{formatMarketCap(mc)}</div>
      </div>
      <div className="flex flex-col items-end shrink-0 gap-0.5">
        <span className="text-xs text-slate-600">#{entry.rank}</span>
        {change !== undefined && (
          <span className="text-xs font-semibold" style={{ color: change >= 0 ? '#10b981' : '#ef4444' }}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
      </div>
    </button>
  );
}

interface WatchedCrypto {
  entry: CryptoListEntry;
  asset: CryptoAsset;
}

interface Props {
  prices: PriceMap;
}

export function CustomAnalysisPanel({ prices }: Props) {
  const [watched, setWatched] = useState<WatchedCrypto[]>(() => [{
    entry: BTC_ENTRY,
    asset: buildCryptoAsset(BTC_ENTRY),
  }]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Apply incoming live prices to all watched assets
  useEffect(() => {
    if (prices.size === 0) return;
    setWatched(prev => prev.map(w => ({
      ...w,
      asset: applyPricesToAsset(w.asset, prices),
    })));
  }, [prices]);

  const watchedIds = useMemo(() => new Set(watched.map(w => w.entry.id)), [watched]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return CRYPTO_TOP_200.slice(0, 30);
    return CRYPTO_TOP_200.filter(
      c =>
        c.symbol.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(entry: CryptoListEntry) {
    if (watchedIds.has(entry.id)) return;
    const asset = buildCryptoAsset(entry, prices.get(entry.id));
    setWatched(prev => [...prev, { entry, asset }]);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  }

  function handleRemove(id: string) {
    setWatched(prev => prev.filter(w => w.entry.id !== id));
  }

  function handleRefreshOne(id: string) {
    setWatched(prev => prev.map(w =>
      w.entry.id === id
        ? { ...w, asset: buildCryptoAsset(w.entry, prices.get(w.entry.id)) }
        : w
    ));
  }

  function handleClear() {
    setWatched([{ entry: BTC_ENTRY, asset: buildCryptoAsset(BTC_ENTRY, prices.get(BTC_ENTRY.id)) }]);
  }

  const available = filtered.filter(e => !watchedIds.has(e.id));

  return (
    <section className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-black text-xl text-white flex items-center gap-2">
            <Star size={18} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
            Własna Lista Obserwowanych
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Wybierz dowolną kryptowalutę z top 200 do indywidualnej analizy
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
          {watched.length} / 10 aktywów
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <div
          className="glass rounded-xl flex items-center gap-3 px-4 py-3 transition-all duration-200"
          style={{
            border: isFocused
              ? '1px solid rgba(245,158,11,0.5)'
              : '1px solid rgba(255,255,255,0.08)',
            boxShadow: isFocused ? '0 0 20px rgba(245,158,11,0.1)' : 'none',
          }}
        >
          <Search size={16} style={{ color: isFocused ? '#f59e0b' : '#475569', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Wyszukaj kryptowalutę (np. BTC, Ethereum, SOL...)"
            value={query}
            onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => { setIsFocused(true); setIsOpen(true); }}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setIsOpen(true); inputRef.current?.focus(); }}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={14}
            className="text-slate-500 transition-transform duration-200 shrink-0"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-30"
            style={{
              border: '1px solid rgba(245,158,11,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              maxHeight: '340px',
              overflowY: 'auto',
            }}
          >
            {available.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                {query ? 'Nie znaleziono kryptowaluty' : 'Wszystkie kryptowaluty z listy już dodane'}
              </div>
            )}
            {!query && available.length > 0 && (
              <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Top 200 według kapitalizacji</span>
                {prices.size > 0 && (
                  <span className="text-xs text-emerald-500">● Live</span>
                )}
              </div>
            )}
            <div className="p-2">
              {available.map(entry => (
                <DropdownItem
                  key={entry.id}
                  entry={entry}
                  prices={prices}
                  onSelect={() => handleSelect(entry)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Watched chips */}
      {watched.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {watched.map(w => (
            <div
              key={w.entry.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: `${w.entry.logoColor}18`,
                border: `1px solid ${w.entry.logoColor}35`,
                color: w.entry.logoColor,
              }}
            >
              <span>{w.entry.symbol}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{w.entry.name}</span>
              <button
                onClick={() => handleRemove(w.entry.id)}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                title="Usuń"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          {watched.length > 1 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
            >
              <Trash2 size={11} /> Wyczyść
            </button>
          )}
        </div>
      )}

      {/* Cards grid */}
      {watched.length > 0 && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
        >
          {watched.map((w, i) => (
            <div key={w.entry.id} className="relative group/card">
              <div className="absolute top-3 left-3 z-10 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleRefreshOne(w.entry.id)}
                  title="Odśwież dane"
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all"
                  style={{ background: 'rgba(59,130,246,0.8)', color: 'white' }}
                >
                  ↻
                </button>
                <button
                  onClick={() => handleRemove(w.entry.id)}
                  title="Usuń"
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                  style={{ background: 'rgba(239,68,68,0.8)', color: 'white' }}
                >
                  <X size={10} />
                </button>
              </div>
              <CryptoCard asset={w.asset} rank={i + 1} delay={i * 80} />
            </div>
          ))}

          {watched.length < 10 && (
            <button
              onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
              className="rounded-2xl flex flex-col items-center justify-center gap-3 p-6 transition-all duration-300 min-h-[280px]"
              style={{ border: '2px dashed rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <Plus size={22} style={{ color: '#f59e0b' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-400">Dodaj kryptowalutę</p>
                <p className="text-xs text-slate-600 mt-0.5">z top 200</p>
              </div>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
