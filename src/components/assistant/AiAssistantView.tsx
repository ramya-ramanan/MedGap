import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  aiAssistantService,
  ChatMessage,
  ConversationThread,
  MANDATORY_CLINICAL_DISCLAIMER
} from '../../services/aiAssistantService';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Pill,
  HeartHandshake,
  QrCode,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  Share2,
  Lock,
  Unlock,
  ChevronRight,
  Info,
  PhoneCall,
  CheckCircle2,
  User,
  Stethoscope,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const navigate = useNavigate();
  const {
    patientProfile,
    medications,
    adverseReactions,
    addToast,
    isDemoMode
  } = useApp();

  const activeMeds = medications.filter(m => m.status === 'Active');

  // Authorization state for patient locker connection
  const [isLockerAuthorized, setIsLockerAuthorized] = useState<boolean>(() =>
    aiAssistantService.isLockerAuthorized()
  );

  // Thread management
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or load existing threads
  useEffect(() => {
    let savedThreads = aiAssistantService.getThreads();
    let currentId = aiAssistantService.getActiveThreadId();

    if (savedThreads.length === 0) {
      const defaultThread = aiAssistantService.createNewThread('Initial Health Triage');
      savedThreads = [defaultThread];
      currentId = defaultThread.id;
    } else if (!currentId || !savedThreads.some(t => t.id === currentId)) {
      currentId = savedThreads[0].id;
      aiAssistantService.setActiveThreadId(currentId);
    }

    setThreads(savedThreads);
    setActiveThreadId(currentId);
  }, []);

  const currentThread = threads.find(t => t.id === activeThreadId) || threads[0];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages, isProcessing]);

  const toggleLockerAuthorization = () => {
    const nextState = !isLockerAuthorized;
    setIsLockerAuthorized(nextState);
    aiAssistantService.setLockerAuthorized(nextState);
    if (nextState) {
      addToast(
        'Locker Connected',
        'Assistant can now cross-reference your active medications and allergy history for safety.',
        'success'
      );
    } else {
      addToast(
        'Locker Disconnected',
        'Assistant will provide general medical information only without access to your profile.',
        'info'
      );
    }
  };

  const handleCreateNewThread = () => {
    const newThread = aiAssistantService.createNewThread('New Health Consultation');
    setThreads(aiAssistantService.getThreads());
    setActiveThreadId(newThread.id);
    setIsSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClearCurrentThread = () => {
    if (!currentThread) return;
    const resetThread = {
      ...currentThread,
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'welcome-' + Date.now(),
          sender: 'assistant' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Chat cleared. How can I assist you with your health questions or medication safety today?`,
          interactiveFollowUps: [
            'I have a headache and mild fever',
            'Tell me about Metformin uses and side effects',
            'Can I take Ibuprofen with my current medicines?',
            'What are emergency warning signs for chest pain?'
          ],
          disclaimer: MANDATORY_CLINICAL_DISCLAIMER
        }
      ]
    };

    const updated = threads.map(t => (t.id === resetThread.id ? resetThread : t));
    setThreads(updated);
    aiAssistantService.saveThreads(updated);
    addToast('Chat Cleared', 'Conversation history cleared for this session.', 'info');
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = threads.filter(t => t.id !== threadId);
    if (remaining.length === 0) {
      const fresh = aiAssistantService.createNewThread('Health Consultation');
      setThreads([fresh]);
      setActiveThreadId(fresh.id);
    } else {
      setThreads(remaining);
      aiAssistantService.saveThreads(remaining);
      if (activeThreadId === threadId) {
        setActiveThreadId(remaining[0].id);
        aiAssistantService.setActiveThreadId(remaining[0].id);
      }
    }
    addToast('Deleted', 'Consultation thread removed.', 'info');
  };

  const handleExportTranscript = () => {
    if (!currentThread) return;
    const patientName = patientProfile.fullName || 'Patient';
    const transcript = aiAssistantService.exportConversationTranscript(currentThread, patientName);
    
    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MedGap_Assistant_Summary_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Exported', 'Consultation summary downloaded for your doctor.', 'success');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isProcessing || !currentThread) return;

    setInputQuery('');

    // Append user message
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      disclaimer: MANDATORY_CLINICAL_DISCLAIMER
    };

    const updatedMessages = [...currentThread.messages, userMsg];
    const updatedThread: ConversationThread = {
      ...currentThread,
      title: currentThread.messages.length <= 1 ? (text.slice(0, 32) + (text.length > 32 ? '...' : '')) : currentThread.title,
      updatedAt: new Date().toISOString(),
      messages: updatedMessages
    };

    const updatedThreads = threads.map(t => (t.id === updatedThread.id ? updatedThread : t));
    setThreads(updatedThreads);
    aiAssistantService.saveThreads(updatedThreads);
    setIsProcessing(true);

    try {
      // Process through AI Assistant service
      const assistantResponse = await aiAssistantService.processUserMessage(text, {
        patientProfile,
        activeMedications: activeMeds,
        adverseReactions,
        isLockerAuthorized
      });

      const finalMessages = [...updatedMessages, assistantResponse];
      const finalizedThread: ConversationThread = {
        ...updatedThread,
        updatedAt: new Date().toISOString(),
        messages: finalMessages
      };

      const finalThreads = updatedThreads.map(t => (t.id === finalizedThread.id ? finalizedThread : t));
      setThreads(finalThreads);
      aiAssistantService.saveThreads(finalThreads);
    } catch (err) {
      console.error('Error generating assistant response:', err);
      addToast('Processing Error', 'Failed to generate response. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const quickPrompts = [
    '🩺 I have a headache and mild fever',
    '💊 Tell me about Lisinopril uses & warnings',
    '⚠️ Can I take Advil with my current medicines?',
    '🚨 What are emergency red-flag symptoms?',
    '🍵 What are safe self-care steps for a cold?'
  ];

  return (
    <div className="space-y-4">
      {/* Top Advisory Banner */}
      <div className="bg-gradient-to-r from-medblue-50 via-sky-50 to-teal-50 border border-medblue-200/80 rounded-2xl p-3.5 sm:p-4 shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-medblue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-medblue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                AI Medical Assistant & Triage
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-medblue-100 text-medblue-800 border border-medblue-200 uppercase tracking-wider">
                Clinical Safety
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Reliable symptom guidance & verified medicine information. Integrated with your MedGap locker.
            </p>
          </div>
        </div>

        {/* Locker Authorization Toggle */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={toggleLockerAuthorization}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all shadow-xs ${
              isLockerAuthorized
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
            title={
              isLockerAuthorized
                ? 'MedGap locker connected: Cross-referencing active meds & allergies.'
                : 'Click to authorize MedGap locker connection for personalized safety cross-checks.'
            }
          >
            {isLockerAuthorized ? (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Locker Protected ({activeMeds.length} meds)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-slate-500" />
                <span>Locker Disconnected</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/share')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs"
            title="Generate 30-min doctor QR pass"
          >
            <QrCode className="w-3.5 h-3.5 text-medblue-600" />
            <span className="hidden md:inline">Doctor Pass</span>
          </button>
        </div>
      </div>

      {/* Main Chat Layout (Sidebar + Chat Area) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card flex overflow-hidden min-h-[640px] max-h-[750px] relative">
        
        {/* Left Thread History Sidebar */}
        <div
          className={`w-64 bg-slate-50/90 border-r border-slate-200 flex flex-col transition-all duration-200 z-10 ${
            isSidebarOpen ? 'absolute inset-y-0 left-0 shadow-xl' : 'hidden md:flex'
          }`}
        >
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Consultations
            </span>
            <button
              onClick={handleCreateNewThread}
              className="p-1.5 rounded-lg bg-medblue-600 hover:bg-medblue-700 text-white shadow-xs transition-colors flex items-center space-x-1 text-xs font-semibold"
              title="Start a new consultation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {threads.map(thread => {
              const isActive = thread.id === activeThreadId;
              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    aiAssistantService.setActiveThreadId(thread.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-medblue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{thread.title}</span>
                  </div>
                  {threads.length > 1 && (
                    <button
                      onClick={e => handleDeleteThread(thread.id, e)}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? 'hover:bg-medblue-700 text-white' : 'hover:bg-slate-300 text-slate-500'
                      }`}
                      title="Delete consultation"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-200 bg-white/50 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Patient:</span>
              <span className="font-bold text-slate-800 truncate max-w-[120px]">
                {patientProfile.fullName || 'Patient'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Active Meds:</span>
              <span className="font-bold text-slate-800">{activeMeds.length} in locker</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Allergies:</span>
              <span className="font-bold text-rose-700 truncate max-w-[120px]">
                {patientProfile.knownAllergies?.join(', ') || 'None recorded'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Main Chat Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* Chat Header Bar */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 md:hidden"
                title="Toggle consultation list"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">
                {currentThread?.title || 'Consultation'}
              </h2>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleExportTranscript}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center space-x-1"
                title="Export consultation summary for doctor"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export for Doctor</span>
              </button>

              <button
                onClick={handleClearCurrentThread}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center space-x-1"
                title="Reset this chat session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30">
            {currentThread?.messages.map((msg, index) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white'
                        : 'bg-medblue-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Content */}
                  <div className={`max-w-[85%] sm:max-w-[78%] space-y-3 ${isUser ? 'text-right' : 'text-left'}`}>
                    
                    {/* Timestamp & Label */}
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 px-1">
                      <span className="font-semibold text-slate-600">
                        {isUser ? 'You (Patient)' : 'MedGap Medical Assistant'}
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Main Bubble Card */}
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft-sm ${
                        isUser
                          ? 'bg-gradient-to-r from-medblue-600 to-medblue-700 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none space-y-4'
                      }`}
                    >
                      {/* 1. Emergency Warning Banner Callout */}
                      {msg.emergencyAlert && (
                        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-2.5 animate-pulse-beacon">
                          <div className="flex items-center space-x-2 text-rose-700 font-black text-sm uppercase tracking-wide">
                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>{msg.emergencyAlert.alertHeadline}</span>
                          </div>
                          <p className="text-xs text-rose-900 font-medium">
                            {msg.emergencyAlert.guidanceText}
                          </p>
                          <div className="pt-2 border-t border-rose-200 flex flex-wrap gap-2">
                            {msg.emergencyAlert.helplines.map((line, idx) => (
                              <a
                                key={idx}
                                href={`tel:${line.number.split(' ')[0]}`}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>{line.name}: Call {line.number}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Patient Profile Safety & Allergy Alerts */}
                      {msg.profileSafetyAlerts && msg.profileSafetyAlerts.length > 0 && (
                        <div className="space-y-2">
                          {msg.profileSafetyAlerts.map((alert, aIdx) => (
                            <div
                              key={aIdx}
                              className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
                                alert.severity === 'High'
                                  ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                                  : 'bg-amber-50/90 border-amber-300 text-amber-950'
                              }`}
                            >
                              <ShieldAlert
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                  alert.severity === 'High' ? 'text-rose-600' : 'text-amber-600'
                                }`}
                              />
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold">{alert.title}</span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                      alert.severity === 'High'
                                        ? 'bg-rose-200 text-rose-900'
                                        : 'bg-amber-200 text-amber-900'
                                    }`}
                                  >
                                    {alert.severity} Risk
                                  </span>
                                </div>
                                <p className="text-[11px] leading-relaxed">{alert.description}</p>
                                <p className="text-[11px] font-semibold text-slate-700">
                                  💡 <em>Recommendation:</em> {alert.recommendation}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 3. Verified Medicine Monograph Cards */}
                      {msg.verifiedMonographs && msg.verifiedMonographs.length > 0 && (
                        <div className="space-y-3">
                          {msg.verifiedMonographs.map((mono, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/90 space-y-3"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <div className="flex items-center space-x-2">
                                  <Pill className="w-4 h-4 text-medblue-600" />
                                  <span className="font-extrabold text-slate-900 text-sm">
                                    {mono.name} ({mono.genericName})
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{mono.source}</span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-600">
                                <strong className="text-slate-800">Class:</strong> {mono.therapeuticClass}
                              </p>
                              <div className="text-xs text-slate-700 bg-white/90 p-3 rounded-xl border border-sky-100">
                                <strong className="text-medblue-900 block mb-1">Approved Indications:</strong>
                                <p>{mono.indication}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 4. Text Body (Formatted paragraphs) */}
                      <div className="space-y-2 whitespace-pre-line">
                        {msg.text}
                      </div>

                      {/* 5. Doctor Visit Preparation Questions */}
                      {msg.suggestedDoctorQuestions && msg.suggestedDoctorQuestions.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                            <Stethoscope className="w-3 h-3 text-medblue-600" />
                            <span>Questions to Ask Your Doctor</span>
                          </span>
                          <ul className="space-y-1">
                            {msg.suggestedDoctorQuestions.map((q, qIdx) => (
                              <li key={qIdx} className="text-xs text-slate-600 flex items-start space-x-1.5">
                                <span className="text-medblue-600 font-bold">•</span>
                                <span>{q}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Clinical Disclaimer on every assistant response */}
                      {!isUser && (
                        <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-1.5 text-[10px] text-slate-400">
                          <Info className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{msg.disclaimer}</span>
                        </div>
                      )}

                    </div>

                    {/* 6. Interactive Clickable Follow-up Chips */}
                    {msg.interactiveFollowUps && msg.interactiveFollowUps.length > 0 && !isUser && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.interactiveFollowUps.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleSendMessage(chip)}
                            className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-medblue-50 text-slate-700 hover:text-medblue-700 border border-slate-200 hover:border-medblue-300 transition-all flex items-center space-x-1"
                          >
                            <span>{chip}</span>
                            <ChevronRight className="w-3 h-3 opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* Thinking / Processing Spinner */}
            {isProcessing && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-medblue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs shadow-soft-sm flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-medblue-600 animate-ping" />
                  <span className="font-semibold text-slate-700">
                    Evaluating clinical guidelines & cross-referencing medicine safety...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips (Shown when few messages) */}
          {currentThread && currentThread.messages.length <= 2 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Try asking:</span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-medblue-50 border border-slate-200 hover:border-medblue-300 text-slate-700 hover:text-medblue-700 shrink-0 font-medium transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Box */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  placeholder="Ask about symptoms, medicines, side effects, or safety warnings..."
                  className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-medblue-500 rounded-2xl focus:outline-none transition-all placeholder:text-slate-400"
                  disabled={isProcessing}
                />
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isProcessing}
                className="px-4 py-3 bg-medblue-600 hover:bg-medblue-700 disabled:bg-slate-300 text-white rounded-2xl font-semibold transition-all shadow-sm flex items-center justify-center shrink-0 active:scale-95"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[10px] text-slate-400 text-center mt-2">
              🔒 MedGap provides general medical information and safety guidance; it does not replace a qualified healthcare professional.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
