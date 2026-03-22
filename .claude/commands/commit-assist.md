# /commit-assist - Commit message preparation (never executes git)

## Task
$ARGUMENTS

## Pipeline

### Step 1: Analyze Changes
- Run `git status` to see staged and unstaged changes.
- Run `git diff --cached` to see staged changes (if any).
- Run `git diff` to see unstaged changes.

### Step 2: Categorize Changes
- Identify the type: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`
- Identify the scope: `backend`, `frontend`, `config`, `db`, or specific module name

### Step 3: Generate Commit Message
Output the following format (ready to copy-paste):

```
[type]([scope]): [short description]

[Optional body with more detail]

[Optional footer with breaking changes or issue references]
```

Examples:
- `feat(backend/notification): Add push notification support for medication reminders`
- `fix(frontend/profile): Fix profile screen crash when user has no avatar`
- `refactor(backend/medication): Extract sync logic into dedicated service`

### Step 4: Suggest Commands
Output the git commands the user should run (but DO NOT execute them):
```bash
# Stage changes:
git add [specific files]

# Commit:
git commit -m "type(scope): description"
```

## MCP Integration
- **github**: Check for related open issues that this commit might resolve. If found, suggest adding `Fixes #123` or `Closes #123` to the commit message footer.

## Rules
- NEVER execute git add, git commit, or any write git commands
- NEVER modify any files
- Follow conventional commit format: type(scope): description
- Keep subject line under 72 characters
- If changes span multiple concerns, suggest separate commits
- Warn if .env, credentials, or other sensitive files are staged
