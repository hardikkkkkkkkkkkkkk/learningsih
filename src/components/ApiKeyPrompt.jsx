import React, { useState } from 'react';
import { Key, Eye, EyeOff, Sparkles, CheckCircle2, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { validateKeyFormat } from '../utils/geminiClient';

export default function ApiKeyPrompt({ apiKey, onSetKey, language = 'en' }) {
  const [draft, setDraft] = useState(apiKey || '');
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(!!apiKey);
  const isHi = language === 'hi';

  const validation = draft.trim() ? validateKeyFormat(draft.trim()) : null;
  const hasFormatError = validation && !validation.valid && draft.trim().length > 5;

  const handleSave = () => {
    const k = draft.trim();
    const v = validateKeyFormat(k);
    if (!v.valid) return; // Don't save invalid keys
    onSetKey(k);
    setDismissed(true);
  };

  if (dismissed && apiKey) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 14px', marginBottom: 14,
        background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={14} color="#059669" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#065F46' }}>
            {isHi ? 'Gemini AI सक्रिय' : 'Gemini AI Active'}
          </span>
          <span style={{ fontSize: 10, color: '#059669', fontFamily: 'monospace', background: '#D1FAE5', padding: '2px 7px', borderRadius: 99 }}>
            gemini-3.5-flash
          </span>
        </div>
        <button onClick={() => { onSetKey(''); setDismissed(false); setDraft(''); }}
          style={{ fontSize: 11, color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {isHi ? 'बदलें' : 'Change key'}
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} color="var(--blue)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
            {isHi ? 'Gemini AI — निःशुल्क एकीकरण' : 'Gemini AI Integration — Free Tier'}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, background: '#EFF6FF', color: 'var(--blue)', border: '1px solid #BFDBFE', padding: '2px 7px', borderRadius: 99 }}>
            FREE
          </span>
        </div>
        {apiKey && <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)' }}><X size={14} /></button>}
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Steps */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
            {isHi
              ? 'वास्तविक AI उत्तरों के लिए अपना निःशुल्क Google Gemini API key दर्ज करें।'
              : 'Enter your free Google Gemini API key for live AI responses. Without it, the system uses built-in rule-based responses.'}
          </p>

          {[
            { n: 1, text: isHi ? 'aistudio.google.com/apikey खोलें' : 'Visit aistudio.google.com/apikey', link: 'https://aistudio.google.com/apikey' },
            { n: 2, text: isHi ? '"Create API Key" पर क्लिक करें (30 सेकंड, कोई क्रेडिट कार्ड नहीं)' : '"Create API Key" — takes 30 seconds, no credit card' },
            { n: 3, text: isHi ? 'Key "AIzaSy..." या "AQ." से शुरू होती है — नीचे paste करें' : 'Key starts with "AIzaSy..." or "AQ." — paste it below' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#EFF6FF', border: '1px solid #BFDBFE', color: 'var(--blue)', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{s.n}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.45 }}>
                {s.text}
                {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4, color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 2 }}><ExternalLink size={10} /></a>}
              </span>
            </div>
          ))}

          {/* Key format warning */}
          {hasFormatError && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, padding: '8px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8 }}>
              <AlertTriangle size={13} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 11, color: '#991B1B', lineHeight: 1.45 }}>
                <strong>{isHi ? 'अमान्य key format.' : 'Invalid key format.'}</strong>{' '}
                {isHi
                  ? 'Gemini API key "AIzaSy..." या "AQ." से शुरू होती है।'
                  : 'Invalid key format. Gemini keys start with "AIzaSy" or "AQ." — get one free at aistudio.google.com/apikey.'}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 5 }}>
              {isHi ? 'Gemini API Key' : 'API Key'}
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={14} color="var(--text-4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={show ? 'text' : 'password'}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="AIzaSy... or AQ..."
                className="field"
                style={{ width: '100%', padding: '9px 36px 9px 34px', fontSize: 12, fontFamily: 'monospace', borderColor: hasFormatError ? '#FCA5A5' : '' }}
              />
              <button type="button" onClick={() => setShow(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)' }}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button onClick={handleSave} disabled={!draft.trim() || hasFormatError}
            className="btn-primary"
            style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 13, width: '100%' }}>
            <CheckCircle2 size={14} />
            {isHi ? 'Gemini AI सक्रिय करें' : 'Activate Gemini AI'}
          </button>

          <button onClick={() => setDismissed(true)}
            style={{ fontSize: 11, color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>
            {isHi ? 'अभी नहीं — डिफ़ॉल्ट उत्तर उपयोग करें' : 'Skip — use built-in responses'}
          </button>
        </div>
      </div>
    </div>
  );
}
