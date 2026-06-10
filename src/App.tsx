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
  SendIcon
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
  const [activeTab, setActiveTab] = useState<string>('home'); 
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

  // --- MONTE CARLO SIMULATOR STATES (For Hero Link) ---
  const [startCapital, setStartCapital] = useState<number>(100);
  const [winRate, setWinRate] = useState<number>(50);
  const [riskReward, setRiskReward] = useState<number>(2.0);
  const [numTradesSimulated, setNumTradesSimulated] = useState<number>(100);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSummary, setSimSummary] = useState<any>(null);

  // --- PROPOSAL FORM STATES ---
  const [propName, setPropName] = useState<string>('');
  const [propContact, setPropContact] = useState<string>('');
  const [propTitle, setPropTitle] = useState<string>('');
  const [propAbstract, setPropAbstract] = useState<string>('');
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);

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
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
    const storedUser = localStorage.getItem('trader_session');
    if (storedUser) setActiveUser(JSON.parse(storedUser));
    runSimulatorTrajectory();
  }, []);

  const runSimulatorTrajectory = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const arr = [];
      let discBalance = startCapital;
      let emoBalance = startCapital;
      arr.push({ trade: 0, disciplined: discBalance, emotional: emoBalance });
      for (let i = 1; i <= numTradesSimulated; i++) {
        const discWin = Math.random() * 100 < winRate;
        discBalance += discWin ? (startCapital * 0.02 * riskReward) : -(startCapital * 0.02);
        if (discBalance < 0) discBalance = 0;
        const emoWin = Math.random() * 100 < winRate;
        emoBalance += emoWin ? (emoBalance * 0.15 * riskReward) : -(emoBalance * 0.15);
        if (emoBalance < 0) emoBalance = 0;
        arr.push({ trade: i, disciplined: Math.round(discBalance * 100) / 100, emotional: Math.round(emoBalance * 100) / 100 });
      }
      setSimulationData(arr);
      setSimSummary({
        disciplinedFinal: Math.round(discBalance),
        disciplinedStatus: discBalance > startCapital ? 'ትርፋማ' : 'ኪሳራ',
        emotionalFinal: Math.round(emoBalance),
        emotionalStatus: emoBalance <= 0 ? 'Margin Call 💥' : emoBalance > startCapital ? 'ትርፋማ' : 'ኪሳራ'
      });
      setIsSimulating(false);
    }, 400);
  };

  const handleLike = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/papers/${id}/like`, { method: 'POST' });
    if (res.ok) setPapers(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleAddComment = async (paperId: string, e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperId, author: activeUser?.name || 'Anonymous', email: activeUser?.email || '', text: newCommentText.trim() })
    });
    if (res.ok) {
      const saved = await res.json();
      setComments(prev => [saved, ...prev]);
      setNewCommentText('');
    }
  };

  const handleSubmitProposal = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: propName, contact: propContact, title: propTitle, abstract: propAbstract })
    });
    if (res.ok) {
      const saved = await res.json();
      setProposals(prev => [saved, ...prev]);
      setPropName(''); setPropContact(''); setPropTitle(''); setPropAbstract('');
      setProposalSuccess('የጥናት ማመልከቻዎ በተሳካ ሁኔታ ተልኳል!');
    }
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const payload = authMode === 'login' ? { email: authEmail, password: authPassword } : { name: authName, email: authEmail, password: authPassword, telegram: authTelegram };
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) {
      setActiveUser(data.user);
      localStorage.setItem('trader_session', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
    } else { setAuthError(data.error || 'Authentication rejection.'); }
  };

  const handleUnlockPrivacyGate = (e: FormEvent) => {
    e.preventDefault();
    if (privacyPin === 'privacy99') { setPrivacyGateUnlocked(true); setPrivacyError(null); }
    else { setPrivacyError('Invalid security PIN.'); }
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
    if (res.ok) setPapers(prev => prev.filter(p => p.id !== id));
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
      
      {/* HEADER */}
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

          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <button onClick={() => setActiveTab('home')} className={`cursor-pointer transition ${activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].home}</button>
            <button onClick={() => setActiveTab('simulator')} className={`cursor-pointer transition ${activeTab === 'simulator' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].simulatorTitle}</button>
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

      {/* MAIN HUB */}
      <main className="flex-1 z-10 relative">
        
        {activeTab === 'home' && (
          <div className="space-y-0">
            
            {/* 🚀 IMAGE 2 INSPIRED HERO SECTION */}
            <section className="relative py-20 px-6 overflow-hidden border-b border-slate-900 bg-slate-950">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
              
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6"
                >
                  90% of Trading Success <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    lies in your psychology!!
                  </span>
                </motion.h2>
                
                <motion.p 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                   className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-10"
                >
                  "The pressure to grow small accounts fast, lack of disciplined risk rules, and instant gratification are the standard graveyards of retail traders. True success lies in compounding with low risk."
                </motion.p>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-emerald-400 text-xl font-black block">2% RISK</span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Strict Discipline (Survival Key)</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-cyan-400 text-xl font-black block">COMPOUNDING</span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Long-term Capital Acceleration</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-amber-400 text-xl font-black block">DELAYED GRT.</span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Great Rewards Come From Patience</p>
                  </div>
                </div>

                {/* Hero Buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => setActiveTab('simulator')}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition flex items-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4" /> Run Delayed Gratification Simulator
                  </button>
                  <a 
                    href="https://t.me/tradingpsychologyresearchbot" target="_blank" rel="noreferrer"
                    className="px-8 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-widest rounded-xl transition flex items-center gap-2"
                  >
                    <SendIcon className="w-4 h-4 text-cyan-400" /> Chat with Admin on Telegram
                  </a>
                </div>
              </div>
            </section>

            {/* RESEARCH DISCOVERY SECTION (ውቡ የቦክስ ግሪድ ዲዛይን) */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <span>Interactive Research Sandbox (Cards Grid)</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-1">Choose any research card below to read the deep analysis, interact with dynamic capital projection nodes, and leave reviews.</p>
                </div>

                <div className="w-full sm:w-72 relative">
                  <input
                    type="text" placeholder={lang === 'am' ? 'የጥናት ርዕስ ይፈልጉ...' : 'Query scientific nodes...'}
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-3 pr-8 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                  <Compass className="w-4 h-4 text-slate-600 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center font-mono text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                  <span>Synchronizing scientific data...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredPapers.map((paper) => {
                    const isExpanded = expandedPaper === paper.id;
                    const paperComments = comments.filter(c => c.paperId === paper.id);
                    return (
                      <motion.div key={paper.id} layout className={`bg-slate-900/40 border transition-all rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between ${isExpanded ? 'border-emerald-500/30 ring-1 ring-emerald-500/10 shadow-2xl' : 'border-slate-800/80 hover:border-slate-700'}`}>
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase font-bold tracking-widest">Psychology Audit</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono"><MessageSquare className="w-3 h-3" /> {paperComments.length} Comments</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-100 mb-3 font-sans leading-tight">{paper.title}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed text-justify mb-6">{paper.abstract}</p>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-slate-800 pt-5 space-y-6">
                                <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-900">{paper.content}</div>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 border-b border-slate-950 pb-1"><span>Community Peer Discourse</span> <span>Queue ({paperComments.length})</span></div>
                                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                                    {paperComments.map(c => (
                                      <div key={c.id} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900/60 text-xs">
                                        <div className="flex justify-between font-mono text-[9px] mb-1"><span className="text-emerald-400 font-bold">{c.author}</span> <span className="text-slate-600">{maskEmail(c.email)}</span></div>
                                        <p className="text-slate-300 font-sans">{c.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                  {activeUser ? (
                                    <form onSubmit={(e) => handleAddComment(paper.id, e)} className="flex gap-2 pt-2">
                                      <input type="text" placeholder="Broadcast analytical feedback..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none" />
                                      <button type="submit" className="px-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition"><Send className="w-3.5 h-3.5" /></button>
                                    </form>
                                  ) : <p className="text-[10px] text-amber-500 italic text-center py-2 bg-amber-500/5 rounded-lg border border-amber-500/10">* Authenticate to participate in discourse.</p>}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/60">
                           <div className="text-[10px] font-mono text-slate-500">Authors: <span className="text-slate-300">{paper.authors}</span></div>
                           <div className="flex items-center gap-3">
                              <button onClick={(e) => handleLike(paper.id, e)} className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 transition hover:bg-slate-900 cursor-pointer"><ThumbsUp className="w-3 h-3" /> {paper.likes}</button>
                              <button onClick={() => setExpandedPaper(isExpanded ? null : paper.id)} className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg transition hover:bg-emerald-500 hover:text-slate-950 cursor-pointer">{isExpanded ? <X className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}</button>
                           </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: SIMULATOR */}
        {activeTab === 'simulator' && (
           <div className="max-w-4xl mx-auto py-12 px-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
                 <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><Sliders className="text-emerald-400 w-6 h-6" /> Monte Carlo Projector</h2>
                 <p className="text-sm text-slate-400 mb-8 font-mono tracking-tight uppercase">Risk Architecture Simulation v2.0</p>
                 {/* ... Simulator UI (Already linked to startCapital, winRate, etc) ... */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="space-y-1"><label className="block text-[10px] font-mono text-slate-500 uppercase">Capital ($)</label><input type="number" value={startCapital} onChange={e=>setStartCapital(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-bold" /></div>
                    <div className="space-y-1"><label className="block text-[10px] font-mono text-slate-500 uppercase">WinRate (%)</label><input type="number" value={winRate} onChange={e=>setWinRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-bold" /></div>
                    <div className="space-y-1"><label className="block text-[10px] font-mono text-slate-500 uppercase">R:R Ratio</label><input type="number" step="0.1" value={riskReward} onChange={e=>setRiskReward(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-bold" /></div>
                    <div className="flex items-end"><button onClick={runSimulatorTrajectory} disabled={isSimulating} className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl uppercase tracking-widest text-xs cursor-pointer active:scale-95 transition">Compute</button></div>
                 </div>
                 <div className="h-72 w-full bg-slate-950/50 rounded-2xl border border-slate-800 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={simulationData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="trade" stroke="#475569" fontSize={10} />
                          <YAxis stroke="#475569" fontSize={10} />
                          <ChartTooltip contentStyle={{ backgroundColor: '#020813', border: 'none', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="disciplined" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        )}

        {/* TAB 3: SUBMIT PROPOSAL */}
        {activeTab === 'submit_proposal' && (
          <div className="max-w-2xl mx-auto py-12 px-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2"><PlusCircle className="text-emerald-400 w-5 h-5" /> Submit Scientific Proposal</h2>
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <input type="text" placeholder="Full Name *" value={propName} onChange={e=>setPropName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs" />
                <input type="text" placeholder="Contact Method *" value={propContact} onChange={e=>setPropContact(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs" />
                <input type="text" placeholder="Research Title *" value={propTitle} onChange={e=>setPropTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold" />
                <textarea placeholder="Outline your abstract..." value={propAbstract} onChange={e=>setPropAbstract(e.target.value)} rows={6} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs resize-none" />
                <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl uppercase tracking-widest text-xs transition active:scale-98 cursor-pointer">Archive Proposal</button>
              </form>
              {proposalSuccess && <p className="mt-4 text-xs font-mono text-emerald-400 text-center">{proposalSuccess}</p>}
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
              <h2 className="text-lg font-black mb-6 flex items-center gap-2"><ShieldCheck className="text-indigo-400 w-5 h-5" /> Admin Secure Terminal</h2>
              {!privacyGateUnlocked ? (
                <form onSubmit={handleUnlockPrivacyGate} className="max-w-xs mx-auto text-center space-y-4">
                  <Lock className="w-8 h-8 text-slate-700 mx-auto" />
                  <input type="password" placeholder="PIN CODE" value={privacyPin} onChange={e=>setPrivacyPin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center tracking-widest" />
                  {privacyError && <p className="text-xs text-rose-400 font-bold">{privacyError}</p>}
                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl transition cursor-pointer">Access Console</button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-300">Active Papers Count: <strong>{papers.length}</strong></span>
                    <button onClick={()=>setPrivacyGateUnlocked(false)} className="text-[10px] text-rose-400 hover:underline">Lock Session</button>
                  </div>
                  <div className="space-y-2">
                    {papers.map(p=>(
                      <div key={p.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-900 text-xs">
                        <span className="font-bold truncate max-w-sm">{p.title}</span>
                        <button onClick={()=>handleDeletePaper(p.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
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
        <span className="text-emerald-500/50 mt-1 block">Rhythmic Data Node Live 2026</span>
      </footer>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 relative shadow-2xl">
              <button onClick={()=>setIsAuthModalOpen(false)} className="absolute top-6 right-6 text-slate-500"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-black mb-6">{authMode === 'login' ? 'Terminal Login' : 'Register Signature'}</h3>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && <input type="text" placeholder="Identification Name" value={authName} onChange={e=>setAuthName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs" />}
                <input type="email" placeholder="Network Email Node" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs" />
                <input type="password" placeholder="Terminal Key" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs" />
                {authError && <p className="text-xs text-rose-400 font-bold">{authError}</p>}
                <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition">Execute</button>
              </form>
              <button onClick={()=>setAuthMode(authMode==='login'?'signup':'login')} className="mt-6 text-xs text-slate-500 hover:text-emerald-400 transition w-full text-center">
                {authMode === 'login' ? "Don't have a profile? Signup" : "Already have an identity? Login"}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
