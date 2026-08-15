<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.51

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.51** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files use mutable version tags instead of pinned 40-character SHA commit hashes for every `uses:` reference. An attacker who compromises the upstream action repository can push malicious code under the same tag. Affected references include: actions/checkout@v6, actions/setup-node@v6, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v6, actions/cache@v5.

Locations:

- `.github/workflows/build.yml:10`
- `.github/workflows/build.yml:14`
- `.github/workflows/build.yml:22`
- `.github/workflows/commitlint.yml:11`
- `.github/workflows/commitlint.yml:15`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:15`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:31`
- `.github/workflows/test.yml:11`
- `.github/workflows/test.yml:15`
- `.github/workflows/test.yml:22`
- `.github/workflows/test.yml:47`
- `.github/workflows/test.yml:55`
- `.github/workflows/version.yml:14`
- `.github/workflows/version.yml:22`

### script-injection (severity: high)

Sub-rule (a): `${{ needs.release.outputs.major }}`, `${{ needs.release.outputs.minor }}`, and `${{ needs.release.outputs.tag_name }}` are directly interpolated inside `run:` shell command strings in the 'Tag major and minor versions' and 'Tag latest release' steps. GitHub Actions expressions are substituted by the template engine before the shell parses the command, so a malicious value in these step outputs could inject arbitrary shell commands. Example offending lines: `git tag -d v${{ needs.release.outputs.major }} || true` and `run: gh release edit ${{ needs.release.outputs.tag_name }} --latest`. These values should be passed via `env:` variables and then double-quoted in the shell.

Locations:

- `.github/workflows/release-please.yml:33`
- `.github/workflows/release-please.yml:34`
- `.github/workflows/release-please.yml:35`
- `.github/workflows/release-please.yml:36`
- `.github/workflows/release-please.yml:37`
- `.github/workflows/release-please.yml:38`
- `.github/workflows/release-please.yml:41`

### script-injection (severity: high)

Sub-rule (a): `${{ env.VERSION }}` is directly interpolated inside a `run:` shell command string in the 'Check version' step of the integration job: `if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because the template engine substitutes the value before the shell parses it. The value should be referenced as the shell variable `$VERSION` (already available via the job-level `env:` block) and double-quoted.

Locations:

- `.github/workflows/test.yml:77`

### script-injection (severity: high)

Sub-rule (b): In dependabot.yml, `PR_URL` is set from the attacker-controllable `github.event.pull_request.html_url` via the job-level `env:` block, then used **unquoted** in two `run:` steps: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. An unquoted shell variable expansion allows the shell to parse metacharacters (`;`, `|`, `&`, etc.) out of the value, enabling command injection. The variable must be double-quoted: `"$PR_URL"`.

Locations:

- `.github/workflows/dependabot.yml:21`
- `.github/workflows/dependabot.yml:24`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 7 workflow files:

1. unpinned-uses: Pinned all 6 action references to full 40-char SHAs with tag comments preserved: actions/checkout@df4cb1c (v6), actions/setup-node@249970729 (v6), stefanzweifel/git-auto-commit-action@4a55954 (v7), googleapis/release-please-action@45996ed (v5), codecov/codecov-action@fb8b358 (v6), actions/cache@caa2961 (v5). Applied across build.yml, commitlint.yml, lint.yml, release-please.yml, test.yml, and version.yml.

2. script-injection (release-please.yml lines 33-41): Moved needs.release.outputs.major, .minor, and .tag_name into env: blocks as MAJOR, MINOR, TAG_NAME; referenced as double-quoted shell variables in run: scripts.

3. script-injection (test.yml line 77): Replaced ${{ env.VERSION }} template expression inside run: with the shell variable $VERSION (already set via job-level env: block), properly double-quoted.

4. script-injection (dependabot.yml lines 21, 24): Added double quotes around $PR_URL in both gh pr review and gh pr merge commands to prevent shell word-splitting/metacharacter injection.

