# Commit and Push Command

Stage all changes, commit them with a Conventional Commit message matching
this repo's style, and push the current branch to GitHub.

Input:

None.

## Steps

1. Run in parallel:
   - `git status`
   - `git diff` (staged and unstaged)
   - `git log --oneline -10` (match this repo's existing commit style)

2. Review what `git status` picked up before staging. If anything looks like
   a secret or credential (`.env*`, key files, tokens) rather than source
   changes, stop and confirm with the user before including it — do not
   silently stage it.

3. Stage all remaining changes (tracked and untracked) and draft a commit
   message from the actual diff, not a generic label:
   - Conventional Commits format: `type(scope): summary` (see CLAUDE.md's
     Git Rules — `feat`, `fix`, `refactor`, `docs`, etc.)
   - One line covering what changed and why, not a file-by-file listing
   - If the changes correspond to a `TASK-ID` from `backlog/mvp.yaml`,
     reference it in the body (`TASK-ID: short description`), matching
     `/implement-task`'s commit message convention
   - Append the standard trailer:
     `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`

4. Commit, then push the current branch (`git push`, or
   `git push -u origin <branch>` if it has no upstream yet).

5. Run `git status` again to confirm a clean working tree and a successful
   push.

## Output

- Files committed
- Commit message used
- Push result (branch, remote, confirmation it succeeded)

## Do not

- Do not use `git add -A`/`.` blindly without checking `git status` first
  per step 2 — the goal is "commit everything relevant," not "commit
  everything without looking."
- Do not force-push, amend, or rewrite existing history.
- Do not skip hooks (`--no-verify`) if a commit hook fails — fix the
  underlying issue and retry.
