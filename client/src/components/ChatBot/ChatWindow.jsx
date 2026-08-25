import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, Bot, User, Sparkles, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../common/Button';

const ChatWindow = () => {
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();
  const messagesEndRef = useRef(null);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initial welcome message from NyayaMitra Legal AI
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      category: 'Legal Aid Guidance',
      answer: t('welcomeMsg'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Update initial welcome message if language changes and only 1 welcome message exists
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id.startsWith('welcome-')) {
        return [{ ...prev[0], answer: t('welcomeMsg') }];
      }
      return prev;
    });
  }, [language]);

  // Suggested prompt chips for fast testing
  const promptSuggestions = [
    { label: language === 'Hindi' ? '🚨 साइबर / वित्तीय धोखाधड़ी' : '🚨 Financial / OTP Fraud', prompt: t('quickPrompt2') },
    { label: language === 'Hindi' ? '💼 बकाया वेतन विवाद' : '💼 Unpaid Salary Dispute', prompt: t('quickPrompt3') },
    { label: language === 'Hindi' ? '🏠 मकान मालिक जमा विवाद' : '🏠 Landlord Deposit Dispute', prompt: t('quickPrompt1') },
    { label: language === 'Hindi' ? '🛒 उपभोक्ता वारंटी / रिफंड' : '🛒 Consumer Warranty Complaint', prompt: t('quickPrompt4') }
  ];

  // Auto-scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsgObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputMessage('');
    setErrorMessage('');
    setLoading(true);

    try {
      // POST /api/chat with { message, userId, language }
      const res = await api.post('/api/chat', {
        message: text.trim(),
        userId: currentUser?.uid || 'guest-user-101',
        language: language
      });

      const { category, answer } = res.data;

      const botMsgObj = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        category: category || 'Legal Rights',
        answer: answer || 'Thank you for your query. Under Indian law, you have legal rights to file a official petition.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsgObj]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackAns = err.response?.data?.answer || err.response?.data?.error || 'Under Indian Law, you hold fundamental constitutional and statutory protections. Please file an official grievance or call 15100 (NALSA Legal Aid).';
      const botMsgObj = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        category: 'LEGAL AID & PROTECTION',
        answer: fallbackAns,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsgObj]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        category: 'Legal Assistant',
        answer: 'Chat history cleared. How can I assist you with legal guidance today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const renderFormattedText = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-slate-800 text-sm leading-relaxed font-sans">
        {lines.map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={index} className="h-1" />;
          
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={index} className="font-extrabold text-blue-950 text-sm sm:text-base mt-3 mb-1 border-b border-slate-200 pb-1">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          
          if (trimmed.startsWith('---')) {
            return <hr key={index} className="border-slate-200 my-2" />;
          }

          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedLine = parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-slate-950">{part.slice(2, -2)}</strong>;
            }
            return part;
          });

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={index} className="flex items-start gap-2 pl-2 text-slate-800">
                <span className="text-amber-600 font-bold text-sm leading-none mt-1">•</span>
                <span className="flex-1">{formattedLine}</span>
              </div>
            );
          }

          return <p key={index}>{formattedLine}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              {t('chatTitle')}
              <span className="text-[10px] bg-amber-500 text-blue-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Ver 2.4 Active
              </span>
            </h2>
            <p className="text-xs text-blue-200/80">{t('chatSubtitle')}</p>
          </div>
        </div>

        <button
          onClick={clearChatHistory}
          className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
          title="Clear Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50">
        {/* Render Suggestion Chips if initial state */}
        {messages.length <= 1 && (
          <div className="mb-6 bg-blue-50/70 border border-blue-100 rounded-xl p-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 font-semibold text-xs text-blue-900 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t('quickPromptsHeader')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="text-left p-2.5 rounded-lg bg-white hover:bg-blue-950 hover:text-white text-slate-700 text-xs border border-slate-200 transition-all font-medium shadow-2xs group flex items-start gap-2 cursor-pointer"
                >
                  <span className="font-semibold text-blue-900 group-hover:text-amber-300">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-200`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-xs shadow-xs ${
                  isUser ? 'bg-amber-600' : 'bg-blue-900'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div className={`max-w-[85%] sm:max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Category Badge for Bot Responses */}
                {!isUser && msg.category && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 mb-1">
                    <ShieldCheck className="w-3 h-3 text-amber-700" />
                    <span>{msg.category}</span>
                  </div>
                )}

                {/* Message Content Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-blue-900 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-sans'
                  }`}
                >
                  {isUser ? <p className="whitespace-pre-wrap">{msg.text}</p> : renderFormattedText(msg.answer)}
                </div>

                {/* Timestamp */}
                <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                {language === 'Hindi' ? 'न्यायमित्र एआई भारतीय कानूनों का विश्लेषण कर रहा है' : 'NyayaMitra AI is analyzing Indian statutes'}
              </span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-900 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-900 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-900 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chatPlaceholder')}
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all disabled:opacity-50"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            isDisabled={!inputMessage.trim()}
            icon={Send}
            className="px-5 py-3 rounded-xl font-bold"
          >
            <span className="hidden sm:inline">{t('chatSendBtn')}</span>
          </Button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-2">
          ⚖️ {t('chatDisclaimer')}
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
