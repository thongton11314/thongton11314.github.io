# Copilot Development Instructions

This project uses the AI development framework defined in `agent-coding-template/AGENTS.md`.
Read that file in full at the start of every session. The rules below are a summary —
the canonical source is `AGENTS.md`.

---

## Session Start Checklist

Before any code or wiki operation:
1. Read `agent-coding-template/AGENTS.md` in full.
2. Read `agent-coding-template/wiki/index.md` to understand the current project knowledge state.
3. Read `agent-coding-template/wiki/overview.md` for the high-level synthesis.
4. Read relevant `agent-coding-template/wiki/conventions/` pages before writing code.

---

## Quick Rules

1. **Never modify files in `raw/`** — source documents are immutable.
2. **Before any code change** — read relevant wiki pages (modules, conventions, decisions, architecture) under `agent-coding-template/wiki/`.
3. **After any code change** — execute the mandatory 5-step Post-Change Pipeline:
   - Step 1: Update wiki (modules, architecture, ADRs, `wiki/log.md`, `wiki/index.md`)
   - Step 2: Run Sync Gate (Workflow 9) — output Code-Wiki Mapping Table + bidirectional verification
   - Step 3: Run tests — fix code on failure before proceeding
   - Step 4: Update `README.md` if API surface or architecture changed
   - Step 5: Commit with structured message: `<type>: <summary>` + per-file bullet points
4. Always update `wiki/index.md` and `wiki/log.md` after any wiki operation.
5. Use YAML frontmatter on every wiki page.
6. Use `[[wikilinks]]` for cross-references between wiki pages.
7. Flag contradictions with `> [!contradiction]` callouts — never silently overwrite.
8. Flag breaking changes with `> [!breaking]` callouts.
9. New modules → register a page in `wiki/modules/` and update architecture pages.
10. Non-trivial design choices → record an ADR in `wiki/decisions/`.
11. When ingesting a source document → discuss key takeaways with the user first, wait for confirmation before creating wiki pages.
12. Sync Gate (Workflow 9) is mandatory after every code change. Both passes must succeed.
13. Spec-vs-code divergences → log in `wiki/deviations.md`.
14. For changes touching auth, API keys, queries, file paths, or user input → run the `SECURITY.md` checklist.

---

## Agent Model

- **Developer Agent** (this Copilot chat): handles all code and wiki changes using the skills: Plan, Implement, Test, Wiki Sync, Review, Clean, Commit.
- **Exploration Agent** (`Explore` subagent): read-only search and Q&A — never modifies files.

**Before coding**: name the interpretation, state assumptions, ask for clarification rather than guessing.
**For multi-step work**: draft a plan (`N. [Step] → verify: [check]`) before writing code.

---

## Wiki Structure

All wiki pages live under `agent-coding-template/wiki/`:

| Directory | Purpose |
|-----------|---------|
| `sources/` | One summary page per ingested document |
| `entities/` | People, orgs, products, tools, services |
| `concepts/` | Ideas, frameworks, patterns, theories |
| `analyses/` | Comparisons, syntheses, research outputs |
| `architecture/` | System design, component maps, data flows |
| `decisions/` | Architecture Decision Records (ADRs) |
| `conventions/` | Coding standards, naming rules, project patterns |
| `modules/` | One page per module/component/service |
| `deviations.md` | Audit trail of spec-vs-code divergences |
| `index.md` | Master catalog of all wiki pages |
| `log.md` | Chronological record of all operations |
| `overview.md` | High-level synthesis (knowledge + system state) |

---

## Commit Message Format

```
<type>: <summary>

- <file>: <what changed and why>
- wiki/<page>: <what was updated>
```

Types: `feat` | `fix` | `refactor` | `test` | `wiki` | `chore`
