
import React, { useState, useRef, useEffect, useId } from 'react';
import { Message, AgentType } from '../types';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';

// Initialize mermaid with Atlas branding and optimized dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: 'Fira Code, monospace',
  themeVariables: {
    darkMode: true,
    background: 'transparent',
    mainBkg: '#0f172a',
    nodeBorder: '#334155',
    clusterBkg: '#1e293b',
    clusterBorder: '#475569',
    lineColor: '#64748b',
    fontFamily: 'Fira Code',
    fontSize: '12px',
    primaryColor: '#3b82f6',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#2563eb',
    secondaryColor: '#10b981',
    tertiaryColor: '#f59e0b',
    edgeLabelBackground: '#0f172a',
  }
});

interface MermaidProps {
  chart: string;
}

/**
 * Enhanced component to render Mermaid diagrams with zoom-to-fullscreen and pan support.
 */
const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const id = useId().replace(/:/g, ''); 

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      if (!chart.trim()) return;
      setIsLoading(true);
      try {
        // Using a unique ID per render to prevent conflicts
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${id}-${Math.random().toString(36).substr(2, 9)}`, chart);
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Mermaid rendering failed:', err);
          setError('Syntax error in architectural diagram.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    renderChart();
    return () => { isMounted = false; };
  }, [chart, id]);

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atlas-architecture-${id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-900/10 border border-red-500/20 rounded-xl flex items-start gap-3">
        <span className="text-lg">⚠️</span>
        <div>
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Rendering Error</p>
          <p className="text-xs text-red-500/80 mono break-all">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="group relative my-6">
        <div 
          className={`bg-slate-950/40 border border-slate-800/50 rounded-2xl p-6 cursor-zoom-in transition-all hover:border-blue-500/40 hover:bg-slate-950/60 overflow-hidden min-h-[100px] flex items-center justify-center ${isLoading ? 'animate-pulse' : ''}`}
          onClick={() => !isLoading && setIsZoomed(true)}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Synthesizing Chart...</span>
            </div>
          ) : (
            <div 
              className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto transition-opacity duration-500 opacity-100"
              dangerouslySetInnerHTML={{ __html: svg }} 
            />
          )}
        </div>
        
        {!isLoading && (
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); downloadSvg(); }}
              className="p-2 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
              title="Download SVG"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
            <button 
              onClick={() => setIsZoomed(true)}
              className="p-2 bg-blue-600/90 border border-blue-500 rounded-lg text-white hover:bg-blue-500 transition-all shadow-xl"
              title="Full Screen View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </button>
          </div>
        )}
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/98 backdrop-blur-2xl p-6 animate-in fade-in duration-300"
          onClick={() => setIsZoomed(false)}
        >
          <div className="absolute top-6 left-6 flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">🛰️</div>
             <div>
               <h4 className="text-sm font-bold text-white tracking-tight">Architectural Viewer</h4>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Atlas Code Intelligence</p>
             </div>
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); downloadSvg(); }}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export SVG
            </button>
            <button 
              className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-xl text-white text-xl hover:bg-slate-800 transition-colors"
              onClick={() => setIsZoomed(false)}
            >
              ×
            </button>
          </div>

          <div 
            className="w-full h-full flex items-center justify-center overflow-auto p-12 cursor-zoom-out [&>svg]:max-w-none [&>svg]:h-auto transition-transform duration-500"
            onClick={(e) => e.stopPropagation()}
            dangerouslySetInnerHTML={{ __html: svg.replace(/max-width:.*?;/, '') }} 
          />
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-full text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] backdrop-blur-md">
            Click background to exit • Scroll to Pan
          </div>
        </div>
      )}
    </>
  );
};

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  activeAgents: AgentType[];
  hasActiveFile: boolean;
  onOpenGenerator?: () => void;
}

/**
 * The primary chat interface component for interacting with the Atlas agents.
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isThinking, activeAgents, hasActiveFile, onOpenGenerator }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  /**
   * Handles the local input form submission and triggers the global message handler.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isThinking) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  /**
   * Utility function to copy code snippet content to the system clipboard.
   */
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-sm relative border-l border-slate-800">
      {/* Agents Status Header */}
      <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-4 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0 tracking-wider">Sequence:</span>
        <div className="flex gap-2 items-center">
          {Object.values(AgentType).map((agent, i) => {
            const isActive = activeAgents.includes(agent);
            return (
              <React.Fragment key={i}>
                <span 
                  className={`text-[9px] px-2 py-0.5 rounded border transition-all duration-300 whitespace-nowrap ${
                    isActive 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                    : 'bg-slate-800/20 border-slate-800 text-slate-600'
                  }`}
                >
                  {agent.split(' ')[0]}
                </span>
                {i < Object.values(AgentType).length - 1 && (
                   <span className="text-slate-700 text-[8px]">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-6 opacity-80">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-3xl animate-pulse">🛰️</div>
              <div className="absolute -inset-1 bg-blue-500/20 rounded-2xl blur-lg"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-200">Atlas Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                Specialist agents working in parallel to architect, generate, and optimize your repository.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-2 w-full px-4">
               <button 
                onClick={() => onSendMessage("Perform a deep architectural audit of the codebase structure. Identify layers, patterns, and data flows.")}
                className="group text-[10px] bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-lg text-left text-cyan-200 transition-all flex items-center gap-3"
               >
                 <span className="text-lg group-hover:scale-110 transition-transform">🔍</span>
                 <div>
                    <div className="font-bold">Architectural Deep Dive</div>
                    <div className="opacity-60 text-[9px]">Map layers, patterns, and data dependencies</div>
                 </div>
               </button>

               {hasActiveFile && (
                 <button 
                  onClick={() => onSendMessage("Suggest refactoring for the current file focusing on readability: improve variable names, simplify conditional logic (use guard clauses), identify methods to extract, and add descriptive comments.")}
                  className="group text-[10px] bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-left text-amber-200 transition-all flex items-center gap-3"
                 >
                   <span className="text-lg group-hover:scale-110 transition-transform">✨</span>
                   <div>
                     <div className="font-bold">Readability & Structural Audit</div>
                     <div className="opacity-60 text-[9px]">Names, Logic Simplification, and Extraction</div>
                   </div>
                 </button>
               )}
               
               <button 
                onClick={() => onOpenGenerator?.()}
                className="group text-[10px] bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-left text-green-200 transition-all flex items-center gap-3"
               >
                 <span className="text-lg group-hover:scale-110 transition-transform">🏗️</span>
                 <div>
                    <div className="font-bold">Generate Feature</div>
                    <div className="opacity-60 text-[9px]">Architectural code synthesis with Generator Agent</div>
                 </div>
               </button>
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[95%] rounded-xl p-4 shadow-sm ${
              m.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-slate-800/80 text-slate-100 border border-slate-700 rounded-tl-none'
            } transition-all duration-300`}>
              <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                <div className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold ${m.role === 'user' ? 'bg-blue-400' : 'bg-blue-600'}`}>
                  {m.role === 'user' ? 'U' : 'A'}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  {m.role === 'user' ? 'Operator' : (m.agent || 'Atlas')}
                </span>
                <div className="flex-1"></div>
                <span className="text-[9px] opacity-40 font-mono">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="prose prose-invert prose-xs max-w-none prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-code:text-blue-300 prose-headings:mb-2 prose-headings:mt-4 prose-p:leading-relaxed overflow-x-auto">
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeValue = String(children).replace(/\n$/, '');
                      
                      // Handle Mermaid Diagrams explicitly
                      if (match && (match[1] === 'mermaid' || match[1] === 'graph' || match[1] === 'flowchart')) {
                        return <Mermaid chart={codeValue} />;
                      }

                      return !inline ? (
                        <div className="relative group/code">
                          <button 
                            onClick={() => handleCopyCode(codeValue)}
                            className="absolute right-2 top-2 p-1 bg-slate-800 rounded opacity-0 group-hover/code:opacity-100 transition-opacity text-[8px] font-bold uppercase tracking-wider text-slate-400 hover:text-white"
                          >
                            Copy
                          </button>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </div>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono italic">
                {activeAgents.length > 1 ? `${activeAgents[activeAgents.length - 1]} is executing...` : 'Atlas agents are collaborating...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pt-10">
        <form onSubmit={handleSubmit} className="relative group max-w-xl mx-auto flex items-center gap-2">
          <button 
            type="button"
            onClick={onOpenGenerator}
            className="h-14 w-14 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-xl text-2xl hover:bg-green-600/10 hover:border-green-500/50 transition-all active:scale-95 shadow-xl group"
            title="Open Synthesis Panel"
          >
            <span className="group-hover:rotate-12 transition-transform">🏗️</span>
          </button>
          
          <div className="flex-1 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl h-14">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Command the agents..."
                className="flex-1 bg-transparent outline-none py-4 px-5 text-sm font-medium text-slate-200 placeholder:text-slate-600"
                disabled={isThinking}
              />
              <button 
                type="submit"
                disabled={isThinking || !input.trim()}
                className="mr-2 h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-800 text-white rounded-lg transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
