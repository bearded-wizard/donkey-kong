# Agent Workflow Documentation

## ⚠️ IMPORTANT: How to Implement Issues

When the user asks to "implement issue #X", you MUST use the configured sub-agents. Do NOT create generic Task tool prompts.

## The Correct Workflow

### Step 1: Use the Worker Agent

**Command to invoke:**
```bash
claude -f ~/.claude/agents/issue-worker-tdd.md
```

**What the worker agent does:**
- Loads `.claude/project.yml` configuration (THIS PROJECT HAS ONE!)
- Follows the 10-step TDD workflow:
  1. Create feature branch (`issue/[#]-description`)
  2. Update project board (if exists)
  3. TDD: Red-Green-Refactor cycle
  4. Self-review against 13 criteria
  5. Run tests + build (using config commands)
  6. Commit with conventional messages
  7. Create pull request
  8. Move board to "In Review"
  9. Verify tests pass
  10. **Activate review agent** (see Step 2)

**The worker agent will:**
- Use `commands.test`, `commands.build`, `commands.lint` from project.yml
- Follow `verification.steps` for E2E testing
- Check `quality_checks` specific to this project
- Target 100/100 on the grading rubric

### Step 2: Review Agent Takes Over

The **worker agent itself** will activate the review agent at the end. If not, manually invoke:

```bash
claude -f ~/.claude/agents/issue-code-reviewer.md
```

**What the review agent does:**
- Follows the 15-step review workflow
- Fetches PR and extracts linked issue
- Checks out branch and runs tests using project.yml config
- Grades implementation against 13-criteria rubric
- Posts review report to GitHub PR
- **Waits for CI to pass** (if enabled)
- Merges if score ≥85 and CI passes
- Closes linked issue
- Cleans up branches

## Project Configuration

This project has `.claude/project.yml` with:

### Commands
- **test**: `echo '⚠️  No automated tests - manual browser testing required'`
- **build**: `echo '✅ No build step - vanilla JS loads directly in browser'`
- **lint**: `echo '⚠️  No linter configured - manual code review required'`
- **start**: `python -m http.server 8000`

### Verification Type: Browser
- Start HTTP server on port 8000
- Open http://localhost:8000
- Check DevTools Console for errors
- Test player movement, jumping, ladders, barrels
- Verify game state transitions
- Test on multiple browsers

### Quality Checks
- No console.log statements (except intentional debug)
- All values use Constants.js (no hardcoded numbers)
- Check script loading order in index.html
- Verify ES6 class structure (update/render methods)
- Test 60 FPS performance
- Verify retro arcade aesthetic

## What I Did Wrong (Issue #10)

❌ **Incorrect Approach:**
- Created generic Task tool prompts
- Didn't reference ~/.claude/agents/issue-worker-tdd.md
- Didn't reference ~/.claude/agents/issue-code-reviewer.md
- Didn't load .claude/project.yml configuration
- Didn't follow the specific 10-step and 15-step workflows

✅ **What I Should Have Done:**
```bash
# Step 1: Invoke worker agent
claude -f ~/.claude/agents/issue-worker-tdd.md

# Provide issue number: 10
# Worker agent follows all 10 steps autonomously
# Worker agent activates review agent at end

# Step 2: Review agent (auto-activated by worker)
# OR manually: claude -f ~/.claude/agents/issue-code-reviewer.md

# Provide PR number from worker agent
# Review agent follows all 15 steps autonomously
```

## Key Reminders

1. **Always use the configured agents** - they have detailed workflows
2. **Project has .claude/project.yml** - agents will load and use it
3. **Worker → Review handoff** - worker activates review at step 10
4. **Sequential execution** - never work on multiple issues in parallel
5. **E2E verification is MANDATORY** - unit tests ≠ feature works
6. **Target 100/100** - use the 13-criteria grading rubric
7. **Wait for CI** - never merge with failing checks

## For Next Issue

When user says: "Use the worker agent to implement issue #X"

**YOU MUST:**
1. Invoke: `claude -f ~/.claude/agents/issue-worker-tdd.md`
2. Provide issue number to the agent
3. Let worker agent run all 10 steps
4. Worker agent will activate review agent
5. Let review agent run all 15 steps
6. Report final results to user

**DO NOT:**
- Create your own Task tool prompts
- Skip the agent files
- Do the work yourself
- Skip loading project.yml

## Agent File Locations

- Worker Agent: `~/.claude/agents/issue-worker-tdd.md`
- Review Agent: `~/.claude/agents/issue-code-reviewer.md`
- Project Config: `.claude/project.yml` (this directory)
- Config Schema: `~/.claude/agents/project-config-schema.yml`

## Grading Rubric (13 Criteria)

Both agents use this rubric for self-review and code review:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Correctness | 25% | Code works, no bugs |
| Testing | 20% | Comprehensive coverage, TDD followed |
| Code Style | 10% | Follows conventions, linter passes |
| Design Patterns | 10% | SOLID principles, good abstractions |
| Readability | 7% | Clear naming, appropriate comments |
| Performance | 7% | Efficient algorithms, no bottlenecks |
| Error Handling | 7% | Handles errors, validates inputs |
| Maintainability | 6% | Easy to modify, low coupling |
| Documentation | 4% | Updated docs, clear commits |
| Code Duplication | 4% | DRY principle |
| Business Logic | 3% | Meets requirements |
| Time Complexity | 2% | Optimal algorithms |
| Space Complexity | 2% | Efficient memory usage |

**Threshold: ≥85/100 for auto-merge**

---

**Created**: 2025-11-01
**Purpose**: Ensure proper agent workflow is followed for all future issue implementations
**Last Updated**: 2025-11-01
