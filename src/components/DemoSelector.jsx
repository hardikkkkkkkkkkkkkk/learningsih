import React from 'react';
import { FlaskConical, ChevronRight } from 'lucide-react';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

const TIER_CFG = {
  LOW:      { label: 'Low concern',    bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', dot: '#059669' },
  MODERATE: { label: 'Moderate',       bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', dot: '#D97706' },
  HIGH:     { label: 'High distress',  bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', dot: '#EA580C' },
  CRITICAL: { label: 'Critical safety',bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', dot: '#DC2626' },
};

export default function DemoSelector({ currentScenarioId, onSelectScenario, language = 'en' }) {
  const isHi = language === 'hi';

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <FlaskConical size={13} color="var(--text-3)" />
          <span className="section-label">{isHi ? 'डेमो परिदृश्य — परीक्षण वातावरण' : 'Demo Scenarios — Testing Environment'}</span>
          <span style={{
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em',
            background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A',
            padding: '2px 6px', borderRadius: 99
          }}>DEMO</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
          {isHi ? 'किसी परिदृश्य पर क्लिक करें' : 'Click any scenario to load'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {DEMO_SCENARIOS.map(sc => {
          const cfg = TIER_CFG[sc.category] || TIER_CFG.LOW;
          const isActive = currentScenarioId === sc.id;

          return (
            <button key={sc.id} onClick={() => onSelectScenario(sc.id)}
              style={{
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                background: isActive ? cfg.bg : '#fff',
                border: `1px solid ${isActive ? cfg.border : 'var(--border)'}`,
                outline: isActive ? `2px solid ${cfg.dot}40` : 'none',
                outlineOffset: 2,
                textAlign: 'left',
                transition: 'all .15s',
                display: 'flex', flexDirection: 'column', gap: 6
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.background = cfg.bg + '80'; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {cfg.label}
                  </span>
                </div>
                <span style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-4)' }}>
                  {sc.expectedSVI}
                </span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {isHi ? sc.titleHi : sc.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: 'var(--text-4)' }}>
                  {isActive ? (isHi ? '✓ सक्रिय' : '✓ Active') : (isHi ? 'लोड करें' : 'Load')}
                </span>
                <ChevronRight size={11} color={cfg.dot} />
              </div>
            </button>
          );
        })}
      </div>

      {currentScenarioId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 12px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 11, color: '#92400E' }}>
          <span style={{ fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', background: '#FDE68A', padding: '1px 6px', borderRadius: 4 }}>DEMO CASE</span>
          <span>{isHi ? 'वर्तमान डेटा काल्पनिक है — वास्तविक पीड़ित के साथ भ्रमित न करें।' : 'Current data is fictional — do not mistake for a real victim case.'}</span>
        </div>
      )}
    </div>
  );
}
