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
  Trash2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer
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

export default function App() {
  const [lang, setLang] = useState<'am' | 'en'>('am');
  const [activeTab, setActiveTab] = useState<string>('home'); // home, submit_proposal, admin
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
  }, []);

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
                setActiveTab('submit_proposal');
                setIsMobileMenuOpen(false);
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
        
        {/* TAB 1: HOME PAGE (ሳይንሳዊ የካርድ ቦክሶች ብቻ የሚታዩበት) */}
        {activeTab === 'home' && (
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

                        {/* RECHARTS AREA GRAPH */}
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

                        {/* EXPANDED SECTION */}
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

                              {/* COMMENTS CORE */}
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
        )}

        {/* TAB 2: SUBMIT PROPOSAL PORTAL */}
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

        {/* TAB 3: ADMIN CONTROL HUB */}
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
                      onChange={(e) => setMaskEmailsInPublic(e.checked)}
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
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold pt-1">
                        <span>Convert to Core Paper Registry via backend</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
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
