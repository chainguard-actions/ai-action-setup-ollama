<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.61

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **ai-action--setup-ollama/v2.0.61** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference GitHub Actions using mutable tags instead of pinned full-length SHA commits. This exposes the workflow to supply-chain attacks if the upstream action tag is moved or compromised. Unpinned references found: actions/checkout@v7, actions/setup-node@v6, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, actions/cache@v6.

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:16`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:12`
- `.github/workflows/commitlint.yml:17`
- `.github/workflows/lint.yml:12`
- `.github/workflows/lint.yml:17`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:34`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:28`
- `.github/workflows/test.yml:61`
- `.github/workflows/version.yml:18`
- `.github/workflows/version.yml:27`

### script-injection (severity: high)

Rule (a): GitHub Actions expressions are interpolated directly inside run: shell commands, allowing injection of arbitrary shell code. In release-please.yml 'Tag major and minor versions' step, ${{ needs.release.outputs.major }} and ${{ needs.release.outputs.minor }} are embedded directly in git tag/push commands. In release-please.yml 'Tag latest release' step, ${{ needs.release.outputs.tag_name }} is embedded directly in a gh release edit command. In test.yml 'Check version' step, ${{ env.VERSION }} is embedded directly inside a [[ ]] shell comparison. Rule (b): In dependabot.yml, $PR_URL (sourced from ${{ github.event.pull_request.html_url }}) is used unquoted in run: commands 'gh pr review --approve $PR_URL' and 'gh pr merge --auto --squash $PR_URL', allowing shell metacharacter injection.

Locations:

- `.github/workflows/release-please.yml:43`
- `.github/workflows/release-please.yml:51`
- `.github/workflows/test.yml:78`
- `.github/workflows/dependabot.yml:22`
- `.github/workflows/dependabot.yml:26`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all unpinned action references by resolving full commit SHAs for: actions/checkout@v7, actions/setup-node@v6, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, and actions/cache@v6. Fixed script injection in release-please.yml by moving needs.release.outputs.major, needs.release.outputs.minor, and needs.release.outputs.tag_name into step env blocks and referencing them as shell variables. Fixed script injection in test.yml by moving env.VERSION into a step-level env var EXPECTED_VERSION. Fixed script injection in dependabot.yml by quoting $PR_URL in both gh pr review and gh pr merge commands.

