import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Zap, RefreshCw, Clock, ChevronRight, BarChart2, Shield, WifiOff, Database } from 'lucide-react';
import { scanTwitterTrends } from './services/twitterScanner';
import { fetchAllPrices, type PriceMap, type FetchReport } from './services/priceService';
import { applyPricesToAsset } from './services/cryptoData';
import { CRYPTO_TOP_200 } from './data/cryptoList';
import { CryptoCard } from './components/CryptoCard';
import { ScannerModal } from './components/ScannerModal';
import { Ticker } from './components/Ticker';
import { StatsBar } from './components/StatsBar';
import { CustomAnalysisPanel } from './components/CustomAnalysisPanel';
import { SourceStatusBar } from './components/SourceStatusBar';
import type { TrendScanResult } from './types';
import './index.css';

const ALL_IDS = CRYPTO_TOP_200.map(c => c.id);

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

type PriceStatus = 'idle' | 'loading' | 'ok' | 'partial' | 'error';

export default function App() {
  const [scanResult, setScanResult] = useState<TrendScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showTraders, setShowTraders] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [prices, setPrices] = useState<PriceMap>(new Map());
  const [priceStatus, setPriceStatus] = useState<PriceStatus>('idle');
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reports, setReports] = useState<FetchReport[]>([]);
  const [showSources, setShowSources] = useState(false);
  const prevPricesRef = useRef<PriceMap>(new Map());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadPrices = useCallback(async () => {
    setPriceStatus('loading');
    try {
      const { prices: newPrices, reports: newReports } = await fetchAllPrices(
        ALL_IDS,
        prevPricesRef.current
      );
      prevPricesRef.current = newPrices;
      setPrices(newPrices);
      setReports(newReports);
      setLastPriceUpdate(new Date());
      const okCount = newReports.filter(r => r.status === 'ok').length;
      setPriceStatus(okCount === 0 ? 'error' : okCount < newReports.length ? 'partial' : 'ok');
    } catch {
      setPriceStatus('error');
    }
  }, []);

  useEffect(() => { loadPrices(); }, [loadPrices]);

  async function handleRefreshAll() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await loadPrices();
      if (scanResult) {
        setScanResult(prev => prev
          ? { ...prev, topCryptos: prev.topCryptos.map(a => applyPricesToAsset(a, prevPricesRef.current)) }
          : prev
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleScan() {
    if (isScanning) return;
    setIsScanning(true);
    setShowTraders(false);
    try {
      const result = await scanTwitterTrends();
      setScanResult({
        ...result,
        topCryptos: result.topCryptos.map(a => applyPricesToAsset(a, prevPricesRef.current)),
      });
    } finally {
      setIsScanning(false);
    }
  }

  const okSources = reports.filter(r => r.status === 'ok').length;
  const totalSources = reports.length;

  const statusBadge =
    priceStatus === 'loading' ? { label: 'Pobieranie...', color: '#3b82f6', pulse: true } :
    priceStatus === 'ok'      ? { label: 'LIVE', color: '#10b981', pulse: true } :
    priceStatus === 'partial' ? { label: `${okSources}/${totalSources} źródeł`, color: '#f59e0b', pulse: false } :
    priceStatus === 'error'   ? { label: 'Offline', color: '#ef4444', pulse: false } :
    null;

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass" style={{ borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <BarChart2 size={19} className="text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight shimmer-text">CryptoSignal</span>
              <span className="text-slate-500 text-sm"> Pro</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {['Dashboard', 'Portfolio', 'Signals', 'Analiza'].map((item, i) => (
              <button key={item} className="px-3 py-1.5 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                style={{ color: i === 0 ? '#3b82f6' : '#64748b', background: i === 0 ? 'rgba(59,130,246,0.1)' : 'transparent' }}>
                {item}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status badge */}
            {statusBadge && (
              <button
                onClick={() => setShowSources(s => !s)}
                title="Pokaż status źródeł danych"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
                style={{
                  background: `${statusBadge.color}12`,
                  border: `1px solid ${statusBadge.color}28`,
                }}
              >
                {priceStatus === 'loading'
                  ? <RefreshCw size={11} style={{ color: statusBadge.color }} className="animate-spin" />
                  : priceStatus === 'error'
                  ? <WifiOff size={11} style={{ color: statusBadge.color }} />
                  : <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusBadge.color }} />
                }
                <span className="text-xs font-medium" style={{ color: statusBadge.color }}>
                  {statusBadge.label}
                </span>
                {reports.length > 0 && (
                  <Database size={10} style={{ color: statusBadge.color, opacity: 0.7 }} />
                )}
              </button>
            )}

            {/* Refresh button */}
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing || priceStatus === 'loading'}
              title={lastPriceUpdate ? `Ostatnia aktualizacja: ${formatTime(lastPriceUpdate)}` : 'Odśwież ceny'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Odśwież</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={12} />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>

            <button className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Shield size={15} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Ticker */}
        <Ticker prices={prices} />
      </header>

      {/* Source status bar (collapsible) */}
      {showSources && reports.length > 0 && (
        <SourceStatusBar reports={reports} lastUpdate={lastPriceUpdate} onClose={() => setShowSources(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        <StatsBar result={scanResult} prices={prices} />

        {/* Twitter scan section */}
        <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(29,155,240,0.2)' }}>
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1d9bf0, #0ea5e9)' }}>
                <X size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">Twitter Trend Analysis</h2>
                <p className="text-xs text-slate-500">
                  {scanResult
                    ? `Ostatni skan: ${formatTime(scanResult.scanTime)} · ${scanResult.totalMentions} pkt wzm.`
                    : 'Kliknij "Trendy" aby przeskanować Twitter'}
                </p>
              </div>
            </div>
            <button
              onClick={handleScan} disabled={isScanning}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 select-none cursor-pointer"
              style={{
                background: isScanning ? 'rgba(59,130,246,0.1)' : 'linear-gradient(135deg, #1d9bf0, #3b82f6)',
                border: isScanning ? '1px solid rgba(59,130,246,0.3)' : 'none',
                color: isScanning ? '#3b82f6' : 'white',
                boxShadow: isScanning ? 'none' : '0 0 20px rgba(29,155,240,0.4)',
                cursor: isScanning ? 'not-allowed' : 'pointer',
              }}
            >
              {isScanning
                ? <><RefreshCw size={16} className="animate-spin" /> Skanowanie...</>
                : <><X size={16} /><Zap size={14} style={{ color: '#fde047' }} /> Trendy</>
              }
            </button>
          </div>

          {!scanResult && !isScanning && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center animate-float"
                  style={{ background: 'rgba(29,155,240,0.1)', border: '1px solid rgba(29,155,240,0.2)' }}>
                  <X size={36} style={{ color: '#1d9bf0' }} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#1d9bf0' }}>
                  <Zap size={11} className="text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-semibold">Gotowy do skanowania</p>
                <p className="text-slate-500 text-sm mt-1">Przeskanuj Twitter w poszukiwaniu hot kryptowalut</p>
                <p className="text-slate-600 text-xs mt-0.5">Analiza top 15 influencerów · NLP sentyment · Trend scoring</p>
              </div>
              <button onClick={handleScan}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-80 cursor-pointer"
                style={{ color: '#1d9bf0' }}>
                Rozpocznij analizę <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Twitter results */}
        {scanResult && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-xl text-white">
                  Top 5 Kryptowalut <span className="shimmer-text">do Analizy</span>
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Wyselekcjonowane na podstawie analizy {scanResult.traders.length} top traderów Twittera
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowTraders(!showTraders)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  style={{
                    background: showTraders ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                    color: showTraders ? '#8b5cf6' : '#64748b',
                    border: `1px solid ${showTraders ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  Traderzy
                </button>
                <button onClick={handleRefreshAll} disabled={isRefreshing}
                  className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> Odśwież
                </button>
              </div>
            </div>

            {showTraders && (
              <div className="glass rounded-xl p-4 animate-rise-in" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <X size={14} style={{ color: '#8b5cf6' }} />
                  Top 15 Traderów Krypto na Twitterze
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {scanResult.traders.map((trader, i) => (
                    <div key={trader.handle} className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                        style={{ background: 'linear-gradient(135deg, #1d9bf033, #8b5cf633)', color: '#a78bfa' }}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{trader.handle}</div>
                        <div className="text-xs text-slate-500">{(trader.followers / 1000).toFixed(0)}K</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {scanResult.topCryptos.map((asset, i) => (
                <CryptoCard key={asset.id} asset={asset} rank={i + 1} delay={(i + 1) * 120} />
              ))}
            </div>

            <p className="text-center text-xs text-slate-600 pb-2">
              * Dane mają charakter edukacyjny i nie stanowią porady inwestycyjnej. Zawsze przeprowadź własną analizę (DYOR).
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)' }} />
          <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">Własna Analiza</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)' }} />
        </div>

        <CustomAnalysisPanel prices={prices} />

        <p className="text-center text-xs text-slate-700 pb-4">
          * Ceny z 10 źródeł: CoinGecko · Binance · CoinPaprika · Bybit · OKX · HTX · Gate.io · KuCoin · MEXC · Bitfinex
        </p>
      </main>

      <ScannerModal isOpen={isScanning} />
    </div>
  );
}
