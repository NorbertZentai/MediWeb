# /pr - PR description preparation (never executes git)

## Task
$ARGUMENTS

## Pipeline

### Step 1: Analyze Changes
- Run `git log --oneline develop..HEAD` (or appropriate base branch) to see commits.
- Run `git diff develop...HEAD --stat` to see changed files.
- Run `git diff develop...HEAD` to see actual changes (pipe through `head -500` for large diffs).

### Step 2: Understand Context
- For each changed file, briefly understand the purpose of the change.
- Group changes by category: feature, bugfix, refactor, config, test.

### Step 3: Generate PR Description
Output the following format (ready to copy-paste):

```
## Title
[Short, descriptive title under 70 chars]

## Summary
[1-3 bullet points explaining what changed and why]

## Changes
| File | Change |
|------|--------|
| path/to/file | Description |

## Testing
- [ ] Backend compiles: `cd MediWeb_Backend && ./mvnw compile`
- [ ] Frontend builds: `cd MediWeb_Frontend && npx expo export --platform web`
- [ ] Manual testing: [specific scenarios to test]

## Screenshots
[If UI changes, note which screens to screenshot]

## Notes
[Any deployment notes, env var changes, DB migrations needed]
```

### Step 4: Suggest Commands
Output the git commands the user should run (but DO NOT execute them):
```bash
# Push your branch:
git push -u origin feature/your-branch-name

# Create PR:
gh pr create --title "Title" --body "..."
```

## MCP Integration
- **github**: Use github MCP to check for related open issues or PRs that this change might address or conflict with. Also check if there are any failing CI checks on the base branch.
- **memory**: Check memory MCP for any past pipeline decisions or context relevant to this PR (e.g., "we decided to use X approach because of Y").

## Rules
- NEVER execute git push, git commit, or gh pr create
- NEVER modify any files
- Always analyze ALL commits between base and HEAD, not just the latest
- Include deployment notes if config files changed
- Mention breaking changes prominently
