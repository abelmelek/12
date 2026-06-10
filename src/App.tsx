import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { 
  Brain, Sliders, FileText, User, Users, Menu, X, Globe, LogOut, 
  Sparkles, Play, Square, RefreshCw, CheckSquare, Plus, Trash2, 
  ExternalLink, AudioLines, Mail, Lock, Phone, UploadCloud, PlusCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { translations } from './translations';

// ንዑስ ኮምፖነንቶችን ማስገባት
import ResearchDashboard from './components/ResearchDashboard';
import DelayedGratificationSimulator from './components/DelayedGratificationSimulator';
import AdminPanel from './components/AdminPanel';

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

  // --- CHECKLIST STATES ---
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
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

  // --- PROPOSAL FORM STATES (አሁን ለየብቻ ታብ ሆኗል) ---
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

  // DATABASE CONFIG PIPELINE
  useEffect(() => {
    fetch('/api/papers').then(res => res.json()).then(data => setPapers(data || []));
    fetch('/api/comments').then(res => res.json()).then(data => setComments(data || []));
    fetch('/api/proposals').then(res => res.json()).then(data => setProposals(data || []));
    
    const storedUser = localStorage.getItem('trader_session');
    if (storedUser) setActiveUser(JSON.parse(storedUser));

    runSimulatorTrajectory();
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    } else {
      clearInterval(timerIntervalRef.current);
      setRecordingDuration(0);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording]);

  // MONTE CARLO TRAJECTORY
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
    }, 400);
  };

  // AUDIO RECORDING FUNCTIONS
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioURL(URL.createObjectURL(audioBlob));
        setUploadedAudioFile(new File([audioBlob], "recorded_audio.wav", { type: "audio/wav" }));
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) { console.error("Mic access denied", err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const executeVoiceAnalysis = async () => {
    if (!uploadedAudioFile) return;
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('audio', uploadedAudioFile);
    try {
      const res = await fetch('/api/voice/analyze', { method: 'POST', body: formData });
      if (res.ok) {
        const out = await res.json();
        setAiAnalysisResult(out.analysis);
      }
    } catch (err) { console.error(err); }
    setIsAnalyzing(false);
  };

  // ACTIONS
  const handleLike = async (id: string, e: any) => {
    e.stopPropagation();
    const res = await fetch(`/api/papers/${id}/like`, { method: 'POST' });
    if (res.ok) setPapers(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleAddComment = async (paperId: string, e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const payload = { paperId, author: activeUser?.name || 'Anonymous', email: activeUser?.email || '', text: newCommentText };
    const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      const saved = await res.json();
      setComments(prev => [saved, ...prev]);
      setNewCommentText('');
    }
  };

  const handleSubmitProposal = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { name: propName, contact: propContact, title: propTitle, abstract: propAbstract };
    const res = await fetch('/api/proposals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      const saved = await res.json();
      setProposals(prev => [saved, ...prev]);
      setPropName(''); setPropContact(''); setPropTitle(''); setPropAbstract('');
      setProposalSuccess(lang === 'am' ? 'የጥናት ማመልከቻዎ በተሳካ ሁኔታ ለዳታቤዝ ተልኳል!' : 'Proposal archived successfully!');
    }
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const payload = authMode === 'login' ? { email: authEmail, password: authPassword } : { name: authName, email: authEmail, password: authPassword, telegram: authTelegram };
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) {
      setActiveUser(data.user);
      localStorage.setItem('trader_session', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
    } else {
      setAuthError(data.error || 'Authentication error.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020813] text-slate-100 flex flex-col antialiased">
      
      {/* HEADER NAVIGATION */}
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
            <button onClick={() => setActiveTab('submit_proposal')} className={`cursor-pointer transition ${activeTab === 'submit_proposal' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{lang === 'am' ? 'የአዳዲስ ተማሪዎች ፖርታል' : 'Submit Proposal'}</button>
            <button onClick={() => setActiveTab('admin')} className={`cursor-pointer transition ${activeTab === 'admin' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>{translations[lang].adminPanel}</button>
            
            <button onClick={() => setLang(l => l === 'am' ? 'en' : 'am')} className="text-slate-400 hover:text-emerald-400 text-[11px] border border-slate-800 rounded-lg px-2 py-0.5">
              {lang === 'am' ? 'English' : 'አማርኛ'}
            </button>

            {activeUser ? (
              <button onClick={() => setIsProfileModalOpen(true)} className="text-emerald-400 text-xs font-bold border border-emerald-500/20 px-3 py-1.5 rounded-xl bg-slate-900">
                👤 {activeUser.name}
              </button>
            ) : (
              <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition cursor-pointer">
                {translations[lang].loginBtn}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CORE DISPLAY HUB */}
      <main className="flex-1 py-8 max-w-7xl mx-auto w-full px-4">
        
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* HERO SECTION ፡ AUDIO SANDBOX & RULES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* VOICE INTERFACE */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-1.5 mb-1"><AudioLines className="text-emerald-400 w-4 h-4" /> {translations[lang].voiceSandboxTitle}</h2>
                  <p className="text-xs text-slate-400 mb-4">{translations[lang].voiceSandboxDesc}</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {!isRecording ? (
                      <button onClick={startRecording} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-mono text-xs rounded-xl transition">Record</button>
                    ) : (
                      <button onClick={stopRecording} className="px-3 py-1.5 bg-rose-600 animate-pulse text-white font-bold font-mono text-xs rounded-xl transition">Stop ({recordingDuration}s)</button>
                    )}
                    <label className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs rounded-xl cursor-pointer">
                      Upload <input type="file" accept="audio/*" onChange={handleAudioFileChange} className="hidden" />
                    </label>
                    {audioURL && <audio src={audioURL} controls className="h-7 max-w-xs" />}
                  </div>
                </div>

                {uploadedAudioFile && (
                  <div className="mt-4 border-t border-slate-800/60 pt-3">
                    <button onClick={executeVoiceAnalysis} disabled={isAnalyzing} className="w-full py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-mono text-xs font-bold rounded-xl">
                      {isAnalyzing ? 'Analyzing Audio Rhythm...' : 'Run Neuro-Acoustic Analysis'}
                    </button>
                    {aiAnalysisResult && (
                      <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-900 text-xs text-slate-300 space-y-1 font-sans">
                        <p><strong>Emotion:</strong> {aiAnalysisResult.detectedEmotion} ({aiAnalysisResult.riskLevel} Risk)</p>
                        <p className="italic text-slate-400">"{aiAnalysisResult.feedback}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RULES DISCIPLINE CHECKLIST */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-1.5 mb-1"><CheckSquare className="text-emerald-400 w-4 h-4" /> Trading Rules Sandbox</h2>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {checklist.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-950 p-2 rounded-lg text-xs">
                        <span onClick={() => setChecklist(checklist.map(c => c.id === item.id ? {...c, completed: !c.completed} : c))} className={`cursor-pointer ${item.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{item.text}</span>
                        <button onClick={() => setChecklist(checklist.filter(c => c.id !== item.id))} className="text-slate-600 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if(!newChecklistItem)return; setChecklist([...checklist, {id: Date.now().toString(), text: newChecklistItem, completed: false}]); setNewChecklistItem(''); }} className="flex gap-2 mt-2">
                  <input type="text" placeholder="Add custom execution rule..." value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200" />
                  <button type="submit" className="p-1.5 bg-slate-950 border border-slate-800 text-emerald-400 rounded-lg">+</button>
                </form>
              </div>
            </div>

            {/* RESEARCH GRID CARDS (ጥናቶቹ በቦክስ ዲዛይን) */}
            <div>
              <h2 className="text-md font-bold mb-4 flex items-center gap-1.5">📊 {lang === 'am' ? 'የቅርብ ጊዜ ሳይንሳዊ ምርምሮች' : 'Latest Research Library'}</h2>
              <ResearchDashboard
                papers={papers} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                expandedPaper={expandedPaper} setExpandedPaper={setExpandedPaper} handleLike={handleLike}
                activeUser={activeUser} comments={comments} newCommentText={newCommentText} 
                setNewCommentText={setNewCommentText} handleAddComment={handleAddComment} 
                maskEmail={maskEmail} lang={lang} translations={translations}
              />
            </div>
          </div>
        )}

        {/* DELAYED GRATIFICATION SIMULATOR TAB */}
        {activeTab === 'simulator' && (
          <DelayedGratificationSimulator
            startCapital={startCapital} setStartCapital={setStartCapital} winRate={winRate} setWinRate={setWinRate}
            riskReward={riskReward} setRiskReward={setRiskReward} numTradesSimulated={numTradesSimulated} setNumTradesSimulated={setNumTradesSimulated}
            simulationData={simulationData} isSimulating={isSimulating} runSimulatorTrajectory={runSimulatorTrajectory} simSummary={simSummary}
            lang={lang} translations={translations}
          />
        )}

        {/* SUBMIT PROPOSAL PORTAL (ለብቻው ፔጅ የተደረገው) */}
        {activeTab === 'submit_proposal' && (
          <div className="max-w-2xl mx-auto bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-bold mb-2 border-b border-slate-800 pb-2">🧑‍🎓 {translations[lang].submitProposal}</h2>
            <p className="text-xs text-slate-400 mb-6">የእርስዎን የትሬዲንግ ስነ-ልቦና ወይንም የሂሳብ ማባዣ ስልት ጥናት እዚህ ያቅርቡ። አድሚን ገምግሞ ለህዝብ ግልጽ ያደርገዋል።</p>
            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">የአመልካች ሙሉ ስም *</label>
                  <input type="text" value={propName} onChange={(e) => setPropName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">የመገናኛ አድራሻ (ኢሜይል/ስልክ) *</label>
                  <input type="text" value={propContact} onChange={(e) => setPropContact(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">የጥናቱ ርዕስ *</label>
                <input type="text" value={propTitle} onChange={(e) => setPropTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">የጥናቱ አጭር ማጠቃለያ (Abstract Concept Outline) *</label>
                <textarea value={propAbstract} onChange={(e) => setPropAbstract(e.target.value)} rows={6} required className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition">
                {translations[lang].paperPublishBtn || 'Submit Proposal'}
              </button>
            </form>
            {proposalSuccess && <p className="mt-4 text-xs font-mono text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-center">{proposalSuccess}</p>}
          </div>
        )}

        {/* ADMIN PANEL HUB */}
        {activeTab === 'admin' && (
          <AdminPanel
            papers={papers} proposals={proposals} privacyGateUnlocked={privacyGateUnlocked} setPrivacyGateUnlocked={setPrivacyGateUnlocked}
            privacyPin={privacyPin} setPrivacyPin={setPrivacyPin} privacyError={privacyError} handleUnlockPrivacyGate={handleUnlockPrivacyGate}
            maskEmailsInPublic={maskEmailsInPublic} setMaskEmailsInPublic={setMaskEmailsInPublic} purgeTargetEmail={purgeTargetEmail}
            setPurgeTargetEmail={setPurgeTargetEmail} handlePurgeUserData={handlePurgeUserData} purgeResult={purgeResult}
            handleDeletePaper={handleDeletePaper} handleLoadProposalToForm={(p) => alert(`Drafting proposal: ${p.title}`)} lang={lang} translations={translations}
          />
        )}
      </main>

      {/* AUTHENTICATION DIALOG */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
              <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">✕</button>
              <h3 className="text-md font-bold mb-4">{authMode === 'login' ? 'Login to Sandbox' : 'Create Trader Profile'}</h3>
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === 'signup' && <input type="text" placeholder="Full Name" value={authName} onChange={(e) => setAuthName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200" />}
                <input type="email" placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200" />
                <input type="password" placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200" />
                {authError && <p className="text-xs text-rose-400">{authError}</p>}
                <button type="submit" className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">Continue</button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      <footer className="border-t border-slate-900 bg-slate-950 p-6 text-center text-xs font-mono text-slate-500 mt-12">
        © 2026 የትሬዲንግ ስነ-ልቦና ምርምር መድረክ (Trading Psychology Sandbox).
      </footer>
    </div>
  );
}
