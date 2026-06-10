import { useState, useEffect, FormEvent, MouseEvent } from 'react';
import {
  Brain,
  RefreshCw,
  MessageSquare,
  Compass,
  Send,
  Sliders,
  SendIcon,
  PlusCircle,
  FileText,
  TrendingUp,
  MessageCircle,
  Trash2,
  Lock,
  X,
  ShieldCheck,
  Percent,
  DollarSign
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

// Interfaces
interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  likes: number;
  likedBy: string[];
  content: string;
  chartData?: any[];
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

// Hardcoded default research papers to guarantee they are displayed if the database is empty
const defaultPapers: ResearchPaper[] = [
  {
    id: "paper-1",
    title: "የዲሌይ ግራቲፊኬሽን (Delayed Gratification) ጥቅምና በትሬዲንግ ስነ-ልቦና ላይ ያለው ተፅዕኖ",
    abstract: "ይህ ጥናት በትሬዲንግ ውስጥ ፈጣን ስኬትን ከመፈለግ ይልቅ ጊዜ ሰጥቶ፣ ህግን አክብሮና ትርፍን ሳያወጡ መልሶ በመዋዕለ ንዋይ ላይ በመጨመር (Compounding) የሚመጣውን የረጅም ጊዜ ስኬት በሳይንሳዊ መንገድ ይተነትናል።",
    authors: "Trading Psychology Research Team",
    likes: 42,
    likedBy: [],
    content: "በትሬዲንግ አለም ውስጥ ትልቁ ፈተና ስትራቴጂ አለማወቅ ሳይሆን ስሜትን መቆጣጠር አለመቻል ነው። ፈጣን ሃብታም ለመሆን መፈለግ (Instant Gratification) የብዙዎችን አካውንት ያጠፋል። ይህ ጥናት እንደሚያሳየው በየቀኑ ወይም በየወሩ ጥቂት ፐርሰንት እድገት ላይ ትኩረት አድርጎ በዲሲፕሊን የሚሰራ ትሬደር በረጅም ጊዜ ውስጥ እጅግ አስደናቂ ውጤት ያስመዘግባል።",
    chartData: [
      { name: "Week 1", value: 100 },
      { name: "Week 2", value: 115 },
      { name: "Week 3", value: 132 },
      { name: "Week 4", value: 152 },
      { name: "Week 5", value: 175 },
      { name: "Week 6", value: 201 }
    ]
  },
  {
    id: "paper-2",
    title: "በትናንሽ አካውንቶች ላይ የሚፈጠር ከመጠን ያለፈ ስጋት (Overleveraging) እና መዘዙ",
    abstract: "አነስተኛ የንግድ አካውንት ያላቸው ትሬደሮች አካውንታቸውን በፍጥነት ለማሳደግ ሲሉ ከፍተኛ ሎት ሳይዝ (Lot Size) በመጠቀም የሚያጋጥማቸውን የስነ-ልቦና ጫና እና የአካውንት መጥፋት አደጋ የዳሰሰ ጥናት።",
    authors: "Risk Management Dept",
    likes: 38,
    likedBy: [],
    content: "ትናንሽ አካውንቶችን ($50-$100) በፍጥነት ለማሳደግ መሞከር የትሬዲንግ ህግጋትን እንድንጥስ ያደርገናል። በአንድ ትሬድ ላይ ከ 2% በላይ ሪስክ ማድረግ ስሜታዊነትን ይጨምራል፤ ይህም ወደ ተከታታይ ኪሳራ ይመራል። መፍትሄው መጠኑ ምንም ያህል አነስተኛ ቢሆን የ 1:2 Risk to Reward ህግን ጠብቆ መጓዝ ብቻ ነው።",
    chartData: [
      { name: "Trade 1", value: 100 },
      { name: "Trade 2", value: 70 },
      { name: "Trade 3", value: 40 },
      { name: "Trade 4", value: 85 },
      { name: "Trade 5", value: 30 },
      { name: "Trade 6", value: 0 }
    ]
  },
  {
    id: "paper-3",
    title: "የኮምፓውንድ ኢፌክት (The Compound Effect) በትሬዲንግ ካፒታል እድገት ላይ",
    abstract: "የሂሳብ ስሌቶችን መሠረት በማድረግ፣ አነስተኛ ካፒታሎችን በቅንጅት እና በረጅም ጊዜ ጽናት ወደ ትልቅ ሃብት የመቀየር ጥበብ እና የስነ-ባህሪ ሳይንስ ትንተና።",
    authors: "Quantitative Analysis Unit",
    likes: 51,
    likedBy: [],
    content: "አልበርት አንስታይን ኮምፓውንድ ኢንተረስትን 'የአለማችን ስምንተኛው ድንቅ ነገር' ብሎታል። በትሬዲንግም እንዲሁ በየቀኑ የምናገኛትን ትናንሽ ትርፎች ሳናወጣ ካፒታሉ ላይ ስንጨምረው፣ ከጥቂት ወራት በኋላ የካፒታሉ እድገት በከፍተኛ ደረጃ ፍጥነት ይጨምራል (Exponential Growth)። ይህንን ለማሳካት ግን ከፍተኛ ትዕግስት ይጠይቃል።",
    chartData: [
      { name: "Month 1", value: 100 },
      { name: "Month 2", value: 120 },
      { name: "Month 3", value: 144 },
      { name: "Month 4", value: 172 },
      { name: "Month 5", value: 207 },
      { name: "Month 6", value: 248 }
    ]
  }
];

export default function App() {
  const [lang, setLang] = useState<'am' | 'en'>('am');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // --- CORE DATABASE STATES ---
  const [papers, setPapers] = useState<ResearchPaper[]>(defaultPapers);
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

  // --- ADVANCED SIMULATOR STATES ---
  const [startCapital, setStartCapital] = useState<number>(100);
  const [winRate, setWinRate] = useState<number>(55);
  const [riskReward, setRiskReward] = useState<number>(2.0);
  const [numTradesSimulated, setNumTradesSimulated] = useState<number>(50);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // --- COMPOUND CALCULATOR STATES ---
  const [compInitial, setCompInitial] = useState<number>(100);
  const [compGrowth, setCompGrowth] = useState<number>(10);
  const [compCount, setCompCount] = useState<number>(12);
  const [compPeriods, setCompPeriods] = useState<boolean>(true); // true = Months, false = Days
  const [compResults, setCompResults] = useState<any[]>([]);

  // --- FLOATING ASK ADMIN WIDGET ---
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState<boolean>(false);
  const [askName, setAskName] = useState<string>('');
  const [askContact, setAskContact] = useState<string>('');
  const [askQuestion, setAskQuestion] = useState<string>('');
  const [askSuccess, setAskSuccess] = useState<string | null>(null);

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

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');

  // 📡 FETCH REPOSITORIES FROM BACKEND WITH HARDCODED FALLBACK MANAGEMENT
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes, prRes, qRes] = await Promise.all([
          fetch('/api/papers'),
          fetch('/api/comments'),
          fetch('/api/proposals'),
          fetch('/api/admin/questions')
        ]);

        if (pRes.ok) {
          const fetchedPapers = await pRes.json();
          if (fetchedPapers && fetchedPapers.length > 0) {
            setPapers(fetchedPapers);
          }
        }
        if (cRes.ok) setComments(await cRes.json() || []);
        if (prRes.ok) setProposals(await prRes.json() || []);
        if (qRes.ok) setAdminQuestions(await qRes.json() || []);
      } catch (err) {
        console.error("Data synchronization pipeline error, using secure defaults:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const storedUser = localStorage.getItem('trader_session');
    if (storedUser) {
      try { setActiveUser(JSON.parse(storedUser)); } catch (e) { localStorage.removeItem('trader_session'); }
    }
    runAdvancedSimulator();
    calculatePureCompounding();
  }, []);

  // 🧮 MONTE CARLO TRAJECTORY
  const runAdvancedSimulator = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const trajectory = [];
      let disciplinedBalance = startCapital;
      let emotionalBalance = startCapital;

      trajectory.push({ trade: 0, disciplined: Math.round(disciplinedBalance), emotional: Math.round(emotionalBalance) });

      for (let i = 1; i <= numTradesSimulated; i++) {
        const discWin = Math.random() * 100 < winRate;
        const discRiskAmount = disciplinedBalance * 0.02;
        disciplinedBalance += discWin ? (discRiskAmount * riskReward) : -discRiskAmount;
        if (disciplinedBalance < 0) disciplinedBalance = 0;

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
    }, 200);
  };

  // 📈 PURE COMPOUND CALCULATOR MATHEMATICS
  const calculatePureCompounding = () => {
    const list = [];
    let current = compInitial;
    for (let i = 1; i <= compCount; i++) {
      const interest = current * (compGrowth / 100);
      current += interest;
      list.push({ period: i, balance: Math.round(current * 100) / 100, growth: Math.round(interest * 100) / 100 });
    }
    setCompResults(list);
  };

  useEffect(() => {
    calculatePureCompounding();
  }, [compInitial, compGrowth, compCount]);

  // 📝 HANDLERS
  const handleLike = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setPapers(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleAddComment = async (paperId: string, e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      paperId,
      author: activeUser?.name || 'Anonymous Peer',
      email: activeUser?.email || 'hidden@node.local',
      text: newCommentText.trim()
    };

    setComments(prev => [newComment, ...prev]);
    setNewCommentText('');

    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      });
    } catch (err) { console.error(err); }
  };

  const handleSubmitProposal = async (e: FormEvent) => {
    e.preventDefault();
    const newProp = {
      id: `prop-${Date.now()}`,
      name: propName,
      contact: propContact,
      title: propTitle,
      abstract: propAbstract,
      timestamp: new Date().toLocaleDateString()
    };

    setProposals(prev => [newProp, ...prev]);
    setPropName(''); setPropContact(''); setPropTitle(''); setPropAbstract('');
    setProposalSuccess('የጥናት ማመልከቻዎ በተሳካ ሁኔታ ተልኳል!');
    setTimeout(() => setProposalSuccess(null), 4000);

    try {
      await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp)
      });
    } catch (err) { console.error(err); }
  };

  const handleAskAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newQuestion = {
      id: `q-${Date.now()}`,
      senderName: askName,
      senderContact: askContact,
      questionText: askQuestion,
      timestamp: new Date().toLocaleDateString()
    };

    setAdminQuestions(prev => [newQuestion, ...prev]);
    setAskName(''); setAskContact(''); setAskQuestion('');
    setAskSuccess('ጥያቄዎ ለአድሚን ደርሷል!');
    setTimeout(() => setAskSuccess(null), 4500);

    try {
      await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
    } catch (err) { console.error(err); }
  };

  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    const fakeUser = { name: authName || 'Trader Pro', email: authEmail, telegram: authTelegram };
    setActiveUser(fakeUser);
    localStorage.setItem('trader_session', JSON.stringify(fakeUser));
    setIsAuthModalOpen(false);
  };

  const handleDeletePaper = (id: string) => {
    setPapers(prev => prev.filter(p => p.id !== id));
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
      
      {/* NAVIGATION HEADER */}
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
            <button onClick={() => setActiveTab('simulator')} className={`cursor-pointer transition ${activeTab === 'simulator' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].simulatorTitle || 'Simulator'}</button>
            <button onClick={() => setActiveTab('submit_proposal')} className={`cursor-pointer transition ${activeTab === 'submit_proposal' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{lang === 'am' ? 'የጥናት ማመልከቻ' : 'Submit Proposal'}</button>
            <button onClick={() => setActiveTab('admin')} className={`cursor-pointer transition ${activeTab === 'admin' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].adminPanel}</button>
            <button onClick={() => setLang(l => l === 'am' ? 'en' : 'am')} className="text-slate-400 hover:text-emerald-400 text-[11px] border border-slate-800 rounded-lg px-2 py-0.5 cursor-pointer">{lang === 'am' ? 'English' : 'አማርኛ'}</button>
            {activeUser ? (
              <button onClick={() => setIsProfileModalOpen(true)} className="text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/10 cursor-pointer">👤 {activeUser.name}</button>
            ) : (
              <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl cursor-pointer">{translations[lang].loginBtn}</button>
            )}
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-400"><Compass className="w-6 h-6" /></button>
        </div>
      </header>

      {/* MOBILE NAV LINKS */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden bg-slate-950/95 fixed top-[69px] left-0 right-0 z-40 p-4 space-y-2 text-sm border-b border-slate-900 font-mono">
            <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300">Home Library</button>
            <button onClick={() => { setActiveTab('simulator'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300">Compound Simulator</button>
            <button onClick={() => { setActiveTab('submit_proposal'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300">Submit Proposal</button>
            <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-slate-300">Admin Console</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BODY DISPATCH */}
      <main className="flex-1 z-10 relative">
        
        {/* TAB 1: HOME RESEARCH ARCHIVE */}
        {activeTab === 'home' && (
          <div className="space-y-0">
            {/* HERO HERO HERO */}
            <section className="relative py-16 px-6 border-b border-slate-900 bg-slate-950">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-5">
                  90% of Trading Success <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    lies in your psychology!!
                  </span>
                </motion.h2>
                <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed mb-8">
                  "The pressure to grow small accounts fast, lack of disciplined risk rules, and instant gratification are the standard graveyards of retail traders. True success lies in compounding with low risk."
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-emerald-400 text-lg font-black block">2% RISK</span>
                    <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Strict Discipline (Survival Key)</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-cyan-400 text-lg font-black block">COMPOUNDING</span>
                    <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Capital Acceleration Matrix</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-amber-400 text-lg font-black block">DELAYED GRT.</span>
                    <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Patience Brings Great Rewards</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={() => setActiveTab('simulator')} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase font-mono rounded-xl transition flex items-center gap-2 cursor-pointer">
                    <TrendingUp className="w-4 h-4" /> Run Compound Simulator Tools
                  </button>
                </div>
              </div>
            </section>

            {/* DYNAMIC CARD RENDERING PIPELINES */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-md font-black flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>የስነ-ልቦና ጥናቶችና የምርምር ካርዶች (Research Repository)</span>
                  </h2>
                </div>
                <div className="w-full sm:w-64 relative">
                  <input
                    type="text" placeholder="የጥናት ርዕስ ይፈልጉ..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-3 pr-8 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPapers.map((paper) => {
                  const isExpanded = expandedPaper === paper.id;
                  const paperComments = comments.filter(c => c.paperId === paper.id);

                  return (
                    <motion.div key={paper.id} layout className={`bg-slate-900/40 border rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between transition-all ${isExpanded ? 'border-emerald-500/40 shadow-xl' : 'border-slate-800/80 hover:border-slate-700'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 font-black uppercase">Verified Node</span>
                          <span className="text-[10px] text-slate-500 font-mono">💬 {paperComments.length} Responses</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-100 mb-2">{paper.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4 text-justify">{paper.abstract}</p>

                        {/* MINI CHART DISPLAY */}
                        {paper.chartData && (
                          <div className="h-28 w-full bg-slate-950/70 border border-slate-900 rounded-xl p-2 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={paper.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <defs>
                                  <linearGradient id={`g-${paper.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.12}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 2" stroke="#0f172a" />
                                <XAxis dataKey="name" stroke="#475569" fontSize={8} />
                                <YAxis stroke="#475569" fontSize={8} />
                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={1} fill={`url(#g-${paper.id})`} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-slate-800/80 pt-3 mt-3 space-y-3">
                              <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 text-justify font-sans">{paper.content}</div>
                              
                              {/* COMMENTS ARCHIVE */}
                              <div className="space-y-2">
                                <span className="block text-[10px] font-mono text-slate-500 uppercase">Discussion Logs ({paperComments.length})</span>
                                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 text-[11px]">
                                  {paperComments.length === 0 ? (
                                    <p className="text-slate-600 font-mono italic text-[10px]">No community entries yet.</p>
                                  ) : (
                                    paperComments.map(c => (
                                      <div key={c.id} className="bg-slate-950/60 border border-slate-900 p-2 rounded-xl">
                                        <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                          <span className="text-emerald-400 font-bold">{c.author}</span>
                                          <span>{maskEmail(c.email)}</span>
                                        </div>
                                        <p className="text-slate-300 mt-0.5">{c.text}</p>
                                      </div>
                                    ))
                                  )}
                                </div>

                                <form onSubmit={(e) => handleAddComment(paper.id, e)} className="flex gap-2 pt-1">
                                  <input type="text" placeholder="አስተያየትዎን እዚህ ይጻፉ..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none" />
                                  <button type="submit" className="px-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"><Send className="w-3 h-3" /></button>
                                </form>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60">
                        <span className="text-[10px] font-mono text-slate-500">By: {paper.authors}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => handleLike(paper.id, e)} className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 hover:bg-slate-900 cursor-pointer">👍 {paper.likes}</button>
                          <button onClick={() => setExpandedPaper(isExpanded ? null : paper.id)} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer">{isExpanded ? 'Hide ↑' : 'Read Full ↓'}</button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: ADVANCED SIMULATOR & COMPOUNDING COMBINED SUITE */}
        {activeTab === 'simulator' && (
          <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
            
            {/* PANEL A: RISK TO REWARD ENGINE */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h2 className="text-md font-black flex items-center gap-2"><Sliders className="text-emerald-400 w-4 h-4" /> 1. የትሬዲንግ ስጋት ማስያ (Monte Carlo Trajectory)</h2>
                <p className="text-xs text-slate-400 mt-0.5">ዲሲፕሊን ያለው አካውንት እድገት (2% Risk) እና ስሜታዊ አካውንት (15% Overleveraged Risk) ያለውን ልዩነት በግራፍ ያነጻጽሩ።</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Start Capital ($)</label>
                  <input type="number" value={startCapital} onChange={e=>setStartCapital(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Win Rate (%)</label>
                  <input type="number" value={winRate} onChange={e=>setWinRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Risk Reward</label>
                  <input type="number" step="0.1" value={riskReward} onChange={e=>setRiskReward(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Trades Count</label>
                  <input type="number" value={numTradesSimulated} onChange={e=>setNumTradesSimulated(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2" />
                </div>
              </div>

              <button onClick={runAdvancedSimulator} disabled={isSimulating} className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black text-xs uppercase rounded-xl transition cursor-pointer mb-5">
                {isSimulating ? 'Processing Models...' : 'Compute Trajectory Engine'}
              </button>

              <div className="h-64 w-full bg-slate-950/60 rounded-xl border border-slate-800 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#131a26" />
                    <XAxis dataKey="trade" stroke="#475569" fontSize={9} />
                    <YAxis stroke="#475569" fontSize={9} />
                    <ChartTooltip contentStyle={{ backgroundColor: '#020813', borderColor: '#1e293b', fontSize: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Line type="monotone" dataKey="disciplined" name="Disciplined Path (2% Risk)" stroke="#10b981" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="emotional" name="Emotional Path (15% Risk)" stroke="#f43f5e" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PANEL B: SPECIFIC COMPOUND ACCELERATOR SUITE */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h2 className="text-md font-black flex items-center gap-2"><TrendingUp className="text-cyan-400 w-4 h-4" /> 2. ንጹህ የካፒታል ማባዣ ፎርሙላ (Capital Compounding Growth Calculator)</h2>
                <p className="text-xs text-slate-400 mt-0.5">የምታገኟትን እያንዳንዷን ትናንሽ ትርፍ መልሳችሁ አካውንቱ ላይ ስትጨምሩት (Compounding Effect) የሚመጣውን ለውጥ እዚህ ያሰሉ::</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3 text-cyan-400" /> Initial Balance ($)</label>
                  <input type="number" value={compInitial} onChange={e=>setCompInitial(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-bold focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1 flex items-center gap-1"><Percent className="w-3 h-3 text-cyan-400" /> Growth Rate per Cycle (%)</label>
                  <input type="number" value={compGrowth} onChange={e=>setCompGrowth(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-bold focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Interval Type</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                    <button onClick={()=>setCompPeriods(true)} className={`py-1 text-[10px] font-bold rounded-lg ${compPeriods ? 'bg-cyan-500 text-slate-950':'text-slate-400'}`}>Months</button>
                    <button onClick={()=>setCompPeriods(false)} className={`py-1 text-[10px] font-bold rounded-lg ${!compPeriods ? 'bg-cyan-500 text-slate-950':'text-slate-400'}`}>Days</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Number of Cycles</label>
                  <input type="number" value={compCount} onChange={e=>setCompCount(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-bold focus:outline-none focus:border-cyan-500" />
                </div>
              </div>

              {/* TABLE RENDER DISPATCH */}
              <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
                <div className="grid grid-cols-3 bg-slate-900 px-4 py-2 text-slate-400 text-[9px] uppercase font-black border-b border-slate-800">
                  <span>Cycle ({compPeriods ? 'Month':'Day'})</span>
                  <span>Profit Compounded</span>
                  <span className="text-right">Account Balance</span>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-900/40">
                  {compResults.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-3 px-4 py-1.5 hover:bg-slate-900/30 text-slate-300">
                      <span className="text-slate-500"># {row.period}</span>
                      <span className="text-emerald-400 font-bold">+${row.growth}</span>
                      <span className="text-right text-cyan-400 font-bold">${row.balance}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900/50 p-2.5 text-center border-t border-slate-800 text-[11px]">
                  ጠቅላላ የመጨረሻ የካፒታል ዋጋ: <strong className="text-cyan-400 font-black">${compResults[compResults.length - 1]?.balance || compInitial}</strong>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PROPOSAL FORM */}
        {activeTab === 'submit_proposal' && (
          <div className="max-w-xl mx-auto py-10 px-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-md font-black flex items-center gap-2 border-b border-slate-800 pb-2 mb-4"><PlusCircle className="text-emerald-400 w-4 h-4" /> አዲስ የትሬዲንግ ጥናት ማቅረቢያ ፎርም</h2>
              <form onSubmit={handleSubmitProposal} className="space-y-3 text-xs font-sans">
                <input type="text" placeholder="ሙሉ ስም *" value={propName} onChange={e=>setPropName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none" />
                <input type="text" placeholder="የመገናኛ አድራሻ (ቴሌግራም/ኢሜይል) *" value={propContact} onChange={e=>setPropContact(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none" />
                <input type="text" placeholder="የጥናቱ ርዕስ *" value={propTitle} onChange={e=>setPropTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-bold focus:outline-none" />
                <textarea placeholder="የጥናቱ ማጠቃለያ ዝርዝር..." value={propAbstract} onChange={e=>setPropAbstract(e.target.value)} rows={5} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none resize-none leading-relaxed" />
                <button type="submit" className="w-full py-2.5 bg-emerald-500 text-slate-950 font-mono font-black text-xs uppercase rounded-xl cursor-pointer">Submit to Archive</button>
              </form>
              {proposalSuccess && <p className="mt-3 text-xs font-mono text-emerald-400 bg-emerald-500/5 p-2 rounded-xl text-center border border-emerald-500/10">{proposalSuccess}</p>}
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN CONTROLS PANEL */}
        {activeTab === 'admin' && (
          <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-xs font-black uppercase font-mono tracking-wider text-indigo-400 mb-4 flex items-center gap-2 border-b border-slate-950 pb-2">
                <ShieldCheck className="w-4 h-4" /> Admin Terminal Gate
              </h2>

              {!privacyGateUnlocked ? (
                <form onSubmit={(e) => { e.preventDefault(); if (privacyPin === 'privacy99') { setPrivacyGateUnlocked(true); setPrivacyError(null); } else { setPrivacyError('የተሳሳተ PIN ነው።'); } }} className="max-w-xs mx-auto text-center py-4 space-y-3">
                  <input type="password" placeholder="ENTER ACCESS PIN (privacy99)" value={privacyPin} onChange={e=>setPrivacyPin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-center text-xs font-mono tracking-widest text-slate-100" />
                  {privacyError && <p className="text-xs text-rose-400 font-bold">{privacyError}</p>}
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-mono text-xs uppercase font-black rounded-xl cursor-pointer">Verify Credentials</button>
                </form>
              ) : (
                <div className="space-y-6 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex justify-between items-center">
                    <span className="text-slate-400">Public Security Email Masking</span>
                    <input type="checkbox" checked={maskEmailsInPublic} onChange={e=>setMaskEmailsInPublic(e.target.checked)} className="w-3.5 h-3.5" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[10px] uppercase font-black text-slate-400">📥 Trader Inbound Questions Widget Log ({adminQuestions.length})</h3>
                    <div className="space-y-1.5">
                      {adminQuestions.length === 0 ? <p className="text-slate-600 italic text-[11px]">No widget logs found.</p> :
                        adminQuestions.map(q => (
                          <div key={q.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
                            <div className="text-slate-500 text-[10px]">User: <span className="text-slate-300 font-bold">{q.senderName}</span> ({q.senderContact})</div>
                            <p className="text-slate-200 font-sans text-xs mt-1">{q.questionText}</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[10px] uppercase font-black text-slate-400">📁 Active Papers Management</h3>
                    <div className="space-y-1.5">
                      {papers.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2 bg-slate-950 rounded-xl border border-slate-900">
                          <span className="truncate max-w-md font-bold">{p.title}</span>
                          <button onClick={()=>handleDeletePaper(p.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
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
      <footer className="border-t border-slate-900 bg-slate-950 p-6 text-center text-[10px] font-mono text-slate-600 z-10">
        © 2026 የትሬዲንግ ስነ-ልቦና ምርምር መድረክ (Trading Psychology Sandbox).
      </footer>

      {/* FLOATING CHAT WIDGET SYSTEM FOR ASK ADMIN (AS REQUESTED) */}
      <div className="fixed bottom-6 right-6 z-[999] font-sans">
        <AnimatePresence>
          {isChatWidgetOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 15 }} className="absolute bottom-16 right-0 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider font-mono">Ask Admin Portal</h3>
                  <p className="text-[10px] text-slate-500">አድሚኑን በቀጥታ እዚህ መጠየቅ ይችላሉ።</p>
                </div>
                <button onClick={()=>setIsChatWidgetOpen(false)} className="text-slate-400 hover:text-slate-200 text-sm cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleAskAdminSubmit} className="space-y-2">
                <input type="text" placeholder="የእርስዎ ስም *" value={askName} onChange={e=>setAskName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none" />
                <input type="text" placeholder="የመገናኛ ቴሌግራም/ኢሜይል *" value={askContact} onChange={e=>setAskContact(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none" />
                <textarea placeholder="የጥያቄዎ ዝርዝር..." value={askQuestion} onChange={e=>setAskQuestion(e.target.value)} rows={3} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none resize-none leading-relaxed" />
                <button type="submit" className="w-full py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-mono font-black uppercase rounded-xl transition cursor-pointer">Send to Admin Console</button>
              </form>
              {askSuccess && <p className="text-center font-mono text-[10px] text-emerald-400 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">{askSuccess}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button System */}
        <button onClick={() => setIsChatWidgetOpen(!isChatWidgetOpen)} className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer">
          {isChatWidgetOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        </button>
      </div>

      {/* USER PROFILE MODAL */}
      <AnimatePresence>
        {isProfileModalOpen && activeUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 relative">
              <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-slate-500">✕</button>
              <h3 className="text-xs font-black mb-3 font-mono text-slate-400 uppercase">👤 Active Terminal Session</h3>
              <div className="space-y-2 font-mono text-xs text-slate-300 mb-4">
                <div><span className="text-[10px] text-slate-500 block">Operator Signature</span><strong>{activeUser.name}</strong></div>
                <div><span className="text-[10px] text-slate-500 block">Routed Node</span><span>{activeUser.email}</span></div>
              </div>
              <button onClick={() => { setActiveUser(null); localStorage.removeItem('trader_session'); setIsProfileModalOpen(false); }} className="w-full py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase rounded-xl cursor-pointer">Disconnect</button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SIMPLE AUTHENTICATION WINDOW */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 relative">
              <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-500">✕</button>
              <h3 className="text-xs font-black mb-3 font-mono uppercase text-slate-400">Execute Authentication</h3>
              <form onSubmit={handleAuthSubmit} className="space-y-2.5 text-xs">
                <input type="text" placeholder="Full Name" value={authName} onChange={e=>setAuthName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none" />
                <input type="email" placeholder="Network Email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none" />
                <button type="submit" className="w-full py-2 bg-emerald-500 text-slate-950 font-black font-mono uppercase rounded-xl cursor-pointer">Authorize</button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
