import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Sprout,
  User,
  ArrowRight
} from 'lucide-react';

const AIChatbot = () => {
  const { messages, chatLoading, sendChatMessage, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);

  // Auto Scroll to Bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatLoading, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || chatLoading) return;
    
    sendChatMessage(inputValue);
    setInputValue('');
  };

  const handleChipClick = (text) => {
    if (chatLoading) return;
    sendChatMessage(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* 1. FLOATING CHAT BUBBLE TRIGGER */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label={t.chatbotTitle}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-agri-green-700 hover:bg-agri-green-800 dark:bg-agri-green-600 dark:hover:bg-agri-green-700 text-white shadow-lg hover:shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 group"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition-transform duration-200" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
        </button>
      )}

      {/* 2. CHAT DRAWER PANEL */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.25s_ease-out] transition-all">
          
          {/* Chat Header */}
          <div className="px-4 py-3 bg-agri-green-800 dark:bg-agri-dark-obsidian text-white border-b border-agri-green-950/20 dark:border-agri-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg text-agri-green-300">
                <Sprout className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                  {t.chatbotTitle}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <span className="text-[10px] text-agri-green-200/80 dark:text-agri-dark-text-secondary font-medium uppercase tracking-wider block mt-0.5">
                  AgriShield Live Bot
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-agri-dark-obsidian/20">
            {messages.map((msg, index) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={index} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-1`}>
                  
                  {/* Bubble Container */}
                  <div className="flex items-end gap-2 max-w-[85%]">
                    
                    {/* Bot Icon */}
                    {isBot && (
                      <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-agri-dark-obsidian border border-emerald-200/30 text-agri-green-700 dark:text-agri-dark-sprout shrink-0 text-[10px]">
                        🌾
                      </div>
                    )}

                    <div className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm font-medium whitespace-pre-line
                      ${isBot 
                        ? 'bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border text-slate-700 dark:text-slate-200 rounded-bl-none' 
                        : 'bg-agri-green-700 text-white rounded-br-none'
                      }`}
                    >
                      {msg.text}
                    </div>

                  </div>

                  {/* Preset Suggestions Chips (Bot only) */}
                  {isBot && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pl-0 sm:pl-8 flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                      {msg.suggestions.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleChipClick(chip)}
                          className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-agri-green-700 dark:text-agri-dark-text-secondary dark:hover:text-agri-dark-sprout bg-white dark:bg-agri-dark-moss hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-agri-dark-border px-2.5 py-1 rounded-full cursor-pointer transition-all active:scale-95 shadow-inner-soft"
                        >
                          {chip}
                          <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}

            {/* Chatbot Typing Loader */}
            {chatLoading && (
              <div className="flex items-end gap-2 max-w-[80%]">
                <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-agri-dark-obsidian border border-emerald-200/30 text-agri-green-700 dark:text-agri-dark-sprout shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5 text-slate-400 dark:text-agri-dark-text-secondary">
                  <span className="text-xs font-semibold">{t.chatbotTyping}</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef}></div>
          </div>

          {/* Chat Form Footer */}
          <form onSubmit={handleSubmit} className="px-4 py-3 bg-white dark:bg-agri-dark-moss border-t border-slate-100 dark:border-agri-dark-border flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.chatPlaceholder}
              disabled={chatLoading}
              className="flex-1 bg-slate-50 dark:bg-agri-dark-obsidian border border-slate-200 dark:border-agri-dark-border dark:text-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-agri-green-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || chatLoading}
              className="p-2.5 rounded-xl bg-agri-green-700 hover:bg-agri-green-800 dark:bg-agri-green-600 dark:hover:bg-agri-green-700 text-white disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
              aria-label={t.chatButtonLabel}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default AIChatbot;
