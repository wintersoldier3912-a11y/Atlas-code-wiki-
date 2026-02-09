
import React, { useState, useRef, useEffect } from 'react';
import { Message, AgentType } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  activeAgents: AgentType[];
  hasActiveFile: boolean;
}

/**
 * The primary chat interface component for interacting with the Atlas agents.
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isThinking, activeAgents, hasActiveFile }) => {
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
                onClick={() => onSendMessage("Generate a new service layer for handling complex data transformations with error recovery and logging.")}
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
        <form onSubmit={handleSubmit} className="relative group max-w-xl mx-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
          <div className="relative flex items-center bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
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
        </form>
      </div>
    </div>
  );
};
