
import React, { useState, useEffect } from 'react';

interface GithubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (repoUrl: string) => void;
  isIngesting: boolean;
}

/**
 * A modal component for capturing and validating GitHub repository URLs.
 * Features:
 * - Regex validation for public GitHub repository patterns.
 * - Real-time error feedback.
 * - Multi-stage ingestion progress visualization.
 */
export const GithubImportModal: React.FC<GithubImportModalProps> = ({ isOpen, onClose, onImport, isIngesting }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  // Effect to simulate progress steps during ingestion
  useEffect(() => {
    if (isIngesting) {
      const interval = setInterval(() => {
        setStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setStep(0);
    }
  }, [isIngesting]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setUrl('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Validates if the string is a valid GitHub repository URL.
   * Matches patterns like:
   * https://github.com/user/repo
   * github.com/user/repo
   */
  const validateGithubUrl = (input: string): boolean => {
    const pattern = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i;
    return pattern.test(input.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Repository URL is required.');
      return;
    }

    if (!validateGithubUrl(url)) {
      setError('Please enter a valid GitHub repository URL (e.g., github.com/user/repo).');
      return;
    }

    if (!isIngesting) {
      onImport(url.trim());
    }
  };

  const ingestionSteps = [
    "Explorer: Discovering file structure...",
    "Explorer: Indexing source tree...",
    "Architect: Analyzing project stack...",
    "Architect: Synthesizing architecture overview..."
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center text-2xl border border-blue-500/20 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-slate-100">Connect Repository</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Remote Codebase Ingestion</p>
            </div>
          </div>

          {isIngesting ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🛰️</div>
              </div>
              <div className="space-y-4 w-full">
                <p className="text-sm font-medium text-slate-200">Atlas Agents are collaborating...</p>
                <div className="space-y-2 max-w-xs mx-auto text-left">
                  {ingestionSteps.map((s, i) => (
                    <div key={i} className={`flex items-center gap-3 transition-opacity duration-300 ${i <= step ? 'opacity-100' : 'opacity-20'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${i < step ? 'bg-green-500' : i === step ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight leading-none">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="repo-url" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Repository URL
                </label>
                <div className="relative">
                  <input
                    id="repo-url"
                    autoFocus
                    type="text"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="https://github.com/username/project"
                    className={`w-full bg-slate-950 border ${error ? 'border-red-500/50' : 'border-slate-800'} rounded-xl px-5 py-4 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700`}
                    aria-invalid={!!error}
                    aria-describedby={error ? "url-error" : undefined}
                  />
                  {url && !error && validateGithubUrl(url) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in fade-in zoom-in">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>
                {error && (
                  <p id="url-error" className="text-[10px] font-bold text-red-400 mt-2 ml-1 flex items-center gap-1.5">
                    <span className="text-xs">⚠️</span> {error}
                  </p>
                )}
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-4">
                 <div className="text-xl shrink-0">💡</div>
                 <p className="text-xs text-slate-400 leading-relaxed">
                   Atlas will index the repository structure, analyze architectural patterns, and provide an initial overview using <strong>Gemini Agent Orchestration</strong>. Public repositories only.
                 </p>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!url.trim() || isIngesting}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-widest focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
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
