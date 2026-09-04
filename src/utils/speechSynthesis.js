/**
 * Text-to-Speech utility — NHAA SIH26093
 * Prioritizes pleasant female voices in Hindi and English.
 */

let activeUtterance = null;

// Female voice name patterns to prioritize
const FEMALE_HINTS = [
  'female', 'woman', 'zira', 'samantha', 'hazel', 'susan',
  'heera', 'kalpana', 'veena', 'moira', 'tessa', 'karen',
  'victoria', 'fiona', 'google uk english female', 'google हिन्दी'
];

function pickVoice(language) {
  const voices = window.speechSynthesis?.getVoices() || [];
  if (!voices.length) return null;

  const isHi = language === 'hi';
  const langMatch = (v) => isHi
    ? (v.lang === 'hi-IN' || v.lang.startsWith('hi'))
    : (v.lang === 'en-IN' || v.lang === 'en-GB' || v.lang.startsWith('en'));

  // 1. Female + correct language
  let pick = voices.find(v => langMatch(v) && FEMALE_HINTS.some(h => v.name.toLowerCase().includes(h)));

  // 2. Google voice + correct language (usually good quality)
  if (!pick) pick = voices.find(v => langMatch(v) && v.name.toLowerCase().includes('google'));

  // 3. Any correct language voice
  if (!pick) pick = voices.find(v => langMatch(v));

  // 4. Any English voice as last resort
  if (!pick && !isHi) pick = voices.find(v => v.lang.startsWith('en'));

  return pick || null;
}

export function speak(text, language = 'en', options = {}) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) { reject(new Error('TTS not supported')); return; }

    stopSpeaking();

    const utt = new SpeechSynthesisUtterance(text);
    activeUtterance = utt;

    utt.lang   = language === 'hi' ? 'hi-IN' : 'en-IN';
    utt.rate   = options.rate   ?? 0.88;   // slightly slower = more calming
    utt.pitch  = options.pitch  ?? 1.10;   // slightly higher = more feminine/warm
    utt.volume = options.volume ?? 1;

    const voice = pickVoice(language);
    if (voice) utt.voice = voice;

    utt.onend   = () => { activeUtterance = null; resolve(); };
    utt.onerror = (e) => { activeUtterance = null; reject(e); };

    window.speechSynthesis.speak(utt);
  });
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
  activeUtterance = null;
}

export function isSpeaking() {
  return window.speechSynthesis?.speaking ?? false;
}

export function isTTSSupported() {
  return 'speechSynthesis' in window;
}

export function preloadVoices() {
  return new Promise((resolve) => {
    const v = window.speechSynthesis?.getVoices();
    if (v?.length) { resolve(v); return; }
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
    } else { resolve([]); }
  });
}
