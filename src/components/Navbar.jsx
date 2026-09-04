import React from 'react';
import { Shield, Phone, RotateCcw } from 'lucide-react';

export default function Navbar({ language, onToggleLanguage, onResetSession, caseId, isOnline }) {
  const isHi = language === 'hi';

  return (
    <header style={{ background: 'linear-gradient(180deg,#081A36 0%,#0B1E3D 100%)', borderBottom: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 28px rgba(7,20,43,.16)' }} className="sticky top-0 z-50">
      <div style={{ height: 2, display: 'flex' }}>
        <div style={{ flex: 1, background: '#FF9933' }} /><div style={{ flex: 1, background: '#FFFFFF' }} /><div style={{ flex: 1, background: '#138808' }} />
      </div>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px' }} className="nhaa-nav-inner flex items-center justify-between h-16 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,rgba(255,255,255,.13),rgba(255,255,255,.04))', border: '1px solid rgba(255,255,255,.14)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08)' }}>
            <Shield size={18} color="#F59E0B" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#FFFFFF', fontWeight: 850, fontSize: 16, letterSpacing: '-0.025em' }}>NHAA</span>
              <span style={{ color: 'rgba(255,255,255,.22)', fontSize: 13 }}>·</span>
              <span className="hide-nav-mobile" style={{ color: 'rgba(255,255,255,.62)', fontSize: 12, fontWeight: 500 }}>{isHi ? 'एआई-सहायक पीड़ित सहायता' : 'AI-Assisted Victim Support'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 8px', background: 'rgba(5,150,105,.14)', border: '1px solid rgba(16,185,129,.24)', borderRadius: 99 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', animation: 'pulseOnline 2.5s ease-in-out infinite' }} className="anim-online" />
                <span style={{ color: '#6EE7B7', fontSize: 9, fontWeight: 750, letterSpacing: '.07em' }}>{isHi ? 'सिस्टम ऑनलाइन' : 'SYSTEM ONLINE'}</span>
              </div>
              <span className="hide-nav-mobile" style={{ color: 'rgba(255,255,255,.2)', fontSize: 10 }}>SIH26093 Prototype</span>
            </div>
          </div>
        </div>

        <div className="nhaa-nav-controls" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div className="hide-nav-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9 }}>
            <Phone size={12} color="#F59E0B" /><span style={{ color: '#FDE68A', fontSize: 12, fontWeight: 750 }}>14566</span><span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>{isHi ? 'हेल्पलाइन' : 'Helpline'}</span>
          </div>
          <div className="hide-nav-mobile" style={{ padding: '7px 12px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9 }}>
            <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}>Case </span>
            <span style={{ color: 'rgba(255,255,255,.88)', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{caseId}</span>
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 9, overflow: 'hidden' }}>
            {['en', 'hi'].map(l => <button key={l} onClick={() => onToggleLanguage(l)} style={{ padding: '7px 11px', fontSize: 11, fontWeight: 750, cursor: 'pointer', border: 'none', background: language === l ? 'rgba(27,79,189,.9)' : 'transparent', color: language === l ? '#fff' : 'rgba(255,255,255,.45)', transition: 'all .15s' }}>{l === 'en' ? 'EN' : 'हिं'}</button>)}
          </div>
          <button onClick={onResetSession} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }} data-tip={isHi ? 'सत्र रीसेट करें' : 'Reset session'}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
      <style>{`@media(max-width:600px){.nhaa-nav-inner{height:60px!important;padding:0 12px!important}.hide-nav-mobile{display:none!important}.nhaa-nav-controls{gap:6px!important}.nhaa-nav-controls button{min-width:34px}.nhaa-nav-inner .flex{gap:9px!important}}`}</style>
    </header>
  );
}
