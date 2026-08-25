import axios from 'axios'
import Groq from 'groq-sdk'
import { GoogleGenAI } from '@google/genai'

const categories = [
  'cyber_fraud',
  'harassment',
  'property',
  'employment',
  'domestic',
  'consumer',
  'other',
]
const model = 'openai/gpt-oss-20b'

let groqClient
let geminiClient

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  groqClient ??= new Groq({ apiKey: process.env.GROQ_API_KEY })
  return groqClient
}

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY
  if (!key || key === 'your_gemini_api_key_here' || key.trim() === '') {
    return null
  }
  geminiClient ??= new GoogleGenAI({ apiKey: key.trim() })
  return geminiClient
}

function getText(response) {
  return response.choices?.[0]?.message?.content?.trim() || ''
}

function parseCategory(rawText) {
  const normalizedText = rawText.toLowerCase()
  const jsonStart = normalizedText.indexOf('{')
  const jsonEnd = normalizedText.lastIndexOf('}')

  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    try {
      const parsed = JSON.parse(normalizedText.slice(jsonStart, jsonEnd + 1))
      if (typeof parsed.category === 'string') {
        const parsedCategory = categories.find((category) =>
          parsed.category.toLowerCase().includes(category),
        )
        if (parsedCategory) return parsedCategory
      }
    } catch {
      // Fall through to substring matching
    }
  }

  return categories.find((category) => normalizedText.includes(category)) || 'other'
}

export function getDomainSpecificLegalContent(message, isHindi) {
  const msgLower = (message || '').toLowerCase();

  // 1. CYBER FRAUD / FINANCIAL CRIME
  if (/cyber|upi|bank|fraud|scam|deducted|otp|phishing|hack|card|atms|साइबर|धोखाधड़ी|पैसे|ओटीपी|यूपीआई|ऑनलाइन|बैंक/i.test(msgLower)) {
    if (isHindi) {
      return {
        category: 'CYBER FRAUD & FINANCIAL CRIME',
        urgency: 'उच्च (HIGH) — 2 घंटे की सीमा में साइबर हेल्पलाइन 1930 पर खाता फ्रीज कराएं',
        rights: 'सूचना प्रौद्योगिकी अधिनियम और आरबीआई सर्कुलर 2017 के तहत अनधिकृत बैंकिंग लेनदेन में शून्य दायित्व (Zero Liability) का अधिकार।',
        laws: `- **सूचना प्रौद्योगिकी अधिनियम 2000 (IT Act, 2000)**:
  - **धारा 66D**: कंप्यूटर संसाधन द्वारा धोखाधड़ी/प्रतिरूपण की सजा (3 साल की जेल व जुर्माना)।
  - **धारा 66C**: पहचान की चोरी (Identity Theft) और क्रेडेंशियल का दुरुपयोग।
  - **धारा 43A**: डेटा सुरक्षा विफलता पर वित्तीय मुआवजे का प्रावधान।
- **भारतीय न्याय संहिता (BNS, 2023)**:
  - **धारा 318 BNS**: छल / धोखाधड़ी (Cheating)।
  - **धारा 319 BNS**: प्रतिरूपण द्वारा धोखाधड़ी (Cheating by Impersonation)।
- **आरबीआई (RBI) डिजिटल बैंकिंग दिशानिर्देश**: 3 दिनों के भीतर बैंक को सूचित करने पर ग्राहक की देयता शून्य होती है।`,
        docs: `- [ ] बैंक स्टेटमेंट / पासबुक की प्रमाणित कॉपी (विशिष्ट कटौतियों के साथ).
- [ ] यूपीआई लेनदेन आईडी (UTR / Transaction Ref ID) और एसएमएस अलर्ट का स्क्रीनशॉट.
- [ ] धोखाधड़ी वाले मैसेज, फ़िशिंग लिंक, व्हाट्सएप चैट और फोन नंबर का स्क्रीनशॉट.
- [ ] सरकारी पहचान पत्र (आधार कार्ड / पैन कार्ड).`,
        steps: `1. **पहला कदम**: तुरंत साइबर अपराध हेल्पलाइन **1930** पर कॉल करें और राष्ट्रीय साइबर अपराध पोर्टल (cybercrime.gov.in) पर शिकायत दर्ज करें।
2. **दूसरा कदम**: अपने संबंधित बैंक को लिखित आवेदन देकर बैंक खाता/कार्ड तुरंत ब्लॉक कराएं और शून्य दायित्व (Zero Liability) का दावा करें।
3. **तीसरा कदम**: नजदीकी पुलिस स्टेशन की साइबर सेल (Cyber Cell) में ज़ीरो प्राथमिकी (Zero FIR) दर्ज कराएं।
4. **चौथा कदम**: यदि बैंक 30 दिनों में राशि वापस न करे, तो आरबीआई बैंकिंग लोकपाल (RBI Ombudsman) के समक्ष शिकायत दर्ज करें।`
      };
    } else {
      return {
        category: 'CYBER FRAUD & FINANCIAL CRIME',
        urgency: 'HIGH — Freeze transaction immediately within the 2-hour window via 1930 Helpline',
        rights: 'Right to Zero Customer Liability for unauthorized electronic transactions under RBI Circular 2017 & IT Act 2000.',
        laws: `- **Information Technology Act, 2000**:
  - **Section 66D**: Punishment for cheating by personation using computer resources (Up to 3 years imprisonment).
  - **Section 66C**: Punishment for Identity Theft and digital authentication fraud.
  - **Section 43A**: Compensation for failure to protect sensitive personal data.
- **Bharatiya Nyaya Sanhita (BNS, 2023)**:
  - **Section 318 BNS**: Cheating and fraudulently inducing delivery of property.
  - **Section 319 BNS**: Cheating by personation.
- **RBI Digital Banking Guidelines (2017)**: Zero customer liability if unauthorized transaction is notified to bank within 3 days.`,
        docs: `- [ ] Certified Bank Account Statement showing fraudulent debits.
- [ ] UTR / Transaction Reference ID and bank SMS alert screenshots.
- [ ] Screenshots of fraudulent phishing links, WhatsApp messages, or call logs.
- [ ] Government Identity Proof (Aadhaar Card / PAN Card).`,
        steps: `1. **Step 1: Immediate Freeze**: Call **1930** immediately and register your incident at National Cyber Crime Portal (cybercrime.gov.in) to hold stolen funds.
2. **Step 2: Bank Dispute**: Submit a formal written dispute letter to your bank manager claiming Zero Customer Liability under RBI guidelines.
3. **Step 3: Police Complaint**: File a Zero FIR / Cyber Complaint at your nearest District Police Cyber Cell.
4. **Step 4: Ombudsman Escalation**: Escalate to RBI Banking Ombudsman if the bank fails to credit funds within 30 days.`
      };
    }
  }

  // 2. PROPERTY & LANDLORD-TENANT DISPUTES
  if (/landlord|rent|deposit|tenant|eviction|house|flat|lease|मकान|किराया|डिपॉजिट|खाली|डिपोजिट|मकान मालिक/i.test(msgLower)) {
    if (isHindi) {
      return {
        category: 'PROPERTY & LANDLORD-TENANT LAWS',
        urgency: 'मध्यम से उच्च (MEDIUM to HIGH) — जमा राशि की जब्ती और अनधिकृत बेदखली का विरोध',
        rights: 'मॉडल किरायेदारी अधिनियम और संपत्ति अंतरण अधिनियम के तहत 30 दिनों में सुरक्षा जमा वापसी और बिना नोटिस बेदखली के खिलाफ सुरक्षा का अधिकार।',
        laws: `- **मॉडल किरायेदारी अधिनियम (Model Tenancy Act) / राज्य किराया नियंत्रण अधिनियम**:
  - **सुरक्षा जमा वापसी (Deposit Refund)**: परिसर खाली करने के 30 दिनों के भीतर पूरी सुरक्षा जमा राशि वापस करना अनिवार्य है।
  - **बेदखली की सूचना (Eviction Notice)**: बिना कम से कम 2 महीने के लिखित नोटिस के बेदखली गैर-कानूनी है।
  - **बिजली/पानी काटना अवैध**: मकान मालिक द्वारा पानी या बिजली की सप्लाई काटना कानूनन अपराध है।
- **भारतीय न्याय संहिता (BNS, 2023)**:
  - **धारा 316 BNS**: अमानत में खयानत (Criminal Breach of Trust) — सुरक्षा राशि रोकने के खिलाफ।
  - **धारा 329 BNS**: गृह अतिचार (Criminal Trespass)।
  - **धारा 351 BNS**: आपराधिक धमकी (Criminal Intimidation) — जबरन बेदखली की धमकी पर।
- **संपत्ति अंतरण अधिनियम 1882 (Transfer of Property Act, 1882)**:
  - **धारा 108**: पट्टेदार और पट्टेदार के कानूनी अधिकार और दायित्व।`,
        docs: `- [ ] निष्पादित किराया समझौता / लीज डीड (Rent Agreement / Lease Deed).
- [ ] सुरक्षा जमा भुगतान की रसीद / बैंक ट्रांसफर यूटीआर (UTR) विवरण.
- [ ] मासिक किराया भुगतान की सभी रसीदें / पासबुक विवरण.
- [ ] मकान मालिक के साथ व्हाट्सएप चैट, ईमेल या नोटिस की प्रति.`,
        steps: `1. **पहला कदम**: मकान मालिक को 15 दिनों का औपचारिक लिखित कानूनी नोटिस (Legal Notice) भेजें, जिसमें सुरक्षा राशि लौटाने और अनुचित बेदखली रोकने की मांग करें।
2. **दूसरा कदम**: यदि मकान मालिक पानी/बिजली काटता है या धमकी देता है, तो नजदीकी पुलिस स्टेशन में धारा 351/316 BNS के तहत शिकायत दर्ज कराएं।
3. **तीसरा कदम**: क्षेत्र के किराया प्राधिकरण / किराया नियंत्रक (Rent Controller / Rent Authority) के समक्ष याचिका दायर करें।
4. **चौथा कदम**: जमा राशि की वसूली के लिए दीवानी अदालत (Civil Court) में संक्षिप्त वाद (Order 37 CPC) दायर करें।`
      };
    } else {
      return {
        category: 'PROPERTY & LANDLORD-TENANT LAWS',
        urgency: 'MEDIUM to HIGH — Recovery of withheld security deposit and prevention of unlawful eviction',
        rights: 'Right to full security deposit refund within 30 days & protection against arbitrary eviction under Model Tenancy Act.',
        laws: `- **Model Tenancy Act / State Rent Control Act**:
  - **Security Deposit Refund**: Mandates mandatory refund of security deposit within 30 days of vacating premises.
  - **Notice Period**: Minimum 2-month written notice required before initiating eviction.
  - **Essential Services**: Illegal for landlords to cut off water, electricity, or maintenance utilities.
- **Bharatiya Nyaya Sanhita (BNS, 2023)**:
  - **Section 316 BNS**: Criminal Breach of Trust (applicable to unlawful security deposit retention).
  - **Section 329 BNS**: Criminal Trespass.
  - **Section 351 BNS**: Criminal Intimidation (applicable to forced eviction threats).
- **Transfer of Property Act, 1882**:
  - **Section 108**: Statutory rights and liabilities of lessor (landlord) and lessee (tenant).`,
        docs: `- [ ] Original Registered / Unregistered Rent Agreement or Lease Deed.
- [ ] Bank Transfer UTR / Receipts of Initial Security Deposit Payment.
- [ ] Monthly Rent Payment Bank Statements / Payment Receipts.
- [ ] Written Communications (Email, SMS, WhatsApp chats) with the Landlord.`,
        steps: `1. **Step 1: Formal Legal Notice**: Issue a 15-day formal Legal Notice to the landlord demanding deposit refund and cessation of harassment.
2. **Step 2: Police Intimation**: If landlord threatens physical eviction or cuts utilities, file a complaint at local police station under Section 351 & 316 BNS.
3. **Step 3: Rent Authority Petition**: File an application before the local Rent Authority / Rent Controller.
4. **Step 4: Summary Recovery Suit**: File a summary suit under Order 37 CPC in Civil Court to recover unpaid deposit with interest.`
      };
    }
  }

  // 3. EMPLOYMENT & SALARY DISPUTES
  if (/salary|wage|job|employee|employer|company|boss|termination|pf|esi|वेतन|नौकरी|सैलरी|कंपनी|तनख्वाह/i.test(msgLower)) {
    if (isHindi) {
      return {
        category: 'EMPLOYMENT & LABOUR LAWS',
        urgency: 'उच्च (HIGH) — बकाया वेतन और पीएफ/ईएसआई गैर-भुगतान की वसूली',
        rights: 'मजदूरी भुगतान अधिनियम के तहत महीने की 7 तारीख तक पूरा वेतन पाने और औद्योगिक विवाद अधिनियम के तहत अवैध बर्खास्तगी के खिलाफ अधिकार।',
        laws: `- **मजदूरी भुगतान अधिनियम, 1936 (Payment of Wages Act, 1936)**:
  - **धारा 15**: वेतन में अनधिकृत कटौती या देरी से भुगतान के खिलाफ दावा और 10 गुना मुआवजे की मांग।
- **औद्योगिक विवाद अधिनियम, 1947 (Industrial Disputes Act, 1947)**:
  - **धारा 25F**: बिना उचित नोटिस अवधि या छंटनी मुआवजे के अवैध बर्खास्तगी पर रोक।
- **दुकान और स्थापना अधिनियम (State Shops & Establishments Act)**:
  - हर महीने की 7 से 10 तारीख तक अर्जित वेतन का पूर्ण भुगतान अनिवार्य।
- **भारतीय न्याय संहिता (BNS, 2023)**:
  - **धारा 316 BNS**: वेतन से काटे गए पीएफ (PF) / ईएसआई (ESI) अंशदान को जमा न करना अमानत में खयानत (Criminal Breach of Trust) है।`,
        docs: `- [ ] नियुक्ति पत्र / रोजगार अनुबंध (Appointment Letter / Employment Contract).
- [ ] वेतन पर्ची (Salary Slips) और बैंक खाता विवरण (Bank Statement).
- [ ] त्यागपत्र / बर्खास्तगी पत्र / एचआर (HR) ईमेल थ्रेड.
- [ ] फॉर्म 16 / पीएफ मेंबर पासबुक (EPF Passbook).`,
        steps: `1. **पहला कदम**: नियोक्ता/कंपनी के प्रबंधन को 15 दिनों का लिखित कानूनी नोटिस (Legal Notice) भेजें।
2. **दूसरा कदम**: क्षेत्र के श्रम आयुक्त (Labour Commissioner Office) के समक्ष मजदूरी भुगतान अधिनियम की धारा 15 के तहत शिकायत दर्ज करें।
3. **तीसरा कदम**: यदि पीएफ काटा गया है पर जमा नहीं किया गया, तो ईपीएफओ पोर्टल (EPFO Portal) पर शिकायत दर्ज कराएं।
4. **चौथा कदम**: श्रम न्यायालय (Labour Court) में बकाया राशि की वसूली हेतु वाद दायर करें।`
      };
    } else {
      return {
        category: 'EMPLOYMENT & LABOUR LAWS',
        urgency: 'HIGH — Recovery of withheld salary, wages, statutory dues & PF',
        rights: 'Right to timely salary by the 7th of every month under Payment of Wages Act & protection against wrongful termination.',
        laws: `- **Payment of Wages Act, 1936**:
  - **Section 15**: Claims arising out of unauthorized deductions or delay in payment of wages with up to 10x compensation.
- **Industrial Disputes Act, 1947**:
  - **Section 25F**: Mandatory notice period & retrenchment compensation before termination.
- **State Shops and Establishments Act**:
  - Mandates payment of earned wages by the 7th of every calendar month.
- **Bharatiya Nyaya Sanhita (BNS, 2023)**:
  - **Section 316 BNS**: Criminal Breach of Trust for failing to deposit employee PF/ESI contributions with statutory authorities.`,
        docs: `- [ ] Official Appointment Letter / Employment Contract.
- [ ] Monthly Salary Slips & Bank Account Statements showing past credits.
- [ ] Resignation / Termination / HR Email communications.
- [ ] EPFO Member Passbook / Form 16.`,
        steps: `1. **Step 1: Legal Notice**: Issue a 15-day formal Legal Notice to Company Directors and HR demanding immediate settlement of salary arrears.
2. **Step 2: Labour Commissioner**: File a formal petition under Section 15 of Payment of Wages Act before the local Labour Commissioner.
3. **Step 3: EPFO Grievance**: Lodge an online complaint on CPGRAMS / EPFO Portal if EPF deductions were withheld.
4. **Step 4: Labour Court**: File a recovery application before the Industrial Tribunal / Labour Court.`
      };
    }
  }

  // 4. CONSUMER PROTECTION
  if (/defective|product|warranty|refund|seller|amazon|flipkart|shop|repair|ख़राब|गारंटी|वारंटी|दुकान|सामान|उत्पाद/i.test(msgLower)) {
    if (isHindi) {
      return {
        category: 'CONSUMER PROTECTION LAWS',
        urgency: 'मध्यम (MEDIUM) — खराब उत्पाद के रिफंड, रीप्लेसमेंट और मुआवजे की मांग',
        rights: 'उपभोक्ता संरक्षण अधिनियम 2019 के तहत सुरक्षित उत्पाद, अनुचित व्यापार प्रथाओं से सुरक्षा और रिफंड/मुआवजे का अधिकार।',
        laws: `- **उपभोक्ता संरक्षण अधिनियम, 2019 (Consumer Protection Act, 2019)**:
  - **धारा 2(47)**: अनुचित व्यापार व्यवहार (Unfair Trade Practice) — रिफंड/वारंटी देने से मना करने पर।
  - **धारा 35**: जिला उपभोक्ता विवाद निवारण आयोग (District Consumer Commission) के समक्ष याचिका।
  - **धारा 84**: उत्पाद दायित्व (Product Liability) — खराब उत्पाद से हुए नुकसान का मुआवजा।
- **भारतीय अनुबंध अधिनियम 1872 (Indian Contract Act, 1872)**:
  - **धारा 73**: अनुबंध के उल्लंघन पर क्षतिपूर्ति और हर्जाना।`,
        docs: `- [ ] उत्पाद खरीद का मूल चालान / बिल (Tax Invoice / Purchase Receipt).
- [ ] वारंटी कार्ड / सर्विस सेंटर की जॉब शीट (Service Center Job Sheet).
- [ ] विक्रेता/कंपनी के साथ ईमेल/चैट का रिकॉर्ड.
- [ ] खराब उत्पाद/दोष की तस्वीरें या वीडियो साक्ष्य.`,
        steps: `1. **पहला कदम**: विक्रेता और निर्माता कंपनी को लिखित शिकायत/ईमेल भेजकर 7 दिनों में समाधान की मांग करें।
2. **दूसरा कदम**: राष्ट्रीय उपभोक्ता हेल्पलाइन **1915** पर कॉल करें या NCH ऐप/पोर्टल (consumerhelpline.gov.in) पर शिकायत दर्ज कराएं।
3. **तीसरा कदम**: e-Daakhil पोर्टल (edaakhil.nic.in) के माध्यम से जिला उपभोक्ता आयोग में शिकायत दर्ज करें।
4. **चौथा कदम**: उत्पाद की पूरी कीमत की वापसी + मानसिक उत्पीड़न का मुआवजा मांगे।`
      };
    } else {
      return {
        category: 'CONSUMER PROTECTION LAWS',
        urgency: 'MEDIUM — Recovery of refund, product replacement & compensation for defective service',
        rights: 'Right to refund, product liability compensation & protection against unfair trade practices under Consumer Protection Act 2019.',
        laws: `- **Consumer Protection Act, 2019**:
  - **Section 2(47)**: Unfair Trade Practice (Defeats warranty obligations / refuses lawful refund).
  - **Section 35**: Filing complaint before District Consumer Disputes Redressal Commission.
  - **Section 84**: Product Liability action against seller & manufacturer for defective goods.
- **Indian Contract Act, 1872**:
  - **Section 73**: Damages for breach of contract.`,
        docs: `- [ ] Purchase Tax Invoice / Bill Receipt.
- [ ] Warranty Card / Authorized Service Center Job Sheet.
- [ ] Email / Chat correspondence with seller/customer care.
- [ ] Photographs / Video evidence demonstrating product defect.`,
        steps: `1. **Step 1: Notice to Seller**: Send a written demand email giving 7 days to replace product or refund money.
2. **Step 2: National Consumer Helpline**: Call **1915** or lodge grievance at consumerhelpline.gov.in.
3. **Step 3: Consumer Court (e-Daakhil)**: File a formal consumer petition online via edaakhil.nic.in before District Commission.
4. **Step 4: Claim Damages**: Seek full refund + litigation costs + compensation for mental harassment.`
      };
    }
  }

  // 5. HARASSMENT, WORKPLACE DISPUTES & WOMEN PROTECTION
  if (/harass|harrass|haras|teammate|colleague|coworker|boss|workplace|office|women|domestic|husband|dowry|stalking|threat|abuse|bullying|modesty|molest|intimidat|महिला|उत्पीडन|उत्पीड़न|परेशान|धमकी|सहकर्मी|साथी|घरेलू हिंसा|दहेज|छेड़छाड़|पति/i.test(msgLower)) {
    if (isHindi) {
      return {
        category: 'WORKPLACE & PERSONAL HARASSMENT LAWS',
        urgency: 'अत्यंत उच्च (HIGH) — कार्यस्थल पर आंतरिक शिकायत समिति (ICC) और पुलिस सुरक्षा की मांग',
        rights: 'POSH अधिनियम 2013 के तहत सुरक्षित कार्यस्थल का अधिकार और बीएनएस की धाराओं के तहत आपराधिक उत्पीड़न के खिलाफ सुरक्षा।',
        laws: `- **कार्यस्थल पर महिलाओं का उत्पीड़न अधिनियम (POSH Act, 2013)**:
  - आंतरिक शिकायत समिति (ICC) के समक्ष औपचारिक लिखित शिकायत का अधिकार।
  - 90 दिनों के भीतर अनिवार्य जांच और पीड़िता को अंतरिम राहत।
- **भारतीय न्याय संहिता (BNS, 2023)**:
  - **धारा 351 BNS**: आपराधिक धमकी (Criminal Intimidation) — मौखिक धमकी या दबाव बनाने पर।
  - **धारा 74 BNS**: महिला की लज्जा भंग करने के इरादे से हमला या आपराधिक बल।
  - **धारा 78 BNS**: पीछा करना और डिजिटल उत्पीड़न (Stalking & Online Harassment)।
  - **धारा 79 BNS**: महिला का अपमान करने के इरादे से कहे गए शब्द या हाव-भाव।
- **सूचना प्रौद्योगिकी अधिनियम 2000 (IT Act, 2000)**:
  - **धारा 66E / 67**: निजता का उल्लंघन या ईमेल/व्हाट्सएप के जरिए अश्लील/धमकी भरे संदेश भेजना।
- **कंपनी आचार संहिता और औद्योगिक रोजगार अधिनियम**: दोषी कर्मचारी पर अनुशासनात्मक कार्रवाई व निलंबन।`,
        docs: `- [ ] व्हाट्सएप/ईमेल चैट, एसएमएस और कॉल रिकॉर्डिंग के स्क्रीनशॉट.
- [ ] कार्यस्थल पर दी गई लिखित शिकायत या एचआर (HR) ईमेल पत्राचार.
- [ ] गवाहों के बयान / सहकर्मियों का विवरण.
- [ ] आधिकारिक पहचान पत्र (आधार कार्ड / कंपनी आईडी).`,
        steps: `1. **पहला कदम**: सहकर्मी/टीम के सदस्य द्वारा दिए गए सभी धमकी भरे संदेशों, ईमेल और कॉल रिकॉर्डिंग्स का स्क्रीनशॉट लेकर सुरक्षित रखें।
2. **दूसरा कदम**: कंपनी के एचआर (HR) और आंतरिक शिकायत समिति (Internal Complaints Committee - ICC) को औपचारिक लिखित शिकायत दर्ज कराएं।
3. **तीसरा कदम**: यदि उत्पीड़न जारी रहता है या धमकी मिलती है, तो नजदीकी पुलिस स्टेशन या महिला हेल्पलाइन **1091** / **112** पर धारा 351/78 BNS के तहत प्राथमिकी (FIR) दर्ज कराएं।
4. **चौथा कदम**: मुफ्त कानूनी सहायता के लिए जिला कानूनी सेवा प्राधिकरण (DLSA) से संपर्क करें।`
      };
    } else {
      return {
        category: 'WORKPLACE & PERSONAL HARASSMENT LAWS',
        urgency: 'HIGH — Immediate internal HR/ICC grievance & police intimation for harassment',
        rights: 'Right to a Safe Workplace free from Harassment under POSH Act 2013 & protection against Criminal Intimidation under Article 21.',
        laws: `- **POSH Act, 2013 (Sexual Harassment of Women at Workplace Act)**:
  - Right to file formal written complaint before the Internal Complaints Committee (ICC).
  - Mandatory inquiry completion within 90 days with interim transfer/leave protection.
- **Bharatiya Nyaya Sanhita (BNS, 2023)**:
  - **Section 351 BNS**: Criminal Intimidation (covers verbal threats, harassment, or coercion).
  - **Section 74 BNS**: Assault or criminal force to outrage modesty.
  - **Section 78 BNS**: Stalking (unwanted physical/digital tracking or persistent online harassment).
  - **Section 79 BNS**: Word, gesture, or act intended to insult modesty.
- **Information Technology Act, 2000**:
  - **Section 66E / Section 67**: Violation of privacy or transmitting offensive/harassing electronic messages.
- **Industrial Employment (Standing Orders) Act & Company Code of Conduct**: Disciplinary action & suspension of the offending employee.`,
        docs: `- [ ] Screenshots of WhatsApp / Email chats, SMS, and call log recordings.
- [ ] Formal written grievance submitted to HR / Management.
- [ ] Witness statements or supporting emails from colleagues.
- [ ] Government ID & Company Employment ID card.`,
        steps: `1. **Step 1: Evidence Preservation**: Export and back up all harassing emails, WhatsApp messages, and call recordings.
2. **Step 2: File Internal Complaint**: Submit a formal written complaint to your company's HR Department and Internal Complaints Committee (ICC).
3. **Step 3: Police Intimation**: If harassment or intimidation persists, lodge an FIR at the local Police Station under Section 351 & 78 BNS.
4. **Step 4: Legal Protection**: Seek free legal representation from District Legal Services Authority (DLSA).`
      };
    }
  }

  // 6. RTI / PUBLIC GOVERNANCE
  if (/rti|road|government|officer|public|municipal|आरटीआई|सड़क|सरकारी|निर्माण|अधिकारी/i.test(msgLower)) {
    if (isHindi) {
      return {
        category: 'RIGHT TO INFORMATION & PUBLIC GOVERNANCE',
        urgency: 'मध्यम (MEDIUM) — सार्वजनिक कार्यों और सरकारी धन की पारदर्शिता',
        rights: 'सूचना का अधिकार अधिनियम 2005 के तहत 30 दिनों में सार्वजनिक दस्तावेज और सरकारी जानकारी प्राप्त करने का अधिकार।',
        laws: `- **सूचना का अधिकार अधिनियम, 2005 (RTI Act, 2005)**:
  - **धारा 6(1)**: जन सूचना अधिकारी (PIO) के समक्ष जानकारी हेतु आवेदन देना।
  - **धारा 7(1)**: आवेदन प्राप्त होने के 30 दिनों के भीतर सूचना प्रदान करना अनिवार्य।
- **भारतीय संविधान (Constitution of India)**:
  - **अनुच्छेद 19(1)(a)**: अभिव्यक्ति की स्वतंत्रता के अंतर्गत सूचना का अधिकार।
  - **अनुच्छेद 21**: सुरक्षित सार्वजनिक सड़कों का अधिकार।`,
        docs: `- [ ] आरटीआई आवेदन का मसौदा (RTI Application Draft).
- [ ] ₹10 का पोस्टर ऑर्डर / ऑनलाइन शुल्क रसीद.
- [ ] समस्याग्रस्त सड़क/सरकारी कार्य की तस्वीरें या स्थान का विवरण.`,
        steps: `1. **पहला कदम**: संबंधित विभाग (उदा. PWD / नगर निगम) के जन सूचना अधिकारी (PIO) के नाम आरटीआई आवेदन तैयार करें।
2. **दूसरा कदम**: ₹10 का शुल्क संलग्न कर पंजीकृत डाक या RTI Online पोर्टल (rtionline.gov.in) पर जमा करें।
3. **तीसरा कदम**: यदि 30 दिनों में उत्तर न मिले, तो धारा 19(1) के तहत प्रथम अपीलीय अधिकारी को प्रथम अपील भेजें।
4. **चौथा कदम**: संतुष्ट न होने पर राज्य/केंद्रीय सूचना आयोग (Information Commission) में द्वितीय अपील दायर करें।`
      };
    } else {
      return {
        category: 'RIGHT TO INFORMATION & PUBLIC GOVERNANCE',
        urgency: 'MEDIUM — Transparency of public infrastructure, funds & official records',
        rights: 'Right to obtain certified public documents & inspection of works within 30 days under RTI Act 2005.',
        laws: `- **Right to Information Act, 2005 (RTI Act)**:
  - **Section 6(1)**: Submission of application to Public Information Officer (PIO).
  - **Section 7(1)**: Mandate to furnish requested information within 30 days.
- **Constitution of India**:
  - **Article 19(1)(a)**: Right to Information as a fundamental freedom.
  - **Article 21**: Right to safe public roads & civic infrastructure.`,
        docs: `- [ ] Drafted RTI Application under Section 6(1).
- [ ] ₹10 Court Fee Stamp / Postal Order / Online Payment Receipt.
- [ ] Photographs / Location details of public road or municipal work.`,
        steps: `1. **Step 1: File Application**: Submit RTI application to Public Information Officer (PIO) of concerned department.
2. **Step 2: Pay Nominal Fee**: Attach ₹10 postal order or submit via rtionline.gov.in.
3. **Step 3: First Appeal**: If no response in 30 days, file First Appeal under Sec 19(1).
4. **Step 4: Second Appeal**: Escalate to Information Commission if unsatisfied.`
      };
    }
  }

  // 7. GENERAL AID (DEFAULT)
  if (isHindi) {
    return {
      category: 'GENERAL LEGAL AID & RIGHTS',
      urgency: 'उच्च (HIGH) — संवैधानिक अधिकारों और कानूनी उपायों का निष्पादन',
      rights: 'भारतीय संविधान के अनुच्छेद 14 और 21 के तहत विधि के समक्ष समता और मुफ्त कानूनी सहायता का अधिकार।',
      laws: `- **भारतीय न्याय संहिता (BNS, 2023)**:
  - **धारा 351 BNS**: आपराधिक धमकी (Criminal Intimidation).
  - **धारा 318 BNS**: धोखाधड़ी (Cheating).
- **भारतीय संविधान (Constitution of India)**:
  - **अनुच्छेद 14**: विधि के समक्ष समता.
  - **अनुच्छेद 21**: जीवन और व्यक्तिगत स्वतंत्रता का अधिकार.
  - **अनुच्छेद 39A**: मुफ्त कानूनी सहायता और समान न्याय.`,
        docs: `- [ ] प्राथमिक साक्ष्य, रसीदें और रिकॉर्ड.
- [ ] लिखित पत्राचार, एसएमएस, ईमेल या चैट रिकॉर्ड.
- [ ] आधिकारिक पहचान पत्र (आधार/पैन कार्ड).`,
        steps: `1. **पहला कदम**: अपने सभी साक्ष्यों और रिकॉर्ड्स को सुरक्षित रखें।
2. **दूसरा कदम**: संबंधित पक्ष को 15 दिनों का कानूनी नोटिस भेजें।
3. **तीसरा कदम**: पुलिस स्टेशन (FIR) या उपयुक्त फोरम में शिकायत दर्ज करें।
4. **चौथा कदम**: नालसा हेल्पलाइन **15100** पर कॉल कर मुफ्त सरकारी वकील प्राप्त करें।`
    };
  } else {
    return {
      category: 'GENERAL LEGAL AID & RIGHTS',
      urgency: 'HIGH — Enforcing fundamental constitutional & statutory remedies',
      rights: 'Right to equality before law, due process and free legal representation under Articles 14, 21 & 39A.',
      laws: `- **Bharatiya Nyaya Sanhita (BNS, 2023)**:
  - **Section 351 BNS**: Criminal Intimidation (threats or coercion).
  - **Section 318 BNS**: Cheating and fraudulent inducement.
- **Constitution of India**:
  - **Article 14**: Equality before Law.
  - **Article 21**: Right to Life & Personal Liberty.
  - **Article 39A**: Free Legal Aid for all citizens.`,
      docs: `- [ ] Primary evidence, agreements, receipts, and payment proofs.
- [ ] Written communications (Emails, WhatsApp chats, SMS).
- [ ] Government Identity Proof (Aadhaar / PAN Card).`,
      steps: `1. **Step 1: Evidence Backup**: Secure and print all digital proofs and transaction receipts.
2. **Step 2: Formal Notice**: Send a written legal notice giving a 15-day cure period.
3. **Step 3: File Complaint**: File an FIR at police station or approach appropriate tribunal/court.
4. **Step 4: DLSA Assistance**: Call **15100** to assign a free court advocate via DLSA.`
    };
  }
}

function getDbCategory(category) {
  if (!category) return 'harassment';
  const catUpper = category.toUpperCase();
  if (catUpper.includes('CYBER')) return 'cyber_fraud';
  if (catUpper.includes('HARASSMENT')) return 'harassment';
  if (catUpper.includes('PROPERTY')) return 'property';
  if (catUpper.includes('EMPLOYMENT')) return 'employment';
  if (catUpper.includes('WOMEN') || catUpper.includes('FAMILY')) return 'domestic';
  if (catUpper.includes('CONSUMER')) return 'consumer';
  return 'harassment';
}

export async function processMessage(message, getLegalContexts, language = 'English') {
  const isHindi = language && (language.toLowerCase() === 'hindi' || language === 'हिन्दी');
  const domainInfo = getDomainSpecificLegalContent(message, isHindi);

  const ragUrl = process.env.N8N_WEBHOOK_URL || process.env.RAG_WEBHOOK_URL;

  // 1. PRIMARY ENGINE: USER'S RAG MODEL WEBHOOK URL (Supports both /webhook/ and /webhook-test/)
  if (ragUrl) {
    const urlsToTry = [
      ragUrl,
      ragUrl.includes('/webhook/') ? ragUrl.replace('/webhook/', '/webhook-test/') : ragUrl.replace('/webhook-test/', '/webhook/')
    ];

    for (const targetUrl of urlsToTry) {
      console.log(`[RAG Primary Engine] Forwarding query to RAG Webhook URL: ${targetUrl}`);
      try {
        const n8nResponse = await axios.post(
          targetUrl,
          {
            message,
            query: message,
            language,
            category: domainInfo.category,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
            timeout: 12000,
          }
        );

        const rawData = n8nResponse.data || {};
        let ragAnswer = '';

        if (typeof rawData === 'string' && rawData.trim()) {
          ragAnswer = rawData.trim();
        } else if (typeof rawData === 'object') {
          if (rawData.legalAdvice || rawData.applicableLaws || rawData.suggestedActions) {
            const la = rawData.legalAdvice || rawData;
            let md = `### 📌 1. EXECUTIVE CASE SUMMARY & LEGAL TRIAGE\n`;
            md += `- **Overview**: Detailed statutory analysis for query: "${message}".\n`;
            md += `- **Urgency Level**: **${la.urgencyLevel || 'HIGH'}**\n`;
            md += `- **Primary Legal Category**: ${domainInfo.category}\n\n---\n\n`;

            if (Array.isArray(la.applicableLaws) && la.applicableLaws.length > 0) {
              md += `### ⚖️ 2. APPLICABLE LAWS, SECTIONS & STATUTORY PROVISIONS\n`;
              la.applicableLaws.forEach(item => {
                if (typeof item === 'string') {
                  md += `- ${item}\n`;
                } else if (item.law) {
                  md += `- **${item.law}**: ${item.description || ''}\n`;
                }
              });
              md += `\n---\n\n`;
            }

            if (Array.isArray(la.recommendedDocuments) && la.recommendedDocuments.length > 0) {
              md += `### 📄 3. REQUIRED & NECESSARY DOCUMENTS CHECKLIST\n`;
              la.recommendedDocuments.forEach(doc => {
                md += `- [ ] **${doc}**\n`;
              });
              md += `\n---\n\n`;
            }

            if (Array.isArray(la.suggestedActions) && la.suggestedActions.length > 0) {
              md += `### 🚀 4. STEP-BY-STEP PRACTICAL ACTION PLAN\n`;
              la.suggestedActions.forEach((act, idx) => {
                if (typeof act === 'string') {
                  md += `${idx + 1}. ${act}\n`;
                } else if (act.step || act.action) {
                  md += `${idx + 1}. **${act.step || 'Step'}**: ${act.action}\n`;
                }
              });
              md += `\n---\n\n`;
            }

            md += `### 🛡️ 5. FREE LEGAL AID & EMERGENCY HELPLINES DIRECTORY\n`;
            md += `- **NALSA Legal Aid Hotline**: Call **15100** for free court advocates via DLSA.\n`;
            md += `- **National Emergency & Police**: Call **112** for immediate police response.\n`;
            md += `- **Cyber Fraud Helpline**: Call **1930** within 2 hours of online financial fraud.\n\n`;
            md += `---\n*Disclaimer: NyayaMitra RAG Engine provides automated legal information under Indian Law.*`;
            
            ragAnswer = md;
          } else {
            ragAnswer = rawData.answer || rawData.output || rawData.response || rawData.result || rawData.text || '';
          }
        }

        if (ragAnswer && typeof ragAnswer === 'string' && ragAnswer.length > 20) {
          console.log(`[RAG Primary Engine SUCCESS] Received legal analysis from RAG Webhook URL!`);
          return {
            category: domainInfo.category,
            answer: ragAnswer,
          };
        }
      } catch (ragErr) {
        console.warn(`[RAG Primary Engine Warning] Webhook ${targetUrl} skipped (${ragErr.message}).`);
      }
    }
  }

  // 2. SECONDARY ENGINE: RETRIEVE RAG KNOWLEDGE CONTEXT FROM POSTGRES DB
  let ragFormattedText = '';
  if (typeof getLegalContexts === 'function') {
    try {
      const dbCat = getDbCategory(domainInfo.category);
      const dbContexts = await getLegalContexts(dbCat);
      if (Array.isArray(dbContexts) && dbContexts.length > 0) {
        ragFormattedText = dbContexts.map(c => `- **${c.title}** (${c.law_reference}): ${c.summary} [Applicable Sections: ${c.applicable_sections}]`).join('\n');
        console.log(`[RAG DB Context] Retrieved ${dbContexts.length} verified legal contexts for category: ${dbCat}`);
      }
    } catch (ragErr) {
      console.warn('[RAG DB Warning] DB Legal Context retrieval failed:', ragErr.message);
    }
  }

  // Also query n8n RAG Webhook if configured for live vector augmentations
  if (process.env.N8N_WEBHOOK_URL) {
    try {
      const n8nResponse = await axios.post(
        process.env.N8N_WEBHOOK_URL,
        { message, query: message, category: domainInfo.category },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          timeout: 5000,
        }
      );
      const rawData = n8nResponse.data || {};
      const n8nText = typeof rawData === 'string' ? rawData : (rawData.legalAdvice || rawData.output || rawData.response || '');
      if (n8nText) {
        ragFormattedText += `\n- **n8n Vector RAG Insight**: ${n8nText}`;
        console.log('[RAG Vector Webhook Active] Successfully retrieved external vector augmentation from n8n');
      }
    } catch (n8nErr) {
      console.warn('[RAG Vector Webhook] n8n RAG call skipped:', n8nErr.message);
    }
  }

  const ragPromptSnippet = ragFormattedText
    ? `\n### 📚 RETRIEVED RAG LEGAL KNOWLEDGE CONTEXT (VECTOR DATABASE)\nUse the following verified Indian law statutory precedents to enrich your analysis:\n${ragFormattedText}\n`
    : '';

  // 2. Check if Gemini API Key is configured
  const gemini = getGeminiClient();
  if (gemini) {
    console.log(`Processing query with Google Gemini API (Category: ${domainInfo.category}, RAG Context Attached: ${!!ragFormattedText}, Language: ${language})...`);

    const systemPrompt = isHindi
      ? `आप न्यायमित्र AI हैं — भारत का आधिकारिक राष्ट्रीय AI कानूनी सहायता एवं सुरक्षा तंत्र।
आप भारतीय नागरिकों के लिए संपूर्ण, अत्यधिक विस्तृत, स्पष्ट और स्वच्छ कानूनी विश्लेषण प्रदान करते हैं।

CRITICAL RULE: केवल इस विशिष्ट मामले पर लागू होने वाले कानून और धाराएं ही प्रदर्शित करें। किसी भी अप्रासंगिक या अनावश्यक कानून/अधिनियम को शामिल न करें।
${ragPromptSnippet}
प्रत्येक उपयोगकर्ता प्रश्न के लिए, आपको इस सटीक अनिवार्य 6-भाग प्रारूप का पालन करना होगा:

### 📌 1. मामले का मुख्य सारांश और कानूनी ट्राइएज (EXECUTIVE CASE SUMMARY)
- **अवलोकन (Overview)**: उपयोगकर्ता की कानूनी स्थिति: "${message}" का स्पष्ट और विस्तृत सारांश।
- **आपातकाल का स्तर (Urgency Level)**: ${domainInfo.urgency}
- **प्रमुख कानूनी अधिकार (Key Legal Rights)**: ${domainInfo.rights}

### ⚖️ 2. लागू कानून, धाराएं और कानूनी प्रावधान (APPLICABLE LAWS & SECTIONS)
केवल इस मामले से संबंधित प्रासंगिक भारतीय कानूनों, अधिनियमों और विशिष्ट धारा नंबरों का विस्तृत विवरण प्रदान करें (कोई अन्य अप्रासंगिक कानून न लिखें):
${domainInfo.laws}

### 📄 3. आवश्यक दस्तावेजों की सूची (REQUIRED DOCUMENTS CHECKLIST)
${domainInfo.docs}

### 🚀 4. चरण-दर-चरण व्यावहारिक कार्य योजना (STEP-BY-STEP ACTION PLAN)
${domainInfo.steps}

### 🛡️ 5. मुफ्त कानूनी सहायता और आपातकालीन हेल्पलाइन निर्देशिका (FREE LEGAL AID & HELPLINES)
- **नालसा (NALSA) मुफ्त कानूनी सहायता हेल्पलाइन**: जिला कानूनी सेवा प्राधिकरण (DLSA) के तहत मुफ्त सरकारी वकील हेतु **15100** पर कॉल करें।
- **राष्ट्रीय आपातकाल और पुलिस**: **112** पर कॉल करें।
- **साइबर धोखाधड़ी हेल्पलाइन**: ऑनलाइन वित्तीय धोखाधड़ी होने पर **1930** पर कॉल करें।
- **विशेषज्ञ हेल्पलाइन**: महिला हेल्पलाइन (**1091** / **181**), चाइल्डलाइन (**1098**), वरिष्ठ नागरिक एल्डरलाइन (**14567**)।

---
*अस्वीकरण: न्यायमित्र भारतीय कानून के तहत स्वचालित एआई-संचालित कानूनी जानकारी प्रदान करता है। यह औपचारिक वकील-ग्राहक प्रतिनिधित्व नहीं है।*

---
User Query: "${message}"`
      : `You are NyayaMitra AI — the official National AI Legal Aid & Protection System of India.
You provide exhaustive, highly detailed, neat, and structured legal analysis for Indian citizens.

CRITICAL RULE: ONLY DISPLAY LAWS AND SECTIONS THAT ARE STRICTLY APPLICABLE TO THE USER'S SPECIFIC LEGAL PROBLEM. DO NOT INCLUDE ANY UNRELATED OR INAPPLICABLE LAWS OR STATUTES.
${ragPromptSnippet}
FOR EVERY USER QUERY, YOU MUST FOLLOW THIS EXACT MANDATORY 6-SECTION FORMAT:

### 📌 1. EXECUTIVE CASE SUMMARY & LEGAL TRIAGE
- **Overview**: Detailed legal analysis for query: "${message}".
- **Urgency Level**: ${domainInfo.urgency}
- **Key Legal Rights**: ${domainInfo.rights}

### ⚖️ 2. APPLICABLE LAWS, SECTIONS & STATUTORY PROVISIONS
Provide ONLY the specific laws, acts, and section numbers applicable to this case (Do NOT list unrelated laws):
${domainInfo.laws}

### 📄 3. REQUIRED & NECESSARY DOCUMENTS CHECKLIST
${domainInfo.docs}

### 🚀 4. STEP-BY-STEP PRACTICAL ACTION PLAN
${domainInfo.steps}

### 🛡️ 5. FREE LEGAL AID & EMERGENCY HELPLINES DIRECTORY
- **NALSA Legal Aid Hotline**: Call **15100** for free court advocates via District Legal Services Authority (DLSA).
- **National Emergency & Police**: Call **112** for immediate police response.
- **Cyber Fraud Helpline**: Call **1930** within 2 hours of online financial fraud.
- **Specialized Helplines**: Women Protection (**1091** / **181**), Childline (**1098**), Senior Citizen Elderline (**14567**).

---
*Disclaimer: NyayaMitra provides automated AI-driven legal information under Indian Law. Consult DLSA for court representation.*

---
User Query: "${message}"`;

    // Try Gemini models in sequence to handle potential 429 rate limit
    const geminiModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];

    for (const modelName of geminiModels) {
      try {
        console.log(`Trying Gemini model: ${modelName}`);
        const answerResponse = await gemini.models.generateContent({
          model: modelName,
          contents: systemPrompt,
        });

        if (answerResponse?.text) {
          return {
            category: domainInfo.category,
            answer: answerResponse.text,
          };
        }
      } catch (err) {
        console.warn(`Gemini model ${modelName} call failed/rate-limited:`, err.message);
      }
    }
  }

  // 2. If n8n RAG Webhook is configured, try n8n
  if (process.env.N8N_WEBHOOK_URL) {
    try {
      const n8nResponse = await axios.post(
        process.env.N8N_WEBHOOK_URL,
        { message, query: message },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          timeout: 10000,
        }
      );
      const rawData = n8nResponse.data || {};
      const payload = rawData.legalAdvice || rawData;
      if (payload && (payload.answer || payload.output || payload.response || typeof payload === 'string')) {
        return {
          category: domainInfo.category,
          answer: typeof payload === 'string' ? payload : (payload.answer || payload.output || payload.response),
        };
      }
    } catch (n8nError) {
      console.warn('n8n RAG Webhook unavailable:', n8nError.message);
    }
  }

  // 3. Guaranteed Local Domain-Matched Legal AI Analysis Fallback
  console.log(`Generating local domain-matched legal analysis fallback for: ${domainInfo.category}`);
  const fallbackAnswer = isHindi
    ? `### 📌 1. मामले का मुख्य सारांश और कानूनी ट्राइएज (EXECUTIVE CASE SUMMARY)
- [ ] **प्राथमिक अनुबंध व साक्ष्य**: अनुबंध, किराया समझौता, नियुक्ति पत्र, बैंक स्टेटमेंट, भुगतान लेनदेन आईडी, रसीदें।
- [ ] **संचार रिकॉर्ड**: ईमेल थ्रेड्स, व्हाट्सएप/एसएमएस चैट, कॉल लॉग्स, लिखित नोटिस की प्रतियां।
- [ ] **आधिकारिक पहचान पत्र**: आधार कार्ड, पैन कार्ड, पुलिस शिकायत की रसीद।

---

### 🚀 4. चरण-दर-चरण व्यावहारिक कार्य योजना (STEP-BY-STEP ACTION PLAN)
1. **चरण 1: साक्ष्य सुरक्षित करें**: सभी चैट, ईमेल, लेनदेन आईडी और रसीदों का प्रिंटआउट लें और सुरक्षित रखें।
2. **चरण 2: औपचारिक कानूनी नोटिस भेजें**: संबंधित पक्ष को 15 दिनों की समयावधि का लिखित कानूनी नोटिस (पंजीकृत डाक से) भेजें।
3. **चरण 3: आधिकारिक शिकायत दर्ज करें**: स्थानीय पुलिस स्टेशन (ज़ीरो प्राथमिकी/FIR), राष्ट्रीय साइबर क्राइम पोर्टल (cybercrime.gov.in), श्रम आयुक्त या उपभोक्ता फोरम में शिकायत दर्ज कराएं।
4. **चरण 4: न्यायिक कार्यवाही**: त्वरित न्याय हेतु सिविल कोर्ट (Order 37 CPC) या जिला कानूनी सेवा प्राधिकरण (DLSA) में याचिका दायर करें।

---

### 🛡️ 5. मुफ्त कानूनी सहायता और आपातकालीन हेल्पलाइन निर्देशिका (FREE LEGAL AID & HELPLINES)
- **नालसा (NALSA) मुफ्त कानूनी सहायता हेल्पलाइन**: मुफ्त सरकारी वकील हेतु **15100** पर कॉल करें।
- **राष्ट्रीय आपातकाल व पुलिस**: **112** पर कॉल करें।
- **साइबर धोखाधड़ी हेल्पलाइन**: ऑनलाइन वित्तीय धोखाधड़ी होने पर **1930** पर कॉल करें।
- **विशेषज्ञ हेल्पलाइन**: महिला हेल्पलाइन (**1091** / **181**), चाइल्डलाइन (**1098**), वरिष्ठ नागरिक एल्डरलाइन (**14567**)।

---
*अस्वीकरण: न्यायमित्र भारतीय कानून के तहत स्वचालित एआई-संचालित कानूनी जानकारी प्रदान करता है। अदालत में प्रतिनिधित्व के लिए अपने स्थानीय जिला कानूनी सेवा प्राधिकरण (DLSA) से संपर्क करें।*`
    : `### 📌 1. EXECUTIVE CASE SUMMARY & LEGAL TRIAGE
- **Overview**: Exhaustive analysis of your legal query: "${message}". Under Indian jurisprudence, you hold fundamental Constitutional and statutory protections.
- **Urgency Level**: **HIGH** — Immediate preservation of evidence and formal legal representation is strongly advised.
- **Key Legal Rights**: Right to Due Process, Right to Remuneration, Right Against Arbitrary Coercion, and Right to Equality before Law under Article 14 & Article 21.

---

### ⚖️ 2. APPLICABLE LAWS, SECTIONS & STATUTORY PROVISIONS
- **Bharatiya Nyaya Sanhita (BNS, 2023) / IPC**:
  - **Section 316 BNS (Criminal Breach of Trust)**: Applies to unauthorized withholding of funds, security deposits, or statutory dues.
  - **Section 318 BNS (Cheating)**: Applies to fraudulent inducement or breach of contract.
  - **Section 351 BNS (Criminal Intimidation)**: Covers threats, coercion, or harassment.
- **Specialized Acts**:
  - **Information Technology Act, 2000 (Section 43A, Section 66D)**: Applicable for online financial fraud, cyber harassment, or data breaches.
  - **Payment of Wages Act, 1936 (Section 15) & Industrial Disputes Act, 1947**: Mandatory payment of earned wages.
  - **Model Tenancy Act & Consumer Protection Act 2019**: Protection against unlawful eviction, security deposit retention, or defective services.
- **Constitutional Provisions**: Article 21 (Right to Livelihood) & Article 39A (Free Legal Aid).

---

### 📄 3. REQUIRED & NECESSARY DOCUMENTS CHECKLIST
- [ ] **Contracts & Agreements**: Employment agreement, lease deed, loan documents, or invoice copies.
- [ ] **Financial Records**: Certified bank statements, salary slips, payment receipts, UTR transaction IDs.
- [ ] **Communication Evidence**: Email threads, WhatsApp/SMS chat screenshots, call recordings, written notices.
- [ ] **Government Identification**: Aadhaar Card, PAN Card, Police Complaint Copy, Postal Receipts.

---

### 🚀 4. STEP-BY-STEP PRACTICAL ACTION PLAN
1. **Step 1: Secure Evidence**: Export and back up all emails, agreements, messages, and bank records to personal storage immediately.
2. **Step 2: Serve Formal Legal Notice**: Send a written legal notice giving a 15-day cure period before initiating court proceedings.
3. **Step 3: Lodge Official Complaint**: File a complaint at your local Police Station (Zero FIR), National Cyber Crime Portal (cybercrime.gov.in), Labour Commissioner, Consumer Commission, or Rent Controller.
4. **Step 4: Judicial Proceedings**: File a recovery suit under Order 37 CPC or seek DLSA advocate assistance.

---

### 🛡️ 5. FREE LEGAL AID & EMERGENCY HELPLINES DIRECTORY
- **NALSA Legal Aid Hotline**: Call **15100** for free court-appointed advocates via District Legal Services Authority (DLSA).
- **National Emergency & Police**: Call **112** for immediate police response.
- **National Cyber Crime Helpline**: Call **1930** within 2 hours of online financial fraud.
- **Specialized Helplines**: Women Protection (**1091** / **181**), Childline (**1098**), Senior Citizen Elderline (**14567**).

---
*Disclaimer: NyayaMitra provides automated AI-driven legal information under Indian Law. Consult your local DLSA panel for court representation.*`;

  return {
    category: 'LEGAL AID & PROTECTION',
    answer: fallbackAnswer,
  };
}

export async function formalizeDocumentWithGemini(templateId, formData = {}) {
  console.log(`[Legal AI Formalizer] Formalizing user form inputs for template: ${templateId}`);

  const gemini = getGeminiClient();

  if (gemini) {
    const prompt = `You are a Senior Supreme Court Advocate and official legal draftsman in India.
Your task is to take informal, raw user-submitted form data for an official Indian legal document (${templateId}) and convert raw notes into formal, highly professional Indian court petition language.

User Raw Input Data:
${JSON.stringify(formData, null, 2)}

Requirements:
1. Rephrase raw user descriptions, notes, and complaints into formal legal statements of fact using proper legal terminology (e.g., "Complainant", "Applicant", "Respondent", "Opposite Party", "unauthorized debit", "statutory default").
2. Format statement of facts into clean, numbered formal court paragraphs starting with "1. THAT...", "2. THAT...".
3. Cite exact relevant Indian statutory laws and section numbers (e.g. IT Act Sec 66D, BNS 2023 Sec 318, POSH Act 2013, Model Tenancy Act, Payment of Wages Act 1936 Sec 15, Consumer Protection Act 2019 Sec 35, RTI Act 2005 Sec 6(1)).
4. Provide a formal, powerful "PRAYER FOR RELIEF" demanding specific legal remedies.

Return ONLY a valid JSON object matching this exact structure (no markdown fences, no code blocks):
{
  "formalAddressee": "BEFORE THE STATION HOUSE OFFICER / AUTHORIZED OFFICER / COURT",
  "formalSubject": "OFFICIAL PETITION / DEMAND NOTICE REGARDING...",
  "formalStatementOfFacts": "1. THAT the Applicant is a law-abiding citizen of India residing at the given address.\\n2. THAT on [Date], the Respondent committed...",
  "applicableSections": "Section 66D IT Act 2000; Section 318 BNS 2023; RBI Circular 2017.",
  "formalPrayerForRelief": "PRAYER FOR RELIEF:\\nWherefore, it is most respectfully prayed that this Hon'ble Authority may be pleased to:\\na) Register an official FIR against the Respondent;\\nb) Order immediate recovery/refund of INR [Amount];\\nc) Grant suitable compensation for mental harassment."
}`;

    const geminiModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];

    for (const modelName of geminiModels) {
      try {
        const response = await gemini.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        const rawText = response?.text || '';
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        if (parsed && (parsed.formalStatementOfFacts || parsed.formalSubject)) {
          console.log(`[Legal AI Formalizer SUCCESS] Drafted formal legal petition with Gemini (${modelName})`);
          return {
            ...formData,
            ...parsed,
            isAiFormalized: true,
          };
        }
      } catch (err) {
        console.warn(`[Legal AI Formalizer] Gemini model ${modelName} call skipped:`, err.message);
      }
    }
  }

  // Local Guaranteed Formal Legal Transformer Fallback
  console.log(`[Legal AI Formalizer] Using guaranteed local legal transformer fallback for: ${templateId}`);

  let formalAddressee = 'BEFORE THE COMPETENT LEGAL AUTHORITY & POLICE DESK';
  let formalSubject = `OFFICIAL LEGAL PETITION REGARDING ${templateId.toUpperCase()}`;
  let formalStatementOfFacts = '';
  let applicableSections = 'Bharatiya Nyaya Sanhita (BNS 2023) & Constitutional Remedies';
  let formalPrayerForRelief = 'PRAYER FOR RELIEF:\nWherefore, it is most respectfully prayed that this Hon\'ble Authority may be pleased to grant immediate statutory relief and pass appropriate orders.';

  if (templateId === 'fraud_complaint') {
    formalAddressee = 'BEFORE THE OFFICER-IN-CHARGE, CYBER CRIME CELL / DISTRICT POLICE STATION';
    formalSubject = `OFFICIAL COMPLAINT UNDER SECTION 66D IT ACT 2000 & SECTION 318 BNS 2023 FOR CYBER FRAUD OF INR ${formData.amountLost || '0'}`;
    formalStatementOfFacts = `1. THAT the Complainant (${formData.fullName || 'Complainant'}) is a law-abiding citizen residing at ${formData.contactPhone || 'Registered Mobile Address'}.\n2. THAT on ${formData.transactionDate || 'the specified date'}, an unauthorized electronic transaction amounting to INR ${formData.amountLost || '0'} occurred via ${formData.bankName || 'Bank/UPI Platform'} bearing UTR Ref ${formData.utrReference || 'Pending'}.\n3. THAT the raw incident details submitted are as follows: "${formData.incidentDescription || 'Fraudulent unauthorized debit'}".\n4. THAT the acts of the unknown offenders constitute criminal cheating by personation and unauthorized computer access.`;
    applicableSections = 'Section 43A & 66D of Information Technology Act 2000; Section 318 of Bharatiya Nyaya Sanhita (BNS 2023); RBI Circular on Zero Customer Liability 2017.';
    formalPrayerForRelief = `PRAYER FOR RELIEF:\nWherefore, it is most respectfully prayed that this Hon'ble Authority may be pleased to:\na) Register an official First Information Report (FIR) under Section 318 BNS 2023;\nb) Issue urgent directives to ${formData.bankName || 'the Bank'} to freeze suspect node accounts;\nc) Order full restitution of INR ${formData.amountLost || '0'} under RBI Zero Customer Liability Guidelines.`;
  } else if (templateId === 'legal_notice') {
    formalAddressee = `FORMAL LEGAL DEMAND NOTICE\nTO: ${formData.recipientName || 'RECIPIENT'}\nADDRESS: ${formData.recipientAddress || 'RECIPIENT ADDRESS'}`;
    formalSubject = `FORMAL LEGAL NOTICE FOR RECOVERY / DEFAULT: ${formData.noticeSubject || 'BREACH OF CONTRACT'}`;
    formalStatementOfFacts = `1. THAT my Client (${formData.senderName || 'Sender'}) resides at ${formData.senderAddress || 'Sender Address'}.\n2. THAT you, the addressee (${formData.recipientName || 'Recipient'}), entered into an agreement/transaction with my Client.\n3. THAT you have committed statutory default as detailed: "${formData.disputeDetails || 'Failure to refund/pay statutory dues'}".\n4. THAT your failure to rectify the default within ${formData.deadlineDays || '15 Days'} has caused severe financial loss and mental agony to my Client.`;
    applicableSections = 'Order 37 of Civil Procedure Code (CPC 1908); Section 316 of Bharatiya Nyaya Sanhita (BNS 2023); Section 73 of Indian Contract Act 1872.';
    formalPrayerForRelief = `DEMAND & NOTICE:\nYou are hereby called upon to comply with the terms of this notice within ${formData.deadlineDays || '15 Days'}, failing which my Client shall initiate summary civil suit (Order 37 CPC) and criminal prosecution at your sole risk and costs.`;
  } else if (templateId === 'rti_application') {
    formalAddressee = `BEFORE THE PUBLIC INFORMATION OFFICER (PIO)\nDEPARTMENT: ${formData.publicAuthority || 'PUBLIC AUTHORITY'}\nADDRESS: ${formData.departmentAddress || 'DEPARTMENT ADDRESS'}`;
    formalSubject = `APPLICATION FOR OBTAINING INFORMATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005`;
    formalStatementOfFacts = `1. THAT the Applicant (${formData.applicantName || 'Applicant'}) is a citizen of India.\n2. THAT the Applicant seeks certified information and records regarding: "${formData.informationSought || 'Public works, expenditure, and official records'}" for the period ${formData.timePeriod || 'Relevant Period'}.\n3. THAT the statutory application fee of INR 10/- has been remitted via ${formData.feeMode || 'Postal Order'}.`;
    applicableSections = 'Section 6(1) and Section 7(1) of the Right to Information Act, 2005; Article 19(1)(a) of the Constitution of India.';
    formalPrayerForRelief = `PRAYER:\nIt is requested that certified copies of the information sought above be furnished to the Applicant within the statutory 30-day period as mandated under Section 7(1) of the RTI Act 2005.`;
  } else if (templateId === 'employment_grievance') {
    formalAddressee = `BEFORE THE LABOUR COMMISSIONER / CONCILIATION OFFICER\nCOMPANY: ${formData.companyName || 'EMPLOYER COMPANY'}`;
    formalSubject = `OFFICIAL COMPLAINT REGARDING UNLAWFUL SALARY WITHHOLDING & WRONGFUL TERMINATION`;
    formalStatementOfFacts = `1. THAT the Employee (${formData.employeeName || 'Employee'}, Designation: ${formData.designation || 'Staff'}) was employed with ${formData.companyName || 'Employer Company'}.\n2. THAT the Employer has illegally withheld earned wages/dues amounting to INR ${formData.unpaidSalary || '0'}.\n3. THAT the grievance details submitted: "${formData.grievanceDetails || 'Non-payment of salary and illegal termination'}".`;
    applicableSections = 'Section 15 of Payment of Wages Act 1936; Section 25F of Industrial Disputes Act 1947; Section 316 BNS 2023.';
    formalPrayerForRelief = `PRAYER FOR RELIEF:\nIt is prayed that the Labour Authorities direct the Employer to release INR ${formData.unpaidSalary || '0'} with 10x statutory compensation and interest thereon.`;
  } else if (templateId === 'consumer_complaint') {
    formalAddressee = `BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION`;
    formalSubject = `CONSUMER COMPLAINT UNDER SECTION 35 OF CONSUMER PROTECTION ACT 2019 FOR DEFECTIVE PRODUCT / UNFAIR TRADE PRACTICE`;
    formalStatementOfFacts = `1. THAT the Complainant (${formData.complainantName || 'Complainant'}) purchased product/service from ${formData.sellerName || 'Seller'} vide Invoice ${formData.invoiceNumber || 'Invoice'}.\n2. THAT the product/service is severely defective: "${formData.defectDetails || 'Defective product and failure of warranty obligation'}".`;
    applicableSections = 'Section 2(47), Section 35, and Section 84 of Consumer Protection Act 2019; Section 73 of Indian Contract Act 1872.';
    formalPrayerForRelief = `PRAYER FOR RELIEF:\na) Direct the Seller to refund INR ${formData.claimAmount || '0'} with interest;\nb) Award INR 25,000 for mental harassment and litigation costs.`;
  }

  return {
    ...formData,
    formalAddressee,
    formalSubject,
    formalStatementOfFacts,
    applicableSections,
    formalPrayerForRelief,
    isAiFormalized: true,
  };
}

export async function enhanceDescriptionWithAI(rawDescription, templateId = 'fraud_complaint') {
  console.log(`[AI Description Enhancer] Enhancing raw user description for template: ${templateId}`);

  if (!rawDescription || !rawDescription.trim()) {
    return '1. THAT the Complainant is a law-abiding citizen of India.\n2. THAT the Complainant has suffered a statutory default and financial loss.\n3. THAT immediate legal intervention is requested.';
  }

  const gemini = getGeminiClient();

  if (gemini) {
    const prompt = `You are a Senior Supreme Court Legal Drafter in India.
Enhance and rewrite the following user-submitted informal description of a legal dispute into formal, highly authoritative Indian court petition statement of facts.

User Raw Description: "${rawDescription}"
Document Category / Type: "${templateId}"

Rules:
1. Rephrase raw notes into clean, numbered court statements starting with "1. THAT...", "2. THAT...".
2. Use precise formal legal vocabulary ("Complainant", "Respondent", "unauthorized debit", "statutory breach", "wrongful inducement").
3. Mention relevant Indian laws (IT Act 2000, BNS 2023, Consumer Protection Act 2019, POSH Act 2013, Model Tenancy Act, Payment of Wages Act 1936).
4. Do NOT output JSON or markdown fences. Output ONLY the clean enhanced formal text paragraphs ready to paste into a legal document.`;

    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      if (response?.text) {
        console.log('[AI Description Enhancer SUCCESS] Successfully enhanced user description with Gemini!');
        return response.text.replace(/```/g, '').trim();
      }
    } catch (err) {
      console.warn('[AI Description Enhancer] Gemini call skipped:', err.message);
    }
  }

  // Local fallback enhancer
  console.log('[AI Description Enhancer] Using local formal transformer fallback');
  return `1. THAT the Applicant/Complainant is a law-abiding citizen of India.\n2. THAT regarding the incident submitted: "${rawDescription}", the Respondent committed acts constituting statutory default and legal violation.\n3. THAT the said actions violate fundamental statutory rights under applicable Indian laws and cause severe financial / personal hardship.\n4. THAT the Applicant prays for immediate official intervention and restitution under law.`;
}