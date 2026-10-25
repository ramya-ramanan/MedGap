import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  aiAssistantService,
  ChatMessage,
  MANDATORY_CLINICAL_DISCLAIMER
} from '../../services/aiAssistantService';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Info,
  Lock,
  Unlock,
  PhoneCall
} from 'lucide-react';

export const AiAssistantWidget: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientProfile, medications, adverseReactions, addToast } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLockerAuthorized, setIsLockerAuthorized] = useState<boolean>(() =>
    aiAssistantService.isLockerAuthorized()
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // If already on the dedicated full-page /assistant view, hide the floating widget to avoid redundancy
  const isFullAssistantPage = location.pathname === '/assistant';

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'widget-welcome',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Hi ${
            patientProfile.fullName ? patientProfile.fullName.split(' ')[0] : 'there'
          }! I am your MedGap AI Medical Assistant. Ask me any medical or medicine question.`,
          interactiveFollowUps: [
            'I have a headache and mild fever',
            'Can I take Ibuprofen with Lisinopril?',
            'What are common side effects of Metformin?'
          ],
          disclaimer: MANDATORY_CLINICAL_DISCLAIMER
        }
      ]);
    }
  }, [patientProfile.fullName]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isProcessing]);

  if (isFullAssistantPage) {
    return null;
  }

  const activeMeds = medications.filter(m => m.status === 'Active');

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isProcessing) return;

    setInputQuery('');

    const userMsg: ChatMessage = {
      id: 'widget-user-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      disclaimer: MANDATORY_CLINICAL_DISCLAIMER
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsProcessing(true);

    try {
      const response = await aiAssistantService.processUserMessage(text, {
        patientProfile,
        activeMedications: activeMeds,
        adverseReactions,
        isLockerAuthorized
      });
      setMessages([...updated, response]);
    } catch (err) {
      console.error('Widget error processing assistant query:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Expanded Quick Drawer */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[390px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-medblue-600 to-medblue-800 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm leading-tight flex items-center space-x-1">
                  <span>MedGap Assistant</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-white/20 font-mono">Triage</span>
                </h3>
                <p className="text-[10px] text-sky-100">
                  {isLockerAuthorized ? `🔒 Connected (${activeMeds.length} active meds)` : '🔓 Disconnected'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/assistant');
                }}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Expand to full screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="px-3 py-1 bg-sky-50 border-b border-sky-100 flex items-center justify-between text-[10px] text-slate-600">
            <span className="truncate">General medical & triage guide. Not a doctor.</span>
            <button
              onClick={() => {
                const next = !isLockerAuthorized;
                setIsLockerAuthorized(next);
                aiAssistantService.setLockerAuthorized(next);
              }}
              className="text-medblue-700 font-bold hover:underline shrink-0 ml-2"
            >
              {isLockerAuthorized ? 'Lock Active' : 'Enable Locker'}
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[90%] leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-medblue-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-2'
                    }`}
                  >
                    {/* Emergency Callout */}
                    {msg.emergencyAlert && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 space-y-1.5 font-sans">
                        <div className="flex items-center space-x-1.5 text-rose-700 font-bold text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>EMERGENCY: ACT NOW</span>
                        </div>
                        <p className="text-[11px]">{msg.emergencyAlert.guidanceText}</p>
                        <a
                          href="tel:911"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call 911 / 112 Immediately</span>
                        </a>
                      </div>
                    )}

                    {/* Profile Alerts */}
                    {msg.profileSafetyAlerts && msg.profileSafetyAlerts.length > 0 && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-[11px]">
                        <span className="font-bold flex items-center space-x-1 text-amber-800">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Locker Safety Alert:</span>
                        </span>
                        <p>{msg.profileSafetyAlerts[0].description}</p>
                      </div>
                    )}

                    {/* Text Body */}
                    <div className="whitespace-pre-line text-xs">{msg.text}</div>
                  </div>

                  {/* Follow-up Chips */}
                  {msg.interactiveFollowUps && !isUser && (
                    <div className="flex flex-wrap gap-1 pt-1 max-w-[95%]">
                      {msg.interactiveFollowUps.slice(0, 2).map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSendMessage(chip)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 transition-colors truncate max-w-[180px]"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-medblue-600 animate-ping" />
                <span>Checking clinical references...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                placeholder="Ask about symptoms or medicines..."
                className="flex-1 px-3 py-2 text-xs bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-medblue-500 rounded-xl focus:outline-none transition-all placeholder:text-slate-400"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isProcessing}
                className="p-2 bg-medblue-600 hover:bg-medblue-700 disabled:bg-slate-300 text-white rounded-xl transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-gradient-to-r from-medblue-600 to-medblue-800 hover:from-medblue-700 hover:to-medblue-900 text-white rounded-2xl shadow-lg shadow-medblue-600/30 flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95 group focus:outline-none"
        title="Open AI Medical Assistant"
      >
        <div className="relative">
          <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <span className="text-xs font-bold tracking-tight">AI Assistant</span>
      </button>
    </div>
  );
};
