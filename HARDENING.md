<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.61

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.61** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files reference external actions using mutable version tags instead of full 40-character SHA commit hashes. This exposes the workflow to supply-chain attacks if a tag is moved or an action is compromised. Affected references include: actions/checkout@v7, actions/setup-node@v6, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, actions/cache@v6.

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:27`
- `.github/workflows/commitlint.yml:12`
- `.github/workflows/commitlint.yml:17`
- `.github/workflows/lint.yml:12`
- `.github/workflows/lint.yml:17`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:33`
- `.github/workflows/test.yml:12`
- `.github/workflows/test.yml:17`
- `.github/workflows/test.yml:27`
- `.github/workflows/test.yml:47`
- `.github/workflows/test.yml:54`
- `.github/workflows/version.yml:18`
- `.github/workflows/version.yml:28`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: shell commands. In release-please.yml, the 'Tag major and minor versions' step interpolates ${{ needs.release.outputs.major }}, ${{ needs.release.outputs.minor }} directly into git tag and git push shell commands (e.g. `git tag -d v${{ needs.release.outputs.major }} || true`). The 'Tag latest release' step interpolates ${{ needs.release.outputs.tag_name }} directly into `gh release edit ${{ needs.release.outputs.tag_name }} --latest`. In test.yml, the 'Check version' step interpolates ${{ env.VERSION }} directly into a shell string: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]; then`. All ${{ }} expressions are expanded by the YAML template engine before the shell ever sees them, enabling shell metacharacter injection.

Locations:

- `.github/workflows/release-please.yml:41`
- `.github/workflows/release-please.yml:42`
- `.github/workflows/release-please.yml:43`
- `.github/workflows/release-please.yml:44`
- `.github/workflows/release-please.yml:45`
- `.github/workflows/release-please.yml:46`
- `.github/workflows/release-please.yml:49`
- `.github/workflows/test.yml:64`

### script-injection (severity: high)

Sub-rule (b): Unquoted shell variable expansion of untrusted data. In dependabot.yml, the job-level env var PR_URL is set from ${{ github.event.pull_request.html_url }} (attacker-controllable via pull_request_target). It is then used unquoted in two run: steps: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. An unquoted variable allows shell word-splitting and glob expansion of any metacharacters embedded in the URL value.

Locations:

- `.github/workflows/dependabot.yml:20`
- `.github/workflows/dependabot.yml:23`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 6 workflow files:

1. **unpinned-uses** (build.yml, commitlint.yml, lint.yml, release-please.yml, test.yml, version.yml): Pinned all 6 external action references to full 40-character SHA commit hashes with mutable tag preserved in a comment:
   - actions/checkout@v7 → @9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0
   - actions/setup-node@v6 → @249970729cb0ef3589644e2896645e5dc5ba9c38
   - stefanzweifel/git-auto-commit-action@v7 → @4a55954c782fc1ea30b9056cd3e7a2b40ca8887d
   - googleapis/release-please-action@v5 → @45996ed1f6d02564a971a2fa1b5860e934307cf7
   - codecov/codecov-action@v7 → @fb8b3582c8e4def4969c97caa2f19720cb33a72f
   - actions/cache@v6 → @55cc8345863c7cc4c66a329aec7e433d2d1c52a9

2. **script-injection sub-rule (a)** (release-please.yml, test.yml): Moved all ${{ }} expressions out of run: shell strings into step-level env: blocks. In release-please.yml, MAJOR/MINOR/TAG_NAME env vars replace direct interpolation in git tag/push/gh commands. In test.yml, EXPECTED_VERSION env var replaces ${{ env.VERSION }} in the version check string.

3. **script-injection sub-rule (b)** (dependabot.yml): Quoted $PR_URL in both shell commands (`"$PR_URL"`) to prevent word-splitting and glob expansion of attacker-controlled URL values.

