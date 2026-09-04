import React from 'react';
import { Flame, AlertCircle, CloudRain, Zap } from 'lucide-react';

const EMOTIONS = [
  { id: 'fear',     label: 'Fear',     labelHi: 'भय',           icon: Flame,       color: '#DC2626' },
  { id: 'anxiety',  label: 'Anxiety',  labelHi: 'चिंता',         icon: AlertCircle, color: '#D97706' },
  { id: 'distress', label: 'Distress', labelHi: 'मानसिक तनाव',   icon: Zap,         color: '#7C3AED' },
  { id: 'sadness',  label: 'Sadness',  labelHi: 'निराशा',        icon: CloudRain,   color: '#2563EB' },
];

export default function EmotionBars({ emotions = {}, language = 'en' }) {
  const isHi = language === 'hi';

  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div className="section-label" style={{ marginBottom: 4 }}>
        {isHi ? 'भावनात्मक संकेत' : 'Emotional Signals'}
      </div>
      <p style={{ fontSize: 10, color: 'var(--text-4)', marginBottom: 14, fontStyle: 'italic' }}>
        {isHi ? 'बातचीत संकेतक — नैदानिक निदान नहीं' : 'Conversational indicators — not clinical diagnosis'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {EMOTIONS.map(em => {
          const Icon = em.icon;
          const pct = Math.min(99, Math.max(5, emotions[em.id] ?? 15));
          return (
            <div key={em.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={13} color={em.color} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
                    {isHi ? em.labelHi : em.label}
                  </span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: em.color, fontVariantNumeric: 'tabular-nums' }}>
                  {pct}%
                </span>
              </div>
              <div className="ebar-track">
                <div className="ebar-fill" style={{ width: `${pct}%`, background: em.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
