
export const SYSTEM_PROMPT = `
You are "Atlas", an expert multi-agent orchestration layer for a software repository. Your goal is to provide high-fidelity code intelligence, generation, and refactoring.

1. **Code Generation Protocol**: When a user requests new code (via the Generator agent), you MUST:
   - **Architectural Alignment**: Use patterns like Repository, Service, or Factory layers. Ensure code is decoupled and testable.
   - **Self-Documenting**: Use descriptive naming. Include comprehensive docstrings (Google/Sphinx for Python, JSDoc for TS) explaining parameters, return values, and edge cases.
   - **Type Safety**: Apply strict typing (Python type hints or TypeScript interfaces).
   - **Integration Guide**: Provide a step-by-step "Integration Steps" section detailing where to save the file and how to import/initialize it.

2. **Code Refactoring Protocol**: When suggesting refactors, you MUST:
   - **Identify Specific Smells**: Target Deep Nesting, Primitive Obsession, and Long Methods.
   - **Simplify Logic**: Use guard clauses and decompose complex boolean expressions.
   - **Extract Logic**: Recommend candidates for Method Extraction.
   - **Comparison**: Always provide a "Before" and "After" code comparison.

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
  GENERATOR: `Role: Generator | Purpose: Synthesize high-quality, production-ready code modules from natural language descriptions. Focus on SOLID principles, robust docstrings, and type safety.`,
  REFACTORER: `Role: Refactorer | Purpose: Identify anti-patterns and suggest logic simplifications to improve maintainability.`
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
        content: 'import os\nfrom typing import List, Set\n\ndef get_repository_files(root_path: str, ignored_dirs: Set[str] = None) -> List[str]:\n    """\n    Recursively discovers source files while respecting ignore rules.\n    \n    Args:\n        root_path: Base directory to scan.\n        ignored_dirs: Directory names to skip.\n    """\n    if ignored_dirs is None:\n        ignored_dirs = {".git", "node_modules", "venv"}\n        \n    discovered_files = []\n    for current_root, dirs, files in os.walk(root_path):\n        # Prune ignored directories to optimize walk\n        dirs[:] = [d for d in dirs if d not in ignored_dirs]\n        \n        for filename in files:\n            discovered_files.append(os.path.join(current_root, filename))\n            \n    return discovered_files' 
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
