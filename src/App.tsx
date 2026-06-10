import { useState, useEffect, FormEvent, MouseEvent } from 'react';
import {
  Brain,
  RefreshCw,
  MessageSquare,
  Compass,
  Send,
  ThumbsUp,
  Sliders,
  PlusCircle,
  FileText,
  ArrowRight,
  User,
  Lock,
  Menu,
  X,
  ShieldCheck,
  Trash2,
  TrendingUp,
  SendIcon,
  HelpCircle,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
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

interface AdminQuestion {
  id: string;
  senderName: string;
  senderContact: string;
  questionText: string;
  timestamp: string;
}

export default function App() {
  const [lang, setLang] = useState<'am' | 'en'>('am');
  const [activeTab, setActiveTab] = useState<string>('home'); // home, simulator, submit_proposal, admin
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // --- CORE DATABASE STATES ---
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [adminQuestions, setAdminQuestions] = useState<AdminQuestion[]>([]);
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

  // --- SIMULATOR CONTROL STATES (Delayed & Compounding Combined) ---
  const [startCapital, setStartCapital] = useState<number>(100);
  const [winRate, setWinRate] = useState<number>(55);
  const [riskReward, setRiskReward] = useState<number>(2.0);
  const [numTradesSimulated, setNumTradesSimulated] = useState<number>(50);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // --- PROPOSAL & ASK ADMIN STATES ---
  const [propName, setPropName] = useState<string>('');
  const [propContact, setPropContact] = useState<string>('');
  const [propTitle, setPropTitle] = useState<string>('');
  const [propAbstract, setPropAbstract] = useState<string>('');
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);

  const [askName, setAskName] = useState<string>('');
  const [askContact, setAskContact] = useState<string>('');
  const [askQuestion, setAskQuestion] = useState<string>('');
  const [askSuccess, setAskSuccess] = useState<string | null>(null);

  // --- PRIVACY & ADMIN CONFIG STATES ---
  const [privacyGateUnlocked, setPrivacyGateUnlocked] = useState<boolean>(false);
  const [privacyPin, setPrivacyPin] = useState<string>('');
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [maskEmailsInPublic, setMaskEmailsInPublic] = useState<boolean>(true);
  const [purgeTargetEmail, setPurgeTargetEmail] = useState<string>('');
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');

  // 📡 FETCH REPOSITORIES FROM BACKEND PIPELINES
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
        const questionsRes = await fetch('/api/admin/questions');
        if (questionsRes.ok) {
          const qData = await questionsRes.json();
          setAdminQuestions(qData || []);
        }
      } catch (err) {
        console.error("Data synchronization engine failed:", err);
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
    runAdvancedSimulator();
  }, []);

  // 🧮 COMPREHENSIVE SIMULATOR (DISCIPLINED VS EMOTIONAL COMPOUNDING)
  const runAdvancedSimulator = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const trajectory = [];
      let disciplinedBalance = startCapital;
      let emotionalBalance = startCapital;

      trajectory.push({
        trade: 0,
        disciplined: Math.round(disciplinedBalance),
        emotional: Math.round(emotionalBalance)
      });

      for (let i = 1; i <= numTradesSimulated; i++) {
        // Disciplined Path: Strict 2% Risk with Compounding
        const discWin = Math.random() * 100 < winRate;
        const discRiskAmount = disciplinedBalance * 0.02;
        disciplinedBalance += discWin ? (discRiskAmount * riskReward) : -discRiskAmount;
        if (disciplinedBalance < 0) disciplinedBalance = 0;

        // Emotional Path: Wild 15% Risk (Overleveraging/Greed)
        const emoWin = Math.random() * 100 < winRate;
        const emoRiskAmount = emotionalBalance * 0.15;
        emotionalBalance += emoWin ? (emoRiskAmount * riskReward) : -emoRiskAmount;
        if (emotionalBalance < 0) emotionalBalance = 0;

        trajectory.push({
          trade: i,
          disciplined: Math.round(disciplinedBalance * 100) / 100,
          emotional: Math.round(emotionalBalance * 100) / 100
        });
      }

      setSimulationData(trajectory);
      setIsSimulating(false);
    }, 300);
  };

  // 📝 HANDLERS FOR CORE INTERACTIONS
  const handleLike = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/papers/${id}/like`, { method: 'POST' });
      if (res.ok) {
        setPapers(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
      }
    } catch (err) {
      console.error("Upvote engine pipeline failure:", err);
    }
  };

  const handleAddComment = async (paperId: string, e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          author: activeUser?.name || 'Anonymous Peer',
          email: activeUser?.email || 'hidden@node.local',
          text: newCommentText.trim()
        })
      });
      if (res.ok) {
        const savedComment = await res.json();
        setComments(prev => [savedComment, ...prev]);
        setNewCommentText('');
      }
    } catch (err) {
      console.error("Comment registry delivery failure:", err);
    }
  };

  const handleSubmitProposal = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: propName, contact: propContact, title: propTitle, abstract: propAbstract })
      });
      if (res.ok) {
        const saved = await res.json();
        setProposals(prev => [saved, ...prev]);
        setPropName(''); setPropContact(''); setPropTitle(''); setPropAbstract('');
        setProposalSuccess('የጥናት ማመልከቻዎ በተሳካ ሁኔታ ለዳታቤዝ ተልኳል!');
      }
    } catch (err) { console.error(err); }
  };

  const handleAskAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderName: askName, senderContact: askContact, questionText: askQuestion })
      });
      if (res.ok) {
        const saved = await res.json();
        setAdminQuestions(prev => [saved, ...prev]);
        setAskName(''); setAskContact(''); setAskQuestion('');
        setAskSuccess('ጥያቄዎ ለአድሚን በሰላም ደርሷል! በቅርቡ ምላሽ ያገኛሉ።');
      }
    } catch (err) {
      console.error("Failed to post question to admin:", err);
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
    } catch (err) { setAuthError('Network loop timeout.'); }
  };

  const handleUnlockPrivacyGate = (e: FormEvent) => {
    e.preventDefault();
    if (privacyPin === 'privacy99') {
      setPrivacyGateUnlocked(true);
      setPrivacyError(null);
    } else { setPrivacyError('የተሳሳተ የአድሚን PIN ኮድ ነው።'); }
  };

  const handleDeletePaper = async (id: string) => {
    try {
      const res = await fetch(`/api/papers/${id}`, { method: 'DELETE' });
      if (res.ok) setPapers(prev => prev.filter(p => p.id !== id));
    } catch (err) { console.error(err); }
  };

  const maskEmail = (email: string) => {
    if (!maskEmailsInPublic) return email;
    if (!email || !email.includes('@')) return '******';
    const [name, domain] = email.split('@');
    return `${name.substring(0, 2)}***@${domain}`;
  };

  const filteredPapers = papers.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.abstract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020813] text-slate-100 flex flex-col antialiased selection:bg-emerald-500/20 relative overflow-x-hidden">
      
      {/* HEADER NAVIGATION */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/20 border border-emerald-500/20 rounded-xl">
              <Brain className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight">{translations[lang].title}</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{translations[lang].subTitle}</p>
            </div>
          </div>

          {/* Desktop Navigation links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <button onClick={() => setActiveTab('home')} className={`cursor-pointer transition ${activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].home}</button>
            <button onClick={() => setActiveTab('simulator')} className={`cursor-pointer transition ${activeTab === 'simulator' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].simulatorTitle || 'Simulator'}</button>
            <button onClick={() => setActiveTab('submit_proposal')} className={`cursor-pointer transition ${activeTab === 'submit_proposal' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{lang === 'am' ? 'የአዳዲስ ተማሪዎች ፖርታል' : 'Submit Proposal'}</button>
            <button onClick={() => setActiveTab('admin')} className={`cursor-pointer transition ${activeTab === 'admin' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].adminPanel}</button>
            <button onClick={() => setLang(l => l === 'am' ? 'en' : 'am')} className="text-slate-400 hover:text-emerald-400 text-[11px] border border-slate-800 rounded-lg px-2 py-0.5">{lang === 'am' ? 'English' : 'አማርኛ'}</button>
            {activeUser ? (
              <button onClick={() => setIsProfileModalOpen(true)} className="text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/10">👤 {activeUser.name}</button>
            ) : (
              <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl">{translations[lang].loginBtn}</button>
            )}
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-400"><Menu className="w-6 h-6" /></button>
        </div>
      </header>

      {/* MOBILE OVERLAY MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden bg-slate-950/95 fixed top-[69px] left-0 right-0 z-40 p-4 space-y-2 text-sm border-b border-slate-900 font-mono">
            <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300">Home Library</button>
            <button onClick={() => { setActiveTab('simulator'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300">Compound Simulator</button>
            <button onClick={() => { setActiveTab('submit_proposal'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300">Submit Proposal</button>
            <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300">Admin Control</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE FRAMEWORK DISPLAY HUB */}
      <main className="flex-1 z-10 relative">
        
        {/* TAB 1: HOME PAGE LIBRARY & THE ENHANCED HERO SECTION */}
        {activeTab === 'home' && (
          <div className="space-y-0">
            
            {/* HERO SECTION */}
            <section className="relative py-20 px-6 border-b border-slate-900 bg-slate-950">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
              
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
                  90% of Trading Success <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    lies in your psychology!!
                  </span>
                </motion.h2>
                
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed mb-10">
                  "The pressure to grow small accounts fast, lack of disciplined risk rules, and instant gratification are the standard graveyards of retail traders. True success lies in compounding with low risk."
                </motion.p>

                {/* Stat Micro Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-center">
                    <span className="text-emerald-400 text-xl font-black block">2% RISK</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-1">Strict Discipline (Survival Key)</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-center">
                    <span className="text-cyan-400 text-xl font-black block">COMPOUNDING</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-1">Long-term Capital Acceleration</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-center">
                    <span className="text-amber-400 text-xl font-black block">DELAYED GRT.</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-1">Great Rewards Come From Patience</p>
                  </div>
                </div>

                {/* Hero Trigger Layouts */}
                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={() => setActiveTab('simulator')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition flex items-center gap-2 cursor-pointer">
                    <TrendingUp className="w-4 h-4" /> Run Delayed Compounding Simulator
                  </button>
                  <a href="https://t.me/tradingpsychologyresearchbot" target="_blank" rel="noreferrer" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-widest rounded-xl transition flex items-center gap-2">
                    <SendIcon className="w-4 h-4 text-cyan-400" /> Chat with Admin on Telegram
                  </a>
                </div>
              </div>
            </section>

            {/* INTERACTIVE RESEARCH SANDBOX CARDS */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
                <div>
                  <h2 className="text-lg font-black flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Interactive Research Sandbox (Fetched Cards)</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Choose any scientific card below to review empirical data, read deep content architectures and submit analytical responses.</p>
                </div>

                <div className="w-full sm:w-72 relative">
                  <input
                    type="text" placeholder={lang === 'am' ? 'የጥናት ርዕስ ይፈልጉ...' : 'Query scientific nodes...'}
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-3 pr-8 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                  <Compass className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center font-mono text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Synchronizing active database registries...</span>
                </div>
              ) : filteredPapers.length === 0 ? (
                <div className="py-12 bg-slate-950/20 border border-dashed border-slate-900 rounded-2xl text-center text-xs font-mono text-slate-500">
                  No active scientific research nodes matched the criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredPapers.map((paper) => {
                    const isExpanded = expandedPaper === paper.id;
                    const paperComments = comments.filter(c => c.paperId === paper.id);

                    return (
                      <motion.div key={paper.id} layout className={`bg-slate-900/40 border transition-all duration-300 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group ${isExpanded ? 'border-emerald-500/30 shadow-2xl' : 'border-slate-800/80 hover:border-slate-700'}`}>
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase font-black">Verified Archive</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono"><MessageSquare className="w-3 h-3" /> {paperComments.length} Responses</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-100 mb-2 font-sans group-hover:text-emerald-400/90 transition">{paper.title}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed text-justify mb-4">{paper.abstract}</p>

                          {/* RECHARTS AREA GRAPH ATTACHED TO PAPER */}
                          {paper.chartData && paper.chartData.length > 0 && (
                            <div className="h-32 w-full bg-slate-950/60 border border-slate-900 rounded-xl p-2 font-mono text-[9px] mb-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={paper.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id={`g-${paper.id}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="2 2" stroke="#0f172a" />
                                  <XAxis dataKey="name" stroke="#475569" tickLine={false} />
                                  <YAxis stroke="#475569" tickLine={false} />
                                  <ChartTooltip contentStyle={{ backgroundColor: '#020813', borderColor: '#1e293b', fontSize: '9px' }} />
                                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={1.5} fill={`url(#g-${paper.id})`} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-slate-800/80 pt-4 space-y-4">
                                <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-justify font-sans">{paper.content}</div>
                                
                                {/* DISCOURSE QUEUE */}
                                <div className="space-y-2">
                                  <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Peer Comments Portal ({paperComments.length})</span>
                                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                                    {paperComments.length === 0 ? (
                                      <p className="text-[10px] text-slate-600 font-mono italic">No forum dialogue logs found.</p>
                                    ) : (
                                      paperComments.map(c => (
                                        <div key={c.id} className="bg-slate-950/60 border border-slate-900/60 p-2.5 rounded-xl">
                                          <div className="flex justify-between font-mono text-[9px] text-slate-400 mb-0.5">
                                            <span className="text-emerald-400 font-bold">{c.author}</span>
                                            <span>{maskEmail(c.email)}</span>
                                          </div>
                                          <p className="text-slate-300 font-sans text-xs">{c.text}</p>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                  {activeUser ? (
                                    <form onSubmit={(e) => handleAddComment(paper.id, e)} className="flex gap-2 mt-2">
                                      <input type="text" placeholder="Add community comment..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none" />
                                      <button type="submit" className="px-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"><Send className="w-3 h-3" /></button>
                                    </form>
                                  ) : <p className="text-[10px] text-amber-500 italic text-center py-1 bg-amber-500/5 border border-amber-500/10 rounded-lg">* Sign in to post technical commentary.</p>}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/60">
                          <div className="text-[10px] font-mono text-slate-500">By: <span className="text-slate-300">{paper.authors}</span></div>
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => handleLike(paper.id, e)} className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 transition hover:bg-slate-900 cursor-pointer"><ThumbsUp className="w-3 h-3" /> {paper.likes}</button>
                            <button onClick={() => setExpandedPaper(isExpanded ? null : paper.id)} className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 hover:text-slate-200 transition cursor-pointer">{isExpanded ? 'Hide ↑' : 'Read Full ↓'}</button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* 📬 ORIGINAL "ASK ADMIN" SYSTEM QUESTION GATEWAY (RESTORED) */}
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 mt-16 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                  <HelpCircle className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-black tracking-tight">የአድሚን ጥያቄ መጠየቂያ ፎርም (Ask Admin Portal)</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">በትሬዲንግ ስነ-ልቦና ወይንም በትንሽ አካውንት አያያዝ ዙሪያ ያልተረዳዎትን ነገር ለአድሚን በቀጥታ ይላኩ።</p>
                  </div>
                </div>

                <form onSubmit={handleAskAdminSubmit} className="space-y-3 font-sans text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="የእርስዎ ስም *" value={askName} onChange={e=>setAskName(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                    <input type="text" placeholder="የመገናኛ ቴሌግራም/ኢሜይል *" value={askContact} onChange={e=>setAskContact(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                  </div>
                  <textarea placeholder="የጥያቄዎ ዝርዝር እዚህ ይጻፉ... *" value={askQuestion} onChange={e=>setAskQuestion(e.target.value)} rows={4} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none" />
                  <button type="submit" className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold uppercase rounded-xl tracking-wider transition cursor-pointer">
                    Submit Question to Admin
                  </button>
                </form>
                {askSuccess && <p className="mt-3 text-xs font-mono text-cyan-400 text-center bg-cyan-500/5 p-2 rounded-lg border border-cyan-500/10">{askSuccess}</p>}
              </div>

            </section>
          </div>
        )}

        {/* TAB 2: ADVANCED SIMULATOR (DELAYED GRATIFICATION & COMPOUND EFFECT FULL DISPLAY) */}
        {activeTab === 'simulator' && (
          <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              <div className="border-b border-slate-800 pb-4 mb-6">
                <h2 className="text-xl font-black flex items-center gap-2"><Sliders className="text-emerald-400 w-5 h-5" /> Advanced Compounding Simulator</h2>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  ይህ ማሳያ የረጅም ጊዜ **የኮምፓውንድ ኢፌክት (Compound Effect)** ጥቅምን እና ያለ ዲሲፕሊን በትልቅ Risk መገበያየት (**Emotional Path**) የሚያስከትለውን የካፒታል መጥፋት ያነጻጽራል።
                </p>
              </div>

              {/* Input Regulator Panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Start Capital ($)</label>
                  <input type="number" value={startCapital} onChange={e=>setStartCapital(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Win Rate (%)</label>
                  <input type="number" value={winRate} onChange={e=>setWinRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Risk Reward Ratio</label>
                  <input type="number" step="0.1" value={riskReward} onChange={e=>setRiskReward(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Trades count</label>
                  <input type="number" value={numTradesSimulated} onChange={e=>setNumTradesSimulated(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold" />
                </div>
              </div>

              <button onClick={runAdvancedSimulator} disabled={isSimulating} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer mb-8">
                {isSimulating ? 'Processing Math Models...' : 'Compute Trajectory Engine'}
              </button>

              {/* Comparative Charts Visualizer */}
              <div className="h-80 w-full bg-slate-950/60 rounded-2xl border border-slate-800 p-4 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#131a26" />
                    <XAxis dataKey="trade" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} />
                    <ChartTooltip contentStyle={{ backgroundColor: '#020813', borderColor: '#1e293b', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                    <Line type="monotone" dataKey="disciplined" name="Disciplined Path (2% Risk Compounded)" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="emotional" name="Emotional Path (15% Overleveraged Risk)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Informative Grid Notice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl">
                  <span className="text-emerald-400 font-bold block">🟢 Disciplined Compound Effect</span>
                  <p className="text-slate-400 text-[11px] font-sans mt-1 leading-relaxed">
                    ካፒታልዎን በእያንዳንዱ ትሬድ ላይ በ 2% ሪስክ ብቻ እያባዙ (Compound) ሲሄዱ፣ የነገሮች መጥፋት ዕድል በእጅጉ ይቀንሳል፣ የትርፍ ዕድልዎ ደግሞ በረጅም ጊዜ በከፍተኛ ፍጥነት ያድጋል።
                  </p>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-xl">
                  <span className="text-rose-400 font-bold block">🔴 Emotional Greed Fallacy</span>
                  <p className="text-slate-400 text-[11px] font-sans mt-1 leading-relaxed">
                    በአንድ ጊዜ ትልቅ ትርፍ ለማግኘት በመመኘት አካውንትን በ 15% ወይንም ከዚያ በላይ ሪስክ ማድረግ መጀመሪያ ላይ ትርፍ ቢያመጣም፣ በጥቂት ተከታታይ ኪሳራዎች አካውንቱን ሙሉ በሙሉ ወደ መጥፋት (Margin Call) ይመራዋል።
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBMIT STUDENT PROPOSAL */}
        {activeTab === 'submit_proposal' && (
          <div className="max-w-2xl mx-auto py-12 px-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl">
              <div className="border-b border-slate-800 pb-3 mb-6">
                <h2 className="text-lg font-black flex items-center gap-2"><PlusCircle className="text-emerald-400 w-5 h-5" /> Submit Scientific Proposal</h2>
                <p className="text-xs text-slate-400 font-sans mt-1">የእርስዎን የትሬዲንግ ስነ-ልቦና ወይንም የሂሳብ ማባዣ ስልት ጥናት እዚህ ያቅርቡ። አድሚን ገምግሞ በሆም ፔጁ ላይ ለህዝብ ግልጽ ያደርገዋል።</p>
              </div>

              <form onSubmit={handleSubmitProposal} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">የአመልካች ሙሉ ስም *</label>
                  <input type="text" value={propName} onChange={e=>setPropName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">የመገናኛ አድራሻ (ቴሌግራም/ኢሜይል) *</label>
                  <input type="text" value={propContact} onChange={e=>setPropContact(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">የጥናቱ ርዕስ *</label>
                  <input type="text" value={propTitle} onChange={e=>setPropTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-bold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">የጥናቱ አጭር ማጠቃለያ (Abstract Outline) *</label>
                  <textarea value={propAbstract} onChange={e=>setPropAbstract(e.target.value)} rows={6} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none resize-none leading-relaxed" />
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer">Archive System Proposal</button>
              </form>
              {proposalSuccess && <p className="mt-4 text-xs font-mono text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-center">{proposalSuccess}</p>}
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN ADVANCED CONTROL CONSOLE */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              <h2 className="text-md font-black uppercase font-mono tracking-wide mb-4 flex items-center gap-2 border-b border-slate-950 pb-2 text-indigo-400">
                <ShieldCheck className="w-5 h-5" /> Admin Secure Verification Terminal
              </h2>

              {!privacyGateUnlocked ? (
                <form onSubmit={handleUnlockPrivacyGate} className="max-w-xs mx-auto text-center py-6 space-y-4">
                  <Lock className="w-8 h-8 text-slate-700 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-400">የአስተዳዳሪ ማረጋገጫ ኮድ (PIN) ያስገቡ።</p>
                  <input type="password" placeholder="ENTER SECURITY PIN (privacy99)" value={privacyPin} onChange={e=>setPrivacyPin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-xs tracking-widest text-slate-100" />
                  {privacyError && <p className="text-xs text-rose-400 font-bold">{privacyError}</p>}
                  <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs uppercase font-black rounded-xl transition cursor-pointer">Unlock Session</button>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-emerald-400 text-xs font-mono">
                    ✓ Validation Success. Active system admin console online.
                  </div>

                  {/* IDENTITIES MASK CONTROL */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center gap-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-300 block">Mask Trader Email Logs</span>
                      <p className="text-[11px] text-slate-500 font-sans">ሲበራ የተጠቃሚዎች ኢሜይል በከፊል ተሸፍኖ ለህዝብ ይታያል።</p>
                    </div>
                    <input type="checkbox" checked={maskEmailsInPublic} onChange={e=>setMaskEmailsInPublic(e.target.checked)} className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-500 cursor-pointer" />
                  </div>

                  {/* INBOUND SENDER QUESTIONS FROM SITE (RESTORED) */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-black uppercase text-slate-400">📥 Inbound Trader Questions Queue ({adminQuestions.length})</h3>
                    <div className="space-y-2">
                      {adminQuestions.length === 0 ? (
                        <p className="text-xs text-slate-600 font-mono italic">No inbound terminal queries reported.</p>
                      ) : (
                        adminQuestions.map(q => (
                          <div key={q.id} className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-b border-slate-900 pb-1">
                              <span>From: <strong className="text-slate-300">{q.senderName}</strong> ({q.senderContact})</span>
                              <span>{q.timestamp || 'Just Now'}</span>
                            </div>
                            <p className="text-xs text-slate-300 font-sans leading-relaxed">{q.questionText}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* QUEUED INBOUND PROPOSALS */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-black uppercase text-slate-400">📥 Active Proposals Frameworks ({proposals.length})</h3>
                    <div className="space-y-2">
                      {proposals.length === 0 ? (
                        <p className="text-xs text-slate-600 font-mono italic">No student structures inside the queue.</p>
                      ) : (
                        proposals.map(p => (
                          <div key={p.id} className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                            <span className="block text-[10px] font-mono text-slate-500">By: {p.name} ({p.contact})</span>
                            <h4 className="text-xs font-bold font-sans text-slate-200">{p.title}</h4>
                            <p className="text-slate-400 text-[11px] font-sans">{p.abstract}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* LIVE PAPERS MANAGEMENT */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-black uppercase text-slate-400">📁 Active Database Registries ({papers.length})</h3>
                    <div className="space-y-2">
                      {papers.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-900 text-xs">
                          <span className="font-bold truncate max-w-sm font-sans">{p.title}</span>
                          <button onClick={()=>handleDeletePaper(p.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 p-8 text-center text-[10px] font-mono text-slate-600">
        © 2026 የትሬዲንግ ስነ-ልቦና ምርምር መድረክ (Trading Psychology Sandbox). <br />
        <span className="text-emerald-500/40 mt-1 block">Rhythmic Data Node Live 2026</span>
      </footer>

      {/* TERMINAL AUTHENTICATION MODAL */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
              <button onClick={()=>setIsAuthModalOpen(false)} className="absolute top-5 right-5 text-slate-500 hover:text-slate-300">✕</button>
              <h3 className="text-md font-black mb-1">{authMode === 'login' ? 'Terminal Account Unlock' : 'Initialize Profile Signature'}</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-4">Identity Verification</p>
              
              <form onSubmit={handleAuthSubmit} className="space-y-3 font-mono text-xs">
                {authMode === 'signup' && <input type="text" placeholder="Full Identification Name" value={authName} onChange={e=>setAuthName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none" />}
                <input type="email" placeholder="Network Email Node" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none" />
                <input type="password" placeholder="Terminal Account Key" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none" />
                {authError && <p className="text-xs text-rose-400 font-bold text-center font-sans">{authError}</p>}
                <button type="submit" className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl uppercase tracking-widest text-xs">Execute Verification</button>
              </form>
              <button onClick={()=>setAuthMode(authMode==='login'?'signup':'login')} className="mt-4 text-xs text-slate-500 hover:text-emerald-400 transition w-full text-center">
                {authMode === 'login' ? "New Operator? Initialize Profile" : "Existing Active Identity? Login"}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* USER PROFILE MODAL */}
      <AnimatePresence>
        {isProfileModalOpen && activeUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
              <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-slate-500">✕</button>
              <h3 className="text-sm font-black mb-4 border-b border-slate-950 pb-2">👤 Operational Profile Credentials</h3>
              <div className="space-y-2 font-mono text-xs text-slate-300 mb-6">
                <div><span className="text-[10px] text-slate-500 block">Operator Signature</span><strong>{activeUser.name}</strong></div>
                <div><span className="text-[10px] text-slate-500 block">Routed Email Node</span><span>{activeUser.email}</span></div>
              </div>
              <button onClick={() => { setActiveUser(null); localStorage.removeItem('trader_session'); setIsProfileModalOpen(false); }} className="w-full py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase rounded-xl transition cursor-pointer">Disconnect Terminal</button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
