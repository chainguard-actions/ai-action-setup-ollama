<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.72

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.72** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference GitHub Actions using mutable version tags instead of pinned full-length SHA commit hashes. This exposes the workflow to supply-chain attacks if a tag is moved or a dependency is compromised. Affected references include: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7 (build.yml); actions/checkout@v7, actions/setup-node@v7 (commitlint.yml); actions/checkout@v7, actions/setup-node@v7 (lint.yml); googleapis/release-please-action@v5, actions/checkout@v7 (release-please.yml); actions/checkout@v7, actions/setup-node@v7, codecov/codecov-action@v7, actions/cache@v6 (test.yml); actions/checkout@v7, actions/setup-node@v7 (version.yml). All should be pinned to full 40-character SHA digests.

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:25`
- `.github/workflows/commitlint.yml:12`
- `.github/workflows/commitlint.yml:17`
- `.github/workflows/lint.yml:12`
- `.github/workflows/lint.yml:17`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:32`
- `.github/workflows/test.yml:12`
- `.github/workflows/test.yml:17`
- `.github/workflows/test.yml:22`
- `.github/workflows/test.yml:48`
- `.github/workflows/test.yml:57`
- `.github/workflows/version.yml:15`
- `.github/workflows/version.yml:22`

### script-injection (severity: high)

Sub-rule (a): GitHub Actions expressions are directly interpolated inside `run:` shell command strings, allowing template-substituted values to be parsed as shell syntax before quoting can protect them.

1. release-please.yml 'Tag major and minor versions' step: `git tag -d v${{ needs.release.outputs.major }} || true`, `git tag -a v${{ needs.release.outputs.major }}.${{ needs.release.outputs.minor }} -m ...`, and similar lines directly embed `needs.release.outputs.*` (steps output context) into shell commands.

2. release-please.yml 'Tag latest release' step: `run: gh release edit ${{ needs.release.outputs.tag_name }} --latest` directly embeds a step output into a shell command.

3. test.yml 'Check version' step: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]; then` — `${{ env.VERSION }}` is interpolated by GitHub Actions into the shell script before the shell processes it, even though it appears inside single quotes in the YAML.

Sub-rule (b): dependabot.yml uses `$PR_URL` (sourced from `${{ github.event.pull_request.html_url }}`, an attacker-controllable value on pull_request_target) unquoted in two `run:` commands: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. An attacker-crafted PR URL containing shell metacharacters could achieve command injection.

Locations:

- `.github/workflows/release-please.yml:41`
- `.github/workflows/release-please.yml:47`
- `.github/workflows/test.yml:68`
- `.github/workflows/dependabot.yml:22`
- `.github/workflows/dependabot.yml:25`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all 16 unpinned action references across build.yml, commitlint.yml, lint.yml, release-please.yml, test.yml, and version.yml by pinning to full SHA digests with version tag comments. Fixed script injection in release-please.yml by moving needs.release.outputs.major, needs.release.outputs.minor, and needs.release.outputs.tag_name into env vars (MAJOR, MINOR, TAG_NAME) and using them as quoted shell variables. Fixed script injection in test.yml 'Check version' step by moving env.VERSION into env var EXPECTED_VERSION. Fixed unquoted $PR_URL in dependabot.yml by adding double quotes around both usages.

