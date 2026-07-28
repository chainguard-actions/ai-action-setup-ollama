<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.65

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.65** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files use mutable tag-based `uses:` references instead of pinned full 40-character SHA commit hashes. This exposes the action to supply-chain attacks if any upstream action is compromised or its tag is moved. Affected references include: `actions/checkout@v7`, `actions/setup-node@v7`, `stefanzweifel/git-auto-commit-action@v7`, `googleapis/release-please-action@v5`, `codecov/codecov-action@v7`, `actions/cache@v6`. All should be pinned to their full SHA digest.

Locations:

- `.github/workflows/build.yml:10`
- `.github/workflows/build.yml:15`
- `.github/workflows/build.yml:25`
- `.github/workflows/commitlint.yml:11`
- `.github/workflows/commitlint.yml:16`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:16`
- `.github/workflows/release-please.yml:24`
- `.github/workflows/release-please.yml:33`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:18`
- `.github/workflows/test.yml:27`
- `.github/workflows/test.yml:51`
- `.github/workflows/test.yml:60`
- `.github/workflows/version.yml:16`
- `.github/workflows/version.yml:24`

### script-injection (severity: high)

Sub-rule (a): `${{ needs.release.outputs.major }}`, `${{ needs.release.outputs.minor }}`, and `${{ needs.release.outputs.tag_name }}` are directly interpolated inside `run:` shell command strings in the 'Tag major and minor versions' and 'Tag latest release' steps. These are `needs.*.outputs.*` values — workflow-controllable contexts that flow through YAML template substitution before the shell sees them, enabling command injection. They must be moved to `env:` variables and the shell expansions must be double-quoted.

Locations:

- `.github/workflows/release-please.yml:40`
- `.github/workflows/release-please.yml:41`
- `.github/workflows/release-please.yml:42`
- `.github/workflows/release-please.yml:43`
- `.github/workflows/release-please.yml:44`
- `.github/workflows/release-please.yml:45`
- `.github/workflows/release-please.yml:48`

### script-injection (severity: high)

Sub-rule (a): `${{ env.VERSION }}` is directly interpolated inside a `run:` shell command string in the 'Check version' step of the integration job. `env.VERSION` is sourced from `matrix.version` (a workflow-controllable context), so this expression flows through YAML template substitution before the shell sees it, enabling injection. It should be referenced as the shell variable `$VERSION` (already in the job-level `env:` block) with proper double-quoting instead of using `${{ env.VERSION }}` directly in the script.

Locations:

- `.github/workflows/test.yml:72`

### script-injection (severity: high)

Sub-rule (b): In `dependabot.yml`, the env variable `PR_URL` holds `${{ github.event.pull_request.html_url }}` — an attacker-controlled value from a `pull_request_target` trigger. It is expanded unquoted as `$PR_URL` in both `run:` steps (`gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`). An unquoted shell variable expansion allows shell metacharacters in the URL to be interpreted, enabling command injection. The variable must be double-quoted: `"$PR_URL"`.

Locations:

- `.github/workflows/dependabot.yml:20`
- `.github/workflows/dependabot.yml:23`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 7 workflow files:

1. **unpinned-uses**: Pinned all 6 action references to full 40-char SHAs with tag comments preserved:
   - actions/checkout@v7 → @3d3c42e5aac5ba805825da76410c181273ba90b1
   - actions/setup-node@v7 → @820762786026740c76f36085b0efc47a31fe5020
   - stefanzweifel/git-auto-commit-action@v7 → @4a55954c782fc1ea30b9056cd3e7a2b40ca8887d
   - googleapis/release-please-action@v5 → @45996ed1f6d02564a971a2fa1b5860e934307cf7
   - codecov/codecov-action@v7 → @fb8b3582c8e4def4969c97caa2f19720cb33a72f
   - actions/cache@v6 → @55cc8345863c7cc4c66a329aec7e433d2d1c52a9

2. **script-injection (release-please.yml)**: Moved needs.release.outputs.major, .minor, and .tag_name into env: blocks (MAJOR, MINOR, TAG_NAME) and referenced them as double-quoted shell variables in run: scripts.

3. **script-injection (test.yml)**: Replaced ${{ env.VERSION }} in the Check version step with $VERSION (already in job-level env:), properly double-quoted.

4. **script-injection (dependabot.yml)**: Double-quoted $PR_URL in both gh pr review and gh pr merge commands to prevent shell metacharacter injection.

