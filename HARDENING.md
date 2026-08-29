<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.73

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.73** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All `uses:` references across every workflow file use mutable tag refs (e.g. `@v7`, `@v5`, `@v6`) instead of full 40-character SHA commit digests. This exposes the action to supply-chain attacks if any upstream action is compromised or a tag is moved. Affected references include: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, actions/cache@v6.

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:12`
- `.github/workflows/commitlint.yml:17`
- `.github/workflows/lint.yml:12`
- `.github/workflows/lint.yml:17`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:33`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:18`
- `.github/workflows/test.yml:27`
- `.github/workflows/test.yml:55`
- `.github/workflows/test.yml:62`
- `.github/workflows/version.yml:16`
- `.github/workflows/version.yml:26`

### script-injection (severity: high)

Sub-rule (a): `${{ needs.release.outputs.major }}`, `${{ needs.release.outputs.minor }}`, and `${{ needs.release.outputs.tag_name }}` are interpolated directly inside `run:` shell command strings in the 'Tag major and minor versions' and 'Tag latest release' steps. These step output values flow through YAML template substitution before the shell sees them, allowing an attacker who can influence the release-please output to inject arbitrary shell commands. Offending lines include: `git tag -d v${{ needs.release.outputs.major }} || true`, `git tag -a v${{ needs.release.outputs.major }}.${{ needs.release.outputs.minor }} -m ...`, `git push -f origin v${{ needs.release.outputs.major }}`, and `gh release edit ${{ needs.release.outputs.tag_name }} --latest`.

Locations:

- `.github/workflows/release-please.yml:42`
- `.github/workflows/release-please.yml:43`
- `.github/workflows/release-please.yml:44`
- `.github/workflows/release-please.yml:45`
- `.github/workflows/release-please.yml:46`
- `.github/workflows/release-please.yml:47`
- `.github/workflows/release-please.yml:49`

### script-injection (severity: high)

Sub-rule (a): `${{ env.VERSION }}` is interpolated directly inside a `run:` shell command string in the 'Check version' step of the integration job. The VERSION env var is sourced from `${{ matrix.version }}` (a workflow-controllable matrix value), so embedding it as a `${{ ... }}` expression directly in the shell script allows shell metacharacter injection. Offending line: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]; then`

Locations:

- `.github/workflows/test.yml:69`

### script-injection (severity: high)

Sub-rule (b): The env var `$PR_URL` (set from the untrusted `${{ github.event.pull_request.html_url }}`) is expanded unquoted in two `run:` shell commands: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. An attacker controlling the PR URL could inject shell metacharacters. The variable must be double-quoted: `"$PR_URL"`.

Locations:

- `.github/workflows/dependabot.yml:22`
- `.github/workflows/dependabot.yml:26`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 7 workflow files:

1. **unpinned-uses**: Pinned all 6 action references to full SHA digests with tag comments preserved:
   - actions/checkout@v7 → @3d3c42e5aac5ba805825da76410c181273ba90b1
   - actions/setup-node@v7 → @820762786026740c76f36085b0efc47a31fe5020
   - stefanzweifel/git-auto-commit-action@v7 → @4a55954c782fc1ea30b9056cd3e7a2b40ca8887d
   - googleapis/release-please-action@v5 → @45996ed1f6d02564a971a2fa1b5860e934307cf7
   - codecov/codecov-action@v7 → @fb8b3582c8e4def4969c97caa2f19720cb33a72f
   - actions/cache@v6 → @55cc8345863c7cc4c66a329aec7e433d2d1c52a9

2. **script-injection (release-please.yml)**: Moved `${{ needs.release.outputs.major }}`, `${{ needs.release.outputs.minor }}`, and `${{ needs.release.outputs.tag_name }}` out of run: shell strings into step-level env: blocks (MAJOR, MINOR, TAG_NAME), then referenced them as double-quoted shell variables.

3. **script-injection (test.yml)**: Replaced `${{ env.VERSION }}` template expression inside the run: shell string with `$VERSION` — the VERSION env var is already set at the job level, so it's available as a plain shell variable without template interpolation.

4. **script-injection (dependabot.yml)**: Added double-quotes around `$PR_URL` in both gh commands to prevent shell metacharacter injection from attacker-controlled PR URLs.

