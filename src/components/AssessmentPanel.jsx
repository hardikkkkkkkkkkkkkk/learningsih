import React from 'react';
import SVIGauge from './SVIGauge';
import EmotionBars from './EmotionBars';
import RiskBadge from './RiskBadge';
import ActionRecommendations from './ActionRecommendations';
import CaseSummary from './CaseSummary';
import { Tag, Sparkles, Info, Activity } from 'lucide-react';

const SEV = {
  critical: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', dot: '#DC2626' },
  high:     { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', dot: '#EA580C' },
  medium:   { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', dot: '#D97706' },
};

export default function AssessmentPanel({ assessment, caseId, messages, language }) {
  const isHi = language === 'hi';
  const {
    svi = 10, riskLevel = 'LOW',
    detectedIndicators = [], emotions = {},
    explainableReasons = [], recommendedActions = [],
    analyzedMessageCount = 0
  } = assessment || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header bar */}
      <div style={{
        background: '#0B1E3D',
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Activity size={16} color="#93C5FD" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {isHi ? 'लाइव मूल्यांकन' : 'Live Assessment'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
              {isHi ? 'वास्तविक समय संकेतक विश्लेषण' : 'Real-time indicator analysis · SIH26093'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{svi}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>/ 100 SVI · {analyzedMessageCount} {isHi ? 'संदेश' : 'messages'}</div>
        </div>
      </div>

      {/* Risk banner — restrained */}
      <RiskBadge riskLevel={riskLevel} language={language} />

      {/* SVI Gauge + Emotion Signals side-by-side on wide, stacked on narrow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* SVI Gauge */}
        <div className="card" style={{ padding: '18px 14px' }}>
          <div className="section-label" style={{ marginBottom: 14 }}>
            {isHi ? 'तनाव भेद्यता सूचकांक' : 'Stress Vulnerability Index'}
          </div>
          <SVIGauge svi={svi} riskLevel={riskLevel} language={language} />
        </div>

        {/* Emotional signals */}
        <EmotionBars emotions={emotions} language={language} />
      </div>

      {/* Detected Indicators */}
      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Tag size={13} color="var(--text-3)" />
            <span className="section-label">{isHi ? 'पहचाने गए जोखिम संकेतक' : 'Detected Risk Indicators'}</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
            {detectedIndicators.length} {isHi ? 'सक्रिय' : 'active'}
          </span>
        </div>

        {detectedIndicators.length === 0 ? (
          <div style={{
            padding: '16px', textAlign: 'center',
            border: '1px dashed var(--border)', borderRadius: 9,
            color: 'var(--text-4)', fontSize: 12, fontStyle: 'italic'
          }}>
            {isHi ? 'कोई सक्रिय जोखिम संकेतक नहीं।' : 'No elevated risk indicators in this session.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {detectedIndicators.map(ind => {
              const s = SEV[ind.severity] || SEV.medium;
              return (
                <div key={ind.id} className="ind-chip"
                  style={{ background: s.bg, color: s.color, borderColor: s.border, border: '1px solid' }}
                  data-tip={ind.matchedTerms?.[0] ? `Signal: "${ind.matchedTerms[0]}"` : undefined}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                  {ind.name}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Explainable AI */}
      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <Sparkles size={13} color="var(--blue)" />
          <span className="section-label">{isHi ? 'यह स्तर क्यों?' : 'Why This Level?'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {explainableReasons.map((r, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '9px 12px', borderRadius: 8,
              background: '#FAFAFA', border: '1px solid var(--border-lt)'
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)', background: '#EFF6FF', border: '1px solid #BFDBFE', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {i + 1}
              </span>
              <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>{r}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
          <Info size={11} color="var(--text-4)" />
          <span style={{ fontSize: 10, color: 'var(--text-4)', fontStyle: 'italic' }}>
            {isHi ? 'साक्ष्य-आधारित विश्लेषण — नैदानिक निदान नहीं।' : 'Evidence-based analysis — not a clinical diagnosis.'}
          </span>
        </div>
      </div>

      {/* Recommended Actions */}
      <ActionRecommendations recommendations={recommendedActions} riskLevel={riskLevel} language={language} />

      {/* Case Summary */}
      <CaseSummary caseId={caseId} assessment={assessment} messages={messages} language={language} />

    </div>
  );
}
