<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.68

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.68** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable version tags instead of full 40-character commit SHAs, making them vulnerable to supply-chain attacks if the tag is moved. Failing references:
- build.yml: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7
- commitlint.yml: actions/checkout@v7, actions/setup-node@v7
- lint.yml: actions/checkout@v7, actions/setup-node@v7
- release-please.yml: googleapis/release-please-action@v5, actions/checkout@v7
- test.yml: actions/checkout@v7, actions/setup-node@v7, codecov/codecov-action@v7, actions/cache@v6
- version.yml: actions/checkout@v7, actions/setup-node@v7

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:16`
- `.github/workflows/build.yml:27`
- `.github/workflows/commitlint.yml:11`
- `.github/workflows/commitlint.yml:16`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:16`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:33`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:27`
- `.github/workflows/test.yml:53`
- `.github/workflows/version.yml:18`
- `.github/workflows/version.yml:27`

### script-injection (severity: high)

Rule (a): GitHub Actions expressions are interpolated directly inside run: shell command strings, allowing template substitution before the shell processes the value.

1. release-please.yml 'Tag major and minor versions' step: `${{ needs.release.outputs.major }}` and `${{ needs.release.outputs.minor }}` are embedded directly in git tag and git push commands, e.g.: `git tag -d v${{ needs.release.outputs.major }} || true`

2. release-please.yml 'Tag latest release' step: `${{ needs.release.outputs.tag_name }}` is embedded directly in: `run: gh release edit ${{ needs.release.outputs.tag_name }} --latest`

3. test.yml 'Check version' step: `${{ env.VERSION }}` is embedded directly in a run: block: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]; then`

Rule (b): dependabot.yml sets `PR_URL: ${{ github.event.pull_request.html_url }}` in the job env and then uses `$PR_URL` unquoted in two run: steps: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. The unquoted expansion allows shell metacharacter injection from the attacker-controlled PR URL.

Locations:

- `.github/workflows/release-please.yml:42`
- `.github/workflows/release-please.yml:49`
- `.github/workflows/test.yml:67`
- `.github/workflows/dependabot.yml:21`
- `.github/workflows/dependabot.yml:24`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all unpinned action references across 6 workflow files by replacing mutable version tags with full 40-character commit SHAs (with tag comments for readability). Fixed script injection in release-please.yml by moving needs.release.outputs.major, needs.release.outputs.minor, and needs.release.outputs.tag_name into step-level env vars. Fixed script injection in test.yml by moving env.VERSION into a step-level env var EXPECTED_VERSION. Fixed shell metacharacter injection in dependabot.yml by quoting $PR_URL as "$PR_URL" in both gh commands.

