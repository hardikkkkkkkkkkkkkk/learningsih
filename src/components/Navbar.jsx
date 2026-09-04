import React from 'react';
import { Shield, Phone, LifeBuoy, RotateCcw, Globe } from 'lucide-react';

export default function Navbar({ language, onToggleLanguage, onResetSession, caseId, isOnline }) {
  const isHi = language === 'hi';

  return (
    <header style={{ background: '#0B1E3D', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="sticky top-0 z-50">
      {/* Tricolor stripe */}
      <div style={{ height: 2, display: 'flex' }}>
        <div style={{ flex: 1, background: '#FF9933' }} />
        <div style={{ flex: 1, background: '#FFFFFF' }} />
        <div style={{ flex: 1, background: '#138808' }} />
      </div>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px' }}
        className="flex items-center justify-between h-14 gap-4">

        {/* Left — Brand */}
        <div className="flex items-center gap-3">
          <div style={{
            width: 34, height: 34,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={16} color="#F59E0B" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>NHAA</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>·</span>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500 }}>
                {isHi ? 'एआई-सहायक पीड़ित सहायता' : 'AI-Assisted Victim Support'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '2px 7px',
                background: 'rgba(5,150,105,0.15)',
                border: '1px solid rgba(5,150,105,0.3)',
                borderRadius: 99
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#10B981',
                  animation: 'pulseOnline 2.5s ease-in-out infinite'
                }} className="anim-online" />
                <span style={{ color: '#6EE7B7', fontSize: 10, fontWeight: 600, letterSpacing: '.06em' }}>
                  {isHi ? 'सिस्टम ऑनलाइन' : 'SYSTEM ONLINE'}
                </span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>
                SIH26093 Prototype
              </span>
            </div>
          </div>
        </div>

        {/* Right — Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Helpline */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8
          }}>
            <Phone size={12} color="#F59E0B" />
            <span style={{ color: '#FDE68A', fontSize: 12, fontWeight: 700 }}>14566</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{isHi ? 'हेल्पलाइन' : 'Helpline'}</span>
          </div>

          {/* Case ID */}
          <div style={{
            padding: '5px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8
          }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}>Case </span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{caseId}</span>
          </div>

          {/* Language */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            overflow: 'hidden'
          }}>
            {['en', 'hi'].map(l => (
              <button key={l} onClick={() => onToggleLanguage(l)}
                style={{
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: language === l ? 'rgba(27,79,189,0.8)' : 'transparent',
                  color: language === l ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                  transition: 'all .15s'
                }}>
                {l === 'en' ? 'EN' : 'हिं'}
              </button>
            ))}
          </div>

          {/* Reset */}
          <button onClick={onResetSession}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s'
            }}
            data-tip={isHi ? 'सत्र रीसेट करें' : 'Reset session'}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
