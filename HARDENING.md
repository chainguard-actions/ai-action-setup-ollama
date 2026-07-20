<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.62

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.62** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Tag major and minor versions' step directly interpolates ${{ needs.release.outputs.major }}, ${{ needs.release.outputs.minor }} expressions inside a run: shell command. These values flow through YAML template substitution before the shell sees them, enabling command injection. Sub-rule (a): The 'Tag latest release' step directly interpolates ${{ needs.release.outputs.tag_name }} inside a run: shell command (e.g., `run: gh release edit ${{ needs.release.outputs.tag_name }} --latest`).

Locations:

- `.github/workflows/release-please.yml:37`
- `.github/workflows/release-please.yml:44`

### script-injection (severity: high)

Sub-rule (a): The 'Check version' step directly interpolates ${{ env.VERSION }} inside a run: shell command string: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]`. Any ${{ }} expression inside a run: block is a script-injection risk regardless of context.

Locations:

- `.github/workflows/test.yml:67`

### script-injection (severity: high)

Sub-rule (b): The 'Approve Dependabot PR' and 'Auto-merge Dependabot PR' steps use the unquoted shell variable $PR_URL (which holds the workflow-controlled value ${{ github.event.pull_request.html_url }}) in run: commands without double-quoting: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. An unquoted expansion allows the shell to parse metacharacters from the value.

Locations:

- `.github/workflows/dependabot.yml:20`
- `.github/workflows/dependabot.yml:23`

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable version tags instead of full 40-character SHA digests, making them vulnerable to supply-chain attacks if the tag is moved. Failing references include: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7 (build.yml); actions/checkout@v7, actions/setup-node@v7 (commitlint.yml); googleapis/release-please-action@v5, actions/checkout@v7 (release-please.yml); actions/checkout@v7, actions/setup-node@v7, codecov/codecov-action@v7, actions/cache@v6 (test.yml); actions/checkout@v7, actions/setup-node@v7 (lint.yml); actions/checkout@v7, actions/setup-node@v7 (version.yml).

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:27`
- `.github/workflows/commitlint.yml:12`
- `.github/workflows/commitlint.yml:17`
- `.github/workflows/lint.yml:12`
- `.github/workflows/lint.yml:17`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:31`
- `.github/workflows/test.yml:12`
- `.github/workflows/test.yml:17`
- `.github/workflows/test.yml:30`
- `.github/workflows/test.yml:49`
- `.github/workflows/version.yml:17`
- `.github/workflows/version.yml:28`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed all findings across 6 workflow files:

1. script-injection (release-please.yml): Moved needs.release.outputs.major, .minor, and .tag_name expressions into env: blocks (MAJOR, MINOR, TAG_NAME) and used double-quoted shell variable references instead of direct ${{ }} interpolation in run: commands.

2. script-injection (test.yml): Moved env.VERSION expression into an env: block as EXPECTED_VERSION and referenced it as "${EXPECTED_VERSION}" in the shell comparison.

3. script-injection (dependabot.yml): Added double-quotes around $PR_URL in both gh pr review and gh pr merge commands to prevent shell metacharacter injection.

4. unpinned-uses (build.yml, commitlint.yml, lint.yml, release-please.yml, test.yml, version.yml): Pinned all 6 distinct action references to full 40-character SHA digests with tag comments preserved: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (v7), actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 (v7), stefanzweifel/git-auto-commit-action@4a55954c782fc1ea30b9056cd3e7a2b40ca8887d (v7), googleapis/release-please-action@45996ed1f6d02564a971a2fa1b5860e934307cf7 (v5), codecov/codecov-action@fb8b3582c8e4def4969c97caa2f19720cb33a72f (v7), actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 (v6).

