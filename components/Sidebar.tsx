
import React, { useState } from 'react';
import { FileNode } from '../types';

interface SidebarProps {
  structure: FileNode[];
  onFileSelect: (file: FileNode) => void;
}

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
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-slate-800 transition-colors text-sm rounded ${depth > 0 ? 'ml-3' : ''}`}
      >
        <span className="mr-2 opacity-60">
          {node.type === 'directory' ? (isOpen ? '▼' : '▶') : '📄'}
        </span>
        <span className={node.type === 'directory' ? 'font-medium text-slate-300' : 'text-slate-400'}>
          {node.name}
        </span>
      </div>
      {node.type === 'directory' && isOpen && node.children && (
        <div className="border-l border-slate-700 ml-4">
          {node.children.map((child, i) => (
            <FileItem key={i} node={child} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ structure, onFileSelect }) => {
  return (
    <aside className="w-64 flex flex-col h-full bg-slate-900 border-r border-slate-800">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-xs">A</div>
        <h1 className="font-bold text-lg tracking-tight">Atlas Wiki</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 ml-2">Explorer</div>
        {structure.map((node, i) => (
          <FileItem key={i} node={node} onSelect={onFileSelect} depth={0} />
        ))}
      </div>
      <div className="p-4 bg-slate-950/50 text-[10px] text-slate-500 font-medium">
        v1.0.0-MVP (Phase-1)
      </div>
    </aside>
  );
};
