<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.69

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.69** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files reference external actions using mutable version tags (e.g. @v7, @v6, @v5) instead of full 40-character commit SHA pins. This exposes the workflow to supply-chain attacks if a tag is moved or a repository is compromised. Affected references include: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, actions/cache@v6.

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:27`
- `.github/workflows/commitlint.yml:12`
- `.github/workflows/commitlint.yml:17`
- `.github/workflows/lint.yml:12`
- `.github/workflows/lint.yml:17`
- `.github/workflows/release-please.yml:21`
- `.github/workflows/release-please.yml:28`
- `.github/workflows/test.yml:12`
- `.github/workflows/test.yml:17`
- `.github/workflows/test.yml:27`
- `.github/workflows/test.yml:46`
- `.github/workflows/version.yml:14`
- `.github/workflows/version.yml:22`

### script-injection (severity: high)

Sub-rule (a): GitHub Actions expressions are directly interpolated inside run: shell command strings, allowing template substitution before the shell processes the value. In release-please.yml, the 'Tag major and minor versions' step interpolates ${{ needs.release.outputs.major }}, ${{ needs.release.outputs.minor }}, and the 'Tag latest release' step interpolates ${{ needs.release.outputs.tag_name }} directly into shell commands (e.g. `git tag -d v${{ needs.release.outputs.major }} || true`, `gh release edit ${{ needs.release.outputs.tag_name }} --latest`). In test.yml, the 'Check version' step interpolates ${{ env.VERSION }} directly into a run: block (e.g. `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]`). These should be passed via env: variables and then referenced as quoted shell variables.

Locations:

- `.github/workflows/release-please.yml:36`
- `.github/workflows/release-please.yml:37`
- `.github/workflows/release-please.yml:38`
- `.github/workflows/release-please.yml:39`
- `.github/workflows/release-please.yml:40`
- `.github/workflows/release-please.yml:41`
- `.github/workflows/release-please.yml:44`
- `.github/workflows/test.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all 6 unpinned action references across build.yml, commitlint.yml, lint.yml, release-please.yml, test.yml, and version.yml by pinning to full 40-character commit SHAs with tag comments. Fixed script injection in release-please.yml (Tag major and minor versions step: moved MAJOR and MINOR to env:; Tag latest release step: moved TAG_NAME to env:) and in test.yml (Check version step: moved VERSION to EXPECTED_VERSION env var). All shell references now use quoted environment variables instead of direct ${{ }} expression interpolation.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed unquoted $PR_URL variable in two shell commands in .github/workflows/dependabot.yml (lines 21 and 25). Changed `gh pr review --approve $PR_URL` to `gh pr review --approve "$PR_URL"` and `gh pr merge --auto --squash $PR_URL` to `gh pr merge --auto --squash "$PR_URL"`. The variable was already correctly set via the env: block; only the quoting was missing.

