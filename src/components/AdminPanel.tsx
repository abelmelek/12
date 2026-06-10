import React, { useState, FormEvent } from 'react';
import { ShieldCheck, Lock, Trash2, Edit, Sliders } from 'lucide-react';

interface AdminPanelProps {
  papers: any[];
  proposals: any[];
  privacyGateUnlocked: boolean;
  setPrivacyGateUnlocked: (v: boolean) => void;
  privacyPin: string; setPrivacyPin: (v: string) => void;
  privacyError: string | null;
  handleUnlockPrivacyGate: (e: FormEvent) => void;
  maskEmailsInPublic: boolean;
  setMaskEmailsInPublic: (v: boolean) => void;
  purgeTargetEmail: string; setPurgeTargetEmail: (v: string) => void;
  handlePurgeUserData: (e: FormEvent) => void;
  purgeResult: string | null;
  handleDeletePaper: (id: string) => void;
  handleLoadProposalToForm: (p: any) => void;
  lang: 'am' | 'en';
  translations: any;
}

export default function AdminPanel({
  papers, proposals, privacyGateUnlocked, setPrivacyGateUnlocked, privacyPin, setPrivacyPin,
  privacyError, handleUnlockPrivacyGate, maskEmailsInPublic, setMaskEmailsInPublic,
  purgeTargetEmail, setPurgeTargetEmail, handlePurgeUserData, purgeResult, handleDeletePaper,
  handleLoadProposalToForm, lang, translations
}: AdminPanelProps) {
  
  return (
    <div className="max-w-5xl mx-auto px-4 space-y-8">
      {/* PRIVACY SYSTEM GATE */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
          <ShieldCheck className="text-teal-400 w-5 h-5" />
          <h3 className="text-md font-bold">{translations[lang].privacyDashboard}</h3>
        </div>

        {!privacyGateUnlocked ? (
          <form onSubmit={handleUnlockPrivacyGate} className="space-y-3 max-w-sm mx-auto text-center py-4">
            <Lock className="w-8 h-8 text-slate-600 mx-auto mb-1" />
            <p className="text-xs text-slate-400">{translations[lang].privacyGateDesc}</p>
            <input
              type="password"
              placeholder="Enter PIN (privacy99)"
              value={privacyPin}
              onChange={(e) => setPrivacyPin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-center text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
            />
            {privacyError && <p className="text-[10px] font-mono text-rose-400">{privacyError}</p>}
            <button type="submit" className="px-4 py-1.5 bg-teal-600 text-slate-950 font-bold font-mono text-xs uppercase rounded-lg hover:bg-teal-500 transition cursor-pointer">
              Verify Credentials
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Mask Checkbox */}
            <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-900">
              <input
                type="checkbox"
                id="maskCheck"
                checked={maskEmailsInPublic}
                onChange={(e) => setMaskEmailsInPublic(e.target.checked)}
                className="mt-0.5 rounded border-slate-800 bg-slate-950 text-teal-600 focus:ring-0"
              />
              <label htmlFor="maskCheck" className="text-xs text-slate-300 leading-tight select-none cursor-pointer">
                {translations[lang].maskEmailsToggle}
              </label>
            </div>

            {/* GDPR Purge */}
            <form onSubmit={handlePurgeUserData} className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-3">
              <span className="block text-xs font-mono text-rose-400 uppercase font-bold">⚠️ GDRP / Data Erasure Request</span>
              <p className="text-[11px] text-slate-400">{translations[lang].eraseUserData}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={purgeTargetEmail}
                  onChange={(e) => setPurgeTargetEmail(e.target.value)}
                  required
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                />
                <button type="submit" className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-200 text-xs font-mono rounded-lg transition cursor-pointer">
                  Purge Data
                </button>
              </div>
              {purgeResult && <p className="text-[10px] font-mono text-amber-400">{purgeResult}</p>}
            </form>
          </div>
        )}
      </div>

      {/* LIVE PAPERS MANAGEMENT */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-bold border-b border-slate-800 pb-2 mb-3">📁 {translations[lang].adminActiveTitle}</h3>
        <div className="space-y-2">
          {papers.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-900 rounded-xl text-xs">
              <span className="font-bold text-slate-200 truncate pr-4">{p.title}</span>
              <button onClick={() => handleDeletePaper(p.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 rounded-lg transition cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PROPOSALS LIST */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-bold border-b border-slate-800 pb-2 mb-3">📥 {translations[lang].submittedProposalsTitle}</h3>
        <div className="space-y-2">
          {proposals.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-2 font-mono">No student proposals pending inside DB.</p>
          ) : (
            proposals.map(p => (
              <div key={p.id} className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>By: {p.name} ({p.contact})</span>
                  <span>{p.timestamp}</span>
                </div>
                <h4 className="font-bold text-slate-200">{p.title}</h4>
                <p className="text-slate-400 text-[11px] leading-tight font-sans">{p.abstract}</p>
                <button onClick={() => handleLoadProposalToForm(p)} className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer">
                  {translations[lang].proposalPickBtn}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
