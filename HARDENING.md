<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.63

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.63** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files use mutable tag-based action references (e.g. @v7, @v5, @v6) instead of full 40-character SHA commit pins. This exposes the workflows to supply-chain attacks if any upstream action tag is moved or compromised. Affected references include: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, actions/cache@v6.

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:12`
- `.github/workflows/commitlint.yml:17`
- `.github/workflows/lint.yml:12`
- `.github/workflows/lint.yml:17`
- `.github/workflows/release-please.yml:21`
- `.github/workflows/release-please.yml:30`
- `.github/workflows/test.yml:12`
- `.github/workflows/test.yml:17`
- `.github/workflows/test.yml:26`
- `.github/workflows/test.yml:48`
- `.github/workflows/test.yml:55`
- `.github/workflows/version.yml:14`
- `.github/workflows/version.yml:24`

### script-injection (severity: high)

Sub-rule (a): ${{ needs.release.outputs.major }}, ${{ needs.release.outputs.minor }}, and ${{ needs.release.outputs.tag_name }} are directly interpolated inside run: shell commands in the 'Tag major and minor versions' and 'Tag latest release' steps. These are needs.*.outputs.* values — workflow-controllable context — injected directly into shell before the shell ever sees them, enabling command injection. Offending lines include: `git tag -d v${{ needs.release.outputs.major }} || true`, `git push -f origin v${{ needs.release.outputs.major }}`, and `gh release edit ${{ needs.release.outputs.tag_name }} --latest`.

Locations:

- `.github/workflows/release-please.yml:37`
- `.github/workflows/release-please.yml:38`
- `.github/workflows/release-please.yml:39`
- `.github/workflows/release-please.yml:40`
- `.github/workflows/release-please.yml:41`
- `.github/workflows/release-please.yml:42`
- `.github/workflows/release-please.yml:45`

### script-injection (severity: high)

Sub-rule (a): ${{ env.VERSION }} is directly interpolated inside a run: shell string in the 'Check version' step: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'*`. The env.VERSION variable is sourced from matrix.version (a workflow-controllable matrix value), so interpolating it directly into the shell command string allows injection of shell metacharacters before the shell parses the script.

Locations:

- `.github/workflows/test.yml:68`

### script-injection (severity: high)

Sub-rule (b): In dependabot.yml (triggered by pull_request_target), the env var PR_URL is set from the untrusted value ${{ github.event.pull_request.html_url }} and then used unquoted as $PR_URL in two run: shell commands: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. Unquoted shell expansion of an attacker-controlled URL allows shell metacharacter injection. The variable must be double-quoted: "$PR_URL".

Locations:

- `.github/workflows/dependabot.yml:21`
- `.github/workflows/dependabot.yml:24`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 6 workflow files:

1. unpinned-uses: Pinned all 6 mutable action references to full 40-char SHAs with tag comments preserved:
   - actions/checkout@v7 → @3d3c42e5aac5ba805825da76410c181273ba90b1
   - actions/setup-node@v7 → @820762786026740c76f36085b0efc47a31fe5020
   - stefanzweifel/git-auto-commit-action@v7 → @4a55954c782fc1ea30b9056cd3e7a2b40ca8887d
   - googleapis/release-please-action@v5 → @45996ed1f6d02564a971a2fa1b5860e934307cf7
   - codecov/codecov-action@v7 → @fb8b3582c8e4def4969c97caa2f19720cb33a72f
   - actions/cache@v6 → @55cc8345863c7cc4c66a329aec7e433d2d1c52a9

2. script-injection (release-please.yml): Moved needs.release.outputs.major, .minor, and .tag_name into step env: blocks (MAJOR, MINOR, TAG_NAME) and referenced them as double-quoted shell variables.

3. script-injection (test.yml): Moved ${{ env.VERSION }} into step env: block as EXPECTED_VERSION and referenced it as "${EXPECTED_VERSION}" in the shell script.

4. script-injection (dependabot.yml): Added double quotes around $PR_URL in both gh pr review and gh pr merge commands to prevent shell metacharacter injection.

