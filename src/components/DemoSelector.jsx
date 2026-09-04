import React from 'react';
import { FlaskConical, ChevronRight } from 'lucide-react';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

const TIER_CFG = {
  LOW: { label: 'Low concern', bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', dot: '#059669' },
  MODERATE: { label: 'Moderate', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', dot: '#D97706' },
  HIGH: { label: 'High distress', bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', dot: '#EA580C' },
  CRITICAL: { label: 'Critical safety', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', dot: '#DC2626' },
};

export default function DemoSelector({ currentScenarioId, onSelectScenario, language = 'en' }) {
  const isHi = language === 'hi';
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          <FlaskConical size={14} color="var(--blue)" />
          <span className="section-label">{isHi ? 'डेमो परिदृश्य — परीक्षण वातावरण' : 'Demo Scenarios — Testing Environment'}</span>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', background: '#EFF6FF', color: 'var(--blue)', border: '1px solid #BFDBFE', padding: '3px 7px', borderRadius: 99 }}>DEMO</span>
        </div>
        <span className="hide-demo-hint" style={{ fontSize: 11, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>{isHi ? 'किसी परिदृश्य पर क्लिक करें' : 'Click any scenario to load'}</span>
      </div>

      <div className="nhaa-demo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 9 }}>
        {DEMO_SCENARIOS.map(sc => {
          const cfg = TIER_CFG[sc.category] || TIER_CFG.LOW;
          const isActive = currentScenarioId === sc.id;
          return (
            <button key={sc.id} onClick={() => onSelectScenario(sc.id)}
              style={{ padding: '11px 12px', borderRadius: 12, cursor: 'pointer', background: isActive ? cfg.bg : '#fff', border: `1px solid ${isActive ? cfg.border : 'var(--border)'}`, outline: isActive ? `2px solid ${cfg.dot}40` : 'none', outlineOffset: 2, textAlign: 'left', transition: 'all .16s', display: 'flex', flexDirection: 'column', gap: 7, boxShadow: isActive ? '0 4px 12px rgba(16,24,40,.05)' : 'var(--shadow-xs)' }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} /><span style={{ fontSize: 9, fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '.04em' }}>{cfg.label}</span></div>
                <span style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-4)' }}>{sc.expectedSVI}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 650, color: 'var(--text-1)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{isHi ? sc.titleHi : sc.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600 }}>{isActive ? (isHi ? '✓ सक्रिय' : '✓ Active') : (isHi ? 'लोड करें' : 'Load')}</span><ChevronRight size={11} color={cfg.dot} /></div>
            </button>
          );
        })}
      </div>

      {currentScenarioId && <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9, padding: '7px 12px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 9, fontSize: 11, color: '#92400E' }}><span style={{ fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: '.06em', background: '#FDE68A', padding: '2px 7px', borderRadius: 5 }}>DEMO CASE</span><span>{isHi ? 'वर्तमान डेटा काल्पनिक है — वास्तविक पीड़ित के साथ भ्रमित न करें।' : 'Current data is fictional — do not mistake for a real victim case.'}</span></div>}
      <style>{`@media(max-width:900px){.nhaa-demo-grid{grid-template-columns:repeat(3,1fr)!important}}@media(max-width:600px){.nhaa-demo-grid{grid-template-columns:repeat(2,1fr)!important}.hide-demo-hint{display:none!important}}@media(max-width:380px){.nhaa-demo-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
