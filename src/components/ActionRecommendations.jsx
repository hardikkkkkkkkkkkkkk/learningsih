import React, { useState } from 'react';
import { CheckCircle2, Circle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

const P = {
  critical: { label: 'Urgent',   labelHi: 'तत्काल', color: '#991B1B', bg: '#FEF2F2', border: '#FECACA' },
  high:     { label: 'High',     labelHi: 'उच्च',   color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
  medium:   { label: 'Medium',   labelHi: 'मध्यम',  color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  low:      { label: 'Standard', labelHi: 'मानक',   color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
};

export default function ActionRecommendations({ recommendations = [], riskLevel = 'LOW', language = 'en' }) {
  const isHi = language === 'hi';
  const [done, setDone] = useState({});
  const [open, setOpen] = useState(true);

  const completed = Object.values(done).filter(Boolean).length;

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: open ? '1px solid var(--border)' : 'none',
          background: 'none', border: 'none', cursor: 'pointer', borderRadius: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={13} color="var(--text-3)" />
          <span className="section-label">{isHi ? 'ऑपरेटर हस्तक्षेप प्रोटोकॉल' : 'Operator Intervention Protocol'}</span>
          {recommendations.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: '#EFF6FF', color: 'var(--blue)', border: '1px solid #BFDBFE',
              padding: '1px 7px', borderRadius: 99
            }}>
              {completed}/{recommendations.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-4)' }}>
            {isHi ? 'निर्णय समर्थन' : 'Decision support only'}
          </span>
          {open ? <ChevronUp size={13} color="var(--text-4)" /> : <ChevronDown size={13} color="var(--text-4)" />}
        </div>
      </button>

      {open && (
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Progress */}
          {recommendations.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'var(--border-lt)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(completed / recommendations.length) * 100}%`, background: 'var(--blue)', borderRadius: 99, transition: 'width .4s ease' }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-4)', flexShrink: 0 }}>{Math.round((completed / recommendations.length) * 100)}% completed</span>
            </div>
          )}

          {recommendations.map(rec => {
            const isDone = !!done[rec.id];
            const p = P[rec.priority] || P.low;

            return (
              <div key={rec.id}
                onClick={() => setDone(d => ({ ...d, [rec.id]: !d[rec.id] }))}
                style={{
                  display: 'flex', gap: 10, padding: '10px 12px',
                  borderRadius: 9, cursor: 'pointer',
                  border: `1px solid ${isDone ? 'var(--border)' : p.border}`,
                  background: isDone ? '#FAFAFA' : p.bg,
                  opacity: isDone ? 0.6 : 1,
                  transition: 'all .2s'
                }}
              >
                <div style={{ marginTop: 1, flexShrink: 0 }}>
                  {isDone
                    ? <CheckCircle2 size={16} color="#059669" />
                    : <Circle size={16} color={p.color} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: isDone ? 'var(--text-4)' : 'var(--text-1)', textDecoration: isDone ? 'line-through' : 'none', lineHeight: 1.4 }}>
                      {rec.title}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: p.color, background: p.bg, border: `1px solid ${p.border}`, padding: '2px 6px', borderRadius: 99, flexShrink: 0, textTransform: 'uppercase' }}>
                      {isHi ? (rec.priority === 'critical' ? 'तत्काल' : rec.priority === 'high' ? 'उच्च' : rec.priority === 'medium' ? 'मध्यम' : 'मानक') : p.label}
                    </span>
                  </div>
                  {rec.detail && (
                    <p style={{ fontSize: 11, color: isDone ? 'var(--text-4)' : 'var(--text-3)', marginTop: 3, lineHeight: 1.45 }}>
                      {rec.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          <p style={{ fontSize: 10, color: 'var(--text-4)', textAlign: 'center', marginTop: 2 }}>
            {isHi ? '↑ पूर्ण हुए चरणों पर क्लिक करें' : '↑ Click items to mark as executed'}
          </p>
        </div>
      )}
    </div>
  );
}
