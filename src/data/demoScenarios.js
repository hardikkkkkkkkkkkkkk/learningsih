/**
 * Pre-configured Demo Scenarios for SIH26093 Prototype Evaluation
 */

export const DEMO_SCENARIOS = [
  {
    id: 'low_status_inquiry',
    title: 'Scenario 1: Low Risk (Status Inquiry)',
    titleHi: 'परिदृश्य 1: सामान्य जोखिम (शिकायत स्थिति)',
    category: 'LOW',
    expectedSVI: '15 – 25',
    language: 'en',
    description: 'Complainant inquiring about a previously registered case status with no distress markers.',
    messages: [
      {
        id: 'm1',
        sender: 'assistant',
        text: 'Welcome to the NHAA support system. Please tell us what happened in your own words. You can take your time.',
        timestamp: '10:00 AM'
      },
      {
        id: 'm2',
        sender: 'victim',
        text: 'I submitted my complaint last week and wanted to know the current status. My acknowledgment number is NHAA-2026-9081.',
        timestamp: '10:01 AM'
      }
    ]
  },
  {
    id: 'moderate_workplace_stress',
    title: 'Scenario 2: Moderate Risk (Workplace Harassment)',
    titleHi: 'परिदृश्य 2: मध्यम जोखिम (कार्यस्थल प्रताड़ना)',
    category: 'MODERATE',
    expectedSVI: '35 – 50',
    language: 'en',
    description: 'Complainant experiencing repeated workplace hostility, anxiety, and sleeplessness.',
    messages: [
      {
        id: 'm1',
        sender: 'assistant',
        text: 'Welcome to the NHAA support system. Please tell us what happened in your own words. You can take your time.',
        timestamp: '10:00 AM'
      },
      {
        id: 'm2',
        sender: 'victim',
        text: 'My supervisor has been repeatedly pressuring and humiliating me daily. I am feeling extremely anxious, worried, and cannot sleep properly at night.',
        timestamp: '10:02 AM'
      }
    ]
  },
  {
    id: 'high_village_threat',
    title: 'Scenario 3: High Risk (Village Threats & Violence)',
    titleHi: 'परिदृश्य 3: उच्च जोखिम (धमकी एवं पारिवारिक खतरा)',
    category: 'HIGH',
    expectedSVI: '65 – 80',
    language: 'en',
    description: 'Physical assault and ongoing threats targeting complainant and family members.',
    messages: [
      {
        id: 'm1',
        sender: 'assistant',
        text: 'Welcome to the NHAA support system. Please tell us what happened in your own words. You can take your time.',
        timestamp: '10:00 AM'
      },
      {
        id: 'm2',
        sender: 'victim',
        text: 'People from my village have threatened my family several times. They attacked me earlier and I am afraid they will come again to harm my children.',
        timestamp: '10:04 AM'
      }
    ]
  },
  {
    id: 'critical_imminent_danger',
    title: 'Scenario 4: Critical Risk (Imminent Physical Crisis)',
    titleHi: 'परिदृश्य 4: गंभीर आपातकाल (तात्कालिक सुरक्षा खतरा)',
    category: 'CRITICAL',
    expectedSVI: '85 – 100',
    language: 'en',
    description: 'Active life-threatening situation with armed perpetrators outside the residence.',
    messages: [
      {
        id: 'm1',
        sender: 'assistant',
        text: 'Welcome to the NHAA support system. Please tell us what happened in your own words. You can take your time.',
        timestamp: '10:00 AM'
      },
      {
        id: 'm2',
        sender: 'victim',
        text: 'Please help me immediately! They are outside my house right now with weapons, banging on the door and threatening to kill us. I am terrified and hiding inside!',
        timestamp: '10:06 AM'
      }
    ]
  },
  {
    id: 'hindi_high_risk',
    title: 'Scenario 5: Hindi High Risk (धमकी एवं हमला)',
    titleHi: 'परिदृश्य 5: हिंदी - उच्च जोखिम (धमकी एवं हमला)',
    category: 'HIGH',
    expectedSVI: '70 – 85',
    language: 'hi',
    description: 'Hindi conversation with threat and violence markers against complainant and family.',
    messages: [
      {
        id: 'm1',
        sender: 'assistant',
        text: 'एनएचएए (NHAA) सहायता प्रणाली में आपका स्वागत है। कृपया अपने शब्दों में बताएं कि क्या हुआ है। आप पूरा समय ले सकते हैं।',
        timestamp: '10:00 AM'
      },
      {
        id: 'm2',
        sender: 'victim',
        text: 'गांव के कुछ लोगों ने मुझे बुरी तरह मारा और मेरे परिवार को जान से मारने की धमकी दी है। मुझे बहुत डर लग रहा है कि वे दोबारा हमला करेंगे।',
        timestamp: '10:05 AM'
      }
    ]
  }
];
