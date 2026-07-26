<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.64

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.64** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All `uses:` references across workflow files use mutable version tags instead of pinned 40-character SHA commit hashes, making the workflows vulnerable to supply-chain attacks if the referenced action tags are moved or compromised. Affected references include: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, actions/cache@v6.

Locations:

- `.github/workflows/build.yml:10`
- `.github/workflows/build.yml:15`
- `.github/workflows/build.yml:25`
- `.github/workflows/commitlint.yml:10`
- `.github/workflows/commitlint.yml:15`
- `.github/workflows/lint.yml:10`
- `.github/workflows/lint.yml:15`
- `.github/workflows/release-please.yml:21`
- `.github/workflows/release-please.yml:30`
- `.github/workflows/test.yml:10`
- `.github/workflows/test.yml:15`
- `.github/workflows/test.yml:26`
- `.github/workflows/test.yml:46`
- `.github/workflows/test.yml:52`
- `.github/workflows/version.yml:14`
- `.github/workflows/version.yml:24`

### script-injection (severity: high)

Sub-rule (a): GitHub Actions expressions are interpolated directly inside `run:` shell command strings. In release-please.yml, `${{ needs.release.outputs.major }}`, `${{ needs.release.outputs.minor }}`, and `${{ needs.release.outputs.tag_name }}` are embedded directly in shell commands (`git tag -d v${{ needs.release.outputs.major }}`, `git push -f origin v${{ needs.release.outputs.major }}`, `gh release edit ${{ needs.release.outputs.tag_name }} --latest`). These values flow through YAML template substitution before the shell parses them, allowing injection of shell metacharacters. In test.yml, `${{ env.VERSION }}` (sourced from `matrix.version`, a workflow-controlled value) is interpolated directly inside a bash `run:` block: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]`.

Locations:

- `.github/workflows/release-please.yml:38`
- `.github/workflows/release-please.yml:44`
- `.github/workflows/test.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all unpinned action references across build.yml, commitlint.yml, lint.yml, release-please.yml, test.yml, and version.yml by pinning to full 40-character SHA hashes (with tag comments for readability). Fixed script injection in release-please.yml by moving needs.release.outputs.major, needs.release.outputs.minor, and needs.release.outputs.tag_name into env: blocks (MAJOR, MINOR, TAG_NAME). Fixed script injection in test.yml by moving env.VERSION into an env: block as EXPECTED_VERSION in the 'Check version' step.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in hardened/action/.github/workflows/dependabot.yml by adding double quotes around $PR_URL in both run: steps (lines 22 and 26). The variable was populated from the attacker-controllable `${{ github.event.pull_request.html_url }}` expression and used unquoted, allowing shell metacharacter injection via a crafted PR URL. Both `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL` were updated to use `"$PR_URL"` instead.

