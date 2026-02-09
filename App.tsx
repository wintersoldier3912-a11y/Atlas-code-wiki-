
import React, { useState, useCallback } from 'react';
import { AppState, Message, AgentType, FileNode } from './types';
import { MOCK_REPO } from './constants';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { GithubImportModal } from './components/GithubImportModal';
import { generateAtlasResponseStream, analyzeGithubRepo } from './services/geminiService';

/**
 * Maps a natural language user query to a sequence of specialized agents.
 */
const getAgentWorkflow = (query: string): AgentType[] => {
  const normalizedQuery = query.toLowerCase();
  
  const workflowDefinitions: Record<string, AgentType[]> = {
    generate: [AgentType.ARCHITECT, AgentType.GENERATOR, AgentType.SECURITY],
    create: [AgentType.ARCHITECT, AgentType.GENERATOR, AgentType.SECURITY],
    write: [AgentType.ARCHITECT, AgentType.GENERATOR, AgentType.SECURITY],
    build: [AgentType.ARCHITECT, AgentType.GENERATOR, AgentType.SECURITY],
    implement: [AgentType.ARCHITECT, AgentType.GENERATOR, AgentType.SECURITY],
    setup: [AgentType.ARCHITECT, AgentType.GENERATOR, AgentType.SECURITY],
    refactor: [AgentType.REFACTORER, AgentType.ARCHITECT],
    optimize: [AgentType.REFACTORER, AgentType.ARCHITECT],
    improve: [AgentType.REFACTORER, AgentType.ARCHITECT],
    readability: [AgentType.REFACTORER, AgentType.ARCHITECT],
    explain: [AgentType.EXPLAINER],
    impact: [AgentType.CHANGE_IMPACT, AgentType.SECURITY, AgentType.ARCHITECT],
    change: [AgentType.CHANGE_IMPACT, AgentType.SECURITY, AgentType.ARCHITECT],
    architecture: [AgentType.EXPLORER, AgentType.ARCHITECT, AgentType.EXPLAINER],
    structure: [AgentType.EXPLORER, AgentType.ARCHITECT, AgentType.EXPLAINER],
    overview: [AgentType.EXPLORER, AgentType.ARCHITECT, AgentType.EXPLAINER],
    audit: [AgentType.EXPLORER, AgentType.ARCHITECT, AgentType.SECURITY, AgentType.EXPLAINER],
  };

  for (const [trigger, agents] of Object.entries(workflowDefinitions)) {
    if (normalizedQuery.includes(trigger)) return agents;
  }
  
  return [AgentType.EXPLORER];
};

/**
 * The main application component for the Atlas Code Wiki.
 */
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    messages: [],
    isThinking: false,
    activeAgents: [],
    currentFile: null,
    repoStructure: MOCK_REPO
  });

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorInput, setGeneratorInput] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  /**
   * Orchestrates the multi-agent response flow by processing user input.
   */
  const handleSendMessage = useCallback(async (userInput: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: Date.now()
    };

    const workflow = getAgentWorkflow(userInput);

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isThinking: true,
      activeAgents: [AgentType.ATLAS]
    }));

    workflow.forEach((agent, index) => {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          activeAgents: Array.from(new Set([...prev.activeAgents, agent]))
        }));
      }, (index + 1) * 600);
    });

    const assistantId = (Date.now() + 1).toString();
    const assistantPlaceholder: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      agent: AgentType.ATLAS
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, assistantPlaceholder]
    }));

    const contextHeader = state.currentFile 
      ? `Active File Context: ${state.currentFile.path}\nContent:\n${state.currentFile.content}\n\n`
      : "";
    
    // Provide general repo structure context for architecture queries
    const repoContext = userInput.toLowerCase().match(/architecture|structure|overview|audit/)
      ? `Full Project Structure:\n${JSON.stringify(state.repoStructure, (k, v) => k === 'content' ? undefined : v, 2)}\n\n`
      : "";

    const conversationHistory = state.messages
      .filter(m => m.content)
      .map(m => ({ role: m.role, content: m.content }));

    let streamedContent = "";
    
    await generateAtlasResponseStream(
      `${repoContext}${contextHeader}Query: ${userInput}`, 
      conversationHistory, 
      (chunk) => {
        streamedContent += chunk;
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m => 
            m.id === assistantId ? { ...m, content: streamedContent } : m
          )
        }));
      }
    );

    setState(prev => ({
      ...prev,
      isThinking: false,
      activeAgents: []
    }));
  }, [state.messages, state.currentFile, state.repoStructure]);

  /**
   * Handles the ingestion of a remote repository.
   * Leverages Gemini to analyze the repository structure and architecture.
   */
  const handleImportRepo = async (url: string) => {
    setIsIngesting(true);
    
    try {
      const analysis = await analyzeGithubRepo(url);
      
      const newRepoNode: FileNode = {
        name: analysis.repoName || url.split('/').pop(),
        path: url,
        type: 'directory',
        children: analysis.structure.map((item: any) => ({
          name: item.name,
          path: item.path,
          type: item.type as 'file' | 'directory',
          children: item.children?.map((child: any) => ({
            name: child.name,
            path: child.path,
            type: child.type as 'file' | 'directory',
            content: child.type === 'file' ? `// Discovered remote file: ${child.name}\n// Use Atlas agents to explain or generate content.` : undefined
          }))
        }))
      };

      const architectSummary = `### 🛰️ Repository Ingested: ${analysis.repoName}\n\n${analysis.summary}\n\n**Stack Identified:**\n${analysis.stack.map((s: string) => `- ${s}`).join('\n')}\n\n**Explorer Insights:**\nAtlas has identified the key entry points and mapped the first two levels of the repository structure. You can now explore the files in the sidebar and ask for specific module analysis.`;

      setState(prev => ({
        ...prev,
        repoStructure: [...prev.repoStructure, newRepoNode],
        messages: [...prev.messages, {
          id: Date.now().toString(),
          role: 'assistant',
          agent: AgentType.ARCHITECT,
          timestamp: Date.now(),
          content: architectSummary
        }]
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: Date.now().toString(),
          role: 'assistant',
          agent: AgentType.ATLAS,
          timestamp: Date.now(),
          content: `❌ **Ingestion Failed:** Could not analyze repository at ${url}. Please ensure the URL is valid and public.`
        }]
      }));
    } finally {
      setIsIngesting(false);
      setIsImportModalOpen(false);
    }
  };

  const handleFileSelect = (file: FileNode) => setState(prev => ({ ...prev, currentFile: file }));

  const triggerRefactor = () => {
    if (state.currentFile && !state.isThinking) {
      handleSendMessage(`Refactor \`${state.currentFile.path}\` for readability and structure. focusing on readability: improve variable names, simplify conditional logic (use guard clauses), identify methods to extract, and add descriptive comments.`);
    }
  };

  const handleGeneratorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (generatorInput.trim()) {
      handleSendMessage(`Generator Agent Request: ${generatorInput}. Please generate a robust implementation following architectural patterns, including comprehensive docstrings, strict type safety, and clear integration steps.`);
      setGeneratorInput("");
      setIsGeneratorOpen(false);
    }
  };

  const handleProjectOverview = () => {
    handleSendMessage("Perform a deep architectural audit of the current project structure. Identify primary layers, design patterns, and critical data flow paths.");
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
      <Sidebar 
        structure={state.repoStructure} 
        onFileSelect={handleFileSelect} 
        onOpenImport={() => setIsImportModalOpen(true)}
        onProjectOverview={handleProjectOverview}
        isIngesting={isIngesting}
      />
      
      <GithubImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRepo}
        isIngesting={isIngesting}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#0f172a] selection:bg-blue-500/30">
        <div className="flex-1 flex overflow-hidden relative">
          {/* Generator Overlay */}
          {isGeneratorOpen && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
              <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-green-900/20">🏗️</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">Generator Agent</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Synthesis Engine</p>
                  </div>
                </div>
                <form onSubmit={handleGeneratorSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Synthesis Instructions</label>
                    <textarea
                      autoFocus
                      value={generatorInput}
                      onChange={(e) => setGeneratorInput(e.target.value)}
                      placeholder="Describe the module, function, or service you need Atlas to build..."
                      className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all resize-none shadow-inner"
                    />
                  </div>
                  <div className="flex items-center gap-4 bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                    <span className="text-xl shrink-0">✨</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Atlas will apply architectural patterns, strict type safety, and provide a full integration guide for this module.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsGeneratorOpen(false)} className="px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest">Discard</button>
                    <button type="submit" disabled={!generatorInput.trim()} className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black transition-all shadow-xl shadow-green-900/20 active:scale-95 uppercase tracking-widest">Synthesize Code</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col border-r border-slate-800/50 relative">
            <header className="h-14 bg-slate-950/50 border-b border-slate-800 flex items-center px-6 justify-between shrink-0">
              <nav className="flex gap-6 h-full items-center">
                <button className="text-[10px] font-black border-b-2 border-blue-500 h-full px-1 text-slate-200 uppercase tracking-widest">Editor</button>
                <button className="text-[10px] font-black text-slate-500 hover:text-slate-300 transition-colors h-full px-1 uppercase tracking-widest">Analysis</button>
              </nav>
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setIsGeneratorOpen(true)}
                   className="px-4 py-1.5 bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                 >
                  <span className="text-sm">🏗️</span> Generate
                </button>
              </div>
            </header>

            <section className="flex-1 overflow-auto bg-[#0b1120] relative no-scrollbar">
              {state.currentFile ? (
                <div className="h-full flex flex-col">
                  <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-b border-slate-800/30 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700 shadow-lg">📄</div>
                      <div>
                        <h2 className="text-xs font-mono font-bold text-slate-200 tracking-tight">{state.currentFile.path}</h2>
                        <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase tracking-widest opacity-60">
                          {state.currentFile.content?.split('\n').length || 0} Lines • Local Workspace
                        </p>
                      </div>
                    </div>
                    <button onClick={triggerRefactor} className="text-[9px] font-bold bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 px-4 py-2 rounded-lg border border-amber-500/20 transition-all uppercase tracking-widest active:scale-95">
                      Refactor Structure
                    </button>
                  </div>
                  <div className="flex-1 p-0 overflow-auto">
                    <table className="w-full border-collapse">
                       <tbody>
                          {state.currentFile.content?.split('\n').map((line, idx) => (
                             <tr key={idx} className="group hover:bg-blue-500/5 transition-colors">
                                <td className="w-12 text-right pr-6 text-[10px] text-slate-700 font-mono opacity-50 border-r border-slate-800/30 py-0.5 select-none">{idx + 1}</td>
                                <td className="pl-6 font-mono text-sm text-slate-300 whitespace-pre py-0.5 leading-relaxed">{line || ' '}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-950/20 p-12 text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-3xl flex items-center justify-center text-5xl animate-pulse">🛰️</div>
                    <div className="absolute -inset-4 bg-blue-500/5 blur-3xl rounded-full"></div>
                  </div>
                  <h3 className="text-slate-200 font-bold text-xl mb-3 tracking-tight">Code Intelligence Active</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                    Select a local file or <span className="text-blue-400 cursor-pointer font-bold hover:underline" onClick={() => setIsImportModalOpen(true)}>import a GitHub repository</span> to begin automated analysis, security scanning, and structural refactoring.
                  </p>
                </div>
              )}
            </section>

            {/* Prominent Generator FAB */}
            <button 
              onClick={() => setIsGeneratorOpen(true)}
              className="absolute bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-95 transition-all group"
              title="Synthesize New Code"
            >
              <span className="group-hover:rotate-12 transition-transform">🏗️</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
            </button>
          </div>

          {/* Chat Panel */}
          <div className="w-[480px] shrink-0">
            <ChatInterface 
              messages={state.messages} 
              onSendMessage={handleSendMessage} 
              isThinking={state.isThinking}
              activeAgents={state.activeAgents}
              hasActiveFile={!!state.currentFile}
              onOpenGenerator={() => setIsGeneratorOpen(true)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
