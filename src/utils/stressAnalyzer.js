/**
 * AI Stress & Trauma Assessment Engine for NHAA (14566)
 * Prototype Implementation for Smart India Hackathon 2026 (SIH26093)
 * 
 * NOTE FOR PRODUCTION DEPLOYMENT:
 * This prototype utilizes a deterministic, explainable rule-and-keyword scoring engine.
 * A full production system requires:
 *  1. Validated multilingual fine-tuned transformer models (IndicBERT / fine-tuned LLMs for 22 scheduled Indian languages).
 *  2. Domain-specific clinical evaluation by psychiatric and victim assistance experts.
 *  3. Rigorous fairness and bias mitigation testing across demographics.
 *  4. Strict adherence to the Digital Personal Data Protection (DPDP) Act, 2023.
 *  5. Continuous human-in-the-loop oversight (Strict Decision-Support Paradigm).
 */

export const INDICATOR_DEFINITIONS = {
  immediate_danger: {
    id: 'immediate_danger',
    name: 'Immediate Safety Risk',
    nameHi: 'तात्कालिक सुरक्षा जोखिम',
    weight: 35,
    severity: 'critical',
    keywords: [
      'right now', 'outside my house', 'following me', 'coming to attack', 'weapon',
      'knife', 'gun', 'break in', 'banging on door', 'surrounded', 'danger right now',
      'hurry', 'emergency', 'lock the door', 'hiding',
      'अभी', 'तुरंत', 'घर के बाहर', 'पीछा कर रहे', 'हथियार', 'बंदूक', 'चाकू', 'दरवाजा तोड़', 'घेरा', 'छुपा हुआ'
    ]
  },
  self_harm: {
    id: 'self_harm',
    name: 'Self-Harm Concern',
    nameHi: 'आत्म-क्षति की आशंका',
    weight: 40,
    severity: 'critical',
    keywords: [
      'want to die', 'end my life', 'kill myself', 'no reason to live', 'cannot live anymore',
      'suicide', 'ending it all', 'better off dead',
      'मरना चाहता', 'जान दे दूंगा', 'खुदकुशी', 'जीने का मन नहीं', 'जीवन समाप्त'
    ]
  },
  threat: {
    id: 'threat',
    name: 'Threat & Intimidation',
    nameHi: 'धमकी एवं भय',
    weight: 18,
    severity: 'high',
    keywords: [
      'threat', 'threaten', 'threatened', 'threatening', 'kill', 'will kill', 'warned',
      'destroy', 'finish me', 'revenge', 'dire consequences',
      'धमकी', 'मार देंगे', 'जान से मारने', 'बर्बाद', 'धमका रहे', 'खत्म कर'
    ]
  },
  violence: {
    id: 'violence',
    name: 'Physical Violence / Assault',
    nameHi: 'शारीरिक हिंसा / हमला',
    weight: 18,
    severity: 'high',
    keywords: [
      'beat', 'beaten', 'attacked', 'assaulted', 'violence', 'hit', 'struck', 'bleeding',
      'injured', 'bruised', 'physical attack', 'slapped', 'pushed',
      'मारा', 'पीटा', 'हमला', 'हमला किया', 'हिंसा', 'खून', 'चोट', 'मारा-पीटा'
    ]
  },
  family_danger: {
    id: 'family_danger',
    name: 'Family Danger',
    nameHi: 'परिवार के लिए खतरा',
    weight: 12,
    severity: 'high',
    keywords: [
      'family', 'children', 'child', 'kids', 'mother', 'father', 'daughter', 'son', 'wife', 'husband', 'sister', 'brother', 'parents',
      'परिवार', 'बच्चे', 'बच्चों', 'मां', 'माता', 'पिता', 'बेटी', 'बेटा', 'पत्नी', 'पति', 'बहन', 'भाई'
    ]
  },
  fear: {
    id: 'fear',
    name: 'Fear & Terror',
    nameHi: 'भय एवं दहशत',
    weight: 12,
    severity: 'medium',
    keywords: [
      'scared', 'afraid', 'frightened', 'terrified', 'panic', 'trembling', 'fear', 'dread', 'terror', 'horror',
      'डर', 'डर लग रहा', 'भय', 'दहशत', 'कांप', 'सहम'
    ]
  },
  anxiety: {
    id: 'anxiety',
    name: 'Anxiety & Panic',
    nameHi: 'चिंता एवं घबराहट',
    weight: 10,
    severity: 'medium',
    keywords: [
      'worried', 'panic', 'nervous', 'cannot sleep', 'cant sleep', 'anxious', 'restless', 'stress', 'nightmare', 'shaking',
      'चिंता', 'घबराहट', 'नींद नहीं', 'बेचैनी', 'तनाव'
    ]
  },
  repeated_harassment: {
    id: 'repeated_harassment',
    name: 'Repeated Harassment',
    nameHi: 'लगातार प्रताड़ना',
    weight: 8,
    severity: 'medium',
    keywords: [
      'repeatedly', 'every day', 'daily', 'again and again', 'continuously', 'stalking', 'months', 'weeks', 'multiple times', 'frequent',
      'बार-बार', 'रोज', 'लगातार', 'महीनों से', 'कई बार', 'पीछा करना', 'परेशान'
    ]
  },
  hopelessness: {
    id: 'hopelessness',
    name: 'Hopelessness',
    nameHi: 'निराशा / असहायता',
    weight: 12,
    severity: 'high',
    keywords: [
      'hopeless', 'cannot continue', 'no way out', 'helpless', 'lost hope', 'no one listens', 'nobody cares',
      'निराश', 'कोई रास्ता नहीं', 'लाचार', 'असहाय', 'उम्मीद खत्म', 'कोई नहीं सुनता'
    ]
  },
  social_isolation: {
    id: 'social_isolation',
    name: 'Social Isolation / Boycott',
    nameHi: 'सामाजिक बहिष्कार / अलगाव',
    weight: 8,
    severity: 'medium',
    keywords: [
      'nobody to help', 'alone', 'isolated', 'boycott', 'boycotted', 'village ousted', 'community ban', 'cut off',
      'अकेला', 'कोई मदद नहीं', 'बहिष्कार', 'गांव से निकाला', 'अलग-थलग'
    ]
  },
  severe_distress: {
    id: 'severe_distress',
    name: 'Severe Emotional Distress',
    nameHi: 'गंभीर मानसिक तनाव',
    weight: 12,
    severity: 'high',
    keywords: [
      'breaking down', 'crying constantly', 'cannot breathe', 'traumatized', 'mental torture', 'unbearable', 'suffering',
      'टूट गया', 'रो रहा हूँ', 'सांस नहीं आ रही', 'सदमा', 'मानसिक प्रताड़ना', 'असहनीय'
    ]
  },
  intimidation: {
    id: 'intimidation',
    name: 'Intimidation & Coercion',
    nameHi: 'दबाव एवं ब्लैकमेल',
    weight: 8,
    severity: 'medium',
    keywords: [
      'blackmail', 'extortion', 'forcing me', 'pressuring', 'coerced', 'withdrawing complaint', 'compromise force',
      'ब्लैकमेल', 'जबरदस्ती', 'दबाव', 'शिकायत वापस लेने', 'समझौता करने'
    ]
  }
};

/**
 * Main Deterministic Analyzer Function
 * @param {Array<{sender: string, text: string}>} messages 
 * @param {string} language - 'en' or 'hi'
 * @returns {object} Assessment metrics & explainability payload
 */
export function analyzeConversation(messages, language = 'en') {
  const victimTexts = messages
    .filter(m => m.sender === 'victim' || m.sender === 'user')
    .map(m => m.text.toLowerCase());

  if (victimTexts.length === 0) {
    return getDefaultAssessment(language);
  }

  const fullText = victimTexts.join(' ');
  const detectedIndicators = [];
  const matchedKeywords = {};
  let totalIndicatorScore = 0;

  // Keyword & Pattern Matching
  for (const [key, config] of Object.entries(INDICATOR_DEFINITIONS)) {
    const matched = [];
    
    // Special composite rule for family danger: Requires family term + threat/attack/fear context
    if (key === 'family_danger') {
      const hasFamilyTerm = config.keywords.some(kw => fullText.includes(kw.toLowerCase()));
      const hasThreatOrViolence = [
        ...INDICATOR_DEFINITIONS.threat.keywords,
        ...INDICATOR_DEFINITIONS.violence.keywords,
        ...INDICATOR_DEFINITIONS.fear.keywords
      ].some(kw => fullText.includes(kw.toLowerCase()));

      if (hasFamilyTerm && hasThreatOrViolence) {
        matched.push(language === 'hi' ? 'परिवार सुरक्षा' : 'family safety concern');
      }
    } else {
      for (const kw of config.keywords) {
        if (fullText.includes(kw.toLowerCase())) {
          matched.push(kw);
        }
      }
    }

    if (matched.length > 0) {
      detectedIndicators.push({
        id: config.id,
        name: language === 'hi' ? config.nameHi : config.name,
        severity: config.severity,
        weight: config.weight,
        matchedTerms: [...new Set(matched)].slice(0, 3)
      });
      matchedKeywords[key] = [...new Set(matched)];
      totalIndicatorScore += config.weight;
    }
  }

  // SVI Calculation (Base: 10, capped at 100)
  const baseSVI = 12;
  let rawSVI = baseSVI + totalIndicatorScore;

  // Add contextual multipliers
  if (matchedKeywords['immediate_danger']) {
    rawSVI += 15;
  }
  if (matchedKeywords['self_harm']) {
    rawSVI = Math.max(rawSVI, 88);
  }

  const svi = Math.min(100, Math.max(10, Math.round(rawSVI)));

  // Risk Classification
  let riskLevel = 'LOW';
  let riskColor = 'green';
  if (svi >= 76) {
    riskLevel = 'CRITICAL';
    riskColor = 'red';
  } else if (svi >= 51) {
    riskLevel = 'HIGH';
    riskColor = 'orange';
  } else if (svi >= 26) {
    riskLevel = 'MODERATE';
    riskColor = 'amber';
  }

  // Emotion Breakdown Percentages
  const emotionScores = calculateEmotions(fullText, matchedKeywords, svi);

  // Explainable AI Reasoning (Evidence-based bullet points)
  const explainableReasons = generateXAIReasons(detectedIndicators, matchedKeywords, svi, language);

  // Operator Recommended Interventions
  const recommendedActions = getRecommendedActions(riskLevel, detectedIndicators, language);

  // Structured Case Summary
  const caseSummary = generateStructuredSummary(riskLevel, detectedIndicators, emotionScores, language);

  return {
    svi,
    riskLevel,
    riskColor,
    detectedIndicators,
    emotions: emotionScores,
    explainableReasons,
    recommendedActions,
    caseSummary,
    analyzedMessageCount: victimTexts.length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculates Fear, Anxiety, Sadness, Distress % with smooth keyword weighting
 */
function calculateEmotions(text, matches, svi) {
  let fearScore = 15;
  let anxietyScore = 20;
  let sadnessScore = 12;
  let distressScore = 18;

  if (matches['fear']) fearScore += 35 + (matches['fear'].length * 8);
  if (matches['threat']) fearScore += 25;
  if (matches['immediate_danger']) fearScore += 25;
  if (matches['family_danger']) fearScore += 15;

  if (matches['anxiety']) anxietyScore += 40 + (matches['anxiety'].length * 6);
  if (matches['repeated_harassment']) anxietyScore += 20;
  if (matches['intimidation']) anxietyScore += 15;

  if (matches['hopelessness']) sadnessScore += 45;
  if (matches['social_isolation']) sadnessScore += 25;
  if (matches['severe_distress']) sadnessScore += 20;

  if (matches['violence']) distressScore += 40;
  if (matches['severe_distress']) distressScore += 30;
  if (matches['immediate_danger']) distressScore += 20;
  if (matches['self_harm']) distressScore += 40;

  // Scale relative to overall SVI baseline
  const scale = svi / 70;
  fearScore = Math.min(98, Math.max(10, Math.round(fearScore * (0.6 + 0.4 * scale))));
  anxietyScore = Math.min(95, Math.max(15, Math.round(anxietyScore * (0.6 + 0.4 * scale))));
  sadnessScore = Math.min(92, Math.max(8, Math.round(sadnessScore * (0.6 + 0.4 * scale))));
  distressScore = Math.min(99, Math.max(12, Math.round(distressScore * (0.6 + 0.4 * scale))));

  return {
    fear: fearScore,
    anxiety: anxietyScore,
    sadness: sadnessScore,
    distress: distressScore
  };
}

/**
 * Generates transparent XAI reasons without clinical psychiatric labeling
 */
function generateXAIReasons(indicators, matches, svi, language) {
  const reasons = [];
  const isHi = language === 'hi';

  if (indicators.length === 0 || svi <= 25) {
    reasons.push(
      isHi 
        ? "बातचीत में कोई तत्काल खतरा या गंभीर आघात संकेत नहीं मिले हैं; शिकायत की सामान्य स्थिति का उल्लेख है।" 
        : "No immediate physical threat or severe trauma indicators identified; complainant mentions administrative status/inquiry."
    );
    reasons.push(
      isHi 
        ? "तनाव सूचकांक (SVI) सामान्य सीमा में बना हुआ है।" 
        : "Stress vulnerability score remains within normative baseline threshold."
    );
    return reasons;
  }

  if (matches['immediate_danger']) {
    reasons.push(
      isHi
        ? `सक्रिय सुरक्षा जोखिम: त्वरित आपातकालीन शब्दों (${matches['immediate_danger'].slice(0, 2).join(', ')}) का उपयोग हुआ है।`
        : `Active Safety Alert: Complainant explicitly references imminent danger terms ("${matches['immediate_danger'].slice(0, 2).join('", "')}").`
    );
  }

  if (matches['self_harm']) {
    reasons.push(
      isHi
        ? "अत्यधिक मानसिक संकट: आत्म-हानि या जीवन समाप्ति से संबंधित संवेदनशील शब्द दर्ज किए गए।"
        : "Extreme Distress: Sensitive indicators indicating acute vulnerability / self-harm concern flagged."
    );
  }

  if (matches['threat'] || matches['violence']) {
    const terms = [...(matches['threat'] || []), ...(matches['violence'] || [])].slice(0, 2).join('", "');
    reasons.push(
      isHi
        ? `शारीरिक सुरक्षा व धमकी संकेत: हिंसा या जान से मारने की धमकियों का उल्लेख पाया गया।`
        : `Threat & Physical Safety: Explicit mentions of physical aggression or direct intimidation ("${terms}").`
    );
  }

  if (matches['family_danger']) {
    reasons.push(
      isHi
        ? "पारिवारिक सुरक्षा चिंता: शिकायतकर्ता ने अपने परिवार/बच्चों पर खतरे की आशंका व्यक्त की है।"
        : "Collateral Vulnerability: Expressed fear of retaliation or danger extending to family/children."
    );
  }

  if (matches['repeated_harassment'] || matches['intimidation']) {
    reasons.push(
      isHi
        ? "लगातार प्रताड़ना: शिकायतकर्ता पर बार-बार दबाव या सामाजिक उत्पीड़न का संकेत मिला है।"
        : "Persistent Pattern: Multi-incident timeline indicating sustained harassment or coercion."
    );
  }

  if (matches['hopelessness'] || matches['social_isolation']) {
    reasons.push(
      isHi
        ? "गहरा आघात एवं असहायता: सहायता न मिलने और सामाजिक अलगाव का संकेत है।"
        : "High Vulnerability: Markers of systemic isolation and perceived lack of local support."
    );
  }

  // Ensure 2–4 concise points
  return reasons.slice(0, 4);
}

/**
 * Returns prioritized operator guidelines based on risk level
 */
function getRecommendedActions(riskLevel, indicators, language) {
  const isHi = language === 'hi';

  if (riskLevel === 'CRITICAL') {
    return [
      {
        id: 'c1',
        title: isHi ? 'प्रशिक्षित मानव ऑपरेटर को तत्काल ट्रांसफर करें' : 'Immediately transfer to trained human senior operator',
        priority: 'critical',
        detail: isHi ? 'संवाद को केवल चैटबॉट के भरोसे न छोड़ें।' : 'Do not leave complainant relying solely on automated responses.'
      },
      {
        id: 'c2',
        title: isHi ? 'शिकायतकर्ता की तात्कालिक भौतिक सुरक्षा सत्यापित करें' : "Verify victim's immediate physical safety & location",
        priority: 'critical',
        detail: isHi ? 'पूछें क्या वे अभी सुरक्षित स्थान पर हैं।' : 'Calmly inquire if they are in a sheltered/safe place right now.'
      },
      {
        id: 'c3',
        title: isHi ? 'प्राधिकृत NHAA आपातकालीन एस्केलेशन प्रोटोकॉल सक्रिय करें' : 'Initiate emergency escalation according to authorized NHAA protocol',
        priority: 'critical',
        detail: isHi ? 'प्रोटोकॉल के अनुसार वरिष्ठ पर्यवेक्षक को अलर्ट करें।' : 'Flag case for priority intervention with jurisdictional liaison.'
      },
      {
        id: 'c4',
        title: isHi ? 'आपातकालीन संकट हेल्पलाइन / परामर्शदाता सहायता प्रदान करें' : 'Provide emergency counselling & tele-mental health support link',
        priority: 'high',
        detail: isHi ? 'सहानुभूतिपूर्ण और शांत संवाद बनाए रखें।' : 'Maintain trauma-informed empathetic de-escalation.'
      }
    ];
  }

  if (riskLevel === 'HIGH') {
    return [
      {
        id: 'h1',
        title: isHi ? 'मानव परामर्शदाता / ऑपरेटर समीक्षा को प्राथमिकता दें' : 'Prioritize human counsellor/operator assignment',
        priority: 'high',
        detail: isHi ? 'केस को प्राथमिकता कतार में रखें।' : 'Assign case to designated fast-track assistance queue.'
      },
      {
        id: 'h2',
        title: isHi ? 'शिकायतकर्ता की तात्कालिक भौतिक सुरक्षा की पुष्टि करें' : "Confirm complainant's immediate physical security",
        priority: 'high',
        detail: isHi ? 'सुरक्षा योजना और निकटतम सहायता केंद्र की जानकारी साझा करें।' : 'Verify if perpetrators are in physical proximity.'
      },
      {
        id: 'h3',
        title: isHi ? 'त्वरित समीक्षा हेतु शिकायत को उच्च प्राथमिकता पर फ्लैग करें' : 'Flag complaint for urgent NHAA nodal officer review',
        priority: 'high',
        detail: isHi ? 'NHAA प्रक्रिया के तहत कानूनी/सुरक्षा सहायता का आकलन करें।' : 'Evaluate need for law-enforcement liaison per standard guidelines.'
      },
      {
        id: 'h4',
        title: isHi ? 'आघात-संवेदनशील अनुवर्ती संवाद जारी रखें' : 'Continue trauma-informed structured questioning',
        priority: 'medium',
        detail: isHi ? 'दबाव डाले बिना आवश्यक विवरण दर्ज करें।' : 'Document critical incident timestamps without re-traumatizing victim.'
      }
    ];
  }

  if (riskLevel === 'MODERATE') {
    return [
      {
        id: 'm1',
        title: isHi ? 'आघात-संवेदनशील सहानुभूतिपूर्ण संवाद जारी रखें' : 'Continue trauma-informed questioning & active listening',
        priority: 'medium',
        detail: isHi ? 'पीड़ित को अपनी बात रखने का पूरा समय दें।' : 'Offer reassurance and allow complainant to explain at their own pace.'
      },
      {
        id: 'm2',
        title: isHi ? 'मानव सहायता अधिकारी से बात करने का विकल्प प्रदान करें' : 'Recommend human support specialist callback',
        priority: 'medium',
        detail: isHi ? 'आवश्यकता पड़ने पर कॉल ट्रांसफर की सुविधा दें।' : 'Inform complainant of available psychological and legal aid cells.'
      },
      {
        id: 'm3',
        title: isHi ? 'संवेदनशीलता संकेतकों की निरंतर निगरानी करें' : 'Monitor conversation for risk escalation',
        priority: 'low',
        detail: isHi ? 'नए संदेशों में खतरे के संकेतों पर नजर रखें।' : 'Real-time engine will trigger instant alerts if higher stress markers appear.'
      }
    ];
  }

  // LOW
  return [
    {
      id: 'l1',
      title: isHi ? 'मानक शिकायत निवारण सहायता जारी रखें' : 'Continue standard grievance assistance',
      priority: 'low',
      detail: isHi ? 'केस ट्रैकिंग और संबंधित पोर्टल स्थिति साझा करें।' : 'Provide formal case registration and acknowledgment details.'
    },
    {
      id: 'l2',
      title: isHi ? 'केस ट्रैकिंग व संबंधित जानकारी प्रदान करें' : 'Provide case tracking & portal reference details',
      priority: 'low',
      detail: isHi ? 'शिकायत संख्या और अगले प्रशासनिक कदम बताएं।' : 'Offer direct link to check real-time status on NHAA integrated portal.'
    },
    {
      id: 'l3',
      title: isHi ? 'संवाद की पृष्ठभूमि निगरानी बनाए रखें' : 'Maintain background conversational monitoring',
      priority: 'low',
      detail: isHi ? 'सिस्टम सामान्य स्थिति में सक्रिय रहेगा।' : 'Decision support engine remains active for any context shift.'
    }
  ];
}

/**
 * Generates safe trauma-informed assistant replies
 */
export function generateTraumaInformedResponse(userText, assessment, language = 'en') {
  const isHi = language === 'hi';
  const { riskLevel, detectedIndicators } = assessment;
  const hasThreat = detectedIndicators.some(i => i.id === 'threat' || i.id === 'violence');
  const hasImmediate = detectedIndicators.some(i => i.id === 'immediate_danger');
  const hasSelfHarm = detectedIndicators.some(i => i.id === 'self_harm');

  if (hasSelfHarm) {
    return isHi
      ? "हम आपकी बात को बहुत गंभीरता से सुन रहे हैं। कृपया जानें कि आप अकेले नहीं हैं और आपकी सुरक्षा हमारे लिए सबसे महत्वपूर्ण है। मैं तुरंत एक वरिष्ठ मानवीय सहायता अधिकारी को आपके साथ जोड़ रहा हूँ।"
      : "I hear how much pain you are going through, and please know that you are not alone. Your safety and well-being are our highest priority. I am connecting you with a trained support counselor right now.";
  }

  if (hasImmediate) {
    return isHi
      ? "मैंने आपकी बात दर्ज कर ली है। क्या आप अभी किसी सुरक्षित कमरे या स्थान पर हैं? हमारी टीम आपके मामले को सर्वोच्च प्राथमिकता दे रही है।"
      : "Thank you for telling me. Are you currently somewhere safe or sheltered? Our support team is prioritizing your case for urgent assistance.";
  }

  if (riskLevel === 'HIGH' || hasThreat) {
    return isHi
      ? "मैं आपकी स्थिति और चिंता को पूरी तरह समझ रहा हूँ। मैंने यह महत्वपूर्ण विवरण सहायता अधिकारी के लिए विशेष रूप से रेखांकित कर दिया है। क्या आपके पास कोई सुरक्षित संपर्क नंबर उपलब्ध है?"
      : "I understand how difficult this is. I have noted this and made sure all details are highlighted for our support officer. Is anyone threatening you or your family at this exact moment?";
  }

  if (riskLevel === 'MODERATE') {
    return isHi
      ? "धन्यवाद यह जानकारी साझा करने के लिए। हम इस मामले में आपकी पूरी मदद करेंगे। कृपया बिना किसी संकोच के अपनी बात विस्तार से बताएं।"
      : "Thank you for sharing this. We are here to support you through this process. Please take your time and let us know any further details.";
  }

  // Standard/Low response
  return isHi
    ? "नमस्ते। आपकी शिकायत की स्थिति देखने के लिए हम तैयार हैं। कृपया अपना संदर्भ नंबर या जो भी जानकारी आप जोड़ना चाहते हैं, साझा करें।"
    : "I have noted that. I can help you track your complaint status or provide additional documentation guidance for your case.";
}

/**
 * Generates a structured case summary
 */
function generateStructuredSummary(riskLevel, indicators, emotions, language) {
  const isHi = language === 'hi';

  let primaryConcern = isHi ? 'शिकायत स्थिति पूछताछ' : 'General Grievance & Status Inquiry';
  let safetyConcern = isHi ? 'कोई सक्रिय खतरा नहीं' : 'No immediate safety hazard reported';
  let nextStep = isHi ? 'मानक पोर्टल ट्रैकिंग' : 'Standard portal tracking & documentation';

  if (indicators.some(i => i.id === 'immediate_danger')) {
    primaryConcern = isHi ? 'तात्कालिक शारीरिक खतरा / आपातकाल' : 'Imminent Physical Threat & Safety Crisis';
    safetyConcern = isHi ? 'गंभीर तात्कालिक जोखिम — तत्काल मानवीय हस्तक्षेप आवश्यक' : 'Acute immediate risk — direct human verification needed';
    nextStep = isHi ? 'वरिष्ठ अधिकारी को तत्काल आपातकालीन एस्केलेशन' : 'Immediate emergency protocol escalation & supervisor handoff';
  } else if (indicators.some(i => i.id === 'self_harm')) {
    primaryConcern = isHi ? 'गंभीर मानसिक संकट / आत्म-हानि चिंता' : 'Acute Emotional Crisis / Self-Harm Concern';
    safetyConcern = isHi ? 'मनोवैज्ञानिक सुरक्षा निगरानी आवश्यक' : 'Critical psychological support required';
    nextStep = isHi ? 'टेली-मेंटल हेल्थ काउंसलर से त्वरित संपर्क' : 'Immediate tele-mental health counsellor engagement';
  } else if (riskLevel === 'HIGH') {
    primaryConcern = isHi ? 'धमकियां, हिंसा एवं पारिवारिक सुरक्षा जोखिम' : 'Intimidation, Threats & Family Danger';
    safetyConcern = isHi ? 'शिकायतकर्ता / परिजनों के लिए संभावित खतरा' : 'Potential danger to complainant and dependents';
    nextStep = isHi ? 'प्राथमिकता कतार में मानव परामर्शदाता को केस आवंटन' : 'Fast-track assignment to specialized NHAA case officer';
  } else if (riskLevel === 'MODERATE') {
    primaryConcern = isHi ? 'मानसिक तनाव एवं लगातार उत्पीड़न' : 'Heightened Anxiety & Sustained Distress';
    safetyConcern = isHi ? 'सतर्क निगरानी अनुशंसित' : 'Vulnerability monitoring recommended';
    nextStep = isHi ? 'सहायता अधिकारी द्वारा संपर्क का विकल्प' : 'Trauma-informed officer callback option';
  }

  let emotionalSummary = isHi ? 'संतुलित' : 'Stable / Low Distress';
  if (emotions.fear > 70 || emotions.distress > 70) {
    emotionalSummary = isHi 
      ? `उच्च भय (${emotions.fear}%) एवं तनाव (${emotions.distress}%)` 
      : `High Fear (${emotions.fear}%) & High Distress (${emotions.distress}%)`;
  } else if (emotions.anxiety > 50) {
    emotionalSummary = isHi 
      ? `मध्यम चिंता (${emotions.anxiety}%)` 
      : `Elevated Anxiety (${emotions.anxiety}%)`;
  }

  return {
    primaryConcern,
    emotionalSummary,
    safetyConcern,
    systemPriority: riskLevel,
    recommendedNextStep: nextStep
  };
}

/**
 * Default clean assessment state
 */
export function getDefaultAssessment(language = 'en') {
  return {
    svi: 14,
    riskLevel: 'LOW',
    riskColor: 'green',
    detectedIndicators: [],
    emotions: {
      fear: 12,
      anxiety: 18,
      sadness: 10,
      distress: 15
    },
    explainableReasons: [
      language === 'hi' 
        ? "संवाद आरंभिक स्थिति में है; कोई संवेदनशीलता संकेतक दर्ज नहीं हुआ।" 
        : "Initial session state; no elevated trauma or threat indicators detected."
    ],
    recommendedActions: getRecommendedActions('LOW', [], language),
    caseSummary: {
      primaryConcern: language === 'hi' ? 'आरंभिक सत्र' : 'Initial Session Greeting',
      emotionalSummary: language === 'hi' ? 'सामान्य' : 'Baseline / Low',
      safetyConcern: language === 'hi' ? 'कोई खतरा नहीं' : 'No threat reported',
      systemPriority: 'LOW',
      recommendedNextStep: language === 'hi' ? 'शिकायत विवरण दर्ज करें' : 'Record complainant statement'
    },
    analyzedMessageCount: 0,
    timestamp: new Date().toISOString()
  };
}
