<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.57

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.57** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files use mutable tag-based refs instead of full 40-character SHA commit pins. This exposes the workflows to supply-chain attacks if any of the referenced actions are compromised or their tags are moved. Unpinned references found:
- build.yml: actions/checkout@v7, actions/setup-node@v6, stefanzweifel/git-auto-commit-action@v7
- commitlint.yml: actions/checkout@v7, actions/setup-node@v6
- lint.yml: actions/checkout@v7, actions/setup-node@v6
- release-please.yml: googleapis/release-please-action@v5, actions/checkout@v7
- test.yml: actions/checkout@v7, actions/setup-node@v6, codecov/codecov-action@v7, actions/checkout@v7, actions/cache@v5
- version.yml: actions/checkout@v7, actions/setup-node@v6

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:27`
- `.github/workflows/commitlint.yml:11`
- `.github/workflows/commitlint.yml:16`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:16`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:33`
- `.github/workflows/test.yml:11`
- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:24`
- `.github/workflows/test.yml:46`
- `.github/workflows/test.yml:55`
- `.github/workflows/version.yml:16`
- `.github/workflows/version.yml:24`

### script-injection (severity: high)

Rule (a) violation: GitHub Actions expressions are directly interpolated into run: shell command strings, allowing template substitution before the shell processes the value. In release-please.yml, the 'Tag major and minor versions' step interpolates ${{ needs.release.outputs.major }} and ${{ needs.release.outputs.minor }} directly into git tag and git push commands (e.g., `git tag -d v${{ needs.release.outputs.major }} || true`). The 'Tag latest release' step interpolates ${{ needs.release.outputs.tag_name }} directly into `gh release edit ${{ needs.release.outputs.tag_name }} --latest`. These step outputs flow from the release-please action and could contain unexpected characters. All ${{ ... }} expressions must be moved to env: vars and the shell expansions must be double-quoted.

Locations:

- `.github/workflows/release-please.yml:38`
- `.github/workflows/release-please.yml:39`
- `.github/workflows/release-please.yml:40`
- `.github/workflows/release-please.yml:41`
- `.github/workflows/release-please.yml:42`
- `.github/workflows/release-please.yml:43`
- `.github/workflows/release-please.yml:46`

### script-injection (severity: high)

Rule (a) violation: In test.yml, the 'Check version' step in the integration job directly interpolates ${{ env.VERSION }} inside a run: shell command string: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]; then`. The ${{ env.VERSION }} expression is substituted by the YAML template engine before the shell sees it, meaning any shell metacharacters in the value would be interpreted by the shell. This should be replaced with a reference to the $VERSION shell environment variable (already set in the job's env: block) and properly double-quoted.

Locations:

- `.github/workflows/test.yml:68`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all 6 workflow files:

1. **unpinned-uses** (all workflows): Pinned all action references to full 40-char SHAs with tag comments preserved:
   - actions/checkout@v7 → @3d3c42e5aac5ba805825da76410c181273ba90b1
   - actions/setup-node@v6 → @249970729cb0ef3589644e2896645e5dc5ba9c38
   - stefanzweifel/git-auto-commit-action@v7 → @4a55954c782fc1ea30b9056cd3e7a2b40ca8887d
   - googleapis/release-please-action@v5 → @45996ed1f6d02564a971a2fa1b5860e934307cf7
   - codecov/codecov-action@v7 → @fb8b3582c8e4def4969c97caa2f19720cb33a72f
   - actions/cache@v5 → @caa296126883cff596d87d8935842f9db880ef25

2. **script-injection in release-please.yml**: Moved ${{ needs.release.outputs.major }}, ${{ needs.release.outputs.minor }}, and ${{ needs.release.outputs.tag_name }} into env: blocks (MAJOR, MINOR, TAG_NAME) and referenced them as double-quoted shell variables in run: scripts.

3. **script-injection in test.yml**: Replaced ${{ env.VERSION }} in the 'Check version' run: shell string with the shell variable $VERSION (already available via the job's env: block). Changed the glob pattern from single-quoted to double-quoted so the variable expands properly.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two instances of unquoted `$PR_URL` in `.github/workflows/dependabot.yml`. Changed `gh pr review --approve $PR_URL` to `gh pr review --approve "$PR_URL"` and `gh pr merge --auto --squash $PR_URL` to `gh pr merge --auto --squash "$PR_URL"`. The PR_URL env var is populated from `github.event.pull_request.html_url` (untrusted input), so double-quoting prevents shell metacharacters in a crafted URL from causing command injection.

