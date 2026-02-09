
import React, { useState } from 'react';

interface GithubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (repoUrl: string) => void;
  isIngesting: boolean;
}

/**
 * A modal component for capturing GitHub repository URLs and initiating the agent-led ingestion process.
 */
export const GithubImportModal: React.FC<GithubImportModalProps> = ({ isOpen, onClose, onImport, isIngesting }) => {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isIngesting) {
      onImport(url.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center text-2xl border border-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Connect Repository</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Remote Codebase Ingestion</p>
            </div>
          </div>

          {isIngesting ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🛰️</div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-200">Atlas Agents are scanning the repository...</p>
                <div className="flex gap-2 justify-center">
                   <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full animate-pulse">Explorer Active</span>
                   <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-500 rounded-full">Architect Pending</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Repository URL</label>
                <input
                  autoFocus
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-4">
                 <div className="text-xl">💡</div>
                 <p className="text-xs text-slate-400 leading-relaxed">
                   Atlas will index the repository structure, analyze common architectural patterns, and prepare the Explorer agent for deep-context queries.
                 </p>
              </div>
              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-widest"
                >
                  Analyze Repository
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
