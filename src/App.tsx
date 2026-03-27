/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  History as HistoryIcon, 
  LayoutDashboard, 
  Plus, 
  X, 
  ChevronRight, 
  ArrowLeft,
  BookOpen,
  MessageSquare,
  Globe,
  Wind,
  Target,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSpeech } from './hooks/useSpeech';
import { getAIReply, generateFeedback } from './lib/gemini';
import { Session, SessionConfig, Message, Difficulty, Language } from './types';

// --- Components ---

const LandingPage = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-6 text-center">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl"
    >
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200">
          <Mic className="text-white w-10 h-10" />
        </div>
      </div>
      <h1 className="text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
        EduVoice <span className="text-blue-600">AI</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
        Practice interviews, Q&A, and learning with an AI voice tutor. 
        Master any subject through natural conversation.
      </p>
      <button 
        onClick={onStart}
        className="group relative px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
      >
        Get Started
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  </div>
);

const Dashboard = ({ onSelectSession, onOpenHistory, onSelectHistorySession }: { onSelectSession: (config: SessionConfig) => void, onOpenHistory: () => void, onSelectHistorySession: (session: Session) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [language, setLanguage] = useState<Language>('English');
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('eduvoice_sessions') || '[]');
    setRecentSessions(saved.slice(0, 3));
  }, []);

  const cards = [
    { id: 'interview', title: 'Mock Interview', desc: 'Practice for your dream job', icon: Target, color: 'bg-blue-500' },
    { id: 'lecture', title: 'Topic Lecture', desc: 'Learn complex topics simply', icon: BookOpen, color: 'bg-purple-500' },
    { id: 'qa', title: 'Q&A Practice', desc: 'Test your knowledge', icon: MessageSquare, color: 'bg-indigo-500' },
    { id: 'language', title: 'Language Learning', desc: 'Speak like a native', icon: Globe, color: 'bg-emerald-500' },
    { id: 'meditation', title: 'Meditation', desc: 'Focus and relax your mind', icon: Wind, color: 'bg-orange-500' },
  ];

  const handleStart = () => {
    if (!topic) return;
    onSelectSession({ type: selectedType.title, topic, difficulty, language });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back!</h2>
            <p className="text-gray-500">What would you like to practice today?</p>
          </div>
          <button 
            onClick={onOpenHistory}
            className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 text-gray-600"
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ y: -5 }}
              onClick={() => { setSelectedType(card); setIsModalOpen(true); }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:shadow-blue-100/50 transition-all group"
            >
              <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${card.color.split('-')[1]}-100 group-hover:scale-110 transition-transform`}>
                <card.icon className="text-white w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-500 mb-4">{card.desc}</p>
              <div className="flex items-center text-blue-600 font-semibold text-sm">
                Start Session <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>

        {recentSessions.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Recent Sessions</h3>
              <button onClick={onOpenHistory} className="text-blue-600 font-semibold text-sm hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentSessions.map((session) => (
                <motion.div
                  key={session.id}
                  onClick={() => onSelectHistorySession(session)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <BookOpen className="text-blue-600 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 line-clamp-1">{session.config.topic}</h4>
                      <p className="text-xs text-gray-500">{session.config.type} • {new Date(session.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {session.feedback && (
                    <p className="text-sm text-gray-600 line-clamp-2 italic">"{session.feedback}"</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Session Setup</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Topic / Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. React Development, World War II..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                    >
                      <option>English</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleStart}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VoiceRoom = ({ config, onBack }: { config: SessionConfig, onBack: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<{ feedback: string, notes: string[] } | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const hasGreeted = useRef(false);
  const sessionId = useRef(Date.now().toString());

  const { isListening, partialTranscript, error, isSupported, startListening, stopListening, speak } = useSpeech({
    language: config.language === 'Hindi' ? 'hi-IN' : 'en-US',
    silenceTimeout: 1500, // 1.5 second delay for silence
    onTranscript: (text) => {
      handleUserMessage(text);
    }
  });

  const [manualText, setManualText] = useState('');

  // Auto-save session state to history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveSession(messages);
    }
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const startGreeting = async () => {
      setIsThinking(true);
      const greetingPrompt = `Start a ${config.type} session about ${config.topic}. 
      Introduce yourself as a friendly AI tutor and ask the first question to get started. 
      Difficulty: ${config.difficulty}. Language: ${config.language}.`;
      
      try {
        const reply = await getAIReply(greetingPrompt, [], `You are a friendly AI tutor. Keep it short and conversational.`);
        const aiMsg: Message = { id: 'initial', role: 'ai', text: reply, timestamp: Date.now() };
        setMessages([aiMsg]);
        setIsThinking(false);
        
        setIsSpeaking(true);
        const utterance = speak(reply, config.language === 'Hindi' ? 'hi-IN' : 'en-US');
        if (utterance) {
          utterance.onend = () => {
            setIsSpeaking(false);
            startListening(); // Start listening AFTER AI finishes greeting
          };
        } else {
          setIsSpeaking(false);
          startListening();
        }
      } catch (err) {
        console.error(err);
        setIsThinking(false);
      }
    };

    startGreeting();
  }, [config.type, config.topic, config.difficulty, config.language, speak, startListening]);

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Stop listening while processing
    stopListening();
    setManualText('');
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    const systemPrompt = `You are a friendly AI tutor for a ${config.type} session. 
    The topic is ${config.topic}. Difficulty: ${config.difficulty}. 
    Language: ${config.language}.
    Keep replies short, helpful, and conversational. 
    If the language is Hindi, reply in Hindi.`;

    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    try {
      const reply = await getAIReply(text, history, systemPrompt);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: reply, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      
      setIsSpeaking(true);
      const utterance = speak(reply, config.language === 'Hindi' ? 'hi-IN' : 'en-US');
      if (utterance) {
        utterance.onend = () => {
          setIsSpeaking(false);
          startListening(); // Start listening AFTER AI finishes speaking
        };
      } else {
        setIsSpeaking(false);
        startListening();
      }
    } catch (err) {
      console.error(err);
      setIsThinking(false);
    }
  };

  const saveSession = (msgs: Message[], fb?: string, nt?: string[]) => {
    const sessions = JSON.parse(localStorage.getItem('eduvoice_sessions') || '[]');
    const existingIndex = sessions.findIndex((s: Session) => s.id === sessionId.current);
    
    const sessionData: Session = {
      id: sessionId.current,
      config,
      messages: msgs,
      feedback: fb || (existingIndex >= 0 ? sessions[existingIndex].feedback : undefined),
      notes: nt || (existingIndex >= 0 ? sessions[existingIndex].notes : undefined),
      timestamp: existingIndex >= 0 ? sessions[existingIndex].timestamp : Date.now()
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionData;
    } else {
      sessions.unshift(sessionData);
    }
    localStorage.setItem('eduvoice_sessions', JSON.stringify(sessions));
  };

  const handleGenerateFeedback = async () => {
    if (messages.length < 2) return;
    setIsGeneratingFeedback(true);
    const result = await generateFeedback(messages.map(m => ({ role: m.role, text: m.text })));
    setFeedback(result);
    setIsGeneratingFeedback(false);
    saveSession(messages, result.feedback, result.notes);
  };

  const handleStopSession = () => {
    stopListening();
    window.speechSynthesis.cancel();
    saveSession(messages);
    onBack();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <button onClick={handleStopSession} className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors font-semibold text-sm">
          <X className="w-5 h-5" />
          Stop Session
        </button>
        <div className="text-center">
          <h2 className="font-bold text-gray-900">{config.type}</h2>
          <p className="text-xs text-gray-500">{config.topic} • {config.difficulty}</p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Avatar & Mic */}
        <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-gray-50/50 border-r border-gray-100">
          <div className="relative mb-12">
            <motion.div 
              animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-48 h-48 bg-blue-100 rounded-full flex items-center justify-center shadow-inner"
            >
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${config.type}&backgroundColor=b6e3f4`} 
                  alt="AI Avatar"
                  className="w-32 h-32"
                />
              </div>
            </motion.div>
            
            {/* Status Indicator */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white rounded-full shadow-md border border-gray-100 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isThinking ? 'bg-blue-500 animate-bounce' : isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-xs font-semibold text-gray-600">
                {isListening ? 'Listening...' : isThinking ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Ready'}
              </span>
            </div>
          </div>

          <button 
            onClick={isListening ? stopListening : startListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isListening ? 'bg-red-500 shadow-red-200' : 'bg-blue-600 shadow-blue-200'}`}
          >
            {isListening ? <X className="text-white w-10 h-10" /> : <Mic className="text-white w-10 h-10" />}
          </button>
          
          {!isSupported && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3 max-w-xs">
              <AlertCircle className="text-orange-500 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-700">Voice recognition not supported. Please use a modern browser like Chrome.</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 max-w-xs">
              <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Right: Chat UI */}
        <div className="w-full md:w-1/2 flex flex-col h-[500px] md:h-auto">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                <p>Start speaking to begin your session</p>
              </div>
            )}
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            {partialTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[85%] p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Capturing...</span>
                  </div>
                  <p className="text-sm italic">{partialTranscript}</p>
                </div>
              </div>
            )}
          </div>

          {/* Manual Input Fallback */}
          {(!isListening && !isThinking && !isSpeaking) && (
            <div className="px-6 py-2 border-t border-gray-50 flex gap-2">
              <input 
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUserMessage(manualText)}
              />
              <button 
                onClick={() => handleUserMessage(manualText)}
                disabled={!manualText.trim()}
                className="p-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 border-t border-gray-100 bg-white">
            {!feedback ? (
              <button 
                onClick={handleGenerateFeedback}
                disabled={messages.length < 2 || isGeneratingFeedback}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors"
              >
                {isGeneratingFeedback ? 'Generating...' : 'Generate Feedback'}
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Session Feedback
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">{feedback.feedback}</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Key Notes</h4>
                  <ul className="space-y-2">
                    {feedback.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const History = ({ onBack, onSelectSession }: { onBack: () => void, onSelectSession: (session: Session) => void }) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('eduvoice_sessions') || '[]');
    setSessions(saved);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-xl shadow-sm transition-all">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Session History</h2>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HistoryIcon className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No history yet</h3>
            <p className="text-gray-500">Your completed sessions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ x: 5 }}
                onClick={() => onSelectSession(session)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                    <BookOpen className="text-blue-600 w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-md">
                        {session.config.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 truncate">{session.config.topic}</h3>
                    <p className="text-xs text-gray-500 truncate">
                      {session.messages.length} messages • {session.config.difficulty}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-300" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'voice-room' | 'history'>('landing');
  const [currentConfig, setCurrentConfig] = useState<SessionConfig | null>(null);
  const [selectedHistorySession, setSelectedHistorySession] = useState<Session | null>(null);

  const startDashboard = () => setView('dashboard');
  
  const startSession = (config: SessionConfig) => {
    setCurrentConfig(config);
    setView('voice-room');
  };

  const openHistory = () => setView('history');

  const openHistorySession = (session: Session) => {
    setSelectedHistorySession(session);
    // For simplicity, we just show the feedback part if it exists
    // In a real app, we might want to replay the whole session
  };

  return (
    <div className="font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" exit={{ opacity: 0 }}>
            <LandingPage onStart={startDashboard} />
          </motion.div>
        )}
        {view === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard 
              onSelectSession={startSession} 
              onOpenHistory={openHistory} 
              onSelectHistorySession={openHistorySession}
            />
          </motion.div>
        )}
        {view === 'voice-room' && currentConfig && (
          <motion.div key="voice-room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VoiceRoom config={currentConfig} onBack={() => setView('dashboard')} />
          </motion.div>
        )}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <History onBack={() => setView('dashboard')} onSelectSession={openHistorySession} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Session Detail Modal (Simple) */}
      <AnimatePresence>
        {selectedHistorySession && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Session Review</h3>
                <button onClick={() => setSelectedHistorySession(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-8">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Mic className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedHistorySession.config.topic}</h4>
                    <p className="text-sm text-gray-500">{selectedHistorySession.config.type} • {selectedHistorySession.config.difficulty}</p>
                  </div>
                </div>

                {selectedHistorySession.feedback && (
                  <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Feedback
                    </h4>
                    <p className="text-sm text-blue-800 leading-relaxed">{selectedHistorySession.feedback}</p>
                  </div>
                )}

                {selectedHistorySession.notes && selectedHistorySession.notes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Key Notes</h4>
                    <ul className="space-y-2">
                      {selectedHistorySession.notes.map((note, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Conversation</h4>
                  <div className="space-y-4">
                    {selectedHistorySession.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
