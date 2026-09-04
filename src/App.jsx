import React, { useState, useCallback, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ChatPanel from './components/ChatPanel';
import AssessmentPanel from './components/AssessmentPanel';
import DemoSelector from './components/DemoSelector';
import PrivacyFooter from './components/PrivacyFooter';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import { analyzeConversation, generateTraumaInformedResponse, getDefaultAssessment } from './utils/stressAnalyzer';
import { callGeminiAI, checkGeminiHealth } from './utils/geminiClient';
import { DEMO_SCENARIOS } from './data/demoScenarios';

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const newCaseId = () => `NHAA-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;

const makeWelcome = (lang) => [{
  id: 'init',
  sender: 'assistant',
  text: lang === 'hi'
    ? 'एनएचएए सहायता प्रणाली में आपका स्वागत है। मैं आपकी बात ध्यान से और सहानुभूति के साथ सुनने के लिए यहाँ हूँ। कृपया अपने शब्दों में बताएं कि क्या हुआ है — कोई जल्दी नहीं है।'
    : 'Welcome to the NHAA support system. I\'m here to listen carefully and compassionately. Please take your time — tell us what happened in your own words. You are not alone.',
  timestamp: now(),
  aiGenerated: false
}];

export default function App() {
  const [lang, setLang] = useState('en');
  const [scenarioId, setScId] = useState(null);
  const [caseId, setCaseId] = useState(() => newCaseId());
  const [messages, setMessages] = useState(() => makeWelcome('en'));
  const [assessment, setAssess] = useState(() => getDefaultAssessment('en'));
  const [isTyping, setTyping] = useState(false);
  const [aiError, setAiErr] = useState('');
  const [geminiHealth, setGeminiHealth] = useState({ checked: false, ok: false });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nhaa_gemini_key') || '');

  const isBusy = useRef(false);
  const messagesRef = useRef(messages);
  const langRef = useRef(lang);
  const aiActiveRef = useRef(geminiHealth.ok || !!apiKey);
  const apiKeyRef = useRef(apiKey);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { aiActiveRef.current = geminiHealth.ok || !!apiKey; }, [geminiHealth.ok, apiKey]);
  useEffect(() => {
    apiKeyRef.current = apiKey;
    localStorage.setItem('nhaa_gemini_key', apiKey);
  }, [apiKey]);

  // Check the configured key on startup.
  useEffect(() => {
    checkGeminiHealth(apiKeyRef.current).then(status => {
      setGeminiHealth({ checked: true, ok: status.geminiConfigured && status.connection === 'ok' });
    });
  }, []);

  // Validate a newly entered key against the same backend endpoint used by chat.
  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    checkGeminiHealth(apiKey).then(status => {
      if (!cancelled) {
        setGeminiHealth({ checked: true, ok: status.geminiConfigured && status.connection === 'ok' });
        if (status.connection !== 'ok') {
          setAiErr(status.errorCode ? `${status.errorCode}: ${status.errorMessage || ''}`.trim() : 'Gemini connection failed');
        } else {
          setAiErr('');
        }
      }
    });
    return () => { cancelled = true; };
  }, [apiKey]);

  const isAiActive = geminiHealth.ok || !!apiKey;

  const getResponse = useCallback(async (msgs, language, assess) => {
    setTyping(true);
    setAiErr('');
    let responded = false;

    if (aiActiveRef.current) {
      try {
        console.log('[NHAA AI] Calling Gemini via structured backend...');
        const result = await callGeminiAI(msgs, language, apiKeyRef.current, assess);

        if (result?.message?.trim()) {
          setMessages(curr => [...curr, {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: result.message.trim(),
            timestamp: now(),
            aiGenerated: true
          }]);
          responded = true;
        }
      } catch (err) {
        const code = err.code || err.message || 'SERVER_ERROR';
        console.error('[NHAA AI] Backend error:', code, err.details || '');

        if (code === 'AUTHENTICATION_ERROR') {
          setGeminiHealth({ checked: true, ok: false });
        }

        // Never leave the complainant with a dead chat. Use the tested deterministic
        // trauma-informed responder whenever Gemini is unavailable.
        const lastUserText = [...msgs].reverse().find(m => m.sender === 'victim')?.text || '';
        const fallbackText = generateTraumaInformedResponse(lastUserText, assess, language);
        setMessages(curr => [...curr, {
          id: `fb-${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          timestamp: now(),
          aiGenerated: false
        }]);
        responded = true;

        // Keep the actual failure visible to the operator, not to the complainant.
        setAiErr(code === 'AUTHENTICATION_ERROR'
          ? 'Gemini API key rejected. Check the key/project in Google AI Studio.'
          : code === 'QUOTA_EXCEEDED'
            ? 'Gemini quota/rate limit reached. The safe fallback responder is active.'
            : code === 'MODEL_NOT_FOUND'
              ? 'Gemini model unavailable. The safe fallback responder is active.'
              : code === 'TIMEOUT'
                ? 'Gemini timed out. The safe fallback responder is active.'
                : `Gemini temporarily unavailable (${code}). The safe fallback responder is active.`
        );
      }
    }

    if (!responded) {
      await new Promise(r => setTimeout(r, 650));
      const lastUserText = [...msgs].reverse().find(m => m.sender === 'victim')?.text || '';
      const text = generateTraumaInformedResponse(lastUserText, assess, language);
      setMessages(curr => [...curr, {
        id: `fb-${Date.now()}`,
        sender: 'assistant',
        text,
        timestamp: now(),
        aiGenerated: false
      }]);
    }

    setTyping(false);
    isBusy.current = false;
  }, []);

  const handleSend = useCallback((text) => {
    if (isBusy.current) return;
    isBusy.current = true;

    const currentMessages = messagesRef.current;
    const currentLang = langRef.current;
    const userMsg = { id: `u-${Date.now()}`, sender: 'victim', text, timestamp: now() };
    const nextMessages = [...currentMessages, userMsg];

    setMessages(nextMessages);
    messagesRef.current = nextMessages;
    const assess = analyzeConversation(nextMessages, currentLang);
    setAssess(assess);
    getResponse(nextMessages, currentLang, assess);
  }, [getResponse]);

  const handleScenario = useCallback((id) => {
    if (isBusy.current) return;
    if (!id) { handleReset(); return; }
    const sc = DEMO_SCENARIOS.find(s => s.id === id);
    if (!sc) return;
    const l = sc.language || 'en';
    setScId(id); setLang(l); langRef.current = l;
    setMessages(sc.messages); messagesRef.current = sc.messages;
    setAssess(analyzeConversation(sc.messages, l));
    setTyping(false); setAiErr('');
  }, []);

  const handleReset = useCallback(() => {
    isBusy.current = false;
    setScId(null); setCaseId(newCaseId());
    const welcome = makeWelcome(langRef.current);
    setMessages(welcome); messagesRef.current = welcome;
    setAssess(getDefaultAssessment(langRef.current));
    setTyping(false); setAiErr('');
  }, []);

  const handleLang = useCallback((l) => {
    setLang(l); langRef.current = l;
    const curr = messagesRef.current;
    if (curr.length === 1 && curr[0].id === 'init') {
      const welcome = makeWelcome(l);
      setMessages(welcome); messagesRef.current = welcome;
    }
    setAssess(analyzeConversation(messagesRef.current, l));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar language={lang} onToggleLanguage={handleLang} onResetSession={handleReset} caseId={caseId} />
      <main style={{ flex: 1, maxWidth: 1440, width: '100%', margin: '0 auto', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
        {(!geminiHealth.ok || apiKey) && (
          <ApiKeyPrompt apiKey={apiKey} onSetKey={setApiKey} language={lang} />
        )}
        <DemoSelector currentScenarioId={scenarioId} onSelectScenario={handleScenario} language={lang} />
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 16, alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 80, height: 'calc(100vh - 290px)', minHeight: 560 }}>
            <ChatPanel
              messages={messages}
              onSendMessage={handleSend}
              onClearChat={handleReset}
              language={lang}
              onToggleLanguage={handleLang}
              caseId={caseId}
              isAiActive={isAiActive}
              isTyping={isTyping}
              aiError={aiError}
            />
          </div>
          <div style={{ paddingBottom: 24 }}>
            <AssessmentPanel assessment={assessment} caseId={caseId} messages={messages} language={lang} />
          </div>
        </div>
      </main>
      <PrivacyFooter language={lang} />
      <style>{`
        @media (max-width: 900px) {
          main > div:last-child { grid-template-columns: 1fr !important; }
          main > div:last-child > div:first-child { position: static !important; height: 500px !important; }
        }
        @media (max-width: 600px) {
          main { padding: 10px !important; }
          .hide-sm { display: none !important; }
        }
      `}</style>
    </div>
  );
}
