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
  const [lang, setLang]         = useState('en');
  const [scenarioId, setScId]   = useState(null);
  const [caseId, setCaseId]     = useState(() => newCaseId());
  const [messages, setMessages] = useState(() => makeWelcome('en'));
  const [assessment, setAssess] = useState(() => getDefaultAssessment('en'));
  const [isTyping, setTyping]   = useState(false);
  const [aiError, setAiErr]     = useState('');
  const [geminiHealth, setGeminiHealth] = useState({ checked: false, ok: false });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nhaa_gemini_key') || '');

  const isBusy      = useRef(false);   
  const messagesRef = useRef(messages);
  const langRef     = useRef(lang);
  const aiActiveRef = useRef(geminiHealth.ok);
  const apiKeyRef   = useRef(apiKey);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { aiActiveRef.current = geminiHealth.ok || !!apiKey; }, [geminiHealth.ok, apiKey]);
  useEffect(() => { 
    apiKeyRef.current = apiKey; 
    localStorage.setItem('nhaa_gemini_key', apiKey);
  }, [apiKey]);

  // Check backend health on mount
  useEffect(() => {
    checkGeminiHealth().then(status => {
      setGeminiHealth({ checked: true, ok: status.geminiConfigured && status.connection === 'ok' });
    });
  }, []);

  const isAiActive = geminiHealth.ok || !!apiKey;

  /**
   * Generate an AI or fallback response and append it to messages.
   * This MUST be called OUTSIDE any setMessages updater to avoid double-call.
   */
  const getResponse = useCallback(async (msgs, language, assess) => {
    setTyping(true);
    setAiErr('');

    let responded = false;

    // ── Try Gemini AI ──
    if (aiActiveRef.current) {
      try {
        console.log('[NHAA AI] Calling Gemini via structured backend...');
        const result = await callGeminiAI(msgs, language, apiKeyRef.current, assess); 
        
        if (result && result.message && result.message.trim()) {
          console.log(`[NHAA AI] Gemini responded. Intent: ${result.intent}`);
          
          setMessages(curr => [
            ...curr,
            {
              id: `ai-${Date.now()}`,
              sender: 'assistant',
              text: result.message.trim(),
              timestamp: now(),
              aiGenerated: true
            }
          ]);
          responded = true;
        }
      } catch (err) {
        console.error('[NHAA AI] Backend error:', err.message);
        
        // Disable AI completely only if authentication fails
        if (err.message === 'AUTHENTICATION_ERROR') {
          setGeminiHealth({ checked: true, ok: false });
        }
        
        // Instead of silent failure, ALWAYS append a visible, non-destructive error message 
        // to the chat so the user is not left frozen.
        let fallbackMsg = language === 'hi' 
          ? 'माफ़ करें, मुझे उत्तर देने में तकनीकी समस्या हो रही है। कृपया अपना संदेश फिर से भेजने का प्रयास करें।' 
          : "I'm having trouble responding right now. Your message is still here. Please try again in a moment.";

        if (err.message === 'TIMEOUT' || err.message === 'OVERLOADED') {
          fallbackMsg = language === 'hi'
            ? 'सिस्टम में अभी अत्यधिक ट्रैफ़िक है। कृपया कुछ सेकंड प्रतीक्षा करें और पुनः प्रयास करें।'
            : 'The system is currently overloaded with high traffic. Please wait a moment and try again.';
        } else if (err.message === 'EMPTY_RESPONSE') {
           fallbackMsg = language === 'hi'
            ? 'क्षमा करें, मेरा पिछला संदेश ठीक से नहीं बन पाया। क्या आप मुझे थोड़ा और बता सकते हैं?'
            : 'I apologize, my response was interrupted. Could you tell me a little more?';
        } else if (err.message === 'QUOTA_EXCEEDED') {
           fallbackMsg = language === 'hi'
            ? 'क्षमा करें, आपकी दैनिक API सीमा पार हो गई है। कृपया बाद में प्रयास करें।'
            : 'Your daily API quota limit has been exceeded. Please try again later or check your API plan.';
        }
        
        setMessages(curr => [
          ...curr,
          {
            id: `sys-err-${Date.now()}`,
            sender: 'assistant',
            text: `[System]: ${fallbackMsg}`,
            timestamp: now(),
            aiGenerated: false
          }
        ]);
        responded = true; // We handled it with an inline message, no need for the deterministic fallback here
      }
    }

    // ── Deterministic Fallback (only if AI is completely disabled) ──
    if (!responded) {
      await new Promise(r => setTimeout(r, 650));
      const lastUserText = [...msgs].reverse().find(m => m.sender === 'victim')?.text || '';
      const text = generateTraumaInformedResponse(lastUserText, assess, language);
      setMessages(curr => [
        ...curr,
        {
          id: `fb-${Date.now()}`,
          sender: 'assistant',
          text,
          timestamp: now(),
          aiGenerated: false
        }
      ]);
    }

    setTyping(false);
    isBusy.current = false;
  }, []); // No deps — reads from refs or params

  /**
   * Handle user sending a message.
   * Uses ref-based approach to avoid stale closure + double-call.
   */
  const handleSend = useCallback((text) => {
    // Prevent double-call from React StrictMode or rapid sends
    if (isBusy.current) return;
    isBusy.current = true;

    const currentMessages = messagesRef.current;
    const currentLang     = langRef.current;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'victim',
      text,
      timestamp: now()
    };

    const nextMessages = [...currentMessages, userMsg];

    // 1. Add user message to state
    setMessages(nextMessages);
    messagesRef.current = nextMessages;

    // 2. Compute assessment (sync, fast)
    const assess = analyzeConversation(nextMessages, currentLang);
    setAssess(assess);

    // 3. Fire AI/fallback response — OUTSIDE setMessages
    getResponse(nextMessages, currentLang, assess);
  }, [getResponse]);

  // ── Load demo scenario ──
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

  // ── Reset session ──
  const handleReset = useCallback(() => {
    isBusy.current = false;
    setScId(null); setCaseId(newCaseId());
    const welcome = makeWelcome(langRef.current);
    setMessages(welcome); messagesRef.current = welcome;
    setAssess(getDefaultAssessment(langRef.current));
    setTyping(false); setAiErr('');
  }, []);

  // ── Toggle language ──
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
        
        {/* Dynamic API Key Configuration Prompt */}
        {(!geminiHealth.ok || apiKey) && (
          <ApiKeyPrompt 
            apiKey={apiKey} 
            onSetKey={setApiKey} 
            language={lang} 
          />
        )}
        <DemoSelector currentScenarioId={scenarioId} onSelectScenario={handleScenario} language={lang} />

        {/* Two-panel workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 16, alignItems: 'start' }}>
          {/* LEFT: Chat */}
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

          {/* RIGHT: Assessment */}
          <div style={{ paddingBottom: 24 }}>
            <AssessmentPanel
              assessment={assessment}
              caseId={caseId}
              messages={messages}
              language={lang}
            />
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
