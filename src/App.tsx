import { useState, useEffect, useRef, FormEvent, MouseEvent, ChangeEvent } from 'react';
import {
  Sparkles,
  Brain,
  Wand2,
  Volume2,
  Play,
  Square,
  RefreshCw,
  CheckSquare,
  Square as CheckboxBlank,
  Plus,
  Trash2,
  Clock,
  Download,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Compass,
  Send,
  AudioLines,
  ChevronRight,
  Maximize2,
  Briefcase,
  User,
  Lock,
  Mail,
  Phone,
  ThumbsUp,
  Sliders,
  PlusCircle,
  FileText,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  Users,
  Eye,
  LogOut,
  Settings,
  HelpCircle,
  Menu,
  X,
  UploadCloud,
  ShieldCheck
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

import { motion, AnimatePresence } from 'motion/react';
import { translations } from './translations';

// Types representing the database records
interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  likes: number;
  likedBy: string[];
  content: string;
  chartData?: any[];
  comments?: any[];
}

interface Proposal {
  id: string;
  name: string;
  contact: string;
  title: string;
  abstract: string;
  timestamp: string;
}

interface TraderChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [lang, setLang] = useState<'am' | 'en'>('am');
  const [activeTab, setActiveTab] = useState<string>('home'); // home, simulator, submit_proposal, admin
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // --- CORE DATABASE STATES ---
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- USER AUTHENTICATION STATES ---
  const [activeUser, setActiveUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authTelegram, setAuthTelegram] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // --- AUDIO DISCIPLINE SANDBOX STATES ---
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // --- RULES DISCIPLINE CHECKLIST STATES ---
  const [checklist, setChecklist] = useState<TraderChecklistItem[]>([
    { id: '1', text: 'Checked DXY high-impact calendar events today?', completed: false },
    { id: '2', text: 'Sticking strictly to 1-2% risk ceiling per execution?', completed: false },
    { id: '3', text: 'Is the Ichimoku cloud structure backing this bias?', completed: false }
  ]);
  const [newChecklistItem, setNewChecklistItem] = useState<string>('');

  // --- MONTE CARLO SIMULATOR STATES ---
  const [startCapital, setStartCapital] = useState<number>(100);
  const [winRate, setWinRate] = useState<number>(50);
  const [riskReward, setRiskReward] = useState<number>(2.0);
  const [numTradesSimulated, setNumTradesSimulated] = useState<number>(100);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSummary, setSimSummary] = useState<any>(null);

  // --- PROPOSAL SUBMISSION STATES ---
  const [propName, setPropName] = useState<string>('');
  const [propContact, setPropContact] = useState<string>('');
  const [propTitle, setPropTitle] = useState<string>('');
  const [propAbstract, setPropAbstract] = useState<string>('');
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);

  // --- PRIVACY & ADMIN SECURITY CONFIG STATES ---
  const [privacyGateUnlocked, setPrivacyGateUnlocked] = useState<boolean>(false);
  const [privacyPin, setPrivacyPin] = useState<string>('');
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [maskEmailsInPublic, setMaskEmailsInPublic] = useState<boolean>(true);
  const [purgeTargetEmail, setPurgeTargetEmail] = useState<string>('');
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  // --- RESEARCH INTERACTION STATES ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');

  // DATABASE CONFIG PIPELINE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const papersRes = await fetch('/api/papers');
        if (papersRes.ok) {
          const papersData = await papersRes.json();
          setPapers(papersData || []);
        }
        const commentsRes = await fetch('/api/comments');
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData || []);
        }
        const proposalsRes = await fetch('/api/proposals');
        if (proposalsRes.ok) {
          const proposalsData = await proposalsRes.json();
          setProposals(proposalsData || []);
        }
      } catch (err) {
        console.error("Data synchronization failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const storedUser = localStorage.getItem('trader_session');
    if (storedUser) {
      try {
        setActiveUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('trader_session');
      }
    }

    runSimulatorTrajectory();
  }, []);

  // AUDIO MONITOR TIMING ENGINE
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
      setRecordingDuration(0);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording]);

  // MONTE CARLO TRAJECTORY MATH ENGINE
  const runSimulatorTrajectory = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const arr = [];
      let discBalance = startCapital;
      let emoBalance = startCapital;

      arr.push({
        trade: 0,
        disciplined: discBalance,
        emotional: emoBalance,
      });

      for (let i = 1; i <= numTradesSimulated; i++) {
        const discWin = Math.random() * 100 < winRate;
        if (discWin) {
          discBalance += (startCapital * 0.02) * riskReward;
        } else {
          discBalance -= (startCapital * 0.02);
        }
        if (discBalance < 0) discBalance = 0;

        const emoWin = Math.random() * 100 < winRate;
        if (emoWin) {
          emoBalance += (emoBalance * 0.15) * riskReward;
        } else {
          emoBalance -= (emoBalance * 0.15);
        }
        if (emoBalance < 0) emoBalance = 0;

        arr.push({
          trade: i,
          disciplined: Math.round(discBalance * 100) / 100,
          emotional: Math.round(emoBalance * 100) / 100,
        });
      }

      setSimulationData(arr);
      setSimSummary({
        disciplinedFinal: Math.round(discBalance),
        disciplinedStatus: discBalance > startCapital ? 'ትርፋማ' : 'ኪሳራ',
        emotionalFinal: Math.round(emoBalance),
        emotionalStatus: emoBalance <= 0 ? 'Margin Call 💥' : emoBalance > startCapital ? 'ትርፋማ' : 'ኪሳራ',
      });
      setIsSimulating(false);
    }, 400);
  };

  // AUDIO RECORDING FUNCTIONS
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
        setUploadedAudioFile(new File([audioBlob], "recorded_audio.wav", { type: "audio/wav" }));
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or hardware missing:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
    const formData = new FormData();
    formData.append('audio', uploadedAudioFile);

    try {
      const res = await fetch('/api/voice/analyze', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error("Acoustic node calculation failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // IDENTITY CONTROL & SECURITY PIPELINES
  const maskEmail = (email: string) => {
    if (!maskEmailsInPublic) return email;
    if (!email || !email.includes('@')) return '******';
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `**@${domain}`;
    return `${name.substring(0, 2)}***@${domain}`;
  };

  const handleUnlockPrivacyGate = (e: FormEvent) => {
    e.preventDefault();
    if (privacyPin === 'privacy99') {
      setPrivacyGateUnlocked(true);
      setPrivacyError(null);
    } else {
      setPrivacyError('Invalid security PIN architecture code.');
    }
  };

  const handlePurgeUserData = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/privacy/purge?email=${encodeURIComponent(purgeTargetEmail)}`, {
        method: 'POST'
      });
      if (res.ok) {
        const out = await res.json();
        setPurgeResult(out.message || 'Purge executed successfully.');
        setComments(prev => prev.filter(c => c.email !== purgeTargetEmail));
      }
    } catch (err) {
      setPurgeResult('Network pipeline failure during erasure.');
    }
  };

  // INTERACTION HANDLERS
  const handleLike = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/papers/${id}/like`, { method: 'POST' });
      if (res.ok) {
        setPapers(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
      }
    } catch (err) {
      console.error("Failed to register peer upvote:", err);
    }
  };

  const handleAddComment = async (paperId: string, e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentPayload = {
      paperId,
      author: activeUser?.name || 'Anonymous Peer',
      email: activeUser?.email || 'hidden@node.local',
      text: newCommentText.trim()
    };

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentPayload)
      });
      if (res.ok) {
        const savedComment = await res.json();
        setComments(prev => [savedComment, ...prev]);
        setNewCommentText('');
      }
    } catch (err) {
      console.error("Comment delivery engine failed:", err);
    }
  };

  const handleSubmitProposal = async (e: FormEvent) => {
    e.preventDefault();
    const proposalPayload = {
      name: propName,
      contact: propContact,
      title: propTitle,
      abstract: propAbstract
    };

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposalPayload)
      });
      if (res.ok) {
        const saved = await res.json();
        setProposals(prev => [saved, ...prev]);
        setPropName('');
        setPropContact('');
        setPropTitle('');
        setPropAbstract('');
        setProposalSuccess(lang === 'am' ? 'የጥናት ማመልከቻዎ በተሳካ ሁኔታ ለዳታቤዝ ተልኳል!' : 'Proposal archived successfully inside network database.');
      }
    } catch (err) {
      console.error("Proposal system malfunctioned:", err);
    }
  };

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
      } else {
        setAuthError(data.error || 'Authentication core rejection.');
      }
    } catch (err) {
      setAuthError('Network timeout during verification loop.');
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem('trader_session');
  };

  const handleDeletePaper = async (id: string) => {
    try {
      const res = await fetch(`/api/papers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPapers(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Admin delete command failed:", err);
    }
  };

  const handleLoadProposalToForm = (p: Proposal) => {
    alert(`Drafting proposal: ${p.title}`);
  };

  const filteredPapers = papers.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.abstract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020813] text-slate-100 flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-300 overflow-x-hidden relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* HEADER NAVIGATION */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/20 border border-emerald-500/20 rounded-xl shadow-inner">
              <Brain className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                {translations[lang].title}
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                {translations[lang].subTitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <button
              onClick={() => setActiveTab('home')}
              className={`cursor-pointer tracking-wide transition relative py-1 ${
                activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {translations[lang].home}
              {activeTab === 'home' && <motion.div layoutId="navIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`cursor-pointer tracking-wide transition relative py-1 ${
                activeTab === 'simulator' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {translations[lang].simulator}
              {activeTab === 'simulator' && <motion.div layoutId="navIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('submit_proposal')}
              className={`cursor-pointer tracking-wide transition relative py-1 ${
                activeTab === 'submit_proposal' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'am' ? 'የአዳዲስ ተማሪዎች ፖርታል' : 'Submit Proposal'}
              {activeTab === 'submit_proposal' && <motion.div layoutId="navIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`cursor-pointer tracking-wide transition relative py-1 ${
                activeTab === 'admin' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {translations[lang].adminPanel}
              {activeTab === 'admin' && <motion.div layoutId="navIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 rounded-full" />}
            </button>

            <button
              onClick={() => setLang((l) => (l === 'am' ? 'en' : 'am'))}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 text-[10px] uppercase font-bold tracking-wider transition cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              {lang === 'am' ? 'English' : 'አማርኛ'}
            </button>

            {activeUser ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-emerald-500/20 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/10 text-emerald-400 text-xs font-bold transition hover:border-emerald-500/40 cursor-pointer shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeUser.name}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md shadow-emerald-500/10 transition active:scale-98 cursor-pointer"
              >
                {translations[lang].loginBtn}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setLang((l) => (l === 'am' ? 'en' : 'am'))}
              className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-[10px] font-mono font-bold"
            >
              {lang === 'am' ? 'EN' : 'አማ'}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-b border-slate-900 bg-slate-950/95 backdrop-blur-lg fixed top-[69px] left-0 right-0 z-40 p-4 space-y-3 text-sm font-mono shadow-xl"
          >
            <button
              onClick={() => {
                setActiveTab('home');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-xl transition ${activeTab === 'home' ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              {translations[lang].home}
            </button>
            <button
              onClick={() => {
                setActiveTab('simulator');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-xl transition ${activeTab === 'simulator' ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              {translations[lang].simulator}
            </button>
            <button
              onClick={() => {
                setActiveTab('submit_proposal');
                setIsMobileOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-xl transition ${activeTab === 'submit_proposal' ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              {lang === 'am' ? 'የአዳዲስ ተማሪዎች ፖርታል' : 'Submit Proposal'}
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-xl transition ${activeTab === 'admin' ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'text-slate-400'}`}
            >
              {translations[lang].adminPanel}
            </button>

            <div className="pt-2 border-t border-slate-900">
              {activeUser ? (
                <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-xs text-emerald-400 font-bold truncate">👤 {activeUser.name}</span>
                  <button onClick={handleLogout} className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-1 rounded-lg">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full text-center py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
                >
                  {translations[lang].loginBtn}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE DISPLAY HUB */}
      <main className="flex-1 py-8 max-w-7xl mx-auto w-full px-4 z-10">
        
        {/* TAB 1: HOME PAGE (የድሮው ውብ የካርድ ቦክስ እና ይዘት እንዳለ) */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* HERO HEROICS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ACOUSTIC VOICE INTERFACE */}
              <div className="lg:col-span-2 bg-gradient-to-b from-slate-900/60 to-slate-950/40 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md flex flex-col justify-between relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <AudioLines className="text-emerald-400 w-4 h-4 animate-pulse" />
                    <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                      {translations[lang].voiceSandboxTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed mb-6 max-w-xl">
                    {translations[lang].voiceSandboxDesc}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-lg shadow-emerald-400/5 transition active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Record Rhythmic Log</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 animate-pulse text-white font-bold font-mono text-xs rounded-xl shadow-lg shadow-rose-600/10 transition cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Broadcast ({recordingDuration}s)</span>
                      </button>
                    )}

                    <div className="h-4 w-px bg-slate-800 hidden sm:block" />

                    <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs rounded-xl cursor-pointer transition">
                      <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
                      <span>Upload WAV/MP3</span>
                      <input type="file" accept="audio/*" onChange={handleAudioFileChange} className="hidden" />
                    </label>

                    {audioURL && (
                      <div className="w-full sm:w-auto pt-2 sm:pt-0">
                        <audio src={audioURL} controls className="h-8 max-w-full sm:max-w-[240px] opacity-80" />
                      </div>
                    )}
                  </div>
                </div>

                {uploadedAudioFile && (
                  <div className="mt-6 border-t border-slate-800/60 pt-4">
                    <button
                      onClick={executeVoiceAnalysis}
                      disabled={isAnalyzing}
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 font-mono text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition active:scale-99 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing Audio Rhythm Engine...</span>
                        </div>
                      ) : (
                        'Run Neuro-Acoustic Analysis Pipeline'
                      )}
                    </button>

                    {aiAnalysisResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-900/60 text-xs text-slate-300 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Acoustic Meta Metrics</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            aiAnalysisResult.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                            aiAnalysisResult.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {aiAnalysisResult.riskLevel} Over-Leverage Risk
                          </span>
                        </div>
                        <p className="font-sans leading-relaxed">
                          <strong className="text-slate-400">Emotion Profile:</strong> {aiAnalysisResult.detectedEmotion}
                        </p>
                        <p className="italic text-slate-400 font-sans pl-2 border-l border-emerald-500/30">
                          "{aiAnalysisResult.feedback}"
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* RULES DISCIPLINE CHECKLIST SANDBOX */}
              <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/40 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckSquare className="text-emerald-400 w-4 h-4" />
                    <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                      Execution Filter Checklist
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-tight mb-4">
                    የእለቱን ግብይት ከመክፈትዎ በፊት እነዚህን የስነ-ልቦና ማጣሪያዎች መሙላትዎን ያረጋግጡ።
                  </p>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-900/60 text-xs transition hover:border-slate-800"
                      >
                        <div
                          onClick={() => {
                            setChecklist(checklist.map(c => c.id === item.id ? { ...c, completed: !c.completed } : c));
                          }}
                          className="flex items-start gap-2.5 flex-1 cursor-pointer select-none"
                        >
                          <div className="mt-0.5 text-emerald-400 shrink-0">
                            {item.completed ? <CheckSquare className="w-3.5 h-3.5 fill-emerald-400/10" /> : <CheckboxBlank className="w-3.5 h-3.5 text-slate-700" />}
                          </div>
                          <span className={`font-sans leading-tight transition ${item.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                            {item.text}
                          </span>
                        </div>
                        <button
                          onClick={() => setChecklist(checklist.filter(c => c.id !== item.id))}
                          className="text-slate-700 hover:text-rose-400 p-0.5 transition shrink-0 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newChecklistItem.trim()) return;
                    setChecklist([...checklist, { id: Date.now().toString(), text: newChecklistItem.trim(), completed: false }]);
                    setNewChecklistItem('');
                  }}
                  className="flex gap-2 mt-4 pt-3 border-t border-slate-900"
                >
                  <input
                    type="text"
                    placeholder="Add custom mandate..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-sans placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* RESEARCH DISCOVERY SECTION (ውቡ የድሮ የቦክስ ግሪድ ዲዛይን) */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-md font-black tracking-tight flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>{translations[lang].researchLibraryTitle}</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-0.5">
                    Scientific Data Archives
                  </p>
                </div>

                <div className="w-full sm:w-72 relative">
                  <input
                    type="text"
                    placeholder={lang === 'am' ? 'የጥናት ርዕስ ወይም ቁልፍ ቃል ይፈልጉ...' : 'Query scientific nodes...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-1.5 pl-3 pr-8 text-xs font-sans text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
                  />
                  <Compass className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center font-mono text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Synchronizing data pipelines...</span>
                </div>
              ) : filteredPapers.length === 0 ? (
                <div className="py-12 bg-slate-950/20 border border-dashed border-slate-900 rounded-2xl text-center text-xs font-mono text-slate-500">
                  No matching scientific research papers located inside memory banks.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPapers.map((paper) => {
                    const isExpanded = expandedPaper === paper.id;
                    const paperComments = comments.filter(c => c.paperId === paper.id);

                    return (
                      <motion.div
                        key={paper.id}
                        layout="position"
                        className={`bg-slate-900/40 border transition-all duration-300 rounded-2xl p-5 md:p-6 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group ${
                          isExpanded ? 'border-emerald-500/20 shadow-xl shadow-emerald-500/2' : 'border-slate-800/80 hover:border-slate-700/60 shadow-md'
                        }`}
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/2 to-transparent pointer-events-none" />
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400/90 transition font-sans leading-snug">
                              {paper.title}
                            </h3>
                            <button
                              onClick={(e) => handleLike(paper.id, e)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 font-bold tracking-tight transition active:scale-95 cursor-pointer shrink-0"
                            >
                              <ThumbsUp className="w-3 h-3 fill-emerald-400/5" />
                              <span>{paper.likes}</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-slate-500 mb-4">
                            <span>🧑‍💻 {paper.authors}</span>
                            <span>•</span>
                            <span className="text-emerald-500/60 font-bold uppercase tracking-widest text-[9px]">Verified Science</span>
                          </div>

                          <p className="text-xs text-slate-400 font-sans leading-relaxed text-justify">
                            {paper.abstract}
                          </p>

                          {/* RECHARTS RENDER ENGINE (ከድሮው የተወሰደ ውብ ግራፍ) */}
                          {paper.chartData && paper.chartData.length > 0 && (
                            <div className="mt-4 h-36 w-full bg-slate-950/60 border border-slate-900 rounded-xl p-2 font-mono text-[9px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={paper.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id={`grad-${paper.id}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                                  <XAxis dataKey="name" stroke="#475569" tickLine={false} />
                                  <YAxis stroke="#475569" tickLine={false} />
                                  <ChartTooltip contentStyle={{ backgroundColor: '#020813', borderColor: '#1e293b', borderRadius: '8px', fontSize: '10px' }} />
                                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill={`url(#grad-${paper.id})`} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                          {/* EXPANDED CONTENT INTERFACE */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-6 pt-5 border-t border-slate-800/80 space-y-6"
                              >
                                <div className="text-xs text-slate-300 font-sans leading-relaxed space-y-3 bg-slate-950/40 border border-slate-900 p-4 rounded-xl shadow-inner text-justify whitespace-pre-wrap">
                                  {paper.content}
                                </div>

                                {/* DISCOURSE MODULE */}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-950 pb-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Peer Discourse Queue ({paperComments.length})</span>
                                  </div>

                                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {paperComments.length === 0 ? (
                                      <p className="text-[10px] text-slate-600 font-mono italic text-center py-2">No peer dialogue recorded in this thread.</p>
                                    ) : (
                                      paperComments.map((comm) => (
                                        <div key={comm.id} className="bg-slate-950/60 border border-slate-900/60 p-2.5 rounded-xl space-y-0.5 transition hover:border-slate-800/40">
                                          <div className="flex justify-between items-center font-mono text-[9px]">
                                            <span className="text-emerald-400 font-bold">{comm.author}</span>
                                            <span className="text-slate-600">{maskEmail(comm.email)}</span>
                                          </div>
                                          <p className="text-[11px] text-slate-300 font-sans leading-normal pl-0.5">{comm.text}</p>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  {/* COMMENT LEAVE BLOCK */}
                                  {activeUser ? (
                                    <form onSubmit={(e) => handleAddComment(paper.id, e)} className="flex items-center gap-2 mt-2 pt-1">
                                      <input
                                        type="text"
                                        placeholder="Broadcast analytical feedback..."
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/40 font-sans placeholder:text-slate-700"
                                      />
                                      <button
                                        type="submit"
                                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer"
                                      >
                                        <Send className="w-3 h-3" />
                                      </button>
                                    </form>
                                  ) : (
                                    <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl text-center">
                                      <p className="text-[10px] text-amber-500 font-sans italic">
                                        * You must authenticate your terminal profile to participate in community peer discourse.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <button
                          onClick={() => setExpandedPaper(isExpanded ? null : paper.id)}
                          className="w-full mt-5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-xl text-[10px] font-mono font-bold tracking-wider text-slate-400 hover:text-slate-300 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Collapse Abstract ↑' : 'Read Full Scientific Paper ↓'}</span>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SYNOPSIS GRAPH CARD FOOTNOTES (የድሮው የሊንክ ካርዶች ስብስብ) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-900 pt-8">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider block mb-1">Delayed Gratification</span>
                <p className="text-[11px] text-slate-400 font-sans leading-normal">
                  ትናንሽ አካውንቶችን በማሳደግ ሂደት ውስጥ የረጅም ጊዜ ስኬትን ለማምጣት ስሜትን መግታት ዋነኛው የሳይንስ መንገድ ነው።
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block mb-1">The Compound Effect</span>
                <p className="text-[11px] text-slate-400 font-sans leading-normal">
                  በየቀኑ የምናደርጋቸው ትናንሽ እና የተደጋገሙ ትክክለኛ የግብይት ውሳኔዎች በረጅም ጊዜ ውስጥ እጅግ ግዙፍ ለውጥ ያመጣሉ።
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block mb-1">Ichimoku Mandate</span>
                <p className="text-[11px] text-slate-400 font-sans leading-normal">
                  የሂሳብ ስልቶችን እና አውቶሜትድ የእንቅስቃሴ ደመናዎችን በመጠቀም የገበያውን አቅጣጫ ያለስሜት መተንበይ።
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DELAYED GRATIFICATION SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-slate-900 pb-4">
              <h2 className="text-md font-black tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>{translations[lang].simulatorTitle}</span>
              </h2>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-0.5">
                Monte Carlo Risk Projector
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* CONFIG BLOCKS */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Starting Balance ($)</label>
                  <input type="number" value={startCapital} onChange={(e) => setStartCapital(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-bold" />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Win Rate (%)</label>
                  <input type="number" value={winRate} onChange={(e) => setWinRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-bold" />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Risk to Reward Ratio</label>
                  <input type="number" step="0.1" value={riskReward} onChange={(e) => setRiskReward(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-bold" />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Total Executions</label>
                  <input type="number" value={numTradesSimulated} onChange={(e) => setNumTradesSimulated(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-bold" />
                </div>
                <button
                  onClick={runSimulatorTrajectory}
                  disabled={isSimulating}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-black tracking-widest uppercase rounded-xl transition cursor-pointer"
                >
                  Compute Path
                </button>
              </div>

              {/* TRAJECTORY GRAPH PANEL */}
              <div className="md:col-span-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
                <div className="h-64 w-full text-[10px] font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                      <XAxis dataKey="trade" stroke="#475569" />
                      <YAxis stroke="#475569" />
                      <ChartTooltip contentStyle={{ backgroundColor: '#020813', borderColor: '#1e293b' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey="disciplined" name="2% Rule Risk" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="emotional" name="15% Overleveraged" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {simSummary && (
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4 font-mono text-[11px]">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                      <span className="text-slate-500 text-[9px] block uppercase">Disciplined Strategy Output</span>
                      <strong className="text-emerald-400 text-sm">${simSummary.disciplinedFinal}</strong>
                      <span className="text-slate-400 text-[9px] ml-1">({simSummary.disciplinedStatus})</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                      <span className="text-slate-500 text-[9px] block uppercase">Emotional Spikes Output</span>
                      <strong className={`text-sm ${simSummary.emotionalFinal <= 0 ? 'text-rose-500' : 'text-amber-400'}`}>${simSummary.emotionalFinal}</strong>
                      <span className="text-slate-400 text-[9px] ml-1">({simSummary.emotionalStatus})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBMIT PROPOSAL PORTAL (ለብቻው ፔጅ የተደረገው ፎርም) */}
        {activeTab === 'submit_proposal' && (
          <div className="max-w-2xl mx-auto bg-gradient-to-b from-slate-900/60 to-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="border-b border-slate-800 pb-3 mb-6">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <PlusCircle className="text-emerald-400 w-5 h-5" />
                <span>{translations[lang].submitProposal}</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-1">
                የእርስዎን የትሬዲንግ ስነ-ልቦና ወይንም የሂሳብ ማባዣ ስልት ጥናት እዚህ ያቅርቡ። አድሚን ገምግሞ ለህዝብ ግልጽ ያደርገዋል።
              </p>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">የአመልካች ሙሉ ስም *</label>
                  <input
                    type="text"
                    value={propName}
                    onChange={(e) => setPropName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">የመገናኛ አድራሻ (ኢሜይል/ስልክ) *</label>
                  <input
                    type="text"
                    value={propContact}
                    onChange={(e) => setPropContact(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">የጥናቱ ርዕስ *</label>
                <input
                  type="text"
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-sans font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">የጥናቱ አጭር ማጠቃለያ (Abstract Outline) *</label>
                <textarea
                  value={propAbstract}
                  onChange={(e) => setPropAbstract(e.target.value)}
                  rows={6}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-sans leading-relaxed resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-98 cursor-pointer"
              >
                {translations[lang].paperPublishBtn || 'Submit Framework'}
              </button>
            </form>

            {proposalSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-xs font-mono text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-center"
              >
                {proposalSuccess}
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 4: ADMIN CONTROL HUB (አሁን ሙሉ በሙሉ እንዲሰራ ተደርጎ የተስተካከለው) */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="border-b border-slate-900 pb-4">
              <h2 className="text-md font-black tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>{translations[lang].adminPanel}</span>
              </h2>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-0.5">
                Centralized System Gate
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
              <h3 className="text-xs font-mono uppercase font-black text-slate-400 flex items-center gap-2 mb-4 border-b border-slate-950 pb-2">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Secure Terminal Authentication Gate
              </h3>

              {!privacyGateUnlocked ? (
                <form onSubmit={handleUnlockPrivacyGate} className="max-w-xs mx-auto text-center py-6 space-y-3">
                  <Lock className="w-6 h-6 text-slate-700 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-400 font-sans">ይህንን ክፍል ለመክፈት እባክዎ የአድሚን ፒን ኮድ (PIN) ያስገቡ።</p>
                  <input
                    type="password"
                    placeholder="Enter Security PIN (privacy99)"
                    value={privacyPin}
                    onChange={(e) => setPrivacyPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-center text-xs font-mono tracking-widest text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                  {privacyError && <p className="text-[11px] font-mono text-rose-400 font-bold">{privacyError}</p>}
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold font-mono text-xs uppercase rounded-xl shadow-lg transition active:scale-95 cursor-pointer">
                    Verify Admin PIN
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-emerald-400 text-xs font-mono flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>CyberSecurity Validation Clear. Terminal session opened.</span>
                  </div>

                  {/* IDENTITIES MASK OVERRIDE */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-slate-300 block">Mask Trader Email Identities</span>
                      <p className="text-[11px] text-slate-500 font-sans leading-normal">ሲሰናከል የተጠቃሚዎች ሙሉ ኢሜይል በህዝብ ፊት ግልጽ ሆኖ ይታያል።</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={maskEmailsInPublic}
                      onChange={(e) => setMaskEmailsInPublic(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>

                  {/* GDPR PURGE REGULATOR */}
                  <form onSubmit={handlePurgeUserData} className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                    <div>
                      <span className="block text-xs font-mono text-rose-400 font-black uppercase tracking-wider">⚠️ Right to Be Forgotten Pipeline (GDPR)</span>
                      <p className="text-[11px] text-slate-500 font-sans leading-normal mt-0.5">
                        የማንኛውም ተጠቃሚ የውሂብ መዝገብ (Comments/Profile) ሙሉ በሙሉ ከሲስተሙ ለማጥፋት ኢሜይሉን እዚህ ያስገቡ።
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        placeholder="target-trader@domain.com"
                        value={purgeTargetEmail}
                        onChange={(e) => setPurgeTargetEmail(e.target.value)}
                        required
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200"
                      />
                      <button type="submit" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer">
                        Execute Wipeout
                      </button>
                    </div>
                    {purgeResult && <p className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">{purgeResult}</p>}
                  </form>
                </div>
              )}
            </div>

            {/* LIVE LIBRARY MANAGEMENT */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
              <h3 className="text-xs font-mono uppercase font-black text-slate-400 mb-3 border-b border-slate-950 pb-2">
                📁 Active Database Paper Registries ({papers.length})
              </h3>
              <div className="space-y-2">
                {papers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-900/60 rounded-xl text-xs transition hover:border-slate-900">
                    <div className="truncate max-w-md space-y-0.5">
                      <span className="font-bold text-slate-300 block truncate font-sans">{p.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">By: {p.authors}</span>
                    </div>
                    <button
                      onClick={() => {
                        if(confirm('Are you sure you want to delete this paper?')) handleDeletePaper(p.id);
                      }}
                      className="p-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-slate-950 rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* QUEUED INBOUND STUDENT FRAMEWORKS */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
              <h3 className="text-xs font-mono uppercase font-black text-slate-400 mb-3 border-b border-slate-950 pb-2">
                📥 Student System Proposals Queue ({proposals.length})
              </h3>
              <div className="space-y-3">
                {proposals.length === 0 ? (
                  <p className="text-xs text-slate-600 font-mono italic text-center py-4">No student framework submissions inside pipeline queue.</p>
                ) : (
                  proposals.map((p) => (
                    <div key={p.id} className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                      <div className="flex justify-between items-center font-mono text-[10px] text-slate-500 border-b border-slate-900 pb-1.5">
                        <span>Sender: <strong className="text-slate-300">{p.name}</strong> ({p.contact})</span>
                        <span>{p.timestamp || 'Just Now'}</span>
                      </div>
                      <h4 className="font-bold text-slate-200 font-sans text-xs">{p.title}</h4>
                      <p className="text-slate-400 text-[11px] font-sans leading-relaxed text-justify">{p.abstract}</p>
                      <button
                        onClick={() => handleLoadProposalToForm(p)}
                        className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-mono font-bold pt-1 transition"
                      >
                        <span>Convert to Core Paper Registry</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AUTHENTICATION SYSTEM DIALOG MODAL */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-2xl"
            >
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition"
              >
                ✕
              </button>
              <h3 className="text-md font-black tracking-tight mb-1 font-sans">
                {authMode === 'login' ? 'Terminal Login' : 'Initialize Profile'}
              </h3>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-4">
                Identity Authentication
              </p>

              <form onSubmit={handleAuthSubmit} className="space-y-3 font-mono text-xs">
                {authMode === 'signup' && (
                  <input
                    type="text"
                    placeholder="Full Identification Name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500/40"
                  />
                )}
                <input
                  type="email"
                  placeholder="Network Email Identity"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500/40"
                />
                <input
                  type="password"
                  placeholder="Terminal Key Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500/40"
                />
                {authMode === 'signup' && (
                  <input
                    type="text"
                    placeholder="Telegram Username (Optional)"
                    value={authTelegram}
                    onChange={(e) => setAuthTelegram(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-emerald-500/40"
                  />
                )}

                {authError && <p className="text-[11px] text-rose-400 font-bold font-sans text-center">{authError}</p>}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase tracking-wider rounded-xl transition"
                >
                  {authMode === 'login' ? 'Unlock Terminal' : 'Register Signature'}
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-800/60 text-center text-[11px] font-sans">
                {authMode === 'login' ? (
                  <p className="text-slate-400">
                    New proxy operator?{' '}
                    <button onClick={() => setAuthMode('signup')} className="text-emerald-400 font-bold hover:underline">
                      Initialize Profile
                    </button>
                  </p>
                ) : (
                  <p className="text-slate-400">
                    Existing active identity?{' '}
                    <button onClick={() => setAuthMode('login')} className="text-emerald-400 font-bold hover:underline">
                      Terminal Login
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTIVE PROFILE DIALOG MODAL */}
      <AnimatePresence>
        {isProfileModalOpen && activeUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-2xl"
            >
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition"
              >
                ✕
              </button>
              <h3 className="text-sm font-black text-slate-200 mb-4 border-b border-slate-950 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" /> Operational Terminal Credentials
              </h3>
              <div className="space-y-3 font-mono text-xs text-slate-300 mb-6">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Operator Signature</span>
                  <strong className="text-slate-100 text-sm font-sans">{activeUser.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Routed Email Node</span>
                  <span className="text-slate-200">{activeUser.email}</span>
                </div>
                {activeUser.telegram && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Telegram Core Link</span>
                    <span className="text-emerald-400">{activeUser.telegram}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setIsProfileModalOpen(false);
                }}
                className="w-full py-2 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 text-xs font-bold uppercase rounded-xl transition cursor-pointer"
              >
                {lang === 'am' ? 'ከአካውንት ውጣ' : 'Disconnect Terminal'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="border-t border-slate-900 bg-slate-950 p-6 mt-12 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            <span>© 2026 የትሬዲንግ ስነ-ልቦና ምርምር መድረክ (Trading Psychology Sandbox).</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://t.me/tradingpsychologyresearchbot" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">ቴሌግራም አድሚን</a>
            <span>|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Node Live 2026</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
