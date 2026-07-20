<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.59

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.59** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files reference GitHub Actions using mutable version tags instead of immutable 40-character SHA digests, making the workflows vulnerable to supply-chain attacks if a tag is moved. Failing references include: actions/checkout@v7, actions/setup-node@v6, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, actions/cache@v6.

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:11`
- `.github/workflows/commitlint.yml:16`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:16`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:31`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:18`
- `.github/workflows/test.yml:27`
- `.github/workflows/test.yml:55`
- `.github/workflows/test.yml:60`
- `.github/workflows/version.yml:16`
- `.github/workflows/version.yml:22`

### script-injection (severity: high)

Sub-rule (a): ${{ }} expressions are interpolated directly inside run: shell command strings, allowing an attacker to inject arbitrary shell commands. In release-please.yml, the 'Tag major and minor versions' step uses `${{ needs.release.outputs.major }}` and `${{ needs.release.outputs.minor }}` directly in git tag/push commands, and the 'Tag latest release' step uses `${{ needs.release.outputs.tag_name }}` directly in a gh CLI command. In test.yml, the 'Check version' step uses `${{ env.VERSION }}` directly inside a bash conditional string.

Locations:

- `.github/workflows/release-please.yml:36`
- `.github/workflows/release-please.yml:48`
- `.github/workflows/test.yml:68`

### script-injection (severity: high)

Sub-rule (b): In dependabot.yml, the env var $PR_URL (sourced from the untrusted `${{ github.event.pull_request.html_url }}`) is expanded unquoted in two run: commands: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. An attacker-controlled PR URL containing shell metacharacters could alter command execution. The variable must be double-quoted: `"$PR_URL"`.

Locations:

- `.github/workflows/dependabot.yml:21`
- `.github/workflows/dependabot.yml:24`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 7 workflow files:

1. unpinned-uses: Pinned all 6 actions to full 40-char SHAs with tag comments preserved:
   - actions/checkout@v7 → @3d3c42e5aac5ba805825da76410c181273ba90b1
   - actions/setup-node@v6 → @249970729cb0ef3589644e2896645e5dc5ba9c38
   - stefanzweifel/git-auto-commit-action@v7 → @4a55954c782fc1ea30b9056cd3e7a2b40ca8887d
   - googleapis/release-please-action@v5 → @45996ed1f6d02564a971a2fa1b5860e934307cf7
   - codecov/codecov-action@v7 → @fb8b3582c8e4def4969c97caa2f19720cb33a72f
   - actions/cache@v6 → @55cc8345863c7cc4c66a329aec7e433d2d1c52a9

2. script-injection (release-please.yml): Moved needs.release.outputs.major, .minor, and .tag_name into step env: blocks (MAJOR, MINOR, TAG_NAME) and referenced as shell variables with proper quoting.

3. script-injection (test.yml): Moved env.VERSION into step env: block as EXPECTED_VERSION and referenced as ${EXPECTED_VERSION} in the shell conditional.

4. script-injection (dependabot.yml): Added double-quotes around $PR_URL in both gh pr review and gh pr merge commands to prevent shell metacharacter injection.

