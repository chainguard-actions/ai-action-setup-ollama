<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.70

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.70** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All `uses:` references across workflow files use mutable version tags instead of full 40-character SHA commit hashes, making the workflows vulnerable to supply-chain attacks if the referenced action tags are moved or compromised.

Failing references:
- build.yml: `actions/checkout@v7`, `actions/setup-node@v7`, `stefanzweifel/git-auto-commit-action@v7`
- commitlint.yml: `actions/checkout@v7`, `actions/setup-node@v7`
- lint.yml: `actions/checkout@v7`, `actions/setup-node@v7`
- release-please.yml: `googleapis/release-please-action@v5`, `actions/checkout@v7`
- test.yml: `actions/checkout@v7`, `actions/setup-node@v7`, `codecov/codecov-action@v7`, `actions/cache@v6`
- version.yml: `actions/checkout@v7`, `actions/setup-node@v7`

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:30`
- `.github/workflows/commitlint.yml:13`
- `.github/workflows/commitlint.yml:18`
- `.github/workflows/lint.yml:13`
- `.github/workflows/lint.yml:18`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:34`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:28`
- `.github/workflows/test.yml:53`
- `.github/workflows/test.yml:61`
- `.github/workflows/version.yml:14`
- `.github/workflows/version.yml:24`

### script-injection (severity: high)

Rule (a): `${{ needs.release.outputs.* }}` expressions are directly interpolated inside `run:` shell commands in the 'Tag major and minor versions' and 'Tag latest release' steps. `needs.*.outputs.*` values are untrusted workflow-controllable data that flow through YAML template substitution before the shell processes them, enabling command injection.

Offending lines:
- `git tag -d v${{ needs.release.outputs.major }} || true`
- `git tag -d v${{ needs.release.outputs.major }}.${{ needs.release.outputs.minor }} || true`
- `git tag -a v${{ needs.release.outputs.major }} -m 'Release v${{ needs.release.outputs.major }}'`
- `git tag -a v${{ needs.release.outputs.major }}.${{ needs.release.outputs.minor }} -m '...'`
- `git push -f origin v${{ needs.release.outputs.major }}`
- `git push -f origin v${{ needs.release.outputs.major }}.${{ needs.release.outputs.minor }}`
- `run: gh release edit ${{ needs.release.outputs.tag_name }} --latest`

Fix: move the values into `env:` variables and reference them as quoted shell variables (e.g., `"$MAJOR"`).

Locations:

- `.github/workflows/release-please.yml:43`
- `.github/workflows/release-please.yml:44`
- `.github/workflows/release-please.yml:45`
- `.github/workflows/release-please.yml:46`
- `.github/workflows/release-please.yml:47`
- `.github/workflows/release-please.yml:48`
- `.github/workflows/release-please.yml:51`

### script-injection (severity: high)

Rule (a): `${{ env.VERSION }}` is directly interpolated inside a `run:` shell command string in the 'Check version' step. `env.*` values are untrusted workflow-controllable data. The expression appears inside a bash string comparison: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]; then`. This allows YAML template substitution to inject arbitrary shell metacharacters before the shell parses the command.

Fix: reference the env var as a quoted shell variable `"$VERSION"` instead of using `${{ env.VERSION }}` directly in the run block.

Locations:

- `.github/workflows/test.yml:78`

### script-injection (severity: high)

Rule (b): `$PR_URL` is set from `${{ github.event.pull_request.html_url }}` (attacker-controlled via `pull_request_target` trigger) and used **unquoted** in two `run:` shell commands. Unquoted expansion allows the shell to parse metacharacters (`;`, `|`, `&`, `$(...)`, etc.) from the URL value, enabling command injection.

Offending lines:
- `run: gh pr review --approve $PR_URL`  (line 22)
- `run: gh pr merge --auto --squash $PR_URL`  (line 26)

Fix: quote the variable: `gh pr review --approve "$PR_URL"` and `gh pr merge --auto --squash "$PR_URL"`.

Locations:

- `.github/workflows/dependabot.yml:22`
- `.github/workflows/dependabot.yml:26`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 7 workflow files:

1. **unpinned-uses** (build.yml, commitlint.yml, lint.yml, release-please.yml, test.yml, version.yml): Pinned all 6 unique action references to full 40-char SHA hashes with tag comments preserved: actions/checkout@3d3c42e5..., actions/setup-node@82076278..., stefanzweifel/git-auto-commit-action@4a55954c..., googleapis/release-please-action@45996ed1..., codecov/codecov-action@fb8b3582..., actions/cache@55cc8345...

2. **script-injection (release-please.yml)**: Moved `needs.release.outputs.major`, `needs.release.outputs.minor`, and `needs.release.outputs.tag_name` into `env:` blocks as MAJOR, MINOR, TAG_NAME variables; replaced all inline `${{ }}` expressions in run: blocks with quoted shell variables.

3. **script-injection (test.yml)**: Replaced `${{ env.VERSION }}` in the 'Check version' run: block with `$VERSION` (the shell env var already set at job level), using double-quotes.

4. **script-injection (dependabot.yml)**: Added double-quotes around `$PR_URL` in both gh commands to prevent shell injection from unquoted variable expansion.

