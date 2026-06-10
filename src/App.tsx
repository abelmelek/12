import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { 
  Brain, Sliders, FileText, User, Users, Menu, X, Globe, LogOut, 
  Settings, HelpCircle, ShieldCheck, Mail, Lock, Phone, UploadCloud, 
  Sparkles, Play, Square, RefreshCw, CheckSquare, Plus, Trash2, 
  ExternalLink, AudioLines, ChevronRight, Maximize2, Briefcase, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from './translations';

// ከዚህ በፊት የፈጠርካቸውን ንዑስ ኮምፖነንቶች ማስገባት
import DelayedGratificationSimulator from './components/DelayedGratificationSimulator';
import ResearchDashboard from './components/ResearchDashboard';
import AdminPanel from './components/AdminPanel';

// የትሬዲንግ ቼክሊስት አይተም ታይፕ
interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [lang, setLang] = useState<'am' | 'en'>('am');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // --- CORE DATABASE STATES ---
  const [papers, setPapers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  
  // --- AUTHENTICATION STATES ---
  const [activeUser, setActiveUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authTelegram, setAuthTelegram] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // --- AUDIO SANDBOX STATES ---
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // --- TRADING TRERACKER / CHECKLIST STATES ---
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: 'Checked DXY high-impact calendar events today?', completed: false },
    { id: '2', text: 'Sticking strictly to 1-2% risk ceiling per execution?', completed: false },
    { id: '3', text: 'Is the Ichimoku cloud structure backing this bias?', completed: false }
  ]);
  const [newChecklistItem, setNewChecklistItem] = useState<string>('');

  // --- TELEGRAM HELP DESK STATES ---
  const [tgBotUsername, setTgBotUsername] = useState<string>('tradingpsychologyresearchbot');
  const [tgStatusConnected, setTgStatusConnected] = useState<boolean>(true);

  // --- REFACTORING SIMULATOR LINKAGE STATES ---
  const [startCapital, setStartCapital] = useState<number>(100);
  const [winRate, setWinRate] = useState<number>(50);
  const [riskReward, setRiskReward] = useState<number>(2.0);
  const [numTradesSimulated, setNumTradesSimulated] = useState<number>(100);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSummary, setSimSummary] = useState<any>(null);

  // --- INPUT STATES FOR DASHBOARD ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Proposal Form States
  const [propName, setPropName] = useState<string>('');
  const [propContact, setPropContact] = useState<string>('');
  const [propTitle, setPropTitle] = useState<string>('');
  const [propAbstract, setPropAbstract] = useState<string>('');
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);

  // Privacy States
  const [privacyGateUnlocked, setPrivacyGateUnlocked] = useState<boolean>(false);
  const [privacyPin, setPrivacyPin] = useState<string>('');
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [maskEmailsInPublic, setMaskEmailsInPublic] = useState<boolean>(true);
  const [purgeTargetEmail, setPurgeTargetEmail] = useState<string>('');
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  // DATABASE FETCH
  useEffect(() => {
    fetch('/api/papers').then(res => res.json()).then(data => setPapers(data || []));
    fetch('/api/comments').then(res => res.json()).then(data => setComments(data || []));
    fetch('/api/proposals').then(res => res.json()).then(data => setProposals(data || []));
    
    // Check if session user exists
    const storedUser = localStorage.getItem('trader_session');
    if (storedUser) {
      setActiveUser(JSON.parse(storedUser));
    }

    runSimulatorTrajectory();
  }, []);

  // AUDIO RECORDING TIMER EFFECT
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
      setRecordingDuration(0);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording]);

  // MONTE CARLO TRAJECTORY SIMULATOR
  const runSimulatorTrajectory = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const arr = [];
      let discBalance = startCapital;
      let emoBalance = startCapital;

      arr.push({ trade: 0, disciplined: discBalance, emotional: emoBalance });

      for (let i = 1; i <= numTradesSimulated; i++) {
        const discWin = Math.random() * 100 < winRate;
        if (discWin) {
          discBalance += (startCapital * 0.02 * riskReward);
        } else {
          discBalance -= (startCapital * 0.02);
        }
        if (discBalance < 0) discBalance = 0;

        const emoWin = Math.random() * 100 < winRate;
        if (emoWin) {
          emoBalance += (emoBalance * 0.15 * riskReward);
        } else {
          emoBalance -= (emoBalance * 0.15);
        }
        if (emoBalance < 0) emoBalance = 0;

        arr.push({
          trade: i,
          disciplined: Math.round(discBalance * 100) / 100,
          emotional: Math.round(emoBalance * 100) / 100
        });
      }

      setSimulationData(arr);
      setSimSummary({
        disciplinedFinal: Math.round(discBalance),
        disciplinedStatus: discBalance > startCapital ? 'ትርፋማ' : 'ኪሳራ',
        emotionalFinal: Math.round(emoBalance),
        emotionalStatus: emoBalance <= 0 ? 'Margin Call 💥' : emoBalance > startCapital ? 'ትርፋማ' : 'ኪሳራ'
      });
      setIsSimulating(false);
    }, 450);
  };

  // --- AUDIO LOGIC ---
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        // Convert to file object
        const file = new File([audioBlob], "recorded_trader_voice.wav", { type: "audio/wav" });
        setUploadedAudioFile(file);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Audio recording permission denied or unsupported device.", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to free microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedAudioFile(file);
      setAudioURL(URL.createObjectURL(file));
    }
  };

  const executeVoiceAnalysis = async () => {
    if (!uploadedAudioFile) return;
    setIsAnalyzing(true);
    setAiAnalysisResult(null);

    const formData = new FormData();
    formData.append('audio', uploadedAudioFile);
    formData.append('traderEmail', activeUser?.email || 'anonymous@sandbox.com');

    try {
      const res = await fetch('/api/voice/analyze', { method: 'POST', body: formData });
      if (res.ok) {
        const out = await res.json();
        setAiAnalysisResult(out.analysis);
      }
    } catch (err) {
      console.error("AI Neuro-Analysis transaction pipeline failed.", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- AUTH LOGIC ---
  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const payload = authMode === 'login' 
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword, telegram: authTelegram };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setActiveUser(data.user);
        localStorage.setItem('trader_session', JSON.stringify(data.user));
        setIsAuthModalOpen(false);
        // Reset inputs
        setAuthEmail(''); setAuthPassword(''); setAuthName(''); setAuthTelegram('');
      } else {
        setAuthError(data.error || 'Authentication process halted.');
      }
    } catch (err) {
      setAuthError('Connection error occurred.');
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem('trader_session');
  };

  // --- CHECKLIST LOGIC ---
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const addChecklistItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistItem,
      completed: false
    };
    setChecklist(prev => [...prev, newItem]);
    setNewChecklistItem('');
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  // RESEARCH DASHBOARD PROPS & ACTIONS PASSTHROUGH
  const handleLike = async (id: string, e: any) => {
    e.stopPropagation();
    const res = await fetch(`/api/papers/${id}/like`, { method: 'POST' });
    if (res.ok) {
      setPapers(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    }
  };

  const handleAddComment = async (paperId: string, e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const payload = { paperId, author: activeUser?.name || 'Anonymous', email: activeUser?.email || '', text: newCommentText };
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const saved = await res.json();
      setComments(prev => [saved, ...prev]);
      setNewCommentText('');
    }
  };

  const handleSubmitProposal = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { name: propName, contact: propContact, title: propTitle, abstract: propAbstract };
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const saved = await res.json();
      setProposals(prev => [saved, ...prev]);
      setPropName(''); setPropContact(''); setPropTitle(''); setPropAbstract('');
      setProposalSuccess(lang === 'am' ? 'የጥናት ማመልከቻዎ በተሳካ ሁኔታ ለዳታቤዝ ተልኳል!' : 'Proposal archived successfully!');
    }
  };

  const handleUnlockPrivacyGate = (e: FormEvent) => {
    e.preventDefault();
    if (privacyPin === 'privacy99') {
      setPrivacyGateUnlocked(true);
      setPrivacyError(null);
    } else {
      setPrivacyError('Invalid security PIN code.');
    }
  };

  const handlePurgeUserData = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/privacy/purge?email=${encodeURIComponent(purgeTargetEmail)}`, { method: 'POST' });
    if (res.ok) {
      const out = await res.json();
      setPurgeResult(out.message);
      setComments(prev => prev.filter(c => c.email !== purgeTargetEmail));
    }
  };

  const handleDeletePaper = async (id: string) => {
    const res = await fetch(`/api/papers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPapers(prev => prev.filter(p => p.id !== id));
    }
  };

  const maskEmail = (email: string) => {
    if (!maskEmailsInPublic) return email;
    if (!email || !email.includes('@')) return '******';
    const [part1, part2] = email.split('@');
    return part1.substring(0, 2) + '***@' + part2;
  };

  return (
    <div className="min-h-screen bg-[#020813] text-slate-100 flex flex-col relative antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none z-0"></div>

      {/* HEADER NAV */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-emerald-500" />
            <div>
              <h1 className="text-md font-black tracking-tight">{translations[lang].title}</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest">{translations[lang].subTitle}</p>
            </div>
          </div>

          {/* DESKTOP TABS */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <button onClick={() => setActiveTab('home')} className={`cursor-pointer transition ${activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].home}</button>
            <button onClick={() => setActiveTab('simulator')} className={`cursor-pointer transition ${activeTab === 'simulator' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].simulator}</button>
            <button onClick={() => setActiveTab('admin')} className={`cursor-pointer transition ${activeTab === 'admin' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].adminPanel}</button>
            
            <div className="h-4 w-[1px] bg-slate-800"></div>

            <button onClick={() => setLang(l => l === 'am' ? 'en' : 'am')} className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition cursor-pointer">
              <Globe className="w-3.5 h-3.5" /> {lang === 'am' ? 'EN' : 'አማ'}
            </button>

            {activeUser ? (
              <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 hover:border-emerald-500/40 transition cursor-pointer">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[80px] truncate">{activeUser.name}</span>
              </button>
            ) : (
              <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10">
                {translations[lang].loginBtn}
              </button>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-400 hover:text-slate-200 cursor-pointer">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU PANEL */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-slate-950 border-b border-slate-900 px-6 py-4 flex flex-col gap-4 text-xs font-mono z-40 relative">
            <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className="text-left py-1 text-slate-300">{translations[lang].home}</button>
            <button onClick={() => { setActiveTab('simulator'); setIsMobileMenuOpen(false); }} className="text-left py-1 text-slate-300">{translations[lang].simulator}</button>
            <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} className="text-left py-1 text-slate-300">{translations[lang].adminPanel}</button>
            <button onClick={() => { setLang(l => l === 'am' ? 'en' : 'am'); setIsMobileMenuOpen(false); }} className="text-left py-1 text-emerald-400">🌐 Switch Language ({lang === 'am' ? 'English' : 'አማርኛ'})</button>
            {activeUser ? (
              <button onClick={() => { setIsProfileModalOpen(true); setIsMobileMenuOpen(false); }} className="text-left py-2 bg-slate-900 px-3 rounded-lg text-emerald-400">👤 Profile: {activeUser.name}</button>
            ) : (
              <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="py-2 bg-emerald-500 text-slate-950 font-bold text-center rounded-xl">{translations[lang].loginBtn}</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT CONTAINMENT PIPELINE */}
      <main className="flex-1 py-8 z-10 relative">
        
        {activeTab === 'home' && (
          <div className="max-w-7xl mx-auto px-4 space-y-10">
            
            {/* HERO HERO BANNER PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* AUDIO JOURNALING SANDBOX SECTION */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AudioLines className="text-emerald-400 w-5 h-5" />
                    <h2 className="text-md font-bold">{translations[lang].voiceSandboxTitle}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">{translations[lang].voiceSandboxDesc}</p>
                  
                  {/* CONTROLS */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {!isRecording ? (
                      <button onClick={startRecording} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono text-xs font-bold rounded-xl transition cursor-pointer">
                        <Play className="w-3.5 h-3.5 fill-current" /> {lang === 'am' ? 'መቅረጽ ጀምር' : 'Record'}
                      </button>
                    ) : (
                      <button onClick={stopRecording} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 animate-pulse text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer">
                        <Square className="w-3.5 h-3.5 fill-current" /> {lang === 'am' ? `ቁም (${recordingDuration}ሰ)` : `Stop (${recordingDuration}s)`}
                      </button>
                    )}

                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs rounded-xl transition cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{lang === 'am' ? 'ኦዲዮ ጫን' : 'Upload Audio'}</span>
                      <input type="file" accept="audio/*" onChange={handleAudioFileChange} className="hidden" />
                    </label>

                    {audioURL && (
                      <audio src={audioURL} controls className="h-8 max-w-xs rounded-lg bg-slate-950 border border-slate-900" />
                    )}
                  </div>
                </div>

                {uploadedAudioFile && (
                  <div className="border-t border-slate-800/60 pt-4 mt-2">
                    <button onClick={executeVoiceAnalysis} disabled={isAnalyzing} className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-mono font-black uppercase rounded-xl tracking-wider transition hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1">
                      {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {lang === 'am' ? 'በአርተፊሻል ኢንተለጀንስ ስሜትን መርምር' : 'Run Neuro-Acoustic Analysis'}
                    </button>

                    {/* ANALYSIS OUTCOME */}
                    {aiAnalysisResult && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2.5 text-xs font-sans">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                          <span className="font-mono text-[10px] text-slate-500">Neurometric Analysis State</span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-mono text-[10px] font-bold">Confidence: {aiAnalysisResult.confidence}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                          <div>
                            <span className="block text-[10px] font-mono text-slate-400">Detected State (የተገኘው ስሜት)፦</span>
                            <span className="text-sm font-bold text-slate-200">{aiAnalysisResult.detectedEmotion}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono text-slate-400">Risk Assessment (የአደጋ ተጋላጭነት)፦</span>
                            <span className={`text-sm font-bold ${aiAnalysisResult.riskLevel === 'High' ? 'text-rose-400' : 'text-emerald-400'}`}>{aiAnalysisResult.riskLevel} Risk Profile</span>
                          </div>
                        </div>
                        <div>
                          <span className="block text-[10px] font-mono text-slate-400">Psychological Feedback (የአእምሮ ምክር)፦</span>
                          <p className="text-slate-300 italic leading-relaxed mt-0.5 font-sans">{aiAnalysisResult.feedback}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* TRADING DISCPLINE TRERACKER / CHECKLIST SECTION */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="text-emerald-400 w-5 h-5" />
                    <h2 className="text-md font-bold">{translations[lang].checklistTitle || 'Discipline Checklist'}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-tight">{translations[lang].checklistDesc || 'Before clicking execute, review rules.'}</p>
                  
                  {/* LIST */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-900 text-xs">
                        <button onClick={() => toggleChecklistItem(item.id)} className="flex items-start gap-2 flex-1 text-left cursor-pointer">
                          <input type="checkbox" checked={item.completed} readOnly className="mt-0.5 rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0" />
                          <span className={`leading-tight font-sans ${item.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{item.text}</span>
                        </button>
                        <button onClick={() => removeChecklistItem(item.id)} className="p-1 text-slate-600 hover:text-rose-400 transition ml-2 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ADD TO LIST FORM */}
                <form onSubmit={addChecklistItem} className="flex gap-2 border-t border-slate-800/60 pt-4 mt-4">
                  <input
                    type="text"
                    placeholder="አዲስ የትሬዲንግ ህግ ይጨምሩ..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-200 font-sans"
                  />
                  <button type="submit" className="p-1.5 bg-slate-950 border border-slate-800 text-emerald-400 rounded-xl hover:bg-slate-900 transition cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>

            {/* RESEARCH SUB-SYSTEM INTERFACE BOARD */}
            <ResearchDashboard
              papers={papers} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              expandedPaper={expandedPaper} setExpandedPaper={setExpandedPaper} handleLike={handleLike}
              activeUser={activeUser} comments={comments} newCommentText={newCommentText} 
              setNewCommentText={setNewCommentText} handleAddComment={handleAddComment} 
              maskEmail={maskEmail} lang={lang} translations={translations}
              propName={propName} setPropName={setPropName} propContact={propContact} 
              setPropContact={setPropContact} propTitle={propTitle} setPropTitle={setPropTitle} 
              propAbstract={propAbstract} setPropAbstract={setPropAbstract}
              handleSubmitProposal={handleSubmitProposal} proposalSuccess={proposalSuccess}
            />

            {/* TELEGRAM MINI INTERFACE BOT PORTAL GATEWAY */}
            <div className="bg-gradient-to-r from-blue-950/20 to-slate-900/40 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">የቴሌግራም አድሚን እገዛ ዴስክ (Telegram Bot Sync)</h4>
                  <p className="text-xs text-slate-400 leading-tight">በቴሌግራም ቦት በኩል የሚላኩ ጥያቄዎች እና ድምፆች እዚህ ዌብሳይት ላይ በቀጥታ ይመሳሰላሉ።</p>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] text-slate-400">@{tgBotUsername}</span>
                </div>
                <a href={`https://t.me/${tgBotUsername}`} target="_blank" rel="noreferrer" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center gap-1 shadow-lg shadow-blue-600/10 cursor-pointer">
                  <span>Open Bot</span> <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'simulator' && (
          <DelayedGratificationSimulator
            startCapital={startCapital} setStartCapital={setStartCapital}
            winRate={winRate} setWinRate={setWinRate}
            riskReward={riskReward} setRiskReward={setRiskReward}
            numTradesSimulated={numTradesSimulated} setNumTradesSimulated={setNumTradesSimulated}
            simulationData={simulationData} isSimulating={isSimulating}
            runSimulatorTrajectory={runSimulatorTrajectory} simSummary={simSummary}
            lang={lang} translations={translations}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            papers={papers} proposals={proposals} privacyGateUnlocked={privacyGateUnlocked}
            setPrivacyGateUnlocked={setPrivacyGateUnlocked} privacyPin={privacyPin} setPrivacyPin={setPrivacyPin}
            privacyError={privacyError} handleUnlockPrivacyGate={handleUnlockPrivacyGate}
            maskEmailsInPublic={maskEmailsInPublic} setMaskEmailsInPublic={setMaskEmailsInPublic}
            purgeTargetEmail={purgeTargetEmail} setPurgeTargetEmail={setPurgeTargetEmail}
            handlePurgeUserData={handlePurgeUserData} purgeResult={purgeResult}
            handleDeletePaper={handleDeletePaper} handleLoadProposalToForm={handleLoadProposalToForm}
            lang={lang} translations={translations}
          />
        )}
      </main>

      {/* --- AUTHENTICATION DIALOG / MODAL WINDOW --- */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
              <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black tracking-tight mb-1">
                {authMode === 'login' ? (lang === 'am' ? 'ወደ አካውንትዎ ይግቡ' : 'Access Sandbox Account') : (lang === 'am' ? 'አዲስ አካውንት ይክፈቱ' : 'Create Free Sandbox ID')}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {authMode === 'login' ? 'Enter credentials to post comments and analyze data.' : 'Join to contribute to research proposals.'}
              </p>

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Full Name</label>
                    <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans" />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                    <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                    <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" />
                  </div>
                </div>
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Telegram Username (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                      <input type="text" placeholder="@username" value={authTelegram} onChange={(e) => setAuthTelegram(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" />
                    </div>
                  </div>
                )}

                {authError && <p className="text-[11px] font-mono text-rose-400 text-center">{authError}</p>}

                <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer">
                  {authMode === 'login' ? (lang === 'am' ? 'ግባ' : 'Authorize') : (lang === 'am' ? 'አካውንት ክፈት' : 'Register Account')}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[11px] text-slate-400 hover:text-emerald-400 transition font-sans">
                  {authMode === 'login' ? (lang === 'am' ? 'አካውንት የለዎትም? እዚህ ይክፈቱ' : "Don't have an account? Sign up") : (lang === 'am' ? 'አካውንት አለዎት? እዚህ ይግቡ' : "Already registered? Log in")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- TRADER PROFILE PANEL MODAL --- */}
      <AnimatePresence>
        {isProfileModalOpen && activeUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
              <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-md font-bold mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2 text-slate-200">
                <User className="w-4 h-4 text-emerald-400" /> Trader Account Session
              </h3>
              
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">NAME</span>
                  <span className="text-slate-200 font-bold">{activeUser.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">EMAIL</span>
                  <span className="text-slate-200">{activeUser.email}</span>
                </div>
                {activeUser.telegram && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">TELEGRAM HANDLES</span>
                    <span className="text-sky-400">{activeUser.telegram}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-800/60 flex justify-end">
                  <button onClick={() => { handleLogout(); setIsProfileModalOpen(false); }} className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 text-[10px] font-mono font-bold uppercase rounded-lg transition cursor-pointer flex items-center gap-1">
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 p-6 mt-12 text-center text-xs font-mono text-slate-500">
        © 2026 የትሬዲንግ ስነ-ልቦና ምርምር መድረክ (Trading Psychology Sandbox).
      </footer>
    </div>
  );
}
