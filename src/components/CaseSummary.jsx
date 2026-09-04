import React, { useState } from 'react';
import { FileText, Download, ChevronDown, ChevronUp, Hash, Clock, User, CheckCircle2 } from 'lucide-react';

export default function CaseSummary({ caseId, assessment, messages = [], language = 'en' }) {
  const isHi = language === 'hi';
  const [open, setOpen] = useState(false);
  const [dl, setDl] = useState(false);
  const { svi, riskLevel, caseSummary = {}, detectedIndicators = [], emotions = {}, recommendedActions = [] } = assessment || {};

  const fields = [
    { k: isHi ? 'प्राथमिक चिंता'       : 'Primary Concern',      v: caseSummary.primaryConcern },
    { k: isHi ? 'भावनात्मक स्थिति'      : 'Emotional State',      v: caseSummary.emotionalSummary },
    { k: isHi ? 'सुरक्षा संबंधी'        : 'Safety Concern',       v: caseSummary.safetyConcern },
    { k: isHi ? 'अनुशंसित अगला कदम'     : 'Recommended Next Step', v: caseSummary.recommendedNextStep },
  ];

  const handleExport = () => {
    const payload = {
      portal: 'NHAA – National Helpline Against Atrocities (14566)',
      system: 'SIH26093 · AI Stress & Trauma Assessment Module',
      classification: 'OPERATOR DECISION SUPPORT AUDIT REPORT',
      caseId,
      generated: new Date().toISOString(),
      triage: { svi: `${svi}/100`, riskLevel, emotions, indicators: detectedIndicators.map(i => i.name) },
      summary: caseSummary,
      actions: recommendedActions.map(a => `[${a.priority.toUpperCase()}] ${a.title}`),
      transcript: messages.map(m => ({ speaker: m.sender === 'victim' ? 'Complainant' : 'NHAA System', text: m.text, time: m.timestamp })),
      disclaimer: 'AI decision-support only. Not a clinical diagnosis. High-risk cases require human review.'
    };
    const uri = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const a = document.createElement('a');
    a.href = uri;
    a.download = `NHAA_${caseId}_${Date.now()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setDl(true); setTimeout(() => setDl(false), 3000);
  };

  const copyText = () => {
    const t = fields.filter(f => f.v).map(f => `${f.k}: ${f.v}`).join('\n');
    navigator.clipboard?.writeText(`Case ${caseId}\nSVI: ${svi}/100 | Risk: ${riskLevel}\n\n${t}`);
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <FileText size={13} color="var(--text-3)" />
          <span className="section-label">{isHi ? 'AI-जनित केस सारांश' : 'AI-Generated Case Summary'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className={`risk-pill risk-${riskLevel}`} style={{ fontSize: 10 }}>{riskLevel}</div>
          {open ? <ChevronUp size={13} color="var(--text-4)" /> : <ChevronDown size={13} color="var(--text-4)" />}
        </div>
      </button>

      {open && (
        <div style={{ padding: '14px 18px' }}>
          {/* Metadata */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { Icon: Hash, val: caseId },
              { Icon: Clock, val: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
              { Icon: User, val: `${messages.length} exchanges` },
            ].map(({ Icon, val }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
                <Icon size={12} />
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Summary fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {fields.map(f => (
              <div key={f.k} style={{ padding: '10px 12px', background: '#FAFAFA', border: '1px solid var(--border-lt)', borderRadius: 9 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{f.k}</div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4 }}>{f.v || '—'}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={copyText} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isHi ? 'कॉपी करें' : 'Copy Summary'}
            </button>
            <button onClick={handleExport}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', fontSize: 12, fontWeight: 700,
                background: '#0B1E3D', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
                transition: 'background .15s'
              }}>
              {dl ? <><CheckCircle2 size={13} color="#6EE7B7" />{isHi ? 'एक्सपोर्ट हो गया' : 'Exported!'}</> : <><Download size={13} />{isHi ? 'एक्सपोर्ट' : 'Export Assessment'}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
