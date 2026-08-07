<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.67

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.67** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All `uses:` references across all workflow files use mutable version tags instead of pinned 40-character SHA commit hashes, making the workflows vulnerable to supply-chain attacks if a tag is moved or a dependency is compromised. Failing references include: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, actions/cache@v6.

Locations:

- `.github/workflows/build.yml:10`
- `.github/workflows/build.yml:15`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:11`
- `.github/workflows/commitlint.yml:16`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:16`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:32`
- `.github/workflows/test.yml:11`
- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:24`
- `.github/workflows/test.yml:44`
- `.github/workflows/test.yml:50`
- `.github/workflows/version.yml:14`
- `.github/workflows/version.yml:24`

### script-injection (severity: high)

Sub-rule (a): GitHub Actions expressions are directly interpolated inside `run:` shell command strings. In release-please.yml, the 'Tag major and minor versions' step interpolates `${{ needs.release.outputs.major }}` and `${{ needs.release.outputs.minor }}` directly into git tag and git push commands, and the 'Tag latest release' step interpolates `${{ needs.release.outputs.tag_name }}` directly into a gh CLI command. In test.yml, the 'Check version' step interpolates `${{ env.VERSION }}` directly inside a shell string comparison. These expressions are substituted by the Actions runner before the shell ever sees the command, allowing an attacker who can influence these values to inject arbitrary shell commands.

Locations:

- `.github/workflows/release-please.yml:39`
- `.github/workflows/release-please.yml:49`
- `.github/workflows/test.yml:68`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all unpinned action references across build.yml, commitlint.yml, lint.yml, release-please.yml, test.yml, and version.yml by pinning to full 40-character commit SHAs (with tag comments for readability). Fixed script injection in release-please.yml by moving needs.release.outputs.major, needs.release.outputs.minor, and needs.release.outputs.tag_name into env blocks (MAJOR, MINOR, TAG_NAME). Fixed script injection in test.yml by moving env.VERSION into an EXPECTED_VERSION env var for the 'Check version' step.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two unquoted `$PR_URL` expansions in `.github/workflows/dependabot.yml` (lines 21 and 25). Changed `gh pr review --approve $PR_URL` to `gh pr review --approve "$PR_URL"` and `gh pr merge --auto --squash $PR_URL` to `gh pr merge --auto --squash "$PR_URL"`. This prevents shell metacharacters in an attacker-controlled PR URL from being interpreted as shell commands on the `pull_request_target` trigger.

