import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, FileText, ShieldAlert, LogOut, Globe, Scale, User, CheckCircle2, ChevronRight, Phone, MapPin, Compass, PhoneCall, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import ChatWindow from '../components/ChatBot/ChatWindow';
import TemplateSelector from '../components/Templates/TemplateSelector';
import SOSButton, { HELPLINE_NUMBERS } from '../components/SOS/SOSButton';
import Button from '../components/common/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { addToast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'templates' | 'sos'

  // SOS Page Location State
  const [dashCity, setDashCity] = useState('');
  const [dashState, setDashState] = useState('');
  const [dashAddress, setDashAddress] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [locDetecting, setLocDetecting] = useState(false);

  const handleCopyNumber = (number, id) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    addToast({ type: 'info', title: 'Helpline Copied', message: `Copied ${number} to clipboard.` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAutoDetectDashboard = () => {
    setLocDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocDetecting(false);
          addToast({ type: 'success', title: 'Location Detected', message: `Lat: ${pos.coords.latitude.toFixed(3)}, Lng: ${pos.coords.longitude.toFixed(3)}` });
          if (!dashCity) setDashCity('Current GPS Location');
        },
        (err) => {
          setLocDetecting(false);
          addToast({ type: 'warning', title: 'GPS Unavailable', message: 'Please type your City and State manually below.' });
        }
      );
    } else {
      setLocDetecting(false);
      addToast({ type: 'warning', title: 'GPS Unsupported', message: 'Please type your location manually.' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast({ type: 'info', title: 'Logged Out', message: 'You have been signed out safely.' });
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { id: 'chat', label: t('navChat'), icon: MessageSquare, badge: 'AI Bot' },
    { id: 'templates', label: t('navTemplates'), icon: FileText, badge: 'PDF' },
    { id: 'sos', label: t('navSos'), icon: ShieldAlert, badge: 'Alert' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-amber-100 selection:text-blue-900 pb-20 md:pb-0">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-blue-900 text-white shadow-md border-b border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl text-blue-950 font-extrabold shadow-xs">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl tracking-tight leading-none text-white flex items-center gap-2">
                {t('appTitle')} <span className="text-amber-400 font-bold text-xs uppercase tracking-widest hidden sm:inline">{t('appHindiTitle')}</span>
              </h1>
              <p className="text-[11px] text-blue-200 font-medium hidden xs:block">{t('tagline')}</p>
            </div>
          </div>

          {/* Controls: Language Switcher & User Menu */}
          <div className="flex items-center gap-3">
            {/* Language Toggle Dropdown */}
            <div className="flex items-center gap-1.5 bg-blue-950/80 px-2.5 py-1.5 rounded-xl border border-blue-800 text-xs font-semibold">
              <Globe className="w-4 h-4 text-amber-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="English" className="text-slate-900">English (EN)</option>
                <option value="Hindi" className="text-slate-900">हिन्दी (Hindi)</option>
              </select>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-blue-800">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-blue-950 font-bold flex items-center justify-center text-xs shadow-xs">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <span className="text-xs font-semibold text-white hidden md:inline max-w-[120px] truncate">
                {currentUser?.displayName || currentUser?.email || 'Citizen User'}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-blue-200 hover:text-white hover:bg-blue-800/80 rounded-xl transition-colors cursor-pointer"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* App Body Container: Desktop Sidebar + Tab Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row p-4 sm:p-6 gap-6">
        {/* Desktop Sidebar (Persistent) */}
        <aside className="hidden md:flex flex-col w-64 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-[fit-content] sticky top-20">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            {t('navMenuHeader')}
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isActive ? 'bg-amber-500 text-blue-950' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Quick Info Box in Sidebar */}
          <div className="mt-8 bg-blue-50/80 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>{t('legalAidTitle')}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t('legalAidDesc')}
            </p>
            <div className="pt-1 font-mono font-bold text-blue-950 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('nalsaHelpline')}</span>
            </div>
          </div>
        </aside>

        {/* Tab Content Display Container */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === 'chat' && <ChatWindow />}
          {activeTab === 'templates' && <TemplateSelector />}
          {activeTab === 'sos' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-xl text-red-700">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{t('sosHeaderTitle')}</h2>
                    <p className="text-xs text-slate-600">{t('sosHeaderSubtitle')}</p>
                  </div>
                </div>
              </div>

              {/* Location Input Prompt Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>{t('currentLocation')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoDetectDashboard}
                    disabled={locDetecting}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Compass className={`w-4 h-4 ${locDetecting ? 'animate-spin' : ''}`} />
                    {locDetecting ? t('detectingGps') : t('detectGpsBtn')}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('cityLabel')}</label>
                    <input
                      type="text"
                      placeholder="e.g. New Delhi"
                      value={dashCity}
                      onChange={(e) => setDashCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('stateLabel')}</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi"
                      value={dashState}
                      onChange={(e) => setDashState(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('addressLabel')}</label>
                    <input
                      type="text"
                      placeholder="e.g. Connaught Place"
                      value={dashAddress}
                      onChange={(e) => setDashAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Categorized Emergency Helpline Numbers Directory */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Phone className="w-5 h-5 text-red-600" />
                    <span>{t('helplineDirTitle')}</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">{t('clickToDial')}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {HELPLINE_NUMBERS.map((hp) => {
                    const IconComp = hp.icon || Phone;
                    return (
                      <div
                        key={hp.id}
                        className={`border rounded-2xl p-5 space-y-3 transition-all shadow-xs flex flex-col justify-between ${hp.color}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider ${hp.badgeColor}`}>
                              {hp.category}
                            </span>
                            <button
                              onClick={() => handleCopyNumber(hp.number, hp.id)}
                              className="text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer"
                              title="Copy number"
                            >
                              {copiedId === hp.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-white/80 shadow-2xs">
                              <IconComp className="w-5 h-5 text-slate-800" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-snug">{hp.name}</h4>
                              <p className="text-lg font-black font-mono tracking-tight text-slate-950">{hp.number}</p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed">{hp.description}</p>
                        </div>

                        <div className="pt-2">
                          <a
                            href={`tel:${hp.number}`}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors"
                          >
                            <Phone className="w-4 h-4 text-amber-400" />
                            <span>{t('callNow')} ({hp.number})</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom SOS Trigger CTA Banner */}
              <div className="bg-red-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-extrabold text-lg text-white">{t('sosBannerTitle')}</h4>
                  <p className="text-xs text-red-200 max-w-md">
                    {t('sosBannerDesc')}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => {
                      const sosBtn = document.querySelector('.animate-pulse-sos');
                      if (sosBtn) sosBtn.click();
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-blue-950 font-black px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-95 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>{t('launchSosBtn')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating SOS Button Visible on Every Tab & Screen */}
      <SOSButton />

      {/* Mobile Bottom Navigation Bar (Persistent) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 md:hidden px-4 py-2 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-blue-900 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-100 text-blue-900' : ''}`}>
                <IconComp className="w-5 h-5" />
              </div>
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Dashboard;

