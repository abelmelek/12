import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

interface SimulatorProps {
  startCapital: number;
  setStartCapital: (v: number) => void;
  winRate: number;
  setWinRate: (v: number) => void;
  riskReward: number;
  setRiskReward: (v: number) => void;
  numTradesSimulated: number;
  setNumTradesSimulated: (v: number) => void;
  simulationData: any[];
  isSimulating: boolean;
  runSimulatorTrajectory: () => void;
  simSummary: any;
  lang: 'am' | 'en';
  translations: any;
}

export default function DelayedGratificationSimulator({
  startCapital, setStartCapital, winRate, setWinRate, riskReward, setRiskReward,
  numTradesSimulated, setNumTradesSimulated, simulationData, isSimulating,
  runSimulatorTrajectory, simSummary, lang, translations
}: SimulatorProps) {
  
  // ---- አዲስ የኮምፓውንዲንግ ስቴቶች ----
  const [compInitial, setCompInitial] = useState<number>(startCapital || 100);
  const [compDailyRate, setCompDailyRate] = useState<number>(2);
  const [compDays, setCompDays] = useState<number>(30);

  // የኮምፓውንዲንግ ዳታ ስሌት (Memoized)
  const compoundChartData = useMemo(() => {
    const data = [];
    let currentBalance = compInitial;
    const rate = compDailyRate / 100;

    data.push({
      day: lang === 'am' ? 'ቀን 0' : 'Day 0',
      balance: compInitial,
      profit: 0
    });

    for (let i = 1; i <= compDays; i++) {
      const dailyProfit = currentBalance * rate;
      currentBalance += dailyProfit;
      
      data.push({
        day: lang === 'am' ? `ቀን ${i}` : `Day ${i}`,
        balance: parseFloat(currentBalance.toFixed(2)),
        profit: parseFloat((currentBalance - compInitial).toFixed(2))
      });
    }
    return data;
  }, [compInitial, compDailyRate, compDays, lang]);

  const finalAmount = compoundChartData[compoundChartData.length - 1]?.balance || compInitial;
  const netProfit = finalAmount - compInitial;

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      
      {/* ክፍል 1፡ ነባሩ የ 100 ትሬዶች የዲስፕሊን vs ችኩልነት ማነጻጸሪያ */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <Sparkles className="text-amber-400 w-5 h-5" />
          <h2 className="text-lg font-bold">
            {lang === 'am' ? 'የዲስፕሊን እና የስሜታዊነት ትሬዲንግ ማነጻጸሪያ ስሙሌተር' : 'Discipline vs Emotion Trading Simulator'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">{translations[lang].startCapitalLabel || 'Initial Capital'}</label>
            <input 
              type="number" 
              value={startCapital} 
              onChange={(e) => setStartCapital(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition font-mono text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Win Rate (%)</label>
            <input 
              type="number" 
              value={winRate} 
              onChange={(e) => setWinRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition font-mono text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Risk:Reward Ratio (1:X)</label>
            <input 
              type="number" 
              step="0.1" 
              value={riskReward} 
              onChange={(e) => setRiskReward(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition font-mono text-slate-100"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={runSimulatorTrajectory}
              disabled={isSimulating}
              className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? (lang === 'am' ? 'በማስላት ላይ...' : 'Simulating...') : (lang === 'am' ? 'ሲሙሌሽን አስጀምር' : 'Run Simulation')}
            </button>
          </div>
        </div>

        {/* SUMMARY TILES */}
        {simSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl">
              <span className="text-xs font-mono text-slate-400 block mb-1">📊 {lang === 'am' ? 'ባለ 2% ዲስፕሊን ውጤት' : 'Disciplined 2% Account'}</span>
              <div className="text-lg font-mono font-bold text-emerald-400">${simSummary.disciplinedFinal} <span className="text-xs font-normal text-slate-500">({simSummary.disciplinedStatus})</span></div>
            </div>
            <div className="bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-xl">
              <span className="text-xs font-mono text-slate-400 block mb-1">🚨 {lang === 'am' ? 'ባለ 15% የስሜታዊነት (Tilt) ውጤት' : 'Emotional 15% Over-Leverage'}</span>
              <div className="text-lg font-mono font-bold text-rose-400">${simSummary.emotionalFinal} <span className="text-xs font-normal text-slate-500">({simSummary.emotionalStatus})</span></div>
            </div>
          </div>
        )}

        {/* MONTE CARLO CHART */}
        <div className="h-64 w-full bg-slate-950 p-2 rounded-xl border border-slate-800/60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={simulationData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
              <XAxis dataKey="trade" stroke="#475569" fontSize={9} fontFamily="monospace" />
              <YAxis stroke="#475569" fontSize={9} fontFamily="monospace" />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
              <Line name={lang === 'am' ? "ዲስፕሊን (2% ሪስክ)" : "Disciplined (2% Risk)"} type="monotone" dataKey="disciplined" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line name={lang === 'am' ? "ችኩልነት (15% ሪስክ)" : "Emotional (15% Risk)"} type="monotone" dataKey="emotional" stroke="#f43f5e" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ክፍል 2፡ አዲሱ የዕለታዊ ኮምፓውንዲንግ ስሌት መስሪያ */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl"
      >
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <TrendingUp className="text-emerald-400 w-5 h-5" />
          <h2 className="text-lg font-bold">
            {lang === 'am' ? 'የዕለታዊ ኮምፓውንዲንግ ስሌት መስሪያ (Compound Growth)' : 'Daily Compounding Profit Calculator'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              {lang === 'am' ? 'መነሻ ካፒታል (Initial Balance $)' : 'Initial Balance ($)'}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="number"
                value={compInitial}
                onChange={(e) => setCompInitial(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition font-mono text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              {lang === 'am' ? 'የዕለታዊ ትርፍ ግብ (Daily Profit %)' : 'Daily Profit Goal (%)'}
            </label>
            <input
              type="number"
              step="0.1"
              value={compDailyRate}
              onChange={(e) => setCompDailyRate(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-emerald-500 transition font-mono text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              {lang === 'am' ? 'የቀናት ብዛት (Trading Days)' : 'Number of Days'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="number"
                value={compDays}
                onChange={(e) => setCompDays(Math.min(365, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition font-mono text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* COMPOUND STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-center">
            <span className="block text-xs text-slate-400 font-mono mb-1">
              {lang === 'am' ? 'የመጨረሻ የሂሳብ መጠን (Total Balance)' : 'Total Balance'}
            </span>
            <span className="text-xl font-bold text-emerald-400 font-mono">${finalAmount.toLocaleString()}</span>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl text-center">
            <span className="block text-xs text-slate-400 font-mono mb-1">
              {lang === 'am' ? 'የተጣራ ትርፍ (Net Profit)' : 'Net Profit'}
            </span>
            <span className="text-xl font-bold text-blue-400 font-mono">${netProfit.toLocaleString()}</span>
          </div>
        </div>

        {/* COMPOUND CHART */}
        <div className="h-64 w-full bg-slate-950 p-2 rounded-xl border border-slate-800/60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={compoundChartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
              <XAxis dataKey="day" stroke="#475569" fontSize={9} fontFamily="monospace" />
              <YAxis stroke="#475569" fontSize={9} fontFamily="monospace" />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} />
              <Area
                name={lang === 'am' ? "የአካውንት ዕድገት ($)" : "Account Balance ($)"}
                type="monotone"
                dataKey="balance"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
