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
  SendIcon,
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
  comments?: Comment[];
  image?: string;
}

interface Comment {
  id: string;
  paperId: string;
  author: string;
  email: string;
  text: string;
  timestamp: string;
}

interface Proposal {
  id: string;
  name: string;
  contact: string;
  title: string;
  abstract: string;
  timestamp: string;
}

interface UserSession {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

export default function App() {
  // Navigation & Page State
  const [activeTab, setActiveTab] = useState<'home' | 'simulator' | 'proposal' | 'auth' | 'admin'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);

  // Hidden Easter Egg click tracker for Admin Gate access
  const [logoClicks, setLogoClicks] = useState<number>(0);
  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 5) {
        setActiveTab('admin');
        const alertMsg = lang === 'en' 
          ? '🔑 Secret Admin passage unlocked!' 
          : '🔑 ሚስጥራዊው የአድሚን መግቢያ ተከፍቷል!';
        setAuthSuccess(alertMsg);
        setTimeout(() => setAuthSuccess(null), 4000);
        return 0;
      }
      return nextCount;
    });
  };

  // Language Support State
  const [lang, setLang] = useState<'am' | 'en'>(() => {
    const saved = localStorage.getItem('trading_language');
    return (saved === 'en' || saved === 'am') ? saved : 'am';
  });

  const t = translations[lang];

  // Helper to change language
  const toggleLanguage = (selectedLang: 'am' | 'en') => {
    setLang(selectedLang);
    localStorage.setItem('trading_language', selectedLang);
  };

  // Admin Editing State
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editAbstract, setEditAbstract] = useState<string>('');
  const [editAuthors, setEditAuthors] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('trading_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  // DB live reactive states
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  // Forms Input States
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Proposal Submission Form
  const [propName, setPropName] = useState<string>('');
  const [propContact, setPropContact] = useState<string>('');
  const [propTitle, setPropTitle] = useState<string>('');
  const [propAbstract, setPropAbstract] = useState<string>('');
  const [propStatus, setPropStatus] = useState<string | null>(null);
  const [propFileName, setPropFileName] = useState<string>('');
  const [propFileType, setPropFileType] = useState<string>('');
  const [propFileData, setPropFileData] = useState<string>('');
  const [isFileReading, setIsFileReading] = useState<boolean>(false);

  // Admin Panel creation paper
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [newPaperTitle, setNewPaperTitle] = useState<string>('');
  const [newPaperAbstract, setNewPaperAbstract] = useState<string>('');
  const [newPaperAuthors, setNewPaperAuthors] = useState<string>('');
  const [newPaperContent, setNewPaperContent] = useState<string>('');
  const [newPaperChartPreset, setNewPaperChartPreset] = useState<'grow' | 'stable' | 'drawdown' | 'none'>('grow');
  const [adminStatus, setAdminStatus] = useState<string | null>(null);

  // Separate states for multiple authors (can add 2 or 3 authors!)
  const [newPaperAuthor1, setNewPaperAuthor1] = useState<string>('');
  const [newPaperAuthor2, setNewPaperAuthor2] = useState<string>('');
  const [newPaperAuthor3, setNewPaperAuthor3] = useState<string>('');
  const [newPaperImage, setNewPaperImage] = useState<string>('');

  const [editAuthor1, setEditAuthor1] = useState<string>('');
  const [editAuthor2, setEditAuthor2] = useState<string>('');
  const [editAuthor3, setEditAuthor3] = useState<string>('');
  const [editPaperImage, setEditPaperImage] = useState<string>('');

  // Core Delayed Gratification Simulator State
  const [startCapital, setStartCapital] = useState<number>(500);
  const [winRate, setWinRate] = useState<number>(55); // 55% win rate
  const [riskReward, setRiskReward] = useState<number>(2.0); // 1:2 risk reward
  const [numTradesSimulated, setNumTradesSimulated] = useState<number>(100);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSummary, setSimSummary] = useState<{
    disciplinedFinal: number;
    impatientFinal: number;
    disciplinedPeak: number;
    impatientPeak: number;
    disciplinedDrawdown: number;
    impatientDrawdown: number;
  } | null>(null);

  // Interactive user dynamic custom slider data input on detailed papers
  const [paperSliderValue, setPaperSliderValue] = useState<number>(3); // 3% risk
  const [customPaperChart, setCustomPaperChart] = useState<any[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Comment input state
  const [commentText, setCommentText] = useState<string>('');
  const [commentLoading, setCommentLoading] = useState<boolean>(false);

  // Gemini chat workspace states
  const [chatbotActive, setChatbotActive] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model'; text: string; sources?: any[] }>>([
    {
      role: 'model',
      text: "እንኳን ደህና መጡ! እኔ በትሬዲንግ ስነ-ልቦና ላይ ያተኮርኩ የረቂቅ ዕውቀት ረዳት ነኝ። ስለ አነስተኛ አካውንት ማሳደግ፣ የስነ-ልቦና ጫናዎችን (FOMO, Overtrading, Revenge trading) መቆጣጠር ወይም ግራፎች ትንታኔ ማንኛውንም ጥያቄ ይጠይቁኝ።"
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [useSearch, setUseSearch] = useState<boolean>(false);
  const [voiceSynthesisIndex, setVoiceSynthesisIndex] = useState<number | null>(null);

  // Live Help Desk (Telegram bot Q&A integration states)
  const [supportMode, setSupportMode] = useState<'copilot' | 'support'>('support');
  const [supportQuestionText, setSupportQuestionText] = useState<string>('');
  const [supportQuestions, setSupportQuestions] = useState<any[]>([]);
  const [supportQuestionsLoading, setSupportQuestionsLoading] = useState<boolean>(false);
  const [supportQuestionsMessage, setSupportQuestionsMessage] = useState<string | null>(null);
  const [supportQuestionName, setSupportQuestionName] = useState<string>('');
  const [supportQuestionEmail, setSupportQuestionEmail] = useState<string>('');
  const [adminReplyText, setAdminReplyText] = useState<Record<string, string>>({});
  const [telegramStatus, setTelegramStatus] = useState<any>(null);
  const [isCheckingTelegram, setIsCheckingTelegram] = useState<boolean>(false);
  const [telegramBotTokenInput, setTelegramBotTokenInput] = useState<string>('');
  const [telegramChatIdInput, setTelegramChatIdInput] = useState<string>('');
  const [telegramSaveStatus, setTelegramSaveStatus] = useState<string>('');

  // Privacy & Customer Data Governance (GDPR / Anonymization Dashboard)
  const [isPrivacyAdminAuthenticated, setIsPrivacyAdminAuthenticated] = useState<boolean>(false);
  const [privacyPinInput, setPrivacyPinInput] = useState<string>('');
  const [maskEmailsActive, setMaskEmailsActive] = useState<boolean>(false);
  const [privacyUsers, setPrivacyUsers] = useState<any[]>([]);
  const [privacyLoading, setPrivacyLoading] = useState<boolean>(false);
  const [privacyStatus, setPrivacyStatus] = useState<string | null>(null);

  // Sync inputs with telegram status when retrieved
  useEffect(() => {
    if (telegramStatus) {
      if (telegramStatus.botToken) {
        setTelegramBotTokenInput(telegramStatus.botToken);
      }
      if (telegramStatus.chatId) {
        setTelegramChatIdInput(telegramStatus.chatId);
      }
    }
  }, [telegramStatus]);

  // Synchronizers and Initializers
  useEffect(() => {
    fetchResearchPapers();
    runSimulatorTrajectory(); // pre-generate default simulator values
  }, []);

  // Sync questions and proposals on user load
  useEffect(() => {
    if (currentUser?.isAdmin || isAdminAuthenticated) {
      fetchProposals();
      checkTelegramStatus();
    }
    fetchQuestionsList();
  }, [currentUser, isAdminAuthenticated]);

  // Check status / diagnostic of the Telegram Bot Webhook Connection
  const checkTelegramStatus = async () => {
    try {
      setIsCheckingTelegram(true);
      const res = await fetch('/api/telegram/status');
      if (res.ok) {
        const data = await res.json();
        setTelegramStatus(data);
      }
    } catch (err) {
      console.error("Failed to query telegram status:", err);
    } finally {
      setIsCheckingTelegram(false);
    }
  };

  const forceRegisterWebhook = async () => {
    try {
      setIsCheckingTelegram(true);
      const res = await fetch('/api/telegram/setup-webhook');
      if (res.ok) {
        await checkTelegramStatus();
      }
    } catch (err) {
      console.error("Failed to force register webhook:", err);
    } finally {
      setIsCheckingTelegram(false);
    }
  };

  const saveTelegramSettings = async () => {
    try {
      setIsCheckingTelegram(true);
      setTelegramSaveStatus('ያልተቀመጡ ለውጦችን በማስቀመጥ ላይ...');
      const res = await fetch('/api/telegram/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botToken: telegramBotTokenInput,
          chatId: telegramChatIdInput
        })
      });
      if (res.ok) {
        setTelegramSaveStatus('✅ የቦት ቅንጅቶች በተሳካ ሁኔታ ተቀምጠዋል!');
        await checkTelegramStatus();
        await forceRegisterWebhook();
        setTimeout(() => setTelegramSaveStatus(''), 5000);
      } else {
        const d = await res.json();
        setTelegramSaveStatus(`❌ ማስቀመጥ አልተቻለም፡ ${d.error || 'ያልታወቀ ስህተት'}`);
      }
    } catch (err: any) {
      setTelegramSaveStatus(`❌ ማስቀመጥ አልተቻለም፡ ${err.message}`);
    } finally {
      setIsCheckingTelegram(false);
    }
  };

  // Fetch helpdesk questions list
  const fetchQuestionsList = async () => {
    try {
      setSupportQuestionsLoading(true);
      const queryEmail = currentUser?.isAdmin ? '' : (currentUser?.email || supportQuestionEmail || '');
      const url = queryEmail ? `/api/questions?email=${encodeURIComponent(queryEmail)}` : '/api/questions';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSupportQuestions(data);
      }
    } catch (err) {
      console.error("Failed to load helpdesk questions:", err);
    } finally {
      setSupportQuestionsLoading(false);
    }
  };

  // Submit live question to bot (Telegram integration)
  const handleSendQuestion = async (e: FormEvent) => {
    e.preventDefault();
    if (!supportQuestionText.trim()) return;

    const emailToUse = currentUser?.email || supportQuestionEmail;
    const nameToUse = currentUser?.name || supportQuestionName;

    if (!emailToUse || !nameToUse) {
      setSupportQuestionsMessage(lang === 'en' ? 'Please supply your name and email first!' : 'እባክዎ መጀመሪያ ስምዎንና ኢሜይልዎን ያስገቡ!');
      return;
    }

    try {
      setSupportQuestionsLoading(true);
      setSupportQuestionsMessage(null);
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameToUse,
          userId: currentUser?.userId || 'GUEST',
          email: emailToUse,
          text: supportQuestionText
        })
      });

      if (res.ok) {
        setSupportQuestionText('');
        setSupportQuestionsMessage(lang === 'en' ? 'Question successfully sent to Telegram Bot!' : 'ድንቅ ነው! ጥያቄዎ በቀጥታ ለ @tradingpsychologyresearchbot ተልኳል።');
        fetchQuestionsList();
      } else {
        const errData = await res.json();
        setSupportQuestionsMessage('Error: ' + errData.error);
      }
    } catch (err) {
      console.error("Failed to post message to Telegram desk:", err);
      setSupportQuestionsMessage('ከአገልጋዩ ጋር መገናኘት አልተቻለም።');
    } finally {
      setSupportQuestionsLoading(false);
    }
  };

  // Reply to question helper (Admin action)
  const handleAdminReplyQuestion = async (qId: string) => {
    const replyStr = adminReplyText[qId];
    if (!replyStr || !replyStr.trim()) return;

    try {
      const res = await fetch('/api/questions/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: qId,
          adminReply: replyStr
        })
      });

      if (res.ok) {
        setAdminReplyText(prev => ({ ...prev, [qId]: '' }));
        setSupportQuestionsMessage(lang === 'en' ? 'Reply posted successfully!' : 'ምላሹ በተሳካ ሁኔታ ተጽፏል፤ አባልየውም ማየት ይችላል!');
        fetchQuestionsList();
      }
    } catch (err) {
      console.error("Admin support reply posting failed:", err);
    }
  };

  // Monitor Slider Dynamic Change on Detail Page to update custom math chart
  useEffect(() => {
    if (selectedPaper) {
      generateLocalInteractiveChart(selectedPaper.id, paperSliderValue);
    }
  }, [selectedPaper, paperSliderValue]);

  // Fetch Papers from live DB
  const fetchResearchPapers = async () => {
    setIsDataLoading(true);
    try {
      const res = await fetch('/api/research');
      if (res.ok) {
        const data = await res.json();
        setPapers(data);
        // Sync selected paper if open
        if (selectedPaper) {
          const fresh = data.find((p: any) => p.id === selectedPaper.id);
          if (fresh) setSelectedPaper(fresh);
        }
      }
    } catch (e) {
      console.error('Could not fetch papers:', e);
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/admin/proposals');
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Local Interactive Chart on Sliders change
  // Math: Simulates compounding relative to the user-defined slider percentage
  const generateLocalInteractiveChart = (paperId: string, riskPercent: number) => {
    const data = [];
    let capital = startCapital;
    let baselineCapital = startCapital; // standard 2% disciplined risk
    
    // Setup 10 intervals with custom compounding logic depending on paper context
    for (let i = 0; i <= 8; i++) {
      const tradeCount = i * 5;
      
      // Patient compounding simulator relative to customized slider value
      const targetPercent = riskPercent / 100;
      const compoundFactor = Math.pow(1 + (targetPercent * 1.5), tradeCount); // 55% success rate math
      const patientCapital = Math.round(startCapital * compoundFactor);

      // Impatient/high risk compounding math
      // Higher risk percentages suffer higher risk of ruin, which drop capital to zero over multiple cycles
      let gamblerCapital;
      if (riskPercent > 12) {
        gamblerCapital = i > 4 ? 0 : Math.round(startCapital * Math.pow(1 + (riskPercent * 0.08), i) * (0.8 - (i * 0.15)));
      } else {
        gamblerCapital = Math.round(startCapital * Math.pow(1 + (riskPercent * 0.04), i));
      }
      
      data.push({
        name: `${tradeCount} ትሬዶች`,
        'የእርስዎ ስጋት ወሰን': patientCapital >= 0 ? patientCapital : 0,
        'ትዕግስተኛ 2% ስጋት (ምርጥ)': Math.round(startCapital * Math.pow(1.03, tradeCount)),
        'ችኩል 15% ስጋት (ብልሽት)': gamblerCapital >= 0 ? gamblerCapital : 0,
      });
    }
    setCustomPaperChart(data);
  };

  // 100-Trade Monte Carlo simulator for Compounding vs Ruin (Delayed Gratification Page)
  // Disciplined: Risks 2% of equity, target 1:2 R:R (4% reward on win)
  // Impatient/Greedy: Risks 15% of equity, target 1:2 R:R (30% reward on win) but suffers immense mental drawdown and early account blowing
  const runSimulatorTrajectory = () => {
    setIsSimulating(true);
    
    // Local simulation run
    setTimeout(() => {
      let capDisciplined = startCapital;
      let capImpatient = startCapital;
      
      let peakDisciplined = startCapital;
      let peakImpatient = startCapital;
      
      let minDisciplined = startCapital;
      let minImpatient = startCapital;

      const chartPoints = [{
        trade: 0,
        disciplined: capDisciplined,
        impatient: capImpatient,
        disciplinedLimit: capDisciplined,
        impatientLimit: capImpatient
      }];

      for (let i = 1; i <= numTradesSimulated; i++) {
        const isWin = Math.random() * 100 < winRate;
        
        // 1. Disciplined: Risks 2%
        if (capDisciplined > 5) { // if not blown
          const amountAtRisk = capDisciplined * 0.02;
          if (isWin) {
            capDisciplined += amountAtRisk * riskReward;
          } else {
            capDisciplined -= amountAtRisk;
          }
          if (capDisciplined > peakDisciplined) peakDisciplined = capDisciplined;
          if (capDisciplined < minDisciplined) minDisciplined = capDisciplined;
        } else {
          capDisciplined = 0;
        }

        // 2. Impatient: Risks 15% with high volatility. Greedy traders suffer emotional decay
        if (capImpatient > 5) { // if not blown
          // Impatient traders often experience psychological tilt. 
          // If they lose, they double down (revenge trade) risking up to 25% to make it back!
          const tiltFactor = (chartPoints[i-1] && chartPoints[i-1].impatient < capImpatient) ? 0.15 : 0.25; 
          const amountAtRiskImpatient = capImpatient * tiltFactor;

          if (isWin) {
            capImpatient += amountAtRiskImpatient * riskReward;
          } else {
            capImpatient -= amountAtRiskImpatient;
          }
          if (capImpatient > peakImpatient) peakImpatient = capImpatient;
          if (capImpatient < minImpatient) minImpatient = capImpatient;
        } else {
          capImpatient = 0;
        }

        chartPoints.push({
          trade: i,
          disciplined: Math.round(capDisciplined),
          impatient: Math.round(capImpatient),
          disciplinedLimit: Math.round(capDisciplined),
          impatientLimit: Math.round(capImpatient)
        });
      }

      // Format down drawdown metrics
      const ddDisciplined = Math.round(((peakDisciplined - minDisciplined) / peakDisciplined) * 100);
      const ddImpatient = Math.round(((peakImpatient - minImpatient) / peakImpatient) * 100);

      setSimulationData(chartPoints);
      setSimSummary({
        disciplinedFinal: Math.round(capDisciplined),
        impatientFinal: Math.round(capImpatient),
        disciplinedPeak: Math.round(peakDisciplined),
        impatientPeak: Math.round(peakImpatient),
        disciplinedDrawdown: ddDisciplined > 0 ? ddDisciplined : 0,
        impatientDrawdown: ddImpatient > 0 ? ddImpatient : 100
      });

      setIsSimulating(false);
    }, 450);
  };

  // Submit Comments Backend
  const handlePostComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthError(
        lang === 'am'
          ? 'ላይክ ለማድረግ ወይም አስተያየት ለመስጠት እባክዎን መጀመሪያ ይመዝገቡ ወይም ወደ መለያዎ ይግቡ!'
          : 'To like or comment on a research paper, please register or sign in first!'
      );
      setActiveTab('auth');
      return;
    }
    if (!commentText.trim() || commentLoading || !selectedPaper) return;

    setCommentLoading(true);
    try {
      const res = await fetch('/api/research/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId: selectedPaper.id,
          author: currentUser.name,
          email: currentUser.email,
          text: commentText
        })
      });

      if (res.ok) {
        setCommentText('');
        fetchResearchPapers(); // update page
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommentLoading(false);
    }
  };

  // Trigger Likes dynamic toggle
  const handleToggleLike = async (paperId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setAuthError(
        lang === 'am'
          ? 'ላይክ ለማድረግ ወይም አስተያየት ለመስጠት እባክዎን መጀመሪያ ይመዝገቡ ወይም ወደ መለያዎ ይግቡ!'
          : 'To like or comment on a research paper, please register or sign in first!'
      );
      setActiveTab('auth');
      return;
    }

    try {
      const res = await fetch('/api/research/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          email: currentUser.email
        })
      });

      if (res.ok) {
        fetchResearchPapers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Client Authentication registration Form
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setAuthError('እባክዎትን ሁሉንም የመመዝገቢያ ሳጥኖች በትክክል ይሙሉ!');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAuthSuccess('ምዝገባዎ በተሳካ ሁኔታ ተጠናቋል። አሁን መግባት ይችላሉ!');
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        // Auto transfer to login credentials block
        setLoginEmail(regEmail);
      } else {
        setAuthError(data.error || 'የምዝገባ ስህተት ተከስቷል።');
      }
    } catch (err: any) {
      setAuthError('ወደ አገልጋዩ መገናኘት አልተቻለም።');
    }
  };

  // Client Admin dashboard access control check
  const handleVerifyAdminPass = (e: FormEvent) => {
    e.preventDefault();
    setAdminStatus(null);
    if (adminPassword === 'admin123') { // Simple local dynamic sandbox pass
      setIsAdminAuthenticated(true);
      setAdminStatus('እንኳን በደህና መጡ አድሚን! አዲስ ጥናቶችን ማስተዳደር ይችላሉ።');
    } else {
      setAdminStatus('ስህተት፡ የተሳሳተ የአድሚን የይለፍ ቃል። እባክዎ እንደገና ይሞክሩ።');
    }
  };

  // --- PRIVACY & GOVERNANCE HANDLERS ---
  const fetchPrivacySettings = async () => {
    try {
      const res = await fetch('/api/admin/privacy/settings');
      if (res.ok) {
        const data = await res.json();
        setMaskEmailsActive(data.maskEmails);
      }
    } catch (err) {
      console.error("Failed to fetch privacy settings:", err);
    }
  };

  const savePrivacySettings = async (val: boolean) => {
    try {
      setPrivacyLoading(true);
      const res = await fetch('/api/admin/privacy/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maskEmails: val })
      });
      if (res.ok) {
        setMaskEmailsActive(val);
        setPrivacyStatus(t.privacySuccess);
        setTimeout(() => setPrivacyStatus(null), 4000);
        // Refresh research papers to pull comments with masked/unmasked emails
        fetchResearchPapers();
      }
    } catch (err) {
      console.error("Error updating privacy settings:", err);
    } finally {
      setPrivacyLoading(false);
    }
  };

  const fetchPrivacyUsers = async () => {
    try {
      setPrivacyLoading(true);
      const res = await fetch('/api/admin/privacy/users');
      if (res.ok) {
        const data = await res.json();
        setPrivacyUsers(data);
      }
    } catch (err) {
      console.error("Failed to load privacy users list:", err);
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleVerifyPrivacyPin = (e: FormEvent) => {
    e.preventDefault();
    if (privacyPinInput === 'privacy99') {
      setIsPrivacyAdminAuthenticated(true);
      setPrivacyStatus("የፕራይቬሲ ፍቃድ ተረጋግጧል! (Privacy PIN Verified)");
      setTimeout(() => setPrivacyStatus(null), 3000);
      fetchPrivacySettings();
      fetchPrivacyUsers();
    } else {
      setPrivacyStatus("ያልተፈቀደ ኮድ! እባክዎ እንደገና ይሞክሩ። (Incorrect PIN)");
      setTimeout(() => setPrivacyStatus(null), 4000);
    }
  };

  const handleEraseUserData = async (email: string) => {
    if (!window.confirm(`የተጠቃሚ ${email} መለያና ጥናቶች ሙሉ በሙሉ እንዲጠፉ ይፈልጋሉ? ይህ እርምጃ ሊመለስ አይችልም። (Are you sure you want to completely erase ${email}'s data?)`)) {
      return;
    }
    try {
      setPrivacyLoading(true);
      const res = await fetch('/api/admin/privacy/erase-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setPrivacyStatus(`የተጠቃሚ ${email} መረጃዎች በተሳካ ሁኔታ ተደምስሰዋል። (Purged successfully)`);
        setTimeout(() => setPrivacyStatus(null), 5000);
        fetchPrivacyUsers();
        fetchResearchPapers(); // Update comments as well
      }
    } catch (err) {
      console.error("Failed to request data erasure:", err);
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleExportDatabase = () => {
    window.open('/api/admin/privacy/export', '_blank');
  };

  // Admin post new research paper
  const handleCreatePaperAsAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setAdminStatus(null);

    // Combine multiple authors fields if filled, or use the single authors input field
    const combinedAuthors = [newPaperAuthor1, newPaperAuthor2, newPaperAuthor3].filter(Boolean).join('፣ ') || newPaperAuthors;

    if (!newPaperTitle || !newPaperAbstract || !combinedAuthors || !newPaperContent) {
      setAdminStatus('ስህተት፡ እባክዎትን ሁሉንም የመረጃ ክፍሎች በትክክል ይሙሉ!');
      return;
    }

    // Chart mock creator
    const presetsMap = {
      grow: [
        { day: 0, capital: 100 },
        { day: 20, capital: 155 },
        { day: 40, capital: 240 },
        { day: 60, capital: 370 },
        { day: 80, capital: 575 },
        { day: 100, capital: 890 }
      ],
      stable: [
        { day: 0, capital: 100 },
        { day: 20, capital: 110 },
        { day: 40, capital: 122 },
        { day: 60, capital: 135 },
        { day: 80, capital: 150 },
        { day: 100, capital: 168 }
      ],
      drawdown: [
        { day: 0, capital: 100 },
        { day: 20, capital: 180 },
        { day: 40, capital: 290 },
        { day: 60, capital: 80 },
        { day: 80, capital: 2 },
        { day: 100, capital: 0 }
      ],
      none: []
    };

    try {
      const res = await fetch('/api/research/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPaperTitle,
          abstract: newPaperAbstract,
          authors: combinedAuthors,
          content: newPaperContent,
          seedInitialChart: presetsMap[newPaperChartPreset],
          image: newPaperImage || ""
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAdminStatus('ድንቅ ነው! አዲሱ የምርምር ጥናት በተሳካ ሁኔታ ታትሞ ዋናው ገፅ ላይ ተጨምሯል።');
        setNewPaperTitle('');
        setNewPaperAbstract('');
        setNewPaperAuthors('');
        setNewPaperAuthor1('');
        setNewPaperAuthor2('');
        setNewPaperAuthor3('');
        setNewPaperImage('');
        setNewPaperContent('');
        fetchResearchPapers(); // Reload from db
        setTimeout(() => setActiveTab('home'), 1500);
      } else {
        setAdminStatus('ስህተት፡ ' + data.error);
      }
    } catch (err: any) {
      setAdminStatus('አገልጋዩ ላይ ጥናት መፍጠር አልተቻለም።');
    }
  };

  // Admin update existing paper
  const handleUpdatePaperAsAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setAdminStatus(null);

    const combinedEditAuthors = [editAuthor1, editAuthor2, editAuthor3].filter(Boolean).join('፣ ') || editAuthors;

    if (!editTitle || !editAbstract || !combinedEditAuthors || !editContent || !editingPaper) {
      setAdminStatus(lang === 'en' ? 'Error: Please fill in all fields correctly!' : 'ስህተት፡ እባክዎትን ሁሉንም የመረጃ ክፍሎች በትክክል ይሙሉ!');
      return;
    }

    try {
      const res = await fetch('/api/research/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPaper.id,
          title: editTitle,
          abstract: editAbstract,
          authors: combinedEditAuthors,
          content: editContent,
          image: editPaperImage
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAdminStatus(lang === 'en' ? 'Success! The paper was updated successfully.' : 'ድንቅ ነው! የምርምር ጥናቱ መረጃ በተሳካ ሁኔታ ታድሷል።');
        setEditingPaper(null);
        setEditTitle('');
        setEditAbstract('');
        setEditAuthors('');
        setEditAuthor1('');
        setEditAuthor2('');
        setEditAuthor3('');
        setEditPaperImage('');
        setEditContent('');
        fetchResearchPapers(); // Reload from db
      } else {
        setAdminStatus('Error: ' + data.error);
      }
    } catch (err: any) {
      setAdminStatus(lang === 'en' ? 'Failed to update paper on server.' : 'አገልጋዩ ላይ ጥናት ማደስ አልተቻለም።');
    }
  };

  // Admin delete existing paper
  const handleDeletePaperAsAdmin = async (id: string) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to delete this research paper permanently?' : 'ይህን የምርምር ጥናት እስከመጨረሻው ለመሰረዝ እርግጠኛ ነዎት?')) {
      return;
    }
    setAdminStatus(null);

    try {
      const res = await fetch('/api/research/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        setAdminStatus(lang === 'en' ? 'Success! The paper was successfully deleted.' : 'የምርምር ጥናቱ በተሳካ ሁኔታ ከስርዓቱ ተሰርዟል።');
        fetchResearchPapers(); // Reload from db
        if (selectedPaper?.id === id) {
          setSelectedPaper(null);
        }
      } else {
        const data = await res.json();
        setAdminStatus('Error: ' + data.error);
      }
    } catch (err: any) {
      setAdminStatus(lang === 'en' ? 'Failed to delete paper on server.' : 'አገልጋዩ ላይ ጥናት ማጥፋት አልተቻለም።');
    }
  };

  // Client Authentication login Form
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!loginEmail || !loginPassword) {
      setAuthError('እባክዎትን ኢሜይል እና የይለፍ ቃል ያስገቡ!');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setAuthSuccess('እንኳን በደህና ተመለሱ ' + data.user.name + '!');
        setCurrentUser(data.user);
        localStorage.setItem('trading_user_session', JSON.stringify(data.user));
        
        // Auto convert to active admin state if flag is true
        if (data.user.isAdmin) {
          setIsAdminAuthenticated(true);
        }

        setTimeout(() => {
          setActiveTab('home');
        }, 1000);
      } else {
        setAuthError(data.error || 'ኢሜይል ወይም የይለፍ ቃል የተሳሳተ ነው።');
      }
    } catch (err) {
      setAuthError('ከአገልጋዩ ጋር መገናኘት አልተቻለም።');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('trading_user_session');
    setAuthSuccess('በተሳካ ሁኔታ ወጥተዋል። ሰላም ይቆዩ!');
  };

  const handlePropFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (under 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setPropStatus(lang === 'en' ? 'Document size must be under 10MB!' : 'የፋይል መጠን ከ 10MB መብለጥ የለበትም!');
      return;
    }

    setPropFileName(file.name);
    setPropFileType(file.type);
    setIsFileReading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPropFileData(result);
      setIsFileReading(false);
    };
    reader.onerror = () => {
      setPropStatus(lang === 'en' ? 'Error reading document file.' : 'ሰነዱን ለማንበብ ስህተት ተከስቷል።');
      setIsFileReading(false);
    };
    reader.readAsDataURL(file);
  };

  // Proposals submission Form
  const handlePostProposal = async (e: FormEvent) => {
    e.preventDefault();
    setPropStatus(null);

    if (!propName || !propTitle || !propAbstract) {
      setPropStatus('እባክዎ ስምና የሃሳብ አርእስት ይሙሉ!');
      return;
    }

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: propName,
          contact: propContact,
          title: propTitle,
          abstract: propAbstract,
          fileName: propFileName,
          fileType: propFileType,
          fileData: propFileData
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPropStatus(
          lang === 'en' 
            ? 'Your proposal and abstract have been successfully forwarded to the Telegram Bot & Admin Database!' 
            : 'ሃሳብዎ እና የጥናት ፒዲኤፍ/ሰነድዎ በአድሚን ፍቃድ እንዲታተም በቴሌግራም ቦት እና በዳታቤዝ በተሳካ ሁኔታ ተልኳል!'
        );
        setPropName('');
        setPropContact('');
        setPropTitle('');
        setPropAbstract('');
        setPropFileName('');
        setPropFileType('');
        setPropFileData('');
        if (currentUser?.isAdmin) fetchProposals();
      } else {
        setPropStatus('ስህተት ተከስቷል: ' + data.error);
      }
    } catch (e: any) {
      setPropStatus('ለማቅረብ አልተቻለም: ግንኙነት እምቢ ብሏል።');
    }
  };

  // AI Copilot response submit
  const submitChatToAI = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const currentMsg = chatMessage;
    setChatMessage('');
    setChatLoading(true);

    const userHist = [...chatHistory, { role: 'user' as const, text: currentMsg }];
    setChatHistory(userHist);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMsg,
          history: chatHistory.slice(-6), // context depth
          useSearch: useSearch
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setChatHistory((p) => [
          ...p,
          {
            role: 'model',
            text: data.text,
            sources: data.groundingSources
          }
        ]);
      } else {
        throw new Error(data.error || 'የምላሽ ማመንጨት ተቋርጧል።');
      }
    } catch (err: any) {
      setChatHistory((p) => [
        ...p,
        {
          role: 'model',
          text: `⚠️ ይቅርታ፡ መልስ ማቅረብ አልቻልኩም። የGoogle AI የግንኙነት ስህተት አጋጥሟል፡ ${err.message}`
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Convert response speech via server voice synthesis
  const handleSpeakSpeechBytes = async (text: string, index: number) => {
    if (voiceSynthesisIndex === index) {
      // stop speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setVoiceSynthesisIndex(null);
      return;
    }

    setVoiceSynthesisIndex(index);
    try {
      const clean = text.replace(/[*#`_\-]/g, '').slice(0, 300);
      const res = await fetch('/api/gemini/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, voiceName: 'Zephyr' })
      });

      const data = await res.json();
      if (res.ok && data.audio) {
        // Standard Web PCM context reader
        const audioBytes = window.atob(data.audio);
        const len = audioBytes.length;
        const arrayBuf = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          arrayBuf[i] = audioBytes.charCodeAt(i);
        }

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtx.decodeAudioData(arrayBuf.buffer, (buffer) => {
          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.onended = () => setVoiceSynthesisIndex(null);
          source.start(0);
        }, () => {
          triggerLegacySpeechFallback(clean);
        });
      } else {
        triggerLegacySpeechFallback(clean);
      }
    } catch (e) {
      triggerLegacySpeechFallback(text);
    }
  };

  const triggerLegacySpeechFallback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const voice = new SpeechSynthesisUtterance(text.slice(0, 200));
      voice.onend = () => setVoiceSynthesisIndex(null);
      voice.onerror = () => setVoiceSynthesisIndex(null);
      window.speechSynthesis.speak(voice);
    } else {
      setVoiceSynthesisIndex(null);
      alert('የድምፅ ማጫወቻ በብሮውዘርዎ ላይ የለም። እባክዎ ድምጽዎን ይክፈቱ።');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-slate-800 selection:text-emerald-400 relative">
      
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 left-15 w-[350px] h-[350px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* GORGEOUS, STICKY & FULLY RESPONSIVE HEADER */}
      <header id="platform-header" className="sticky top-0 z-50 border-b border-slate-900/80 bg-slate-950/85 backdrop-blur-lg px-4 py-3 md:py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Platform Branding */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => { setSelectedPaper(null); setActiveTab('home'); setIsMobileMenuOpen(false); handleLogoClick(); }}
          >
            <div className="relative">
              {/* Outer logo glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-xl blur-md opacity-40 group-hover:opacity-75 transition duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-cyan-400 p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                  <Brain className="w-5.5 h-5.5 text-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white font-sans group-hover:text-emerald-300 transition duration-150">
                  {t.title}
                </span>
                <span className="hidden sm:inline-block text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                  {t.crowdsourced}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest block font-mono font-semibold">
                {t.subTitle}
              </p>
            </div>
          </div>

          {/* DESKTOP NAVIGATION (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-900/90 backdrop-blur-md">
            <button
              onClick={() => { setSelectedPaper(null); setActiveTab('home'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === 'home' && !selectedPaper
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => { setSelectedPaper(null); setActiveTab('simulator'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {t.simulator}
            </button>
            <button
              onClick={() => { setSelectedPaper(null); setActiveTab('proposal'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === 'proposal'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {t.submitProposal}
            </button>
            {currentUser?.isAdmin && (
              <button
                onClick={() => { setSelectedPaper(null); setActiveTab('admin'); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
                title="Admin Panel Gate"
              >
                {t.adminPanel}
              </button>
            )}
          </nav>

          {/* RIGHT ACTION ITEMS & PROFILE (Desktop: Always, Mobile: Dynamic Toggle) */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Language Switcher Buttons */}
            <div className="flex bg-slate-900/40 p-1 rounded-xl border border-slate-900">
              <button
                onClick={() => toggleLanguage('am')}
                className={`px-2.5 py-1 text-[10px] font-mono tracking-wider font-extrabold rounded-lg transition cursor-pointer ${lang === 'am' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
              >
                አማ
              </button>
              <button
                onClick={() => toggleLanguage('en')}
                className={`px-2.5 py-1 text-[10px] font-mono tracking-wider font-extrabold rounded-lg transition cursor-pointer ${lang === 'en' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-900">
                {/* Profile icon button */}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-2.5 bg-slate-900 hover:bg-slate-850 text-slate-100 hover:text-emerald-400 border border-slate-900 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  title={lang === 'am' ? 'የእኔ መገለጫ (My Profile)' : 'View My Profile'}
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-sans">{lang === 'am' ? 'መገለጫ' : 'Profile'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-slate-900/60 hover:bg-rose-950/40 border border-slate-900 hover:border-rose-900/40 hover:text-rose-400 rounded-xl transition cursor-pointer duration-150"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setSelectedPaper(null); setActiveTab('auth'); }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer transition transform active:scale-95 duration-100"
              >
                <User className="w-3.5 h-3.5" />
                {t.registerLogin}
              </button>
            )}
          </div>

          {/* MOBILE TOGGLE GROUP (Hamburger & Actions for responsive design) */}
          <div className="flex items-center md:hidden gap-2">
            {/* Quick language toggle */}
            <button
              onClick={() => toggleLanguage(lang === 'am' ? 'en' : 'am')}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded-lg text-[10px] font-mono border border-slate-900 font-bold tracking-widest text-emerald-400 uppercase"
            >
              {lang === 'am' ? 'EN' : 'አማ'}
            </button>

            {/* Hamburger Trigger button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-850/80 text-slate-250 cursor-pointer active:scale-95 transition"
              aria-label="Toggle navigation drawer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* POLISHED MOBILE DRAWER SECTION */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-900/80 space-y-4 animate-fade-in">
            {/* Responsive vertical navigation menu */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setSelectedPaper(null); setActiveTab('home'); setIsMobileMenuOpen(false); }}
                className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition ${
                  activeTab === 'home' && !selectedPaper
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950'
                    : 'bg-slate-900/40 text-slate-300 border border-slate-900/70'
                }`}
              >
                {t.home}
              </button>
              <button
                onClick={() => { setSelectedPaper(null); setActiveTab('simulator'); setIsMobileMenuOpen(false); }}
                className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition ${
                  activeTab === 'simulator'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950'
                    : 'bg-slate-900/40 text-slate-300 border border-slate-900/70'
                }`}
              >
                {t.simulator}
              </button>
              <button
                onClick={() => { setSelectedPaper(null); setActiveTab('proposal'); setIsMobileMenuOpen(false); }}
                className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition ${
                  activeTab === 'proposal'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950'
                    : 'bg-slate-900/40 text-slate-300 border border-slate-900/70'
                }`}
              >
                {t.submitProposal}
              </button>
              {currentUser?.isAdmin && (
                <button
                  onClick={() => { setSelectedPaper(null); setActiveTab('admin'); setIsMobileMenuOpen(false); }}
                  className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950'
                      : 'bg-slate-900/40 text-slate-300 border border-slate-900/70'
                  }`}
                >
                  {t.adminPanel}
                </button>
              )}
            </div>

            {/* Mobile Account Details Panel */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-900/80">
              {currentUser ? (
                <div className="flex items-center justify-between gap-3 w-full">
                  <button
                    onClick={() => { setIsProfileModalOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-850 hover:bg-slate-750 text-emerald-400 border border-slate-750 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'am' ? 'የእኔ መገለጫ (Profile)' : 'My Profile'}</span>
                  </button>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-950/20 hover:bg-rose-950 text-rose-400 border border-rose-900/30 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{lang === 'am' ? 'ውጣ (Logout)' : 'Logout'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setSelectedPaper(null); setActiveTab('auth'); setIsMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-450 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/5"
                >
                  <User className="w-4 h-4" />
                  <span>{t.registerLogin}</span>
                </button>
              )}
            </div>
          </div>
        )}

      </header>

      {/* NOTIFICATIONS BAR */}
      {authSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-2.5 px-4 text-center text-xs font-medium relative animate-fade-in z-30">
          ✨ {authSuccess}
          <button onClick={() => setAuthSuccess(null)} className="absolute right-4 top-2 text-emerald-300 hover:text-white font-mono text-xs">✕</button>
        </div>
      )}
      {authError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 py-2.5 px-4 text-center text-xs font-medium relative animate-fade-in z-30">
          ⚠️ {authError}
          <button onClick={() => setAuthError(null)} className="absolute right-4 top-2 text-rose-300 hover:text-white font-mono text-xs">✕</button>
        </div>
      )}

      {/* CORE HERO SUMMARY - BRIEF GREETING */}
      {!selectedPaper && activeTab === 'home' && (
        <section id="hero-deck" className="relative py-12 md:py-16 px-6 bg-slate-950 overflow-hidden border-b border-slate-900">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight font-sans">
              {t.heroHeading} <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {t.heroHeadingAccent}
              </span>
            </h2>
            <p className="text-slate-300 text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              &ldquo;{t.heroParagraph}&rdquo;
            </p>
            
            {/* Summary statistics metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto font-mono">
              <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl">
                <span className="text-emerald-400 text-xl md:text-2xl font-bold">2% RISK</span>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{t.riskLimitDesc}</p>
              </div>
              <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl">
                <span className="text-cyan-400 text-xl md:text-2xl font-bold">COMPOUNDING</span>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{t.compoundingDesc}</p>
              </div>
              <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl col-span-2 md:col-span-1">
                <span className="text-amber-400 text-xl md:text-2xl font-bold">DELAYED GRT.</span>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{t.delayDesc}</p>
              </div>
            </div>

            {/* Simulated Telegram Contact block */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('simulator')}
                className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-400/10"
              >
                <TrendingUp className="w-4 h-4" />
                {t.trySimulator}
              </button>
              <a
                href="https://t.me/tradingpsychologyresearchbot" // Custom Telegram username target
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <SendIcon className="w-3.5 h-3.5 text-cyan-400" />
                {t.chatAdmin}
              </a>
            </div>

          </div>
        </section>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-grow p-4 md:p-6 max-w-7xl w-full mx-auto relative z-10">
        
        {/* TAB 1: HOME GRID & RESEARCH PAPERS */}
        {activeTab === 'home' && !selectedPaper && (
          <div className="space-y-8">
            
            {/* Header section of Grid studies */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-emerald-400 w-5 h-5" />
                  {t.sandboxHeader}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t.sandboxDesc}
                </p>
              </div>

              {/* Loader */}
              {isDataLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  {t.loadingData}
                </div>
              )}
            </div>

            {/* List and Grid display cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {papers.map((paper) => (
                <article
                  key={paper.id}
                  onClick={() => setSelectedPaper(paper)}
                  className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-850 duration-200 transition p-6 rounded-2xl flex flex-col justify-between h-[280px] cursor-pointer group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-emerald-400 font-semibold tracking-wider bg-emerald-500/5 px-2.5 py-0.5 rounded-full border border-emerald-500/10 uppercase">
                        {t.articleType}
                      </span>
                      {/* Comments quantity badge */}
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <MessageSquare className="w-3 h-3 text-cyan-400" />
                        {(paper.comments || []).length} {t.commentsCount}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 duration-150 leading-snug">
                      {paper.title}
                    </h4>
                    
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {paper.abstract}
                    </p>
                  </div>

                  <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {t.by} <span className="text-slate-300 font-medium">{paper.authors}</span>
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {/* Interactive Like button block */}
                      <button
                        onClick={(e) => handleToggleLike(paper.id, e)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-850 hover:border-emerald-500/20 rounded-full text-xs transition font-mono ${
                          currentUser && paper.likedBy?.includes(currentUser.email)
                            ? 'text-emerald-400 bg-emerald-500/5 border-emerald-400/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{paper.likes || 0}</span>
                      </button>

                      <span className="p-1 px-2 bg-slate-950/80 text-emerald-400 text-[10px] rounded group-hover:bg-emerald-400 group-hover:text-slate-950 duration-200 uppercase font-mono tracking-widest flex items-center gap-0.5">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}

              {/* Create Dynamic Abstract box if proposal submission isn't approved yet */}
              {proposals.length > 0 && currentUser?.isAdmin && (
                <div className="border border-dashed border-amber-600/30 bg-amber-500/[0.01] p-6 rounded-2xl flex flex-col justify-between h-[280px]">
                  <div>
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                      የቀረበ የምርምር ጥያቄ (Proposal Pending)
                    </span>
                    <h4 className="text-sm font-bold text-slate-300 mt-2 line-clamp-2">
                      {proposals[0].title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                      {proposals[0].abstract}
                    </p>
                  </div>
                  <div className="border-t border-slate-900/60 pt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">አቅራቢ፦ {proposals[0].name}</span>
                    <button
                      onClick={() => {
                        setNewPaperTitle(proposals[0].title);
                        setNewPaperAbstract(proposals[0].abstract);
                        setNewPaperAuthors(proposals[0].name);
                        setActiveTab('admin');
                      }}
                      className="text-amber-500 hover:text-amber-400 font-bold"
                    >
                      አጽድቅና አትም &rarr;
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* DETAILED PAPER VIEW (ሀ. አኒሜሽን እና ሙሉ የምርምር ፅሁፍ) */}
        {selectedPaper && (
          <div className="space-y-6 animate-fade-in duration-300">
            
            {/* Back to cards option */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedPaper(null)}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 duration-150 cursor-pointer text-left"
              >
                {t.backToList}
              </button>

              <div className="text-slate-400 text-xs font-mono">
                {t.viewingMode}: <span className="text-emerald-400">{selectedPaper.title.slice(0, 30)}...</span>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Left text analyses columns (Merged/Centered) */}
              <div className="space-y-6 bg-slate-900/40 border border-slate-900 p-6 md:p-8 rounded-2xl">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug font-sans">
                    {selectedPaper.title}
                  </h2>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-mono">
                    <span>{t.by} <span className="text-emerald-400 font-sans font-semibold">{selectedPaper.authors}</span></span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                      {selectedPaper.likes} {lang === 'en' ? 'Likes' : 'ላይኮች'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
                  <h5 className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold mb-1">{t.abstractTitle}</h5>
                  <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                    {selectedPaper.abstract}
                  </p>
                </div>

                {/* Primary full body text (Markdown representation conversion) */}
                <div className="prose prose-invert max-w-none text-slate-300 text-xs leading-relaxed space-y-4 pt-2">
                  {selectedPaper.content.split('\n\n').map((para, pIdx) => {
                    if (para.startsWith('###')) {
                      return <h3 key={pIdx} className="text-md font-bold text-white mt-4 border-b border-slate-900 pb-2 flex items-center gap-1.5"><FileText className="text-emerald-400 w-4 h-4" />{para.replace('###', '').trim()}</h3>;
                    }
                    if (para.startsWith('1.') || para.startsWith('2.') || para.startsWith('3.')) {
                      return (
                        <div key={pIdx} className="pl-4 py-1.5 border-l-2 border-emerald-500/20 bg-slate-950/20 my-1">
                          <p className="font-semibold text-white">{para}</p>
                        </div>
                      );
                    }
                    return <p key={pIdx}>{para}</p>;
                  })}
                </div>

                {/* Quick Interactive Liking Trigger on detailed view */}
                <div className="pt-4 border-t border-slate-900 flex items-center justify-between gap-4">
                  <p className="text-[10px] text-slate-400">{t.likePrompt}</p>
                  <button
                    onClick={(e) => handleToggleLike(selectedPaper.id, e)}
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      currentUser && selectedPaper.likedBy?.includes(currentUser.email)
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{selectedPaper.likedBy?.includes(currentUser?.email || '') ? t.likedByYou : t.likeBtn} ({selectedPaper.likes})</span>
                  </button>
                </div>

                {/* Author Showcase card & Image Input ("ማን እንደሰራው ስሙ እና ኢማጅ ማስገቢያ ይኑረው") */}
                <div className="mt-8 pt-6 border-t border-slate-900 space-y-6">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#34d399] font-bold">
                      {lang === 'am' ? 'የጥናቱ አዘጋጆች (Researchers Team)' : 'Research Conducted By'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'am' 
                        ? 'ይህንን ምርምር በጥልቅ ደረጃ ያዘጋጁት እና ያጠናቀሩት የባለሙያዎች ስም ዝርዝር፦' 
                        : 'The team of researchers who conducted and compiled this study:'}
                    </p>
                  </div>

                  {/* Render Creators names */}
                  <div className="flex flex-wrap gap-3">
                    {(selectedPaper.authors || '').split(/[፣,]/).map((authName, i) => {
                      const trimmed = authName.trim();
                      if (!trimmed) return null;
                      return (
                        <div key={i} className="flex items-center gap-2.5 bg-slate-950 px-4 py-2 rounded-xl border border-slate-900">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <User className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="text-xs font-semibold text-slate-100">{trimmed}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Sequential live comments thread below */}
              <div id="comments-thread" className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <MessageCircle className="text-emerald-400 w-4 h-4" />
                    የባለሙያዎች አስተያየት መድረክ ({selectedPaper.comments?.length || 0})
                  </h3>
                  
                  {/* List container */}
                  <div className="space-y-3 mt-3">
                    {(selectedPaper.comments || []).length === 0 ? (
                      <p className="text-3xs text-slate-500 italic py-4 text-center">መጀመሪያ አስተያየት በመጻፍ ውይይቱን ይጀምሩ።</p>
                    ) : (
                      (selectedPaper.comments || []).map((comm) => (
                        <div key={comm.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-200">{comm.author}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(comm.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-350 leading-relaxed font-sans">{comm.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Post Comment Input */}
                <form onSubmit={handlePostComment} className="mt-4 pt-3 border-t border-slate-900 space-y-2">
                  {currentUser ? (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="የእርስዎን ጥናታዊ አስተያየት ይጻፉ..."
                          disabled={commentLoading}
                          className="flex-grow bg-slate-950 text-slate-100 text-xs px-3 py-2 border border-slate-900 rounded-xl focus:outline-none focus:border-emerald-500/45 transition"
                        />
                        <button
                          type="submit"
                          disabled={commentLoading || !commentText.trim()}
                          className="bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-850 disabled:text-slate-500 text-slate-950 font-bold text-xs px-3.5 rounded-xl transition duration-150 cursor-pointer"
                        >
                          ላክ
                        </button>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">በትሬዱንግ አካውንት {currentUser.name} የተፈረመ</span>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-center space-y-2 animate-pulse">
                      <p className="text-3xs text-slate-400">አስተያየት ለመተው መጀመሪያ መመዝገብ ወይም ወደ አካውንትዎ መግባት አለብዎት።</p>
                      <button
                        type="button"
                        onClick={() => { setSelectedPaper(null); setActiveTab('auth'); }}
                        className="px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-3xs font-bold rounded-lg transition"
                      >
                        ግባ / ይመዝገቡ &rarr;
                      </button>
                    </div>
                  )}
                </form>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: DELAYED GRATIFICATION SIMULATOR (ሐ. የዘገየ እርካታ ማስመሰያ) */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            
            {/* Page Headers info description */}
            <div className="bg-slate-900/40 border border-slate-950 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Sliders className="text-emerald-400 w-5 h-5" />
                  የዘገየ እርካታ 100-ትሬዶች ዲስፕሊን ሲሙሌተር (Delayed Gratification)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ይህ የላቁ ግራፍና ሲሙሌተር <strong>በ2% ሪስክ የሚሰራ ትዕግስተኛ (Disciplined)</strong> እና <strong>በ15% ሪስክ የሚሰራ ችኩል (Impatient/Greedy)</strong> ትሬደሮች መካከል <br /> ያለውን ልዩነት በ100 ትሬዶች ውስጥ በሞንቴ ካርሎ የመቶኛ ትንበያ ያሳያል።
                </p>
              </div>

              <div className="bg-emerald-400/5 border border-emerald-500/15 py-1 px-3 rounded-full text-[10px] text-emerald-400 font-mono font-bold tracking-wider">
                100 TRADES TRIAL
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Parameter Settings block (4cols) */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-6">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">የሲሙሌተር ቅንብሮች (Parameters)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">የኪሳራ ስጋት፣ የትሬድ ብዛት እና መነሻ ካፒታል ያዘጋጁ።</p>
                </div>

                <div className="space-y-4">
                  {/* Parameter 1: Capital */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">መነሻ አካውንት ማጠራቀሚያ (Starting Capital):</span>
                      <span className="text-emerald-400 font-bold">${startCapital}</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={startCapital}
                      onChange={(e) => setStartCapital(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-3xs text-slate-500">
                      <span>$100</span>
                      <span>$10,000</span>
                    </div>
                  </div>

                  {/* Parameter 2: Winrate */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">የትሬዲንግ ማሸነፍ መቶኛ (Win Rate %):</span>
                      <span className="text-emerald-400 font-bold">{winRate}% Wins</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="75"
                      value={winRate}
                      onChange={(e) => setWinRate(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-3xs text-slate-500">
                      <span>35% (ዝቅተኛ)</span>
                      <span>55% (አማካይ)</span>
                      <span>75% (ከፍተኛ)</span>
                    </div>
                  </div>

                  {/* Parameter 3: R:R */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">የትርፍ እና ኪሳራ ምጥጥን (Risk-to-Reward):</span>
                      <span className="text-emerald-400 font-bold">1 : {riskReward} R:R</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="4.0"
                      step="0.5"
                      value={riskReward}
                      onChange={(e) => setRiskReward(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-3xs text-slate-500">
                      <span>1:1</span>
                      <span>1:2 (ምርጥ)</span>
                      <span>1:4 (እጅግ ከፍተኛ)</span>
                    </div>
                  </div>

                  {/* Run Button dynamic */}
                  <button
                    onClick={runSimulatorTrajectory}
                    disabled={isSimulating}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 duration-150 transition cursor-pointer font-mono uppercase tracking-wider"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        ስሌቱ እየተመነዘረ ነው...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        አዲስ 100 ትሬዶች ሲሙሌት አድርግ
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950 p-3.5 border border-slate-900 rounded-xl">
                    💡 <strong>የስነ-ልቦና ማስታወሻ፦</strong> ችኩል ትሬደር 3 ወይም 4 ኪሳራዎች በተከታታይ በሚገጥሙት ጊዜ በፍጥነት ስሜቱ ይለወጥና በትቀባይነት ከፍ ያለ ሪስክ (Risk) መውሰድ ይጀምራል። ይህም በመጨረሻ 100% አካውንቱን ባዶ ያደርገዋል።
                  </p>
                </div>

              </div>

              {/* Trajectory lines and metrics (8cols) */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-6">
                
                {/* Result header summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-mono">Disciplined Final (ትዕግስተኛ)</span>
                    <span className={`text-sm md:text-lg font-black font-mono ${simSummary?.disciplinedFinal && simSummary.disciplinedFinal > startCapital ? 'text-emerald-400' : 'text-slate-400'}`}>
                      ${simSummary?.disciplinedFinal || 0}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-mono">Secured Peak (ትልቅ ጣሪያ)</span>
                    <span className="text-sm md:text-lg font-black font-mono text-cyan-400">
                      ${simSummary?.disciplinedPeak || 0}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-mono">Disciplined Drawdown</span>
                    <span className="text-sm md:text-lg font-black font-mono text-blue-400">
                      {simSummary?.disciplinedDrawdown || 0}%
                    </span>
                  </div>

                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                    <span className="text-[10px] text-rose-400 block font-mono">Impatient Final (ችኩል)</span>
                    <span className="text-sm md:text-lg font-black font-mono text-rose-400">
                      ${simSummary?.impatientFinal || 0} (Blown)
                    </span>
                  </div>
                </div>

                {/* Primary Chart representation */}
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDisciplined" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorImpatient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="trade" stroke="#64748b" tick={{ fontSize: 9 }} label={{ value: 'የትሬድ ቁጥር', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                      <ChartTooltip
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#334155' }}
                        labelStyle={{ fontSize: 10, color: '#f8fafc' }}
                        itemStyle={{ fontSize: 10 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      
                      <Area type="monotone" name="ትዕግስተኛ (2% Risk, Compounding)" dataKey="disciplined" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDisciplined)" />
                      <Area type="monotone" name="ችኩል (15% Risk, high loss of capital)" dataKey="impatient" stroke="#ef4444" strokeWidth={1} fillOpacity={1} fill="url(#colorImpatient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">📊 ሲሙሌተር ትንታኔ እና ድምዳሜ</h4>
                  <ul className="text-[11px] text-slate-450 leading-relaxed list-disc list-inside space-y-1">
                    <li><strong>ትዕግስተኛው ትሬደር፡</strong> የእያንዳንዱ ትሬድ ስጋት ወሰን 2% በመሆኑ በኪሳራ ቀናት በቀላሉ ስራውን አይቀይርም። ወለድን እያደሰ (Compounding) ካፒታሉ በረጋ መንገድ ረጅም ርቀት ያድጋል።</li>
                    <li><strong>ችኩሉ ትሬደር፡</strong> በስስት ምክንያት 15% ሪስክ ይወስዳል። በመጀመሪያ ደረጃ ትልቅ ትርፍ ቢያገኝም ፈጣን እርካታን ፍለጋ ሲጣደፍ በሚመጣ ድንገተኛ ተከታታይ ኪሳራዎች አካውንቱን ሙሉ ለሙሉ ወደ ማጥፋት ያመራል።</li>
                  </ul>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: PROPOSALS / SUBMIT WORKFLOW */}
        {activeTab === 'proposal' && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            <div className="bg-slate-900/40 border border-slate-905 p-6 rounded-2xl text-center space-y-3">
              <PlusCircle className="text-emerald-405 w-10 h-10 mx-auto text-emerald-405" />
              <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
                አዲስ የስነ-ልቦና ጥናት ሀሳብ ያቅርቡ
              </h2>
              <p className="text-xs text-slate-400">
                የራስዎ ጥናት ወይም የትሬዲንግ ስነ-ልቦና ዲስፕሊን የሚረዳ ሃሳብ ካለዎት በፎርሙ በኩል ያቅርቡ። አድሚኖቹ ጥናትዎን ገምግመው ፍቃድ ሲሰጡ ዋና ገፅ ላይ እንደ አዲስ ሳጥን (Box) በራሱ ጊዜ የሚፈጠር ይሆናል።
              </p>
            </div>

            {propStatus && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs text-center font-medium animate-pulse">
                {propStatus}
              </div>
            )}

            <form onSubmit={handlePostProposal} className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 block font-mono">የአቅራቢው ሙሉ ስም (Name) *</label>
                  <input
                    type="text"
                    required
                    value={propName}
                    onChange={(e) => setPropName(e.target.value)}
                    placeholder="አቤሜሌክ ሰለሞን"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/45 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 block font-mono">የመገናኛ አድራሻ (Telegram / Phone)</label>
                  <input
                    type="text"
                    value={propContact}
                    onChange={(e) => setPropContact(e.target.value)}
                    placeholder="@leulseged / +251..."
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/45 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 block font-mono">የምርምር ጥናቱ ርዕስ (Research Title) *</label>
                <input
                  type="text"
                  required
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  placeholder="የአዝማሚያ ተቃራኒዎች በትሬደሮች መካከል የሚያመጡት ድቀት ትንተና"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/45 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 block font-mono">አጭር መግቢያ (Abstract Summary) *</label>
                <textarea
                  required
                  rows={4}
                  value={propAbstract}
                  onChange={(e) => setPropAbstract(e.target.value)}
                  placeholder="የዚህ ጥናት ዋና ትንታኔ ትሬደሮች ገበያውን መከተል ሲገባቸው ታች ደርሷል ወይም ላይ ደርሷል ብለው በተቃራኒው ሲገቡ የሚደርሰውን ስነ-ልቦናዊ ሰባራነት የሚዳስስ ነው..."
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/45 transition resize-none"
                />
              </div>

              {/* File Upload Zone - Supports PDF/Word/Docs for Telegram Delivery */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 block font-mono">የጥናት ሰነድ ማያያዣ (PDF / Word / DOCS Doc Attach) - Optional</label>
                
                <div className="relative border border-dashed border-slate-900 rounded-xl bg-slate-950/60 p-5 hover:border-emerald-500/40 transition flex flex-col items-center justify-center text-center group min-h-[110px]">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handlePropFileChange}
                    className="absolute inset-x-0 top-0 bottom-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="ፋይል ለመምረጥ ጠቅ ያድርጉ"
                  />
                  
                  {propFileName ? (
                    <div className="space-y-2 z-20 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-2">
                        <FileText className="w-8 h-8 text-emerald-400 animate-pulse" />
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block max-w-[240px] truncate">{propFileName}</span>
                          <span className="text-[9px] text-emerald-350 font-mono font-bold uppercase">
                            {(propFileType || 'document').split('/').pop()}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setPropFileName('');
                          setPropFileType('');
                          setPropFileData('');
                        }}
                        className="px-2.5 py-1 bg-rose-950/40 text-rose-450 border border-rose-900/30 rounded-lg text-[9px] font-bold hover:bg-rose-950 hover:text-rose-400 transition cursor-pointer relative z-30"
                      >
                        {lang === 'am' ? 'ፋይሉን ሰርዝ (Remove)' : 'Remove file'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-slate-400 pointer-events-none flex flex-col items-center justify-center">
                      <UploadCloud className="w-8 h-8 text-emerald-500/65 group-hover:text-emerald-400 transition duration-150" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-200 block">
                          {lang === 'am' ? 'ፒዲኤፍ ወይም ወርድ ፋይል ይጎትቱ ወይም እዚህ ይጫኑ' : 'Drag & drop research file, or click here to browse'}
                        </span>
                        <span className="text-[9px] text-slate-500 block">PDF, DOC, DOCX up to 10MB</span>
                      </div>
                    </div>
                  )}

                  {isFileReading && (
                    <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center rounded-xl z-25">
                      <span className="text-2xs text-emerald-400 font-mono animate-pulse">ፋይሉን በማንበብ ላይ ነው... (Reading file...)</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition duration-150 cursor-pointer uppercase font-mono tracking-wider"
              >
                ጥያቄውን ላክ (Submit Proposal Idea)
              </button>

            </form>

            <div className="text-center">
              <span className="text-3xs text-slate-500 uppercase font-mono block">አስቸኳይ ጥያቄዎችን አድሚኖች በቀጥታ ለማነጋገር:</span>
              <div className="mt-2 flex items-center justify-center gap-4">
                <a href="https://t.me/tradingpsychologyresearchbot" target="_blank" rel="noreferrer" className="text-3xs text-emerald-400 hover:underline">Telegram Chat &rarr;</a>
                <span className="text-slate-800">|</span>
                <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer" className="text-3xs text-emerald-400 hover:underline">WhatsApp Admin &rarr;</a>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: MEMBERSHIP LOGIN & REGISTRATION (መ. አባልነት ገጽ) */}
        {activeTab === 'auth' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start py-4">
            
            {/* LOGIN CHUNK */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="text-emerald-400 w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold text-white">ወደ አካውንትዎ ይግቡ (Sign In)</h3>
                  <p className="text-[10px] text-slate-400">አስተያየትና ጥናቶችን መምረጥ እንዲችሉ ይግቡ።</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-450 block font-mono">የኢሜይል አድራሻ (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-600" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/45 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-450 block font-mono">የይለፍ ቃል (Password)</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-600" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/45 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition duration-150 cursor-pointer"
                >
                  ግባ (Sign In Account)
                </button>
              </form>


            </div>

            {/* REGISTRATION CHUNK */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Users className="text-cyan-400 w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold text-white">አዲስ አባልነት ይመዝግቡ (Registration)</h3>
                  <p className="text-[10px] text-slate-400">ምርምሮችን ለማካፈል በመድረኩ ላይ ይመዝገቡ።</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5 pt-2">
                
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-450 block font-mono">የአባሉ ሙሉ ስም (Full Name) *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-600" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="ቴዎድሮስ መስፍን"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/45 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-450 block font-mono">የኢሜይል አድራሻ (Email Adress) *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-600" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="youraccount@gmail.com"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/45 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-450 block font-mono">ስልክ ቁጥር (Phone Number) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-600" />
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+251 911000000"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/45 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-450 block font-mono">የይለፍ ቃል (Password) *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-600" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="ባለ 6 ድጂት ሚስጥር"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/45 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs rounded-xl transition duration-150 cursor-pointer"
                >
                  ይመዝገቡ (Complete Registration)
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: ADMIN SECRET CONTROL PANEL (መ. አድሚን ቁጥጥር) */}
        {activeTab === 'admin' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Password Verification Block if not logged in */}
            {!isAdminAuthenticated ? (
              <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
                <div className="text-center space-y-2">
                  <Settings className="w-10 h-10 text-amber-500 mx-auto animate-spin" style={{ animationDuration: '3s' }} />
                  <h3 className="text-md font-bold text-white">ሚስጥራዊ የአድሚን መግቢያ ገጽ (Admin panel gate)</h3>
                  <p className="text-xs text-slate-400">የትሬዲንግ ሥነ-ልቦና ጥናቶችን ለማጽደቅና ለመጻፍ የአድሚን የይለፍ ቃል ያስገቡ።</p>
                </div>

                {adminStatus && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs text-center font-medium">
                    {adminStatus}
                  </div>
                )}

                <form onSubmit={handleVerifyAdminPass} className="flex gap-2 max-w-md mx-auto pt-2">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="የይለፍ ቃል ያስገቡ... (ናሙና: admin123)"
                    className="flex-grow bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/40"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    ፍቃድ አግኝ
                  </button>
                </form>
              </div>
            ) : (
              // Active Admin Creation board
              <div className="space-y-6">
                
                <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-bold text-amber-400">አዲስ ጥናት ማተሚያ ሰሌዳ (Active Publishing Desk)</h3>
                    <p className="text-xs text-slate-400">እዚህ የሚያስገቡት ጥናት በቀጥታ ዋናው ገፅ ላይ ለአዲሱ ጥናት የሚሆን አዲስ የሪሰርች ሳጥን (Box) በራሱ ጊዜ ይፈጥራል።</p>
                  </div>
                  
                  <button
                    onClick={() => setIsAdminAuthenticated(false)}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    ዳሽቦርዱን ዝጋ
                  </button>
                </div>

                {adminStatus && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs text-center font-medium">
                    ✨ {adminStatus}
                  </div>
                )}

                {/* Submissions form paper */}
                <form onSubmit={handleCreatePaperAsAdmin} className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 block font-mono">የጥናቱ ርዕስ (Title) *</label>
                      <input
                        type="text"
                        required
                        value={newPaperTitle}
                        onChange={(e) => setNewPaperTitle(e.target.value)}
                        placeholder="በትሬዲንግ ምስቅልቅል ውስጥ ራስን የመግዛት ምጥጥን"
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/45"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 block font-mono">አቅራቢዎች/የጸሐፊዎቹ ስም (Authors) *</label>
                      <input
                        type="text"
                        required
                        value={newPaperAuthors}
                        onChange={(e) => setNewPaperAuthors(e.target.value)}
                        placeholder="ዮናስ በቀለ፣ ኤልሳቤጥ ክፍሌ"
                        className="w-full bg-slate-950 border border-slate-905 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/45"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 block font-mono">አጭር ማጠቃለያ (Abstract Preview) *</label>
                    <input
                      type="text"
                      required
                      value={newPaperAbstract}
                      onChange={(e) => setNewPaperAbstract(e.target.value)}
                      placeholder="ይህ የምርምር ሳጥን ፈጣን የውሳኔ ስሜትና የፍርሃት ሆርሞን ደረጃዎችን በትሬዲንግ ላይ የሚያመጣው ተፅዕኖ በጥልቀት ይመረምራል..."
                      className="w-full bg-slate-950 border border-slate-905 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 block font-mono">የግራፍ ምስል ሞዴል (Interactive Chart Preset)</label>
                    <select
                      value={newPaperChartPreset}
                      onChange={(e) => setNewPaperChartPreset(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-905 rounded-xl px-3 py-2 text-xs text-emerald-400"
                    >
                      <option value="grow">Constant Compounding Compound (ቋሚ እድገት)</option>
                      <option value="stable">Conservative Low Sizing (አነስተኛ የተረጋጋ ጥንቃቄ)</option>
                      <option value="drawdown">Impatient Margin Blow (ችኩል የኪሳራ ውድቀት)</option>
                      <option value="none">ምንም ግራፍ የለም (None)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 block font-mono">Keep a complete write-up of the analysis (Analysis text) *</label>
                    <textarea
                      required
                      rows={8}
                      value={newPaperContent}
                      onChange={(e) => setNewPaperContent(e.target.value)}
                      placeholder="### መግቢያ&#10;የስሜት ቁጥጥር ችግር ተከታታይ ኪሳራዎች ሲከሰቱ...&#10;&#10;### ስነ-ልቦናዊ ትንታኔ&#10;ትሬደሮች በቀን ከ 2 ጊዜ በላይ ግራፍ እንዳይመለከቱ በማድረግ ኪሳራን በሳል በሆነ መንገድ መቆጣጠር ይቻላል።"
                      className="w-full bg-slate-950 border border-slate-905 rounded-xl px-3 py-2 text-xs text-slate-100 resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition duration-150 cursor-pointer uppercase font-mono tracking-wider"
                  >
                    ጥናቱን አጽድቅና አትም (Confirm & Publish to Live Board)
                  </button>
                </form>

                {/* EDIT FORM (Show if editingPaper is active) */}
                {editingPaper && (
                  <form onSubmit={handleUpdatePaperAsAdmin} className="bg-slate-900 border border-amber-500/40 p-6 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-center bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      <div>
                        <h4 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider">{t.adminActiveTitle}</h4>
                        <p className="text-[10px] text-slate-350 mt-0.5">Editing ID: {editingPaper.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPaper(null);
                          setEditTitle('');
                          setEditAbstract('');
                          setEditAuthors('');
                          setEditContent('');
                        }}
                        className="text-[10px] px-2.5 py-1 bg-slate-950 text-slate-400 hover:text-white rounded border border-slate-800 cursor-pointer"
                      >
                        {t.cancelBtn}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-slate-400 block font-mono">{t.paperTitleLabel}</label>
                        <input
                          type="text"
                          required
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-905 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/45"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] text-slate-400 block font-mono">{t.paperAuthorsLabel}</label>
                        <input
                          type="text"
                          required
                          value={editAuthors}
                          onChange={(e) => setEditAuthors(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-905 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 block font-mono">{t.paperAbstractLabel}</label>
                      <input
                        type="text"
                        required
                        value={editAbstract}
                        onChange={(e) => setEditAbstract(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-905 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 block font-mono">{t.paperContentLabel}</label>
                      <textarea
                        required
                        rows={8}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-905 rounded-xl px-3 py-2 text-xs text-slate-100 resize-none font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition duration-150 cursor-pointer uppercase font-mono tracking-wider shadow-lg shadow-emerald-500/10"
                    >
                      {t.updateBtn}
                    </button>
                  </form>
                )}

                {/* Published Papers List for Administration */}
                <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-350">{t.adminActiveTitle} ({papers.length})</h4>
                  <div className="space-y-3">
                    {papers.map((paper) => (
                      <div key={paper.id} className="p-3 bg-slate-950 border border-slate-905 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h5 className="text-xs font-bold text-slate-100 font-sans">{paper.title}</h5>
                          <span className="text-[10px] text-slate-400 font-mono italic">{t.by} {paper.authors}</span>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPaper(paper);
                              setEditTitle(paper.title);
                              setEditAbstract(paper.abstract);
                              setEditAuthors(paper.authors);
                              setEditContent(paper.content || '');
                              setEditPaperImage(paper.image || '');
                              setAdminStatus(lang === 'en' ? 'Loaded paper details into the editing panel.' : 'የጥናቱ መረጃ ለአስተያየት ሰሌዳው ላይ ጭነናል!');
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }}
                            className="bg-emerald-600/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] tracking-wider font-mono transition cursor-pointer"
                          >
                            {t.editBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePaperAsAdmin(paper.id)}
                            className="bg-rose-600/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-[10px] tracking-wider font-mono transition cursor-pointer"
                          >
                            {t.deleteBtn}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

            {/* List Submitted Proposals to help admin pick ideas */}
            {proposals.length > 0 && isAdminAuthenticated && (
              <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-350">ከተማሪዎች የቀረቡ የምርምር ጥያቄዎች ሂሳብ ({proposals.length})</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {proposals.map((prop) => (
                    <div key={prop.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-bold text-slate-200">{prop.title}</h5>
                          <span className="text-[10px] text-slate-400 font-mono">አቅራቢ፦ {prop.name} ({prop.contact})</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">{new Date(prop.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-350 leading-relaxed bg-slate-900/20 p-2 rounded border border-slate-900">{prop.abstract}</p>
                      
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setNewPaperTitle(prop.title);
                            setNewPaperAbstract(prop.abstract);
                            setNewPaperAuthors(prop.name);
                            // copy abstract content into main paper content for faster flow
                            setNewPaperContent(`### መግቢያ\n${prop.abstract}\n\n### ስነ-ልቦናዊ ትንታኔ እና መፍትሄዎች\n1. ዲስፕሊን ወሰን\n2. ረጅም ጊዜን ማለም እና ኪሳራን መቆጣጠር`);
                            setAdminStatus('ይመልከቱ፡ የጥያቄው መረጃ ለመሙያ ሳጥኑ ላይ ተጫኗል!');
                          }}
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          ለንባብ ቅጽ ውሰድ &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Telegram Bot Connection Status Diagnostic Panel */}
            {isAdminAuthenticated && (
              <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-100">የቴሌግራም ቦት መዋቀሪያ እና ግንኙነት መፈተሻ (Telegram Bot Settings & Diagnostics)</h4>
                  </div>
                  <button
                    type="button"
                    onClick={checkTelegramStatus}
                    disabled={isCheckingTelegram}
                    className="px-2.5 py-1 text-[9px] bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded font-mono transition disabled:opacity-50"
                  >
                    {isCheckingTelegram ? '⌛ በመፈተሽ ላይ...' : '🔍 ግንኙነት ፈትን'}
                  </button>
                </div>

                {/* Settings Input Form */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-3">
                  <h5 className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">⚙️ የቦት ማስተካከያ (Bot Configuration)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-mono">TELEGRAM BOT TOKEN:</label>
                      <input
                        type="text"
                        value={telegramBotTokenInput}
                        onChange={(e) => setTelegramBotTokenInput(e.target.value)}
                        placeholder="e.g. 123456789:ABCdefGhI_klMnoPQRstUVwxYz"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-mono">TELEGRAM CHAT ID / ADMIN ID:</label>
                      <input
                        type="text"
                        value={telegramChatIdInput}
                        onChange={(e) => setTelegramChatIdInput(e.target.value)}
                        placeholder="e.g. 5830413620"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      {telegramSaveStatus ? (
                        <span className="text-emerald-400">{telegramSaveStatus}</span>
                      ) : (
                        <span>ማስታወሻ፦ ቦቱን መጀመሪያ @BotFather ላይ ያዝዙት።</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={saveTelegramSettings}
                      disabled={isCheckingTelegram}
                      className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded text-[10px] font-mono transition cursor-pointer disabled:opacity-50"
                    >
                      💾 ቅንብሮችን አስቀምጥ (Save Settings)
                    </button>
                  </div>
                </div>

                {telegramStatus ? (
                  <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-950 text-[11px] leading-relaxed font-sans">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-b border-slate-900/60 pb-2.5">
                      <div>
                        <span className="text-slate-500 block text-[9px]">BOT TOKEN CONFIG:</span>
                        <span className={telegramStatus.botTokenProvided ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {telegramStatus.botTokenProvided ? '✅ ተገኝቷል (Configured)' : '❌ አልተገኘም (Not Set)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">CHAT ID CONFIG:</span>
                        <span className={telegramStatus.chatIdProvided ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {telegramStatus.chatIdProvided ? '✅ ተገኝቷል (Configured)' : '❌ አልተገኘም (Not Set)'}
                        </span>
                      </div>
                    </div>

                    {telegramStatus.botInfo && (
                      <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900 text-slate-300 space-y-1">
                        <span className="font-bold text-[10px] block text-emerald-400 font-mono">🤖 ቦት መረጃ (Bot Profile)</span>
                        <div className="text-[11px] space-y-0.5">
                          <div>ስም: <strong className="text-white">{telegramStatus.botInfo.first_name}</strong></div>
                          <div className="font-mono text-2xs text-slate-400">username: @{telegramStatus.botInfo.username}</div>
                        </div>
                      </div>
                    )}

                    {telegramStatus.webhookInfo ? (
                      <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900 text-slate-300 space-y-1">
                        <span className="font-bold text-[10px] block text-emerald-400 font-mono">🔗 ዌብሁክ ሁኔታ (Webhook Setup)</span>
                        <div className="text-[11px] space-y-1">
                          <div className="font-mono text-[9px] text-slate-400 break-all">የተመዘገበው ዌብሁክ (Webhook URL)፦ <strong className="text-white">{telegramStatus.webhookInfo.url || 'None'}</strong></div>
                          <div>በመጠባበቅ ላይ ያሉ መላክያዎች (Pending updates)፦ <strong className="text-white">{telegramStatus.webhookInfo.pending_update_count}</strong></div>
                          {telegramStatus.webhookInfo.last_error_message && (
                            <div className="text-rose-400 text-[10px]">ስህተት (Error)፦ {telegramStatus.webhookInfo.last_error_message}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-400 font-mono">⚠️ ዌብሁክ አልተመዘገበም።</div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 font-mono">የቦት ሁኔታ መፈተሻ...</div>
                )}
              </div>
            )}

            {/* PRIVACY & DATA PROTECTION ADMIN DASHBOARD ENTRY & PANEL (የፕራይቬሲና ውሂብ ጥበቃ አድሚን ክፍል) */}
            {isAdminAuthenticated && (
              <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900/50 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-100">
                      {t.privacyDashboard} (Privacy & Data Governance)
                    </h4>
                  </div>
                  {isPrivacyAdminAuthenticated && (
                    <button
                      type="button"
                      onClick={() => setIsPrivacyAdminAuthenticated(false)}
                      className="px-2 py-1 text-[9px] bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 rounded font-mono transition cursor-pointer"
                    >
                      🔐 Lock Dashboard
                    </button>
                  )}
                </div>

                {/* Status or Success alerts */}
                {privacyStatus && (
                  <div className="bg-amber-400/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl text-xs font-mono">
                    ⚠️ {privacyStatus}
                  </div>
                )}

                {/* Gated Login Form if not logged into Privacy Area */}
                {!isPrivacyAdminAuthenticated ? (
                  <form onSubmit={handleVerifyPrivacyPin} className="space-y-3 p-4 bg-slate-950/40 rounded-xl border border-slate-900">
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest font-mono">🔑 {t.privacyGateTitle}</h5>
                      <p className="text-[10px] text-slate-400 leading-normal">{t.privacyGateDesc}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="password"
                        required
                        value={privacyPinInput}
                        onChange={(e) => setPrivacyPinInput(e.target.value)}
                        placeholder="Privacy PIN... (Sample PIN: privacy99)"
                        className="flex-grow bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition cursor-pointer font-mono"
                      >
                        Unlock Entry
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Authenticated Privacy Controls */
                  <div className="space-y-5">
                    {/* Toggle Masking Settings */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-3">
                      <h5 className="text-[10px] uppercase font-mono tracking-wider text-amber-500 font-bold">🛡️ Dynamic Privacy Policy Toggles</h5>
                      
                      <div className="flex items-center justify-between gap-4 p-3 bg-slate-900/30 rounded border border-slate-900">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-slate-200 block">{t.maskEmailsToggle}</span>
                          <p className="text-[9px] text-slate-400">Protects commenter emails by converting 'email@domain.com' to 'em***@domain.com' across lists.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => savePrivacySettings(!maskEmailsActive)}
                          disabled={privacyLoading}
                          className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${maskEmailsActive ? 'bg-amber-500' : 'bg-slate-800'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-transform ${maskEmailsActive ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Purge Compliance list */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-3">
                      <h5 className="text-[10px] uppercase font-mono tracking-wider text-rose-500 font-bold">☠️ GDPR User Erasure & Account Purging Desk</h5>
                      <p className="text-[9px] text-slate-400">Select any registered member below to clear their entire profile, private proposals, and comment records from system logs completely.</p>
                      
                      {privacyLoading && privacyUsers.length === 0 ? (
                        <div className="text-center py-4 text-xs font-mono text-slate-500 animate-pulse">Loading member database...</div>
                      ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin pr-1">
                          {privacyUsers.filter(u => !u.isAdmin).map((user) => (
                            <div key={user.userId} className="p-2.5 bg-slate-950 rounded border border-slate-900 flex items-center justify-between gap-2">
                              <div className="text-[11px] leading-snug">
                                <span className="font-bold text-slate-200 block">{user.name}</span>
                                <span className="font-mono text-[10px] text-slate-400">{user.email} &bull; {user.phone}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleEraseUserData(user.email)}
                                disabled={privacyLoading}
                                className="px-2 py-1 text-[9px] bg-rose-600/10 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/20 rounded font-mono transition cursor-pointer"
                              >
                                {t.eraseUserData}
                              </button>
                            </div>
                          ))}
                          {privacyUsers.filter(u => !u.isAdmin).length === 0 && (
                            <div className="text-center py-2 text-slate-500 text-[10px] font-mono">No registered public members to show.</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Database export compliant */}
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-905 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs leading-relaxed">
                      <div>
                        <span className="font-bold text-slate-200 block">📊 Regulatory Data Portability Backup</span>
                        <p className="text-[9px] text-slate-400">Export the entire live JSON database store instantly to verify structures offline for security governance.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportDatabase}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold text-[10px] rounded transition cursor-pointer self-stretch sm:self-auto text-center"
                      >
                        📥 Export DB (JSON Backup)
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        )}
          </div>
        )}
      </main>

            {/* FLOATABLE TELEGRAM HELP DESK CHAT TRIGGER */}
            <div className="fixed bottom-6 right-6 z-50">
              <AnimatePresence>
                {chatbotActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    className="bg-slate-950 border-2 border-slate-850 rounded-2xl shadow-2xl w-[330px] sm:w-[380px] h-[440px] flex flex-col overflow-hidden mb-3.5 backdrop-blur-lg"
                  >
                    {/* Header chatbot */}
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-3.5 flex items-center justify-between text-slate-950">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 animate-pulse" />
                        <div>
                          <h4 className="text-xs font-bold leading-none font-sans uppercase">የአድሚን ድጋፍ ሰጪ ቦት (Telegram Support)</h4>
                          <span className="text-[8px] font-mono tracking-widest uppercase block mt-1 font-semibold">Direct Helpdesk System</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setChatbotActive(false)}
                          className="text-slate-900 hover:text-white font-mono font-bold text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="flex-grow flex flex-col justify-between overflow-hidden bg-slate-950 text-xs">
                      {/* Message History list */}
                      <div className="flex-grow p-3 overflow-y-auto space-y-3.5 scrollbar-thin bg-slate-950/90">
                        <div className="bg-emerald-400/5 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-xl text-[10px] leading-relaxed">
                          💡 ጥያቄዎን እዚህ ሲልኩ ለአድሚን በቴሌግራም ቦት በቀጥታ ይደርሳል። አድሚኑ ሲመልስልዎትም እዚሁ ያገኙታል!
                        </div>

                        {supportQuestionsMessage && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-2 rounded-xl text-[10px] text-center font-mono">
                            {supportQuestionsMessage}
                          </div>
                        )}

                        {supportQuestionsLoading && (
                          <div className="text-center text-[10px] text-slate-500 font-mono animate-pulse py-4">
                            መረጃዎችን በመጫን ላይ ነው...
                          </div>
                        )}

                        {!supportQuestionsLoading && supportQuestions.length === 0 && (
                          <div className="text-center text-[10.5px] text-slate-600 py-8 font-mono flex flex-col items-center justify-center">
                            <span>ምንም የተጠየቀ ጥያቄ የለም።</span>
                            <span>ለመጀመሪያ ጊዜ ጥያቄዎን ይጠይቁ!</span>
                          </div>
                        )}

                        {!supportQuestionsLoading && supportQuestions.map((q) => (
                          <div key={q.id} className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl space-y-1.5 hover:border-slate-800 transition">
                            <div className="flex items-center justify-between text-[9.5px]">
                              <span className="font-bold text-slate-200">{q.name}</span>
                              <span className="text-slate-500 font-mono">
                                {new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{q.text}</p>
                            
                            {q.isAnswered ? (
                              <div className="mt-2 p-2 bg-emerald-950/40 border-l-2 border-emerald-500 rounded text-[10px] text-emerald-300">
                                <span className="font-bold text-emerald-400 text-[9px] block mb-0.5 font-mono">✍️ የአድሚኑ ምላሽ (Reply):</span>
                                <p className="italic text-[10.5px] text-slate-200">{q.adminReply}</p>
                              </div>
                            ) : (
                              <div className="mt-1 flex items-center gap-1.5 text-[9px] text-amber-500 font-mono font-bold animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>⏳ ምላሽ በመጠባበቅ ላይ...</span>
                              </div>
                            )}

                            {/* Admin inline quick reply */}
                            {(currentUser?.isAdmin || isAdminAuthenticated) && !q.isAnswered && (
                              <div className="mt-2.5 pt-2 border-t border-slate-850 flex gap-1.5">
                                <input
                                  type="text"
                                  value={adminReplyText[q.id] || ''}
                                  onChange={(e) => setAdminReplyText({ ...adminReplyText, [q.id]: e.target.value })}
                                  placeholder="የእርስዎ ምላሽ እዚህ ይፃፉ..."
                                  className="flex-grow bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAdminReplyQuestion(q.id)}
                                  className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold font-mono text-[10px] rounded cursor-pointer"
                                >
                                  ላክ (Reply)
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Guest or client input form */}
                      <form onSubmit={handleSendQuestion} className="p-3 bg-slate-900 border-t border-slate-850 space-y-2">
                        {!currentUser && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={supportQuestionName}
                              onChange={(e) => setSupportQuestionName(e.target.value)}
                              placeholder="ሙሉ ስም *"
                              className="bg-slate-950 border border-slate-800 rounded bg-slate-950/80 text-[10px] px-2.5 py-1.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-emerald-500"
                            />
                            <input
                              type="text"
                              required
                              value={supportQuestionEmail}
                              onChange={(e) => setSupportQuestionEmail(e.target.value)}
                              placeholder="ቴሌግራም @username / ስልክ *"
                              className="bg-slate-950 border border-slate-800 rounded bg-slate-950/80 text-[10px] px-2.5 py-1.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={supportQuestionText}
                            onChange={(e) => setSupportQuestionText(e.target.value)}
                            placeholder="ለቦቱ ምን ጥያቄ መጠየቅ ይፈልጋሉ?"
                            className="flex-grow bg-slate-950 border border-slate-800 rounded-xl text-[11px] px-3 py-2 text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="submit"
                            disabled={supportQuestionsLoading || !supportQuestionText.trim()}
                            className="px-3 bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl transition duration-150 cursor-pointer text-xs font-bold font-mono"
                          >
                            ላክ
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating trigger button with Message icon */}
              <button
                onClick={() => setChatbotActive(!chatbotActive)}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-cyan-500 to-teal-600 p-0.5 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 duration-200 transition cursor-pointer relative"
              >
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </button>
            </div>

      {/* MY PROFILE POPUP MODAL (የእኔ መገለጫ ማሳያ) */}
      {isProfileModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in animate-duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            {/* Header banner glow */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500" />
            
            <div className="p-6 space-y-5">
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
                    {lang === 'am' ? 'የእኔ መገለጫ (My Profile)' : 'My Trading Profile'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition font-mono text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* User Bio and ID badge */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/10">
                    {currentUser.name && currentUser.name[0] ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-100 leading-snug">{currentUser.name || 'Anonymous User'}</h4>
                    <span className="text-[10px] font-mono text-emerald-400">ID: {currentUser.userId || 'TRD-MEMBER'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-900">
                  <div className="space-y-0.5">
                    <span className="text-slate-550 block font-mono">EMAIL:</span>
                    <span className="text-slate-300 font-bold truncate block">{currentUser.email}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-550 block font-mono">PHONE:</span>
                    <span className="text-slate-300 font-bold block">{currentUser.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Liked Research papers list */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block font-bold">
                  ❤️ {lang === 'am' ? 'እርስዎ ላይክ ያደረጓቸው ጥናቶች' : 'Liked Research Topics'}
                </span>
                
                <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-3 max-h-48 overflow-y-auto scrollbar-thin space-y-2">
                  {papers.filter(paper => paper.likedBy?.includes(currentUser.email)).length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-[11px] font-mono leading-relaxed">
                      {lang === 'am' 
                        ? 'እስካሁን ምንም ጥናቶች ላይክ አላደረጉም :(' 
                        : 'No liked research topics yet. Start reviewing papers!'}
                    </div>
                  ) : (
                    papers.filter(paper => paper.likedBy?.includes(currentUser.email)).map((paper) => (
                      <div 
                        key={paper.id}
                        onClick={() => {
                          setSelectedPaper(paper);
                          setIsProfileModalOpen(false);
                          setActiveTab('home');
                          setTimeout(() => {
                            const detailBox = document.getElementById('paper-deep-detail');
                            if (detailBox) detailBox.scrollIntoView({ behavior: 'smooth' });
                          }, 250);
                        }}
                        className="p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-lg flex items-center justify-between gap-3 text-left transition cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-slate-200 line-clamp-1 group-hover:text-emerald-400 transition">
                            {paper.title}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                            {lang === 'am' ? 'አቅራቢ፦' : 'By'} {paper.authors}
                          </span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1 shrink-0">
                          ❤️ {paper.likes}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action utilities */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentUser.userId || "TRD-MEMBER");
                    alert(lang === 'am' ? 'ማንነት መለያ ቁጥርዎ ተኮፒቷል!' : 'Your Member ID was copied!');
                  }}
                  className="flex-1 py-1.5 text-center text-[10px] uppercase font-mono font-bold bg-slate-800 hover:bg-slate-705 text-slate-200 border border-slate-700 rounded-xl transition cursor-pointer"
                >
                  📋 Copy ID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setIsProfileModalOpen(false);
                  }}
                  className="px-4 py-1.5 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-450 text-[10px] font-bold uppercase font-mono rounded-xl transition cursor-pointer"
                >
                  {lang === 'am' ? 'ውጣ' : 'Logout'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 p-6 mt-12 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-550 font-mono text-slate-500">
          <div>
            <span>© 2026 የትሬዲንግ ስነ-ልቦና ምርምር መድረክ (Trading Psychology Sandbox).</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://t.me/tradingpsychologyresearchbot" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">ቴሌግራም አድሚን</a>
            <span>|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sandbox Status: Nominal (የዳታቤዝ ግንኙነት በጥሩ ሁኔታ ላይ ነው)</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
