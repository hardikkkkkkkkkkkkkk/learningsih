import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, Trash2, Volume2, VolumeX, Sparkles, ChevronRight, User, Bot, Loader } from 'lucide-react';
import { speak, stopSpeaking, isTTSSupported, preloadVoices } from '../utils/speechSynthesis';

const SUGGESTIONS_EN = [
  "I feel unsafe right now.",
  "I want to report what happened.",
  "I need help understanding what to do next."
];
const SUGGESTIONS_HI = [
  "मुझे अभी डर लग रहा है।",
  "मैं जो हुआ वह रिपोर्ट करना चाहता/चाहती हूँ।",
  "मुझे समझ नहीं आ रहा आगे क्या करूं।"
];

export default function ChatPanel({ messages, onSendMessage, onClearChat, language, caseId, isAiActive, isTyping, aiError }) {
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [voiceErr, setVoiceErr] = useState('');
  const ttsOk = isTTSSupported();

  const endRef    = useRef(null);
  const inputRef  = useRef(null);
  const recogRef  = useRef(null);
  const prevLen   = useRef(messages.length);
  const isHi      = language === 'hi';
  const suggestions = isHi ? SUGGESTIONS_HI : SUGGESTIONS_EN;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
  useEffect(() => { if (ttsOk) preloadVoices(); }, [ttsOk]);

  // Auto-speak new assistant messages
  useEffect(() => {
    if (!autoSpeak || !ttsOk) { prevLen.current = messages.length; return; }
    if (messages.length <= prevLen.current) { prevLen.current = messages.length; return; }
    prevLen.current = messages.length;
    const last = messages[messages.length - 1];
    if (last?.sender === 'assistant' && last?.id !== 'init') {
      setSpeakingId(last.id);
      speak(last.text, language).catch(() => {}).finally(() => setSpeakingId(null));
    }
  }, [messages, autoSpeak, language, ttsOk]);

  // Speech recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    r.onresult = (e) => { setInput(p => p ? `${p} ${e.results[0][0].transcript}` : e.results[0][0].transcript); setRecording(false); };
    r.onerror = () => { setRecording(false); setVoiceErr(isHi ? 'माइक उपलब्ध नहीं।' : 'Microphone unavailable.'); setTimeout(() => setVoiceErr(''), 4000); };
    r.onend = () => setRecording(false);
    recogRef.current = r;
  }, [language, isHi]);

  const toggleRec = () => {
    if (recording) { try { recogRef.current?.stop(); } catch {} setRecording(false); }
    else { stopSpeaking(); setSpeakingId(null); setRecording(true); try { recogRef.current?.start(); } catch { setTimeout(() => setRecording(false), 2000); } }
  };

  const handleSpeak = useCallback((msg) => {
    if (speakingId === msg.id) { stopSpeaking(); setSpeakingId(null); }
    else { stopSpeaking(); setSpeakingId(msg.id); speak(msg.text, language).catch(() => {}).finally(() => setSpeakingId(null)); }
  }, [speakingId, language]);

  const handleSend = (e) => {
    e?.preventDefault();
    const t = input.trim();
    if (!t || isTyping) return;
    stopSpeaking(); setSpeakingId(null);
    onSendMessage(t);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const hasMessages = messages.some(m => m.sender === 'victim');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>

      {/* ── Panel Header ── */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={15} color="var(--blue)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
              {isHi ? 'AI सहायता सहायक' : 'AI Support Assistant'}
            </span>
            {isAiActive && (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '2px 7px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={9} />Gemini AI
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>
            {isHi ? 'निजी बातचीत • मानव निगरानी सक्रिय' : 'Private conversational support · Human oversight enabled'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {ttsOk && (
            <button
              onClick={() => { setAutoSpeak(v => { if (v) stopSpeaking(); return !v; }); }}
              className="btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '5px 10px', background: autoSpeak ? '#EFF6FF' : '', borderColor: autoSpeak ? '#BFDBFE' : '', color: autoSpeak ? '#1D4ED8' : '' }}
              data-tip={isHi ? 'ऑटो आवाज़' : 'Auto-speak replies'}
            >
              {autoSpeak ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span className="hide-sm">{isHi ? 'आवाज़' : 'Voice'}</span>
            </button>
          )}
          <button onClick={onClearChat} className="btn-icon" style={{ width: 30, height: 30 }} data-tip={isHi ? 'बातचीत साफ़ करें' : 'Clear conversation'}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {aiError && (
        <div style={{ padding: '8px 16px', background: '#FEF2F2', borderBottom: '1px solid #FECACA', fontSize: 11, color: '#991B1B', display: 'flex', gap: 6, flexShrink: 0 }}>
          <span>⚠</span><span>{aiError}</span>
        </div>
      )}
      {voiceErr && (
        <div style={{ padding: '6px 16px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', fontSize: 11, color: '#92400E', flexShrink: 0 }}>{voiceErr}</div>
      )}

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 16, background: '#FAFAFA' }}>

        {/* Empty state */}
        {!hasMessages && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '30px 0' }} className="anim-in">
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#EFF6FF', border: '1px solid #BFDBFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Bot size={22} color="var(--blue)" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>
                {isHi ? 'NHAA AI सहायता' : 'AI-Assisted Victim Support'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 280, textAlign: 'center', lineHeight: 1.5 }}>
                {isHi ? 'जो हुआ वह हमें बताइए। आप पूरा समय ले सकते हैं।' : 'Begin by telling us what happened. You can take your time.'}
              </p>
            </div>

            {/* Suggestion chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 340 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => setInput(s)}
                  style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: '#FFFFFF', border: '1px solid var(--border)',
                    color: 'var(--text-2)', fontSize: 13, cursor: 'pointer',
                    textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-xs)', transition: 'all .15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#BFDBFE'; e.currentTarget.style.background = '#EFF6FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}
                >
                  <span>{s}</span>
                  <ChevronRight size={14} color="var(--text-4)" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation messages */}
        {messages.map((msg, idx) => {
          const isAsst = msg.sender === 'assistant';
          const isSpkg = speakingId === msg.id;
          if (msg.id === 'init' && hasMessages) return null; // hide init after conversation starts
          
          return (
            <div key={msg.id || idx}
              style={{ display: 'flex', gap: 10, justifyContent: isAsst ? 'flex-start' : 'flex-end' }}
              className="anim-up"
            >
              {isAsst && (
                <div style={{
                  width: 30, height: 30, borderRadius: 9, background: '#0B1E3D',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2
                }}>
                  <Bot size={14} color="#93C5FD" />
                </div>
              )}

              <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 5, alignItems: isAsst ? 'flex-start' : 'flex-end' }}>
                {/* Metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isAsst ? 'var(--blue)' : 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {isAsst ? (isHi ? 'NHAA सहायक' : 'NHAA Assistant') : (isHi ? 'शिकायतकर्ता' : 'Complainant')}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-4)' }}>{msg.timestamp}</span>
                  {isAsst && msg.aiGenerated && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1px 6px', borderRadius: 99 }}>AI</span>
                  )}
                </div>

                {/* Bubble */}
                <div className={isAsst ? 'msg-assistant' : 'msg-victim'}
                  style={{ padding: '10px 14px', lineHeight: 1.6, fontSize: 13 }}>
                  {msg.text}
                </div>

                {/* TTS button for assistant */}
                {isAsst && ttsOk && msg.id !== 'init' && (
                  <button onClick={() => handleSpeak(msg)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 10, fontWeight: 600, padding: '3px 8px',
                      borderRadius: 6, cursor: 'pointer', border: '1px solid',
                      transition: 'all .15s',
                      background: isSpkg ? '#EFF6FF' : '#fff',
                      borderColor: isSpkg ? '#BFDBFE' : 'var(--border)',
                      color: isSpkg ? '#1D4ED8' : 'var(--text-4)'
                    }}>
                    {isSpkg ? <VolumeX size={11} /> : <Volume2 size={11} />}
                    {isSpkg
                      ? <><span>{isHi ? 'रोकें' : 'Stop'}</span><span className="wave-bar w1" style={{ height: 8 }} /><span className="wave-bar w2" style={{ height: 8 }} /><span className="wave-bar w3" style={{ height: 8 }} /></>
                      : <span>{isHi ? 'सुनें' : 'Listen'}</span>
                    }
                  </button>
                )}
              </div>

              {!isAsst && (
                <div style={{
                  width: 30, height: 30, borderRadius: 9, background: '#374151',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2
                }}>
                  <User size={14} color="#D1D5DB" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', gap: 10 }} className="anim-up">
            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#0B1E3D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Loader size={14} color="#93C5FD" className="anim-spin" />
            </div>
            <div className="msg-assistant" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '.04em' }}>NHAA Assistant</span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <div className="dot" /><div className="dot" /><div className="dot" />
                <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 4 }}>
                  {isAiActive ? (isHi ? 'Gemini AI सोच रहा है…' : 'Gemini AI is responding…') : (isHi ? 'उत्तर तैयार हो रहा है…' : 'Preparing response…')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* ── Input Area ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', background: '#fff', flexShrink: 0 }}>
        {recording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 12px', background: '#FEF2F2', borderRadius: 8, fontSize: 11, color: '#991B1B' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626' }} className="anim-blink" />
            <span style={{ fontWeight: 600 }}>{isHi ? 'सुन रहा है…' : 'Listening…'}</span>
          </div>
        )}

        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={toggleRec}
            className="btn-ghost"
            style={{
              width: 40, height: 40, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, border: '1px solid',
              background: recording ? '#FEF2F2' : '',
              borderColor: recording ? '#FCA5A5' : 'var(--border)',
              color: recording ? '#DC2626' : 'var(--text-3)'
            }}
          >
            {recording ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isHi ? 'जो हुआ वह बताइए। आप पूरा समय ले सकते हैं…' : 'Tell us what happened. You can take your time…'}
            className="field"
            style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
          />

          <button type="submit" disabled={!input.trim() || isTyping}
            className="btn-primary"
            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isTyping ? <Loader size={16} className="anim-spin" /> : <Send size={15} />}
          </button>
        </form>
      </div>
    </div>
  );
}
