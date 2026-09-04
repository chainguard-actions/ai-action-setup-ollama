<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.74

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.74** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference GitHub Actions using mutable version tags instead of pinned 40-character SHA commit hashes. This exposes the workflow to supply-chain attacks if a tag is moved or a dependency is compromised. Affected references include: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, actions/cache@v6.

Locations:

- `.github/workflows/build.yml:11`
- `.github/workflows/build.yml:16`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:11`
- `.github/workflows/commitlint.yml:16`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:16`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:34`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:18`
- `.github/workflows/test.yml:27`
- `.github/workflows/test.yml:58`
- `.github/workflows/version.yml:16`
- `.github/workflows/version.yml:24`

### script-injection (severity: high)

Sub-rule (a): Direct expression interpolation in run: blocks. In release-please.yml, the 'Tag major and minor versions' step interpolates `${{ needs.release.outputs.major }}` and `${{ needs.release.outputs.minor }}` directly into shell commands (git tag, git push), and the 'Tag latest release' step interpolates `${{ needs.release.outputs.tag_name }}` directly into `gh release edit ${{ needs.release.outputs.tag_name }} --latest`. These are needs.*.outputs.* values that flow through YAML template substitution before the shell sees them, enabling command injection if the release-please action produces a crafted tag name.

Locations:

- `.github/workflows/release-please.yml:43`
- `.github/workflows/release-please.yml:44`
- `.github/workflows/release-please.yml:45`
- `.github/workflows/release-please.yml:46`
- `.github/workflows/release-please.yml:47`
- `.github/workflows/release-please.yml:48`
- `.github/workflows/release-please.yml:51`

### script-injection (severity: high)

Sub-rule (a): Direct expression interpolation in run: block. In test.yml, the 'Check version' step interpolates `${{ env.VERSION }}` directly inside a shell command string: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]; then`. The env.VERSION variable is sourced from matrix.version, a workflow-controllable context. Any ${{ ... }} expression inside a run: block is a script-injection risk regardless of the context it reads from.

Locations:

- `.github/workflows/test.yml:76`

### script-injection (severity: high)

Sub-rule (b): Unquoted shell variable expansion of untrusted data. In dependabot.yml (triggered by pull_request_target), the env var PR_URL is set from `${{ github.event.pull_request.html_url }}` — an attacker-controlled value. It is then expanded unquoted in two run: steps: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. An unquoted expansion allows the shell to parse metacharacters out of the value, enabling command injection. The variable must be double-quoted: `"$PR_URL"`.

Locations:

- `.github/workflows/dependabot.yml:22`
- `.github/workflows/dependabot.yml:26`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 7 workflow files:

1. **unpinned-uses** (build.yml, commitlint.yml, lint.yml, release-please.yml, test.yml, version.yml): Pinned all 6 action references to full 40-character SHA hashes with version tag comments: actions/checkout@v7→3d3c42e5, actions/setup-node@v7→820762786, stefanzweifel/git-auto-commit-action@v7→4a55954c, googleapis/release-please-action@v5→45996ed1, codecov/codecov-action@v7→fb8b3582, actions/cache@v6→55cc8345.

2. **script-injection (release-please.yml)**: Moved needs.release.outputs.major, needs.release.outputs.minor, and needs.release.outputs.tag_name into step env: blocks (MAJOR, MINOR, TAG_NAME) and referenced them as double-quoted shell variables in the run: scripts.

3. **script-injection (test.yml)**: Moved env.VERSION out of the run: shell string into the step's env: block as EXPECTED_VERSION, referenced as "$EXPECTED_VERSION" in the shell script.

4. **script-injection (dependabot.yml)**: Added double quotes around $PR_URL in both gh pr review and gh pr merge commands to prevent shell metacharacter injection from the attacker-controlled pull_request.html_url value.

