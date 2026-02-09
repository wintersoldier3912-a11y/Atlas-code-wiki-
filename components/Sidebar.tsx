
import React, { useState } from 'react';
import { FileNode } from '../types';

interface SidebarProps {
  structure: FileNode[];
  onFileSelect: (file: FileNode) => void;
  onOpenImport: () => void;
  isIngesting?: boolean;
}

/**
 * Internal helper component for rendering a single file or directory in the explorer.
 */
const FileItem: React.FC<{ node: FileNode; onSelect: (file: FileNode) => void; depth: number }> = ({ node, onSelect, depth }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  return (
    <div className="select-none">
      <div 
        onClick={handleClick}
        className={`flex items-center py-1.5 px-3 cursor-pointer hover:bg-slate-800 transition-colors text-xs rounded-lg group ${depth > 0 ? 'ml-3' : ''}`}
      >
        <span className="mr-2 opacity-40 group-hover:opacity-100 transition-opacity">
          {node.type === 'directory' ? (isOpen ? '▼' : '▶') : '📄'}
        </span>
        <span className={`${node.type === 'directory' ? 'font-semibold text-slate-300' : 'text-slate-400'} truncate`}>
          {node.name}
        </span>
      </div>
      {node.type === 'directory' && isOpen && node.children && (
        <div className="border-l border-slate-800/50 ml-5 my-0.5">
          {node.children.map((child, i) => (
            <FileItem key={i} node={child} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * The sidebar component providing a hierarchical view of the repository and management controls.
 */
export const Sidebar: React.FC<SidebarProps> = ({ structure, onFileSelect, onOpenImport, isIngesting }) => {
  return (
    <aside className="w-64 flex flex-col h-full bg-slate-950 border-r border-slate-900 shadow-2xl z-20">
      <div className="p-6 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-900/40">A</div>
          <h1 className="font-bold text-base tracking-tight text-white">Atlas Wiki</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 no-scrollbar space-y-6">
        <div>
          <div className="flex items-center justify-between px-3 mb-3">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Explorer</h2>
            <button 
              onClick={onOpenImport}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-blue-400 transition-all active:scale-90"
              title="Add Repository"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          
          {isIngesting && (
             <div className="mx-3 mb-4 p-3 bg-blue-600/5 border border-blue-500/20 rounded-xl animate-pulse">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                   <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Syncing Remote...</span>
                </div>
             </div>
          )}

          <div className="space-y-0.5">
            {structure.map((node, i) => (
              <FileItem key={i} node={node} onSelect={onFileSelect} depth={0} />
            ))}
          </div>
        </div>

        <div className="px-3">
           <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-3">Recent Projects</h2>
           <div className="space-y-2">
             <div className="flex items-center gap-3 px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-800/50 opacity-60">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-300 font-medium">atlas-core-wiki</span>
             </div>
           </div>
        </div>
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
           <span className="text-[10px] text-slate-500 font-bold tracking-wider">MVP-PHASE-1</span>
        </div>
        <span className="text-[9px] text-slate-700 font-mono">v1.0.4</span>
      </div>
    </aside>
  );
};
