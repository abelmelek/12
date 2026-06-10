import React, { ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { ThumbsUp, MessageSquare } from 'lucide-react';
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
  handleAddComment: (paperId: string, e: any) => void;
  maskEmail: (email: string) => string;
  lang: 'am' | 'en';
  translations: any;
  handleAudioFileChange: (e: ChangeEvent<HTMLInputElement>) => void; // ተጨምሯል
}

export default function ResearchDashboard({
  papers, searchQuery, setSearchQuery, expandedPaper, setExpandedPaper, handleLike,
  activeUser, comments, newCommentText, setNewCommentText, handleAddComment, maskEmail, lang,
  handleAudioFileChange
}: DashboardProps) {
  
  const filteredPapers = papers.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.abstract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* SEARCH BOX */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder={lang === 'am' ? 'የጥናት ርዕስ ወይም ቁልፍ ቃል ይፈልጉ...' : 'Search scientific papers...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2 px-4 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
        />
      </div>

      {/* GRID BOXES LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPapers.map((paper) => {
          const isExpanded = expandedPaper === paper.id;
          const paperComments = comments.filter(c => c.paperId === paper.id);

          return (
            <motion.div 
              key={paper.id} 
              layout 
              className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-sm transition shadow-lg"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="text-sm font-bold text-slate-100">{paper.title}</h3>
                  <button 
                    onClick={(e) => handleLike(paper.id, e)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400 hover:bg-slate-900 transition"
                  >
                    <ThumbsUp className="w-3 h-3" /> {paper.likes}
                  </button>
                </div>
                <span className="text-[10px] font-mono text-slate-500 block mb-3">🧑‍💻 Authors: {paper.authors}</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                  {paper.abstract}
                </p>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                    <div className="prose prose-invert prose-xs text-slate-300 max-w-none bg-slate-950/40 p-3 rounded-xl font-sans">
                      <ReactMarkdown>{paper.content}</ReactMarkdown>
                    </div>

                    {/* COMMENTS */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">User Discourse ({paperComments.length})</h4>
                      <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                        {paperComments.map(c => (
                          <div key={c.id} className="bg-slate-950 p-2 rounded-lg text-[11px]">
                            <span className="text-slate-500 font-mono block text-[9px]">{c.author} ({maskEmail(c.email)})</span>
                            <p className="text-slate-300 mt-0.5">{c.text}</p>
                          </div>
                        ))}
                      </div>
                      {activeUser ? (
                        <form onSubmit={(e) => handleAddComment(paper.id, e)} className="flex gap-2 pt-1">
                          <input type="text" placeholder="Write community feedback..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200" />
                          <button type="submit" className="px-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg">Send</button>
                        </form>
                      ) : (
                        <p className="text-[10px] text-amber-500 italic bg-amber-500/5 p-1.5 rounded-lg text-center">* Sign in to comment.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setExpandedPaper(isExpanded ? null : paper.id)}
                className="w-full mt-4 py-1.5 bg-slate-950 hover:bg-slate-950/50 border border-slate-900 rounded-xl text-[11px] font-mono text-slate-400 transition"
              >
                {isExpanded ? 'Collapse Abstract ↑' : 'Read Full Scientific Paper ↓'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
