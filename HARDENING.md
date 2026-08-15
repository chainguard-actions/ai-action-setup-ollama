<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.58

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.58** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files use mutable tag refs instead of pinned 40-character SHA digests, making them vulnerable to supply-chain attacks if the upstream action tag is moved or compromised.

Failing references:
- build.yml: `actions/checkout@v7`, `actions/setup-node@v6`, `stefanzweifel/git-auto-commit-action@v7`
- commitlint.yml: `actions/checkout@v7`, `actions/setup-node@v6`
- lint.yml: `actions/checkout@v7`, `actions/setup-node@v6`
- release-please.yml: `googleapis/release-please-action@v5`, `actions/checkout@v7`
- test.yml: `actions/checkout@v7`, `actions/setup-node@v6`, `codecov/codecov-action@v7`, `actions/cache@v6`
- version.yml: `actions/checkout@v7`, `actions/setup-node@v6`

Locations:

- `.github/workflows/build.yml:9`
- `.github/workflows/build.yml:14`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:11`
- `.github/workflows/commitlint.yml:16`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:16`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:33`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:18`
- `.github/workflows/test.yml:27`
- `.github/workflows/test.yml:57`
- `.github/workflows/version.yml:15`
- `.github/workflows/version.yml:24`

### script-injection (severity: high)

Sub-rule (a): GitHub Actions expressions (`${{ ... }}`) are interpolated directly inside `run:` shell command strings, allowing injection of shell metacharacters before the shell ever sees the value.

1. `.github/workflows/release-please.yml` — The `Tag major and minor versions` step interpolates `${{ needs.release.outputs.major }}`, `${{ needs.release.outputs.minor }}` directly into git tag/push commands:
   ```
   git tag -d v${{ needs.release.outputs.major }} || true
   git tag -d v${{ needs.release.outputs.major }}.${{ needs.release.outputs.minor }} || true
   git tag -a v${{ needs.release.outputs.major }} -m 'Release v${{ needs.release.outputs.major }}'
   git push -f origin v${{ needs.release.outputs.major }}
   ```
   The `Tag latest release` step interpolates `${{ needs.release.outputs.tag_name }}` directly:
   ```
   run: gh release edit ${{ needs.release.outputs.tag_name }} --latest
   ```

2. `.github/workflows/test.yml` — The `Check version` step interpolates `${{ env.VERSION }}` (sourced from `matrix.version`) directly inside a `run:` shell string:
   ```
   if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]; then
   ```
   These values flow through YAML template substitution before the shell processes them, enabling script injection.

Locations:

- `.github/workflows/release-please.yml:42`
- `.github/workflows/release-please.yml:50`
- `.github/workflows/test.yml:70`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all 15 unpinned action references across 6 workflow files by resolving each tag to its full 40-character SHA digest (preserving the tag in a comment). Fixed 3 script injection points: in release-please.yml, moved ${{ needs.release.outputs.major }}, ${{ needs.release.outputs.minor }}, and ${{ needs.release.outputs.tag_name }} into step env: blocks; in test.yml, moved ${{ env.VERSION }} into a step-level env: block as EXPECTED_VERSION and updated the shell comparison to use double-quoted variable expansion instead of the literal expression string.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed unquoted $PR_URL variable in hardened/action/.github/workflows/dependabot.yml. Both `run:` commands on lines 21 and 25 now use `"$PR_URL"` (double-quoted) instead of bare `$PR_URL`, preventing shell metacharacter injection from the untrusted `github.event.pull_request.html_url` value on the `pull_request_target` trigger.

