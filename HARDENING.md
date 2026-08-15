<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.50

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.50** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All `uses:` references across all workflow files are pinned to mutable tags or version strings instead of immutable 40-character SHA commit hashes. This exposes the workflows to supply-chain attacks if any referenced action is compromised or its tag is moved. Affected references include: actions/checkout@v6, actions/setup-node@v6, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v6, actions/cache@v5.

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:10`
- `.github/workflows/commitlint.yml:15`
- `.github/workflows/lint.yml:10`
- `.github/workflows/lint.yml:15`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:33`
- `.github/workflows/test.yml:10`
- `.github/workflows/test.yml:15`
- `.github/workflows/test.yml:22`
- `.github/workflows/test.yml:44`
- `.github/workflows/test.yml:50`
- `.github/workflows/version.yml:13`
- `.github/workflows/version.yml:22`

### script-injection (severity: high)

Rule (a): `${{ ... }}` expressions are interpolated directly inside `run:` shell command strings. In release-please.yml, the 'Tag major and minor versions' step interpolates `${{ needs.release.outputs.major }}`, `${{ needs.release.outputs.minor }}` directly into git tag and git push commands, and the 'Tag latest release' step interpolates `${{ needs.release.outputs.tag_name }}` directly into a gh CLI command. These are `needs.*.outputs.*` context values which flow through YAML template substitution before the shell sees them, allowing shell metacharacter injection. In test.yml, the 'Check version' step interpolates `${{ env.VERSION }}` directly inside a bash string comparison in a `run:` block.

Locations:

- `.github/workflows/release-please.yml:36`
- `.github/workflows/release-please.yml:37`
- `.github/workflows/release-please.yml:38`
- `.github/workflows/release-please.yml:39`
- `.github/workflows/release-please.yml:40`
- `.github/workflows/release-please.yml:41`
- `.github/workflows/release-please.yml:44`
- `.github/workflows/test.yml:57`

### script-injection (severity: high)

Rule (b): In dependabot.yml, the env var `PR_URL` is set from `${{ github.event.pull_request.html_url }}` (a `github.*` context value) and then expanded unquoted as `$PR_URL` in two `run:` blocks: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. An unquoted shell variable expansion allows shell metacharacters in the URL value to be interpreted by the shell, enabling command injection. The variable must be double-quoted: `"$PR_URL"`.

Locations:

- `.github/workflows/dependabot.yml:21`
- `.github/workflows/dependabot.yml:25`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 7 workflow files:

1. **unpinned-uses**: Pinned all 6 action references to full 40-char SHAs with tag comments preserved:
   - actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803
   - actions/setup-node@v6 → 249970729cb0ef3589644e2896645e5dc5ba9c38
   - stefanzweifel/git-auto-commit-action@v7 → 4a55954c782fc1ea30b9056cd3e7a2b40ca8887d
   - googleapis/release-please-action@v5 → 45996ed1f6d02564a971a2fa1b5860e934307cf7
   - codecov/codecov-action@v6 → fb8b3582c8e4def4969c97caa2f19720cb33a72f
   - actions/cache@v5 → caa296126883cff596d87d8935842f9db880ef25

2. **script-injection (release-please.yml)**: Moved `needs.release.outputs.major`, `needs.release.outputs.minor`, and `needs.release.outputs.tag_name` into step-level `env:` blocks (MAJOR, MINOR, TAG_NAME) and referenced them double-quoted in shell scripts.

3. **script-injection (test.yml)**: Moved `${{ env.VERSION }}` in the 'Check version' step into a step-level `env:` block as `EXPECTED_VERSION` and referenced it double-quoted in the bash comparison.

4. **script-injection (dependabot.yml)**: Added double-quotes around `$PR_URL` in both `gh pr review` and `gh pr merge` commands to prevent shell metacharacter injection.

