
export enum AgentType {
  ATLAS = 'Atlas (Orchestrator)',
  EXPLORER = 'Explorer',
  EXPLAINER = 'Explainer',
  ARCHITECT = 'Architect',
  CHANGE_IMPACT = 'ChangeImpact',
  SECURITY = 'Security',
  GENERATOR = 'Generator',
  REFACTORER = 'Refactorer'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: AgentType;
  timestamp: number;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
}

export interface AppState {
  messages: Message[];
  isThinking: boolean;
  activeAgents: AgentType[];
  currentFile: FileNode | null;
  repoStructure: FileNode[];
}
