import React, { useState } from 'react';
import { ShieldAlert, FileText, HelpCircle, Briefcase, ShoppingBag, ChevronRight, Search } from 'lucide-react';
import TemplateForm from './TemplateForm';
import Card from '../common/Card';
import { useLanguage } from '../../context/LanguageContext';

const TEMPLATE_PRESETS = [
  {
    id: 'fraud_complaint',
    title: 'Fraud Complaint (Cyber & Financial)',
    hindiTitle: 'धोखाधड़ी शिकायत (साइबर और वित्तीय)',
    category: 'Cyber Fraud',
    hindiCategory: 'साइबर धोखाधड़ी',
    icon: ShieldAlert,
    iconBg: 'bg-red-100 text-red-700',
    description: 'Official complaint petition for unauthorized bank deductions, OTP scams, or online shopping fraud for police & cyber cells.',
    hindiDescription: 'पुलिस और साइबर सेल के लिए अनधिकृत बैंक कटौती, ओटीपी घोटाले या ऑनलाइन शॉपिंग धोखाधड़ी के लिए आधिकारिक शिकायत याचिका।',
    fields: [
      { name: 'fullName', label: 'Complainant Full Name', hindiLabel: 'शिकायतकर्ता का पूरा नाम', type: 'text', placeholder: 'e.g. Rajesh Kumar', required: true },
      { name: 'contactPhone', label: 'Contact Phone Number', hindiLabel: 'संपर्क फोन नंबर', type: 'text', placeholder: 'e.g. +91 98765 43210', required: true },
      { name: 'bankName', label: 'Bank / Payment Platform', hindiLabel: 'बैंक / भुगतान प्लेटफॉर्म', type: 'text', placeholder: 'e.g. SBI, HDFC, Paytm', required: true },
      { name: 'transactionDate', label: 'Date of Fraudulent Incident', hindiLabel: 'धोखाधड़ी घटना की तिथि', type: 'date', required: true },
      { name: 'amountLost', label: 'Total Monetary Loss Amount (₹)', hindiLabel: 'कुल मौद्रिक हानि राशि (₹)', type: 'text', placeholder: 'e.g. 35,000', required: true },
      { name: 'utrReference', label: 'Transaction UTR / Reference ID', hindiLabel: 'लेनदेन UTR / संदर्भ आईडी', type: 'text', placeholder: 'e.g. UTR-2026-991823', required: false },
      { name: 'incidentDescription', label: 'Detailed Description of Fraud Incident', hindiLabel: 'धोखाधड़ी की घटना का विस्तृत विवरण', type: 'textarea', placeholder: 'Provide step-by-step detail of how the call/link fraud occurred...', required: true }
    ]
  },
  {
    id: 'legal_notice',
    title: 'Formal Legal Notice',
    hindiTitle: 'आधिकारिक कानूनी नोटिस',
    category: 'Civil Dispute',
    hindiCategory: 'दीवानी विवाद',
    icon: FileText,
    iconBg: 'bg-blue-100 text-blue-900',
    description: 'Standard legal demand notice for breach of contract, unpaid personal loans, or landlord deposit refund disputes.',
    hindiDescription: 'अनुबंध के उल्लंघन, अवैतनिक व्यक्तिगत ऋण, या मकान मालिक जमा रिफंड विवादों के लिए मानक कानूनी मांग नोटिस।',
    fields: [
      { name: 'senderName', label: 'Sender (Your Full Name)', hindiLabel: 'प्रेषक (आपका पूरा नाम)', type: 'text', placeholder: 'e.g. Ananya Sharma', required: true },
      { name: 'senderAddress', label: 'Your Complete Address', hindiLabel: 'आपका पूरा पता', type: 'textarea', placeholder: 'House No, Sector, City, Pincode', required: true, rows: 2 },
      { name: 'recipientName', label: 'Opposite Party (Recipient Name)', hindiLabel: 'विपक्षी दल (प्राप्तकर्ता का नाम)', type: 'text', placeholder: 'e.g. Vikram Malhotra', required: true },
      { name: 'recipientAddress', label: 'Recipient Address', hindiLabel: 'प्राप्तकर्ता का पता', type: 'textarea', placeholder: 'Complete postal address of respondent', required: true, rows: 2 },
      { name: 'noticeSubject', label: 'Legal Notice Subject', hindiLabel: 'कानूनी नोटिस का विषय', type: 'text', placeholder: 'e.g. Recovery of Security Deposit of Rs. 40,000', required: true },
      { name: 'disputeDetails', label: 'Facts & Grievance Details', hindiLabel: 'तथ्य और शिकायत विवरण', type: 'textarea', placeholder: 'State dates, agreements, and nature of default...', required: true },
      { name: 'deadlineDays', label: 'Notice Period Deadline (Days)', hindiLabel: 'नोटिस अवधि की समय सीमा (दिन)', type: 'select', options: ['7 Days', '15 Days', '30 Days'], required: true }
    ]
  },
  {
    id: 'rti_application',
    title: 'RTI Application (Right to Information)',
    hindiTitle: 'आरटीआई आवेदन (सूचना का अधिकार)',
    category: 'Government Governance',
    hindiCategory: 'सरकारी शासन',
    icon: HelpCircle,
    iconBg: 'bg-amber-100 text-amber-900',
    description: 'Statutory petition under Section 6(1) of RTI Act 2005 to request official records from public authorities.',
    hindiDescription: 'सार्वजनिक अधिकारियों से आधिकारिक रिकॉर्ड का अनुरोध करने के लिए आरटीआई अधिनियम 2005 की धारा 6(1) के तहत वैधानिक याचिका।',
    fields: [
      { name: 'applicantName', label: 'Applicant Name', hindiLabel: 'आवेदक का नाम', type: 'text', placeholder: 'e.g. Suresh Verma', required: true },
      { name: 'publicAuthority', label: 'Name of Public Department / PIO Office', hindiLabel: 'सार्वजनिक विभाग / पीआईओ कार्यालय का नाम', type: 'text', placeholder: 'e.g. Public Works Department (PWD) Delhi', required: true },
      { name: 'departmentAddress', label: 'Department Postal Address', hindiLabel: 'विभाग का डाक पता', type: 'textarea', placeholder: 'Address of the Public Information Officer', required: true, rows: 2 },
      { name: 'informationSought', label: 'Specific Questions / Documents Requested', hindiLabel: 'विशिष्ट प्रश्न / मांगे गए दस्तावेज', type: 'textarea', placeholder: 'List specific query 1, query 2 regarding sanctioned funds, project start date, inspection reports...', required: true },
      { name: 'timePeriod', label: 'Time Period of Information', hindiLabel: 'सूचना की समयावधि', type: 'text', placeholder: 'e.g. Financial Year 2024 - 2026', required: true },
      { name: 'feeMode', label: 'Application Fee Mode (₹10)', hindiLabel: 'आवेदन शुल्क का प्रकार (₹10)', type: 'select', options: ['Postal Order (IPO)', 'Court Fee Stamp', 'Demand Draft', 'BPL Exempted'], required: true }
    ]
  },
  {
    id: 'employment_grievance',
    title: 'Employment Dispute & Salary Recovery Notice',
    hindiTitle: 'रोजगार विवाद और वेतन वसूली नोटिस',
    category: 'Labour Law',
    hindiCategory: 'श्रम कानून',
    icon: Briefcase,
    iconBg: 'bg-emerald-100 text-emerald-800',
    description: 'Demand notice for unpaid salary, illegal termination, or withholding of Provident Fund / Experience Certificate.',
    hindiDescription: 'अवैतनिक वेतन, अवैध बर्खास्तगी, या भविष्य निधि / अनुभव प्रमाण पत्र रोकने के लिए मांग नोटिस।',
    fields: [
      { name: 'employeeName', label: 'Employee Full Name', hindiLabel: 'कर्मचारी का पूरा नाम', type: 'text', placeholder: 'e.g. Priya Nair', required: true },
      { name: 'companyName', label: 'Employer / Company Name', hindiLabel: 'नियोक्ता / कंपनी का नाम', type: 'text', placeholder: 'e.g. TechCorp Solutions Pvt Ltd', required: true },
      { name: 'designation', label: 'Designation Held', hindiLabel: 'पद का नाम', type: 'text', placeholder: 'e.g. Senior Operations Executive', required: true },
      { name: 'unpaidMonths', label: 'Period of Unpaid Salary', hindiLabel: 'अवैतनिक वेतन की अवधि', type: 'text', placeholder: 'e.g. June 2026 & July 2026', required: true },
      { name: 'claimAmount', label: 'Total Claim Amount (₹)', hindiLabel: 'कुल दावा राशि (₹)', type: 'text', placeholder: 'e.g. 1,20,000', required: true },
      { name: 'employmentGrievance', label: 'Summary of Employment Grievance', hindiLabel: 'रोजगार शिकायत का सारांश', type: 'textarea', placeholder: 'Detail date of joining, notice served, and communications regarding dues...', required: true }
    ]
  },
  {
    id: 'consumer_complaint',
    title: 'Consumer Court Petition',
    hindiTitle: 'उपभोक्ता फोरम याचिका',
    category: 'Consumer Protection',
    hindiCategory: 'उपभोक्ता संरक्षण',
    icon: ShoppingBag,
    iconBg: 'bg-purple-100 text-purple-800',
    description: 'Grievance petition for defective products, deficient service delivery, or misleading advertisements under Consumer Protection Act 2019.',
    hindiDescription: 'उपभोक्ता संरक्षण अधिनियम 2019 के तहत दोषपूर्ण उत्पादों, सेवा की कमी या भ्रामक विज्ञापनों के लिए शिकायत याचिका।',
    fields: [
      { name: 'consumerName', label: 'Complainant Name', hindiLabel: 'शिकायतकर्ता का नाम', type: 'text', placeholder: 'e.g. Harpreet Singh', required: true },
      { name: 'sellerName', label: 'Seller / Service Provider Name', hindiLabel: 'विक्रेता / सेवा प्रदाता का नाम', type: 'text', placeholder: 'e.g. SuperElectronics Retails Pvt Ltd', required: true },
      { name: 'productService', label: 'Product / Service Purchased', hindiLabel: 'खरीदा गया उत्पाद / सेवा', type: 'text', placeholder: 'e.g. 1.5 Ton Inverter AC', required: true },
      { name: 'purchaseDate', label: 'Date of Purchase / Invoice Date', hindiLabel: 'खरीद की तिथि / चालान तिथि', type: 'date', required: true },
      { name: 'invoiceNumber', label: 'Invoice / Bill Number', hindiLabel: 'चालान / बिल नंबर', type: 'text', placeholder: 'e.g. INV-882910', required: true },
      { name: 'defectDetails', label: 'Defect / Service Deficiency Details', hindiLabel: 'दोष / सेवा की कमी का विवरण', type: 'textarea', placeholder: 'Explain how the product malfunctioned and refused service under warranty...', required: true },
      { name: 'compensationSought', label: 'Compensation & Refund Demanded (₹)', hindiLabel: 'मांगा गया मुआवजा और रिफंड (₹)', type: 'text', placeholder: 'e.g. Full refund of ₹42,000 + ₹10,000 mental harassment compensation', required: true }
    ]
  }
];

const TemplateSelector = () => {
  const { language, t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = TEMPLATE_PRESETS.filter((item) => {
    const q = searchQuery.toLowerCase();
    const title = language === 'Hindi' ? item.hindiTitle : item.title;
    const cat = language === 'Hindi' ? item.hindiCategory : item.category;
    const desc = language === 'Hindi' ? item.hindiDescription : item.description;

    return (
      title.toLowerCase().includes(q) ||
      cat.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q)
    );
  });

  if (selectedTemplate) {
    return (
      <TemplateForm
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('templatesTitle')}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {t('templatesSubtitle')}
          </p>
        </div>

        {/* Search Filter Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Grid of Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((item) => {
          const IconComp = item.icon;
          const cardTitle = language === 'Hindi' ? item.hindiTitle : item.title;
          const cardCategory = language === 'Hindi' ? item.hindiCategory : item.category;
          const cardDesc = language === 'Hindi' ? item.hindiDescription : item.description;

          return (
            <Card
              key={item.id}
              hoverable
              onClick={() => setSelectedTemplate(item)}
              className="flex flex-col justify-between group border-slate-200 hover:border-blue-900 transition-all p-6 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${item.iconBg}`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    {cardCategory}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-900 transition-colors">
                  {cardTitle}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {cardDesc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-900 group-hover:text-amber-600">
                <span>{t('cardAction')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelector;
