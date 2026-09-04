import React from 'react';
import { Bot, UserCheck, Lock, AlertCircle } from 'lucide-react';

export default function PrivacyFooter({ language = 'en' }) {
  const isHi = language === 'hi';

  return (
    <footer style={{ marginTop: 20, borderTop: '1px solid var(--border)', background: '#fff', padding: '20px 24px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: Bot,       title: isHi ? 'AI निर्णय समर्थन' : 'AI Decision Support',    sub: isHi ? 'पूरी तरह प्रतिस्थापन नहीं' : 'Augments, never replaces human judgment' },
            { icon: UserCheck, title: isHi ? 'मानव निगरानी'     : 'Human Oversight',         sub: isHi ? 'उच्च जोखिम = अनिवार्य मानव समीक्षा' : 'All high-risk cases require trained officer review' },
            { icon: Lock,      title: isHi ? 'गोपनीयता-जागरूक'  : 'Privacy-Aware Design',    sub: isHi ? 'DPDP Act 2023 संगत प्रोटोटाइप' : 'DPDP Act 2023 aligned prototype' },
          ].map(b => {
            const Icon = b.icon;
            return (
              <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} color="var(--blue)" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)' }}>{b.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-4)' }}>{b.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 9 }}>
          <AlertCircle size={14} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>
            <strong>{isHi ? 'वैधानिक अस्वीकरण: ' : 'Disclaimer: '}</strong>
            {isHi
              ? 'एआई-जनित भेद्यता मूल्यांकन केवल ऑपरेटर निर्णय-समर्थन हेतु है — यह किसी भी प्रकार का नैदानिक, चिकित्सीय या मनोवैज्ञानिक निदान नहीं है। उच्च एवं गंभीर जोखिम वाले सभी मामलों में प्रशिक्षित मानव ऑपरेटर की अनिवार्य समीक्षा आवश्यक है।'
              : 'AI-generated vulnerability assessment is decision-support only and does not constitute a medical, psychiatric, or psychological diagnosis. All high-risk and critical-risk cases require immediate trained human operator review per NHAA protocols.'}
          </p>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 11, color: 'var(--text-4)' }}>
          <span>NHAA 14566 · National Helpline Against Atrocities · Integrated Support Portal</span>
          <span style={{ fontWeight: 600 }}>Smart India Hackathon 2026 · Problem Statement SIH26093</span>
        </div>
      </div>
    </footer>
  );
}
