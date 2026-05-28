// frontend/src/components/AIChatbot.jsx

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, HelpCircle, ChevronRight } from 'lucide-react';
import { getAIExplanation } from '../api/api';

function AIChatbot({ 
  isOpen, 
  onClose,
  numProcesses,
  numResources,
  available,
  maxMatrix,
  allocMatrix,
  needMatrix,
  isSafe,
  safeSequence
}) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hello! I am your AI OS Professor. I can help explain deadlocks, safe states, the Banker's Algorithm, or analyze our current simulator matrices. Ask me anything!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll chat history to the bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle chatbot send
  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message to state
    const userMsg = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // API call to the Flask backend with current chat history
      const res = await getAIExplanation({
        type: 'chat',
        message: textToSend,
        chatHistory: messages
      });

      // Add AI response to state
      setMessages(prev => [...prev, { role: 'model', text: res.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `⚠️ **System Error**: ${err.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-configured educational quick-questions
  const quickQuestions = [
    { label: "What is a Deadlock?", text: "Explain what an operating system deadlock is and its four necessary conditions." },
    { label: "How does Banker's work?", text: "How does Dijkstra's Banker's Algorithm prevent deadlocks in OS?" },
    { label: "Safe vs Unsafe State?", text: "What is the difference between a safe state and an unsafe state? Does unsafe mean deadlocked?" },
    { label: "Analyze Current State", text: `Review our current configuration: available: [${available}], is_safe: ${isSafe}, safe_sequence: [${safeSequence}]. What does this mean?` }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-45 bg-black/40 backdrop-blur-[3px]"
          />

          {/* Chat Sliding Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0c0e18] border-l border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyberPurple/10 border border-cyberPurple/20 text-cyberPurple rounded-xl">
                  <Bot size={18} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <span>AI OS Professor</span>
                    <Sparkles size={12} className="text-cyberCyan" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Powered by Google Gemini API</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg text-slate-400 hover:text-slate-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Message List scroll box */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              
              {/* Educational guidelines note */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-400 leading-normal flex items-start gap-2">
                <HelpCircle size={14} className="shrink-0 text-cyberCyan mt-0.5" />
                <span>
                  This chatbot incorporates the active state matrices of your simulator in its prompt context. Feel free to ask queries referencing your current grid setup.
                </span>
              </div>

              {/* Chat bubbles list */}
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className={`p-2 rounded-lg text-xs shrink-0 w-8 h-8 flex items-center justify-center border ${
                    msg.role === 'user' 
                      ? 'bg-cyberCyan/10 border-cyberCyan/20 text-cyberCyan' 
                      : 'bg-cyberPurple/10 border-cyberPurple/20 text-cyberPurple'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyberCyan/10 to-cyberPurple/10 border border-cyberCyan/20 text-slate-100 rounded-tr-none'
                      : 'bg-slate-900/60 border border-white/5 text-slate-300 rounded-tl-none'
                  }`}>
                    {/* Render simple markdown bold lines */}
                    {msg.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
                        {line.startsWith('### ') ? (
                          <strong className="block text-sm text-slate-200 mt-2 mb-1">{line.replace('### ', '')}</strong>
                        ) : line.startsWith('- ') ? (
                          <span className="block pl-2">• {line.replace('- ', '')}</span>
                        ) : (
                          // Simple bold parser
                          line.split('**').map((part, pIdx) => 
                            pIdx % 2 === 1 ? <strong key={pIdx} className="text-cyberCyan">{part}</strong> : part
                          )
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {/* AI is typing loading bubbles */}
              {isLoading && (
                <div className="flex gap-3 self-start max-w-[80%]">
                  <div className="p-2 rounded-lg bg-cyberPurple/10 border border-cyberPurple/20 text-cyberPurple shrink-0 w-8 h-8 flex items-center justify-center">
                    <Bot size={14} className="animate-spin-slow" />
                  </div>
                  <div className="p-3 bg-slate-900 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyberCyan animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyberCyan animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyberCyan animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Board */}
            <div className="px-4 py-2 flex flex-col gap-1.5 border-t border-white/5 bg-slate-950/20">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Quick Queries</label>
              <div className="flex gap-2 overflow-x-auto pb-1 select-none">
                {quickQuestions.map((q, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => handleSendMessage(q.text)}
                    disabled={isLoading}
                    className="shrink-0 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyberCyan/30 rounded-lg text-[10px] text-slate-400 hover:text-cyberCyan transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input panel */}
            <div className="p-4 border-t border-white/5 bg-slate-950/60">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} 
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question about OS deadlocks..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-950 border border-white/10 hover:border-white/20 focus:border-cyberCyan/40 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="p-2.5 bg-gradient-to-r from-cyberCyan to-cyberPurple text-darkBg font-bold rounded-xl hover:shadow-[0_0_10px_rgba(0,242,254,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AIChatbot;
