<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.56

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.56** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Tag major and minor versions' run: block directly interpolates `${{ needs.release.outputs.major }}` and `${{ needs.release.outputs.minor }}` (step outputs, a workflow-controllable context) into shell commands without routing through env vars or quoting. Example offending lines: `git tag -d v${{ needs.release.outputs.major }} || true` and `git push -f origin v${{ needs.release.outputs.major }}.${{ needs.release.outputs.minor }}`. Any expression inside a run: block is a script-injection risk regardless of context.

Locations:

- `.github/workflows/release-please.yml:43`

### script-injection (severity: high)

Sub-rule (a): The 'Tag latest release' run: block directly interpolates `${{ needs.release.outputs.tag_name }}` (a step output, workflow-controllable) into a shell command: `run: gh release edit ${{ needs.release.outputs.tag_name }} --latest`. Any `${{ ... }}` expression directly inside a run: block is a script-injection finding.

Locations:

- `.github/workflows/release-please.yml:51`

### script-injection (severity: high)

Sub-rule (a): The 'Check version' run: block directly interpolates `${{ env.VERSION }}` (sourced from `${{ matrix.version }}`, a matrix/env context value) into a shell string: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]; then`. Any `${{ ... }}` expression directly inside a run: block is a script-injection finding.

Locations:

- `.github/workflows/test.yml:78`

### unpinned-uses (severity: high)

Multiple workflow files reference GitHub Actions using mutable version tags instead of pinned 40-character SHA commit hashes, making them vulnerable to supply-chain attacks if the tag is moved. Failing references: actions/checkout@v7, actions/setup-node@v6, stefanzweifel/git-auto-commit-action@v7 (build.yml); actions/checkout@v7, actions/setup-node@v6 (commitlint.yml); actions/checkout@v7, actions/setup-node@v6 (lint.yml); googleapis/release-please-action@v5, actions/checkout@v7 (release-please.yml); actions/checkout@v7, actions/setup-node@v6, codecov/codecov-action@v7, actions/cache@v5 (test.yml); actions/checkout@v7, actions/setup-node@v6 (version.yml).

Locations:

- `.github/workflows/build.yml:13`
- `.github/workflows/build.yml:16`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:13`
- `.github/workflows/commitlint.yml:17`
- `.github/workflows/lint.yml:13`
- `.github/workflows/lint.yml:17`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:34`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:28`
- `.github/workflows/test.yml:61`
- `.github/workflows/version.yml:16`
- `.github/workflows/version.yml:26`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed 3 script-injection findings and 15 unpinned-uses findings across 6 workflow files:

**Script injection fixes:**
- release-please.yml 'Tag major and minor versions': Moved `${{ needs.release.outputs.major }}` and `${{ needs.release.outputs.minor }}` to env vars MAJOR/MINOR, referenced as shell variables.
- release-please.yml 'Tag latest release': Moved `${{ needs.release.outputs.tag_name }}` to env var TAG_NAME, referenced as "$TAG_NAME".
- test.yml 'Check version': Moved `${{ env.VERSION }}` to env var EXPECTED_VERSION, referenced as "${EXPECTED_VERSION}".

**Unpinned action fixes (all resolved via lookup_action_sha):**
- actions/checkout@v7 → @3d3c42e5aac5ba805825da76410c181273ba90b1 (build.yml, commitlint.yml, lint.yml, release-please.yml, test.yml, version.yml)
- actions/setup-node@v6 → @249970729cb0ef3589644e2896645e5dc5ba9c38 (build.yml, commitlint.yml, lint.yml, test.yml, version.yml)
- stefanzweifel/git-auto-commit-action@v7 → @4a55954c782fc1ea30b9056cd3e7a2b40ca8887d (build.yml)
- googleapis/release-please-action@v5 → @45996ed1f6d02564a971a2fa1b5860e934307cf7 (release-please.yml)
- codecov/codecov-action@v7 → @fb8b3582c8e4def4969c97caa2f19720cb33a72f (test.yml)
- actions/cache@v5 → @caa296126883cff596d87d8935842f9db880ef25 (test.yml)

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two instances of unquoted `$PR_URL` in hardened/action/.github/workflows/dependabot.yml. Changed `gh pr review --approve $PR_URL` to `gh pr review --approve "$PR_URL"` and `gh pr merge --auto --squash $PR_URL` to `gh pr merge --auto --squash "$PR_URL"`. The variable is set from the untrusted `github.event.pull_request.html_url` expression; double-quoting prevents shell metacharacters from being interpreted.

