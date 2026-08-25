import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  English: {
    // Top Bar & Navigation
    appTitle: 'NYAYAMITRA',
    appHindiTitle: 'न्याय मित्र',
    tagline: 'National Citizen AI Legal Aid & Protection System',
    navMenuHeader: 'Navigation Menu',
    navChat: 'AI Legal Chat',
    navTemplates: 'Document Templates',
    navSos: 'SOS Emergency',
    logout: 'Logout',

    // Sidebar Legal Banner
    legalAidTitle: 'National Legal Aid',
    legalAidDesc: 'Legal aid is guaranteed under Article 39A of the Indian Constitution.',
    nalsaHelpline: 'NALSA Helpline: 15100',

    // Chatbot Component
    chatTitle: 'NyayaMitra Legal Assistant',
    chatSubtitle: 'Ask any legal question in plain Hindi or English. Get instant, comprehensive legal guidance under BNS, IPC, IT Act, Labour & Tenancy laws.',
    quickPromptsHeader: 'Common Citizen Legal Scenarios (Click to test):',
    quickPrompt1: 'Landlord refusing to refund ₹40,000 security deposit. What are my rights?',
    quickPrompt2: 'Lost ₹25,000 in online UPI QR scam. How to file cyber complaint?',
    quickPrompt3: 'Company withheld 2 months salary. What legal notice can I send?',
    quickPrompt4: 'Bought defective laptop & seller refuses warranty/refund.',
    chatPlaceholder: 'Describe your legal issue (e.g., landlord deposit dispute, salary recovery, cyber fraud)...',
    chatSendBtn: 'Send Legal Query',
    chatDisclaimer: 'NyayaMitra provides automated AI legal guidance. For court representation, consult a qualified lawyer or NALSA free legal counsel (15100).',
    welcomeMsg: 'Namaste! I am NyayaMitra, your AI legal aid assistant. Tell me about your legal issue or complaint in plain language.',

    // Templates Component
    templatesTitle: 'Legal Document & Petition Generator',
    templatesSubtitle: 'Select a legal document template below to generate an officially formatted PDF notice or petition.',
    searchPlaceholder: 'Search templates (e.g. RTI, Fraud)...',
    cardAction: 'Fill & Preview Document',
    backToTemplates: 'Back to Templates',
    generateBtn: 'Generate & Preview Document',
    previewTitle: 'Document Preview',
    previewSubtitle: 'Review your generated legal petition below. Click Download PDF to save or click X to cancel.',
    verifiedBanner: 'Official Document Format • Verified under National Legal Aid Standards',
    downloadPdfBtn: 'Download Official PDF',
    closeModalBtn: 'Close / Discard (X)',

    // SOS Emergency Page
    sosHeaderTitle: 'Emergency SOS & Location Helpline Desk',
    sosHeaderSubtitle: 'Immediate location-based assistance & verified helpline directory',
    currentLocation: 'Your Current Emergency Location',
    detectGpsBtn: 'Detect GPS Location',
    detectingGps: 'Detecting...',
    cityLabel: 'City / District',
    stateLabel: 'State',
    addressLabel: 'Area / Landmark',
    helplineDirTitle: 'Emergency Helpline Directory',
    clickToDial: 'Click any number to dial immediately',
    callNow: 'Call Now',
    sosBannerTitle: 'Need Immediate GPS Law Enforcement Broadcast?',
    sosBannerDesc: 'Use the floating "SOS Legal Alert" button at the bottom left to alert nearest police & DLSA panel advocate.',
    launchSosBtn: 'Launch SOS Alert',

    // Floating SOS Button
    floatingSosBtn: 'SOS LEGAL AID',
    sosModalTitle: 'EMERGENCY SOS LEGAL DISPATCH',
    sosModalSubtitle: 'Broadcast your live GPS coordinates & request urgent legal aid counsel'
  },

  Hindi: {
    // Top Bar & Navigation
    appTitle: 'न्याय मित्र',
    appHindiTitle: 'NYAYAMITRA',
    tagline: 'राष्ट्रीय नागरिक एआई कानूनी सहायता एवं सुरक्षा प्रणाली',
    navMenuHeader: 'नेविगेशन मेनू',
    navChat: 'एआई कानूनी सहायता चैट',
    navTemplates: 'कानूनी दस्तावेज और याचिकाएँ',
    navSos: 'एसओएस आपातकालीन सहायता',
    logout: 'लॉग आउट',

    // Sidebar Legal Banner
    legalAidTitle: 'राष्ट्रीय कानूनी सहायता',
    legalAidDesc: 'भारतीय संविधान के अनुच्छेद 39A के तहत मुफ्त कानूनी सहायता की गारंटी है।',
    nalsaHelpline: 'नालसा हेल्पलाइन: 15100',

    // Chatbot Component
    chatTitle: 'न्यायमित्र एआई कानूनी सहायक',
    chatSubtitle: 'अपनी किसी भी कानूनी समस्या के बारे में सरल हिंदी या अंग्रेजी में पूछें। भारतीय न्याय संहिता (BNS), आईटी अधिनियम, श्रम और उपभोक्ता कानूनों के तहत विस्तृत कानूनी सहायता प्राप्त करें।',
    quickPromptsHeader: 'आम नागरिक कानूनी स्थितियां (परीक्षण के लिए क्लिक करें):',
    quickPrompt1: 'मकान मालिक ₹40,000 का सिक्योरिटी डिपॉजिट वापस नहीं कर रहा है। मेरे क्या अधिकार हैं?',
    quickPrompt2: 'ऑनलाइन यूपीआई क्यूआर घोटाले में ₹25,000 का नुकसान हुआ। साइबर शिकायत कैसे दर्ज करें?',
    quickPrompt3: 'कंपनी ने 2 महीने का वेतन रोक रखा है। मैं कौन सा कानूनी नोटिस भेज सकता हूँ?',
    quickPrompt4: 'दोषपूर्ण लैपटॉप खरीदा और विक्रेता वारंटी/रिफंड से इनकार कर रहा है।',
    chatPlaceholder: 'अपनी कानूनी समस्या बताएं (जैसे मकान मालिक जमा विवाद, वेतन वसूली, साइबर धोखाधड़ी)...',
    chatSendBtn: 'कानूनी प्रश्न भेजें',
    chatDisclaimer: 'न्यायमित्र स्वचालित एआई कानूनी मार्गदर्शन प्रदान करता है। अदालत में प्रतिनिधित्व के लिए, योग्य वकील या नालसा मुफ्त कानूनी वकील (15100) से परामर्श लें।',
    welcomeMsg: 'नमस्ते! मैं न्यायमित्र हूँ, आपका एआई कानूनी सहायता सहायक। मुझे अपनी कानूनी समस्या या शिकायत के बारे में सरल भाषा में बताएं।',

    // Templates Component
    templatesTitle: 'कानूनी दस्तावेज एवं याचिका जनरेटर',
    templatesSubtitle: 'आधिकारिक रूप से तैयार पीडीएफ नोटिस या याचिका जनरेट करने के लिए नीचे एक कानूनी दस्तावेज टेम्पलेट चुनें।',
    searchPlaceholder: 'टेम्पलेट खोजें (जैसे आरटीआई, धोखाधड़ी)...',
    cardAction: 'फॉर्म भरें और पूर्वावलोकन देखें',
    backToTemplates: 'टेम्पलेट्स पर वापस जाएं',
    generateBtn: 'दस्तावेज़ जनरेट करें और पूर्वावलोकन देखें',
    previewTitle: 'दस्तावेज़ पूर्वावलोकन',
    previewSubtitle: 'नीचे अपनी जनरेट की गई कानूनी याचिका की समीक्षा करें। सहेजने के लिए पीडीएफ डाउनलोड पर क्लिक करें या रद्द करने के लिए X पर क्लिक करें।',
    verifiedBanner: 'आधिकारिक कानूनी प्रारूप • राष्ट्रीय कानूनी सहायता मानकों के तहत सत्यापित',
    downloadPdfBtn: 'आधिकारिक पीडीएफ डाउनलोड करें',
    closeModalBtn: 'बंद करें / रद्द करें (X)',

    // SOS Emergency Page
    sosHeaderTitle: 'आपातकालीन एसओएस और स्थान हेल्पलाइन डेस्क',
    sosHeaderSubtitle: 'तत्काल स्थान-आधारित सहायता और सत्यापित हेल्पलाइन निर्देशिका',
    currentLocation: 'आपका वर्तमान आपातकालीन स्थान',
    detectGpsBtn: 'जीपीएस स्थान का पता लगाएं',
    detectingGps: 'पता लगाया जा रहा है...',
    cityLabel: 'शहर / जिला',
    stateLabel: 'राज्य',
    addressLabel: 'क्षेत्र / लैंडमार्क',
    helplineDirTitle: 'आपातकालीन हेल्पलाइन निर्देशिका',
    clickToDial: 'तुरंत कॉल करने के लिए किसी भी नंबर पर क्लिक करें',
    callNow: 'अभी कॉल करें',
    sosBannerTitle: 'क्या आपको तत्काल जीपीएस पुलिस सहायता की आवश्यकता है?',
    sosBannerDesc: 'निकटतम पुलिस और जिला कानूनी सेवा प्राधिकरण के वकील को सचेत करने के लिए नीचे बाईं ओर "एसओएस कानूनी सहायता" बटन का उपयोग करें।',
    launchSosBtn: 'एसओएस अलर्ट भेजें',

    // Floating SOS Button
    floatingSosBtn: 'एसओएस कानूनी सहायता',
    sosModalTitle: 'आपातकालीन एसओएस कानूनी सहायता अलर्ट',
    sosModalSubtitle: 'अपना लाइव जीपीएस स्थान भेजें और तत्काल कानूनी सहायता का अनुरोध करें'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('English');

  const t = (key) => {
    const langDict = translations[language] || translations.English;
    return langDict[key] || translations.English[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
