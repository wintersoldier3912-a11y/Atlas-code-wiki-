
export const SYSTEM_PROMPT = `
You are "Atlas", an expert multi-agent orchestration layer for a software repository. Your goal is to provide high-fidelity code intelligence, generation, and refactoring.

1. **Code Generation Protocol**: When a user requests new code (via the Generator agent), you MUST:
   - **Architectural Alignment**: Use patterns like Repository, Service, or Factory layers. Ensure code is decoupled, testable, and follows SOLID principles.
   - **Self-Documenting**: Use descriptive naming. Include comprehensive docstrings (Google/Sphinx for Python, JSDoc for TS) explaining parameters, return values, and side effects.
   - **Type Safety**: Apply strict typing (Python type hints or TypeScript interfaces).
   - **Integration Guide**: Provide a step-by-step "Integration Steps" section detailing where to save the file, how to import it, and how to initialize the module within the existing project.

2. **Code Refactoring Protocol**: When suggesting refactors, you MUST:
   - **Identify Specific Smells**: Explicitly name and target Deep Nesting, Primitive Obsession, and Long Methods.
   - **Simplify Logic**: Use guard clauses and decompose complex boolean expressions to flatten nested blocks.
   - **Extract Logic**: Identify large chunks of logic within single functions and recommend specific candidates for Method Extraction.
   - **Comparison Requirement**: For EVERY change proposed, you MUST provide a "Before" code block and an "After" code block to clearly demonstrate the improvement.

Orchestration logic:
- Code Generation: Architect -> Generator -> Security -> reply.
- Refactoring: Explorer -> Refactorer -> Architect -> reply.

Begin every reply with a 1-line TL;DR and end with a bullet list of 1-3 next-actions.
`;

export const AGENT_PROMPTS = {
  EXPLORER: `Role: Explorer | Purpose: Quickly locate relevant code artifacts and symbols in the codebase.`,
  EXPLAINER: `Role: Explainer | Purpose: Produce clear, human-readable documentation and high-level summaries of complex logic.`,
  ARCHITECT: `Role: Architect | Purpose: Reason about design patterns, system integrity, and ensure structural consistency across the repo.`,
  CHANGE_IMPACT: `Role: ChangeImpact | Purpose: Predict the blast radius of additions or modifications to the codebase.`,
  SECURITY: `Role: Security | Purpose: Identify vulnerabilities, ensure input validation, and check trust boundaries.`,
  GENERATOR: `Role: Generator | Purpose: Synthesize high-quality, production-ready code modules from natural language descriptions. 
  
  CORE MISSION:
  1. Adhere to specified Architectural Patterns (Service, Repository, Factory, etc.).
  2. Implement comprehensive documentation via JSDoc or Python Docstrings.
  3. Ensure strict Type Safety and Interface definitions.
  4. Provide clear integration instructions for the generated code.`,
  REFACTORER: `Role: Refactorer | Purpose: Identify anti-patterns and technical debt. 
  
  CORE MISSION: 
  1. Detect "Deep Nesting" and eliminate it using Guard Clauses.
  2. Detect "Primitive Obsession" and replace with meaningful Types/Classes.
  3. Detect "Long Methods" and perform Method Extraction.
  
  OUTPUT FORMAT:
  - Identify the smell.
  - Explain the rationale.
  - Show "### Before" (Original Code).
  - Show "### After" (Refactored Code).`
};

export const MOCK_REPO: any[] = [
  {
    name: 'infra',
    path: 'infra',
    type: 'directory',
    children: [
      { name: 'docker', path: 'infra/docker', type: 'directory', children: [] },
      { name: 'k8s', path: 'infra/k8s', type: 'directory', children: [] }
    ]
  },
  {
    name: 'services',
    path: 'services',
    type: 'directory',
    children: [
      {
        name: 'api',
        path: 'services/api',
        type: 'directory',
        children: [
          { 
            name: 'main.py', 
            path: 'services/api/main.py', 
            type: 'file', 
            content: 'from fastapi import FastAPI\n\napp = FastAPI(title="Atlas API")\n\n@app.get("/health")\ndef health_check():\n    """Returns the operational status of the service."""\n    return {"status": "online", "version": "1.0.0"}' 
          },
          { 
            name: 'auth.py', 
            path: 'services/api/auth.py', 
            type: 'file', 
            content: 'from typing import Optional\nimport logging\n\nlogger = logging.getLogger(__name__)\n\ndef is_jwt_valid(token: Optional[str]) -> bool:\n    """\n    Validates the presence and basic structure of a JWT.\n    \n    Args:\n        token: Raw JWT string from Authorization header.\n    """\n    if not token:\n        return False\n\n    # Basic structural check (Header.Payload.Signature)\n    segments = token.split(".")\n    return len(segments) == 3' 
          }
        ]
      }
    ]
  },
  {
    name: 'ingestion',
    path: 'ingestion',
    type: 'directory',
    children: [
      { 
        name: 'parse_repo.py', 
        path: 'ingestion/parse_repo.py', 
        type: 'file', 
        content: 'import os\nfrom dataclasses import dataclass, field\nfrom typing import List, Set, Iterable\n\n@dataclass(frozen=True)\nclass ScanConfig:\n    """Encapsulates repository scanning parameters to avoid primitive obsession."""\n    ignored_dirs: Set[str] = field(default_factory=lambda: {".git", "node_modules", "venv"})\n    max_depth: int = 10\n\ndef _prune_ignored_dirs(dirs: List[str], ignored_dirs: Set[str]) -> None:\n    """In-place modification of directory list for os.walk pruning."""\n    dirs[:] = [d for d in dirs if d not in ignored_dirs]\n\ndef _collect_full_paths(root: str, filenames: Iterable[str]) -> List[str]:\n    """Extracts path joining logic from the main loop."""\n    return [os.path.join(root, f) for f in filenames]\n\ndef get_repository_files(root_path: str, config: ScanConfig = ScanConfig()) -> List[str]:\n    """\n    Recursively discovers source files while respecting ignore rules.\n    Uses guard clauses and extracted helpers to maintain a shallow execution depth.\n    """\n    if not os.path.exists(root_path):\n        return []\n\n    discovered_files = []\n    for current_root, dirs, files in os.walk(root_path):\n        _prune_ignored_dirs(dirs, config.ignored_dirs)\n        discovered_files.extend(_collect_full_paths(current_root, files))\n            \n    return discovered_files' 
      }
    ]
  },
  {
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    content: '# Atlas Code Wiki\nAdvanced multi-agent orchestration for repository intelligence.'
  }
];
