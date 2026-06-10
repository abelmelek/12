import React, { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend } from 'recharts';
import { FileText, ThumbsUp, MessageSquare, Send, Brain, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  papers: any[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  expandedPaper: string | null;
  setExpandedPaper: (v: string | null) => void;
  handleLike: (id: string, e: any) => void;
  activeUser: any;
  comments: any[];
  newCommentText: string;
  setNewCommentText: (v: string) => void;
  handleAddComment: (paperId: string, e: FormEvent) => void;
  maskEmail: (email: string) => string;
  lang: 'am' | 'en';
  translations: any;
  // Proposal States
  propName: string; setPropName: (v: string) => void;
  propContact: string; setPropContact: (v: string) => void;
  propTitle: string; setPropTitle: (v: string) => void;
  propAbstract: string; setPropAbstract: (v: string) => void;
  handleSubmitProposal: (e: FormEvent) => void;
  proposalSuccess: string | null;
}

export default function ResearchDashboard({
  papers, searchQuery, setSearchQuery, expandedPaper, setExpandedPaper, handleLike,
  activeUser, comments, newCommentText, setNewCommentText, handleAddComment, maskEmail,
  lang, translations, propName, setPropName, propContact, setPropContact, propTitle,
  setPropTitle, propAbstract, setPropAbstract, handleSubmitProposal, proposalSuccess
}: DashboardProps) {
  
  const filteredPapers = papers.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.abstract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
      {/* የጥናት ቦርድ ዝርዝር (ግራ ጎን - 2 ኮለምን) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder={lang === 'am' ? 'ጥናቶችን እዚህ ይፈልጉ...' : 'Search research papers...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
          />
        </div>

        {filteredPapers.map((paper) => {
          const isExpanded = expandedPaper === paper.id;
          const paperComments = comments.filter(c => c.paperId === paper.id);

          return (
            <motion.div key={paper.id} layout className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-1">{paper.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mb-2">🧑‍💻 {paper.authors}</p>
                </div>
                <button 
                  onClick={(e) => handleLike(paper.id, e)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 hover:bg-slate-900 transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> {paper.likes}
                </button>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-900 my-3 font-sans">
                {paper.abstract}
              </p>

              {/* EXPANDABLE SECTION */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-slate-800/60 mt-4 pt-4">
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                      <ReactMarkdown>{paper.content}</ReactMarkdown>
                    </div>

                    {/* CHART IF AVAILABLE */}
                    {paper.chartData && paper.chartData.length > 0 && (
                      <div className="h-56 w-full bg-slate-950 p-2 rounded-xl border border-slate-900 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={paper.chartData} margin={{ left: -20, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#121a2e" />
                            <XAxis dataKey={paper.id === 'small-accounts-survival' ? 'month' : 'trade'} stroke="#475569" fontSize={9} />
                            <YAxis stroke="#475569" fontSize={9} />
                            <ChartTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            {paper.id === 'small-accounts-survival' ? (
                              <>
                                <Line name="Patient ($)" type="monotone" dataKey="patient" stroke="#10b981" strokeWidth={2} />
                                <Line name="Impatient ($)" type="monotone" dataKey="impatient" stroke="#f43f5e" strokeWidth={1.5} />
                              </>
                            ) : (
                              <Line name="Account ($)" type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* COMMENTS SECTION */}
                    <div className="mt-4 border-t border-slate-900 pt-4">
                      <h4 className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Comments ({paperComments.length})
                      </h4>
                      <div className="space-y-2.5 max-h-48 overflow-y-auto mb-4 pr-1">
                        {paperComments.map((c) => (
                          <div key={c.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-xs">
                            <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                              <span className="text-slate-400 font-bold">{c.author} ({maskEmail(c.email)})</span>
                              <span>{c.timestamp}</span>
                            </div>
                            <p className="text-slate-300 font-sans">{c.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* ADD COMMENT FORM */}
                      {activeUser ? (
                        <form onSubmit={(e) => handleAddComment(paper.id, e)} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="ይህንን ጥናት በተመለከተ ሀሳብዎን ይፃፉ..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                          />
                          <button type="submit" className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition cursor-pointer">
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <p className="text-[11px] font-mono text-amber-500/80 text-center bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
                          * አስተያየት ለመስጠት እባክዎ መጀመሪያ በነጻ አካውንት ይግቡ።
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setExpandedPaper(isExpanded ? null : paper.id)}
                className="w-full mt-2 py-1.5 bg-slate-950/80 hover:bg-slate-950 border border-slate-900 rounded-xl text-xs font-mono text-slate-400 transition cursor-pointer flex items-center justify-center gap-1"
              >
                {isExpanded ? (lang === 'am' ? 'ጥናቱን ዝጋ ↑' : 'Collapse Document') : (lang === 'am' ? 'ሙሉ ጥናቱን አንብብ ↓' : 'Read Full Research')}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ጥናት ማቅረቢያ ፎርም (ቀኝ ጎን - 1 ኮለምን) */}
      <div className="space-y-6">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
            <Brain className="text-indigo-400 w-4 h-4" />
            <h3 className="text-md font-bold">{translations[lang].submitProposal}</h3>
          </div>
          
          <form onSubmit={handleSubmitProposal} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-0.5">የአመልካች ስም *</label>
              <input type="text" value={propName} onChange={(e) => setPropName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-0.5">የመገናኛ አድራሻ (ኢሜይል/ስልክ) *</label>
              <input type="text" value={propContact} onChange={(e) => setPropContact(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-0.5">የጥናቱ ርዕስ *</label>
              <input type="text" value={propTitle} onChange={(e) => setPropTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-0.5">የጥናቱ አጭር ማጠቃለያ (Abstract) *</label>
              <textarea value={propAbstract} onChange={(e) => setPropAbstract(e.target.value)} rows={4} required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-mono uppercase rounded-lg transition cursor-pointer">
              {translations[lang].paperPublishBtn || 'Submit Proposal'}
            </button>
          </form>

          {proposalSuccess && (
            <p className="mt-3 text-[10px] font-mono text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 text-center">
              {proposalSuccess}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
