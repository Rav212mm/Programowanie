import { useEffect, useState } from 'react';
import { X, Search, BarChart2, Zap } from 'lucide-react';

const SCAN_STEPS = [
  { icon: X, label: 'Łączenie z Twitter/X API...', detail: 'Autoryzacja tokenu dostępu' },
  { icon: Search, label: 'Skanowanie top 15 traderów krypto...', detail: '@PlanB, @Pentoshi, @CryptoKaleo...' },
  { icon: BarChart2, label: 'Analizowanie wzmianek i sentymentu...', detail: 'NLP analiza 2,847 tweetów' },
  { icon: Zap, label: 'Rankingowanie kryptowalut...', detail: 'Obliczanie Trend Score' },
];

interface ScannerModalProps {
  isOpen: boolean;
}

export function ScannerModal({ isOpen }: ScannerModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const stepDuration = 700;
    const interval = setInterval(() => {
      setCurrentStep(s => Math.min(s + 1, SCAN_STEPS.length - 1));
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 98));
    }, 55);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-2xl p-8 w-full max-w-md mx-4 scan-effect" style={{ border: '1px solid rgba(6,182,212,0.3)', boxShadow: '0 0 40px rgba(6,182,212,0.15)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-spin-slow" style={{ background: 'linear-gradient(135deg, #1d9bf0, #0ea5e9)' }}>
            <X size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Twitter Trend Scanner</h3>
            <p className="text-xs text-slate-400">Analiza top 15 traderów krypto</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {SCAN_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <div key={i} className="flex items-start gap-3 transition-all duration-300">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500"
                  style={{
                    background: isDone
                      ? 'rgba(16,185,129,0.2)'
                      : isActive
                      ? 'rgba(6,182,212,0.2)'
                      : 'rgba(255,255,255,0.04)',
                    border: isDone
                      ? '1px solid rgba(16,185,129,0.4)'
                      : isActive
                      ? '1px solid rgba(6,182,212,0.4)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Icon
                    size={15}
                    style={{
                      color: isDone ? '#10b981' : isActive ? '#06b6d4' : '#334155',
                    }}
                    className={isActive ? 'animate-pulse' : ''}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium transition-colors duration-300"
                    style={{ color: isDone ? '#10b981' : isActive ? '#e2e8f0' : '#334155' }}
                  >
                    {step.label}
                  </div>
                  <div
                    className="text-xs transition-colors duration-300 truncate"
                    style={{ color: isDone ? '#10b98188' : isActive ? '#64748b' : '#1e293b' }}
                  >
                    {step.detail}
                  </div>
                </div>
                {isDone && (
                  <span className="text-emerald-400 text-lg leading-none">✓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Postęp analizy</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #1d9bf0, #06b6d4)',
                boxShadow: '0 0 10px rgba(6,182,212,0.5)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
