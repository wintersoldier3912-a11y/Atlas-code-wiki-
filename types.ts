
/**
 * Enumeration of the specialized agents available in the Atlas orchestration layer.
 * Each agent represents a specific domain of expertise in codebase analysis and modification.
 */
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

/**
 * Represents a single interaction within the chat system.
 */
export interface Message {
  /** Unique identifier for the message. */
  id: string;
  /** The role of the entity that created the message. */
  role: 'user' | 'assistant';
  /** The markdown-formatted text content of the message. */
  content: string;
  /** The specific agent responsible for this message, if applicable. */
  agent?: AgentType;
  /** Unix timestamp of when the message was created. */
  timestamp: number;
}

/**
 * Represents a node in the repository's file system tree.
 */
export interface FileNode {
  /** The display name of the file or directory. */
  name: string;
  /** The absolute path within the project root. */
  path: string;
  /** The type of the node. */
  type: 'file' | 'directory';
  /** Recursive children if the node is a directory. */
  children?: FileNode[];
  /** The text content of the file, if loaded. */
  content?: string;
}

/**
 * The global state object for the Atlas Code Wiki application.
 */
export interface AppState {
  /** History of messages exchanged in the current session. */
  messages: Message[];
  /** Flag indicating if the AI model is currently generating a response. */
  isThinking: boolean;
  /** The sequence of agents currently or recently active in the workflow. */
  activeAgents: AgentType[];
  /** The file currently being viewed/edited in the primary workspace. */
  currentFile: FileNode | null;
  /** The full hierarchical structure of the project repository. */
  repoStructure: FileNode[];
}
