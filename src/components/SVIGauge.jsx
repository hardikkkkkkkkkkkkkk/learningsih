import React, { useEffect, useRef, useState } from 'react';

const RISK_CFG = {
  LOW:      { color: '#059669', label: 'LOW',      labelHi: 'न्यून',   bg: '#059669' },
  MODERATE: { color: '#B45309', label: 'MODERATE', labelHi: 'मध्यम',  bg: '#D97706' },
  HIGH:     { color: '#C2410C', label: 'HIGH',     labelHi: 'उच्च',   bg: '#EA580C' },
  CRITICAL: { color: '#991B1B', label: 'CRITICAL', labelHi: 'गंभीर',  bg: '#DC2626' },
};

export default function SVIGauge({ svi = 10, riskLevel = 'LOW', language = 'en' }) {
  const isHi = language === 'hi';
  const cfg = RISK_CFG[riskLevel] || RISK_CFG.LOW;

  // Animated counter
  const [displaySvi, setDisplaySvi] = useState(svi);
  const prevRef = useRef(svi);
  const rafRef  = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to   = svi;
    const dur  = 700;
    let start  = null;
    cancelAnimationFrame(rafRef.current);
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplaySvi(Math.round(from + (to - from) * ease));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else prevRef.current = to;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [svi]);

  // SVG Arc — 220° sweep
  const R = 70, CX = 90, CY = 95;
  const SWEEP = 220;
  const START_ANGLE = -200; // degrees from positive x-axis

  const polar = (deg) => {
    const r = (deg * Math.PI) / 180;
    return { x: CX + R * Math.cos(r), y: CY + R * Math.sin(r) };
  };
  const arc = (a1, a2) => {
    const s = polar(a1), e = polar(a2);
    const large = (a2 - a1) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const pct      = Math.max(0, Math.min(1, svi / 100));
  const endAngle = START_ANGLE + SWEEP * pct;

  // Tier colors on the track
  const tiers = [
    { a1: START_ANGLE,            a2: START_ANGLE + SWEEP * 0.25, c: '#D1FAE5' },
    { a1: START_ANGLE + SWEEP * 0.25, a2: START_ANGLE + SWEEP * 0.50, c: '#FEF3C7' },
    { a1: START_ANGLE + SWEEP * 0.50, a2: START_ANGLE + SWEEP * 0.75, c: '#FFEDD5' },
    { a1: START_ANGLE + SWEEP * 0.75, a2: START_ANGLE + SWEEP,        c: '#FEE2E2' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 180, height: 145 }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Tier backgrounds */}
          {tiers.map((t, i) => (
            <path key={i} d={arc(t.a1, t.a2)} fill="none" stroke={t.c} strokeWidth={10} strokeLinecap="butt" />
          ))}
          {/* Track */}
          <path d={arc(START_ANGLE, START_ANGLE + SWEEP)} fill="none" stroke="#F3F4F6" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
          {/* Active progress */}
          {pct > 0.005 && (
            <path
              className="arc-track"
              d={arc(START_ANGLE, endAngle)}
              fill="none"
              stroke={cfg.bg}
              strokeWidth={8}
              strokeLinecap="round"
            />
          )}
          {/* Needle tip */}
          {pct > 0.005 && (
            <circle cx={polar(endAngle).x} cy={polar(endAngle).y} r={5} fill={cfg.color} />
          )}
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          paddingTop: 18
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>SVI</span>
          <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, color: cfg.color, transition: 'color .5s', fontVariantNumeric: 'tabular-nums' }}>
            {displaySvi}
          </span>
          <div className={`risk-pill risk-${riskLevel}`} style={{ marginTop: 3, fontSize: 10 }}>
            {isHi ? cfg.labelHi : cfg.label}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, width: '100%', marginTop: 8 }}>
        {[
          { r: 'LOW',      c: '#059669', lo: '0',   hi: '25',  l: 'Low',  lHi: 'न्यून'  },
          { r: 'MODERATE', c: '#D97706', lo: '26',  hi: '50',  l: 'Mod',  lHi: 'मध्यम' },
          { r: 'HIGH',     c: '#EA580C', lo: '51',  hi: '75',  l: 'High', lHi: 'उच्च'  },
          { r: 'CRITICAL', c: '#DC2626', lo: '76',  hi: '100', l: 'Crit', lHi: 'गंभीर' },
        ].map(t => (
          <div key={t.r} style={{
            textAlign: 'center', padding: '5px 4px', borderRadius: 7,
            background: riskLevel === t.r ? t.c + '18' : 'transparent',
            border: '1px solid', borderColor: riskLevel === t.r ? t.c + '50' : 'transparent',
            transition: 'all .3s'
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.c }}>{isHi ? t.lHi : t.l}</div>
            <div style={{ fontSize: 9, color: 'var(--text-4)', fontFamily: 'monospace' }}>{t.lo}–{t.hi}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
