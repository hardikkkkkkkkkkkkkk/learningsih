import React from 'react';
import { AlertTriangle, AlertOctagon, ShieldCheck, Info } from 'lucide-react';

export default function RiskBadge({ riskLevel = 'LOW', language = 'en' }) {
  const isHi = language === 'hi';

  if (riskLevel === 'CRITICAL') {
    return (
      <div style={{
        padding: '14px 18px',
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderLeft: '3px solid #DC2626',
        borderRadius: 10,
        display: 'flex', gap: 12, alignItems: 'flex-start'
      }}>
        <AlertOctagon size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '.04em' }}>
              {isHi ? 'गंभीर जोखिम' : 'Critical Risk'}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, background: '#DC2626', color: '#fff', padding: '2px 8px', borderRadius: 99, letterSpacing: '.06em' }}>
              {isHi ? 'तत्काल हस्तक्षेप आवश्यक' : 'IMMEDIATE HUMAN INTERVENTION REQUIRED'}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#B91C1C', marginTop: 4, lineHeight: 1.5 }}>
            {isHi
              ? 'शिकायतकर्ता को केवल AI पर न छोड़ें। तत्काल प्रशिक्षित वरिष्ठ ऑपरेटर को केस ट्रांसफर करें।'
              : 'Do not leave complainant relying solely on automated responses. Immediately transfer to a trained senior operator and activate escalation protocol.'}
          </p>
        </div>
      </div>
    );
  }

  if (riskLevel === 'HIGH') {
    return (
      <div style={{
        padding: '12px 16px',
        background: '#FFF7ED',
        border: '1px solid #FED7AA',
        borderLeft: '3px solid #EA580C',
        borderRadius: 10,
        display: 'flex', gap: 10, alignItems: 'flex-start'
      }}>
        <AlertTriangle size={16} color="#EA580C" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#C2410C' }}>
              {isHi ? 'उच्च जोखिम स्तर' : 'High Risk Level'}
            </span>
            <span style={{ fontSize: 10, background: '#FFEDD5', color: '#C2410C', border: '1px solid #FED7AA', padding: '1px 8px', borderRadius: 99, fontWeight: 700 }}>
              {isHi ? 'मानव ऑपरेटर प्राथमिकता' : 'OPERATOR PRIORITY'}
            </span>
          </div>
          <p style={{ fontSize: 11, color: '#92400E', marginTop: 3, lineHeight: 1.4 }}>
            {isHi ? 'खतरे या हिंसा के संकेत मिले हैं। केस को तत्काल मानवीय समीक्षा के लिए फ्लैग करें।' : 'Elevated threat or danger signals detected. Flag complaint for immediate officer review.'}
          </p>
        </div>
      </div>
    );
  }

  if (riskLevel === 'MODERATE') {
    return (
      <div style={{
        padding: '10px 14px',
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderLeft: '3px solid #D97706',
        borderRadius: 10,
        display: 'flex', gap: 10, alignItems: 'center'
      }}>
        <Info size={15} color="#D97706" style={{ flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#92400E' }}>
            {isHi ? 'मध्यम संवेदनशीलता' : 'Moderate Vulnerability'}
          </span>
          <span style={{ fontSize: 11, color: '#B45309', marginLeft: 8 }}>
            {isHi ? '— मानव सहायता का विकल्प प्रदान करें' : '— Offer human support option'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '10px 14px',
      background: '#ECFDF5',
      border: '1px solid #A7F3D0',
      borderLeft: '3px solid #059669',
      borderRadius: 10,
      display: 'flex', gap: 10, alignItems: 'center'
    }}>
      <ShieldCheck size={15} color="#059669" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: '#065F46' }}>
        {isHi ? 'सामान्य स्तर — मानक प्रक्रिया जारी रखें' : 'Low Risk — Continue standard grievance assistance'}
      </span>
    </div>
  );
}
