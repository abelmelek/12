import React, { FormEvent } from 'react';
import { ShieldCheck, Lock, Trash2, CheckCircle } from 'lucide-react';

interface AdminPanelProps {
  papers: any[];
  proposals: any[];
  privacyGateUnlocked: boolean;
  setPrivacyGateUnlocked: (v: boolean) => void;
  privacyPin: string;
  setPrivacyPin: (v: string) => void;
  privacyError: string | null;
  handleUnlockPrivacyGate: (e: FormEvent) => void;
  maskEmailsInPublic: boolean;
  setMaskEmailsInPublic: (v: boolean) => void;
  purgeTargetEmail: string;
  setPurgeTargetEmail: (v: string) => void;
  handlePurgeUserData: (e: FormEvent) => void;
  purgeResult: string | null;
  handleDeletePaper: (id: string) => void;
  handleLoadProposalToForm: (p: any) => void;
  lang: 'am' | 'en';
  translations: any;
}

export default function AdminPanel({
  papers, proposals, privacyGateUnlocked, privacyPin, setPrivacyPin,
  privacyError, handleUnlockPrivacyGate, maskEmailsInPublic, setMaskEmailsInPublic,
  purgeTargetEmail, setPurgeTargetEmail, handlePurgeUserData, purgeResult, handleDeletePaper,
  handleLoadProposalToForm, lang, translations
}: AdminPanelProps) {
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* SECURITY ACCESS CREDENTIAL LOCK */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
          <ShieldCheck className="text-teal-400 w-4 h-4" /> CyberSecurity Privacy Gateway
        </h3>

        {!privacyGateUnlocked ? (
          <form onSubmit={handleUnlockPrivacyGate} className="max-w-xs mx-auto text-center py-4 space-y-3">
            <Lock className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">ይህንን ክፍል ለመክፈት የአድሚን ፒን ኮድ (PIN) ያስገቡ።</p>
            <input
              type="password"
              placeholder="Enter PIN (Default: privacy99)"
              value={privacyPin}
              onChange={(e) => setPrivacyPin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-center text-xs font-mono"
            />
            {privacyError && <p className="text-[11px] font-mono text-rose-400">{privacyError}</p>}
            <button type="submit" className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold font-mono text-xs uppercase rounded-lg transition">Verify Secure Access</button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400 text-xs">
              <CheckCircle className="w-4 h-4" /> Secure Admin Credentials Authenticated Successfully.
            </div>

            {/* TOGGLE MASKING */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex items-center gap-2 text-xs">
              <input type="checkbox" id="maskCheck" checked={maskEmailsInPublic} onChange={(e) => setMaskEmailsInPublic(e.target.checked)} className="rounded bg-slate-900 border-slate-800 text-teal-500 focus:ring-0" />
              <label htmlFor="maskCheck" className="text-slate-300 cursor-pointer select-none">Mask Trader Email Identities In Public Viewports</label>
            </div>

            {/* GDPR ERASURE */}
            <form onSubmit={handlePurgeUserData} className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
              <span className="block text-xs font-mono text-rose-400 font-bold">⚠️ GDPR / Right to Be Forgotten Pipeline</span>
              <p className="text-[11px] text-slate-400">ማንኛውም ተጠቃሚ ሙሉ ዳታው ከሲስተሙ እንዲጠፋ ሲጠይቅ ኢሜይሉን እዚህ በማስገባት ማጥፋት ይቻላል።</p>
              <div className="flex gap-2">
                <input type="email" placeholder="user@example.com" value={purgeTargetEmail} onChange={(e) => setPurgeTargetEmail(e.target.value)} required className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono" />
                <button type="submit" className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono rounded-lg">Purge</button>
              </div>
              {purgeResult && <p className="text-[11px] font-mono text-amber-400">{purgeResult}</p>}
            </form>
          </div>
        )}
      </div>

      {/* ACTIVE LIBRARY LIST */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-bold border-b border-slate-800 pb-2 mb-3">📁 {translations[lang].adminActiveTitle || 'Active Database Papers'}</h3>
        <div className="space-y-2">
          {papers.map(p => (
            <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-900 rounded-xl text-xs">
              <span className="font-bold text-slate-300 truncate max-w-md">{p.title}</span>
              <button onClick={() => handleDeletePaper(p.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-slate-950 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* PROPOSALS */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-bold border-b border-slate-800 pb-2 mb-3">📥 {translations[lang].submittedProposalsTitle || 'Student System Proposals'}</h3>
        <div className="space-y-3">
          {proposals.length === 0 ? (
            <p className="text-xs text-slate-500 text-center font-mono py-2">No student submissions inside queue.</p>
          ) : (
            proposals.map(p => (
              <div key={p.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>By: {p.name} ({p.contact})</span>
                </div>
                <h4 className="font-bold text-slate-200">{p.title}</h4>
                <p className="text-slate-400 text-[11px] font-sans leading-tight">{p.abstract}</p>
                <button onClick={() => handleLoadProposalToForm(p)} className="text-[10px] text-emerald-400 hover:underline font-mono pt-1">Review Framework</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
