import { useState, useEffect, FormEvent } from 'react';
import { Brain, Sliders, FileText, User, Users, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from './translations';

// ንዑስ ኮምፖነንቶችን ማስገባት
import DelayedGratificationSimulator from './components/DelayedGratificationSimulator';
import ResearchDashboard from './components/ResearchDashboard';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [lang, setLang] = useState<'am' | 'en'>('am');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // --- CORE DATABASE STATES ---
  const [papers, setPapers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);

  // --- REFACTORING SIMULATOR LINKAGE ---
  const [startCapital, setStartCapital] = useState<number>(100);
  const [winRate, setWinRate] = useState<number>(50);
  const [riskReward, setRiskReward] = useState<number>(2.0);
  const [numTradesSimulated, setNumTradesSimulated] = useState<number>(100);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSummary, setSimSummary] = useState<any>(null);

  // --- INPUT STATES ---
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
    
    // Auto run an initial simulation trajectory
    runSimulatorTrajectory();
  }, []);

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

  // ACTIONS
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

  const handleLoadProposalToForm = (p: any) => {
    alert(`Loading: ${p.title} directly to system draft.`);
  };

  const maskEmail = (email: string) => {
    if (!maskEmailsInPublic) return email;
    if (!email || !email.includes('@')) return '******';
    const [part1, part2] = email.split('@');
    return part1.substring(0, 2) + '***@' + part2;
  };

  return (
    <div className="min-h-screen bg-[#020813] text-slate-100 flex flex-col relative antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      
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

          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <button onClick={() => setActiveTab('home')} className={`cursor-pointer transition ${activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].home}</button>
            <button onClick={() => setActiveTab('simulator')} className={`cursor-pointer transition ${activeTab === 'simulator' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].simulator}</button>
            <button onClick={() => setActiveTab('admin')} className={`cursor-pointer transition ${activeTab === 'admin' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].adminPanel}</button>
            
            <button onClick={() => setLang(l => l === 'am' ? 'en' : 'am')} className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition cursor-pointer">
              <Globe className="w-3.5 h-3.5" /> {lang === 'am' ? 'EN' : 'አማ'}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 py-10">
        {activeTab === 'home' && (
          <ResearchDashboard
            papers={papers} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            expandedPaper={expandedPaper} setExpandedPaper={setExpandedPaper} handleLike={handleLike}
            activeUser={{ name: 'Admin Tester', email: 'admin@sandbox.com' }} comments={comments}
            newCommentText={newCommentText} setNewCommentText={setNewCommentText}
            handleAddComment={handleAddComment} maskEmail={maskEmail} lang={lang} translations={translations}
            propName={propName} setPropName={setPropName} propContact={propContact} setPropContact={setPropContact}
            propTitle={propTitle} setPropTitle={setPropTitle} propAbstract={propAbstract} setPropAbstract={setPropAbstract}
            handleSubmitProposal={handleSubmitProposal} proposalSuccess={proposalSuccess}
          />
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

      <footer className="border-t border-slate-950 bg-slate-950 p-6 text-center text-xs font-mono text-slate-500">
        © 2026 የትሬዲንግ ስነ-ልቦና ምርምር መድረክ (Trading Psychology Sandbox).
      </footer>
    </div>
  );
}
