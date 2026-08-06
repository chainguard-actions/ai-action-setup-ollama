<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.66

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.66** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files reference GitHub Actions using mutable version tags (e.g., @v7, @v5, @v6) instead of pinned full 40-character SHA commit hashes. This exposes the workflow to supply-chain attacks if a tag is moved or a dependency is compromised. Affected references include: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, actions/cache@v6, codecov/codecov-action@v7.

Locations:

- `.github/workflows/build.yml:11`
- `.github/workflows/build.yml:16`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:11`
- `.github/workflows/commitlint.yml:16`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:16`
- `.github/workflows/release-please.yml:21`
- `.github/workflows/release-please.yml:33`
- `.github/workflows/test.yml:11`
- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:27`
- `.github/workflows/test.yml:44`
- `.github/workflows/test.yml:51`
- `.github/workflows/version.yml:13`
- `.github/workflows/version.yml:24`

### script-injection (severity: high)

Rule (a): GitHub Actions expressions are interpolated directly inside run: shell command strings. In release-please.yml, the 'Tag major and minor versions' step embeds ${{ needs.release.outputs.major }}, ${{ needs.release.outputs.minor }}, and ${{ needs.release.outputs.tag_name }} directly in shell commands (e.g., `git tag -d v${{ needs.release.outputs.major }} || true`, `gh release edit ${{ needs.release.outputs.tag_name }} --latest`). These step outputs are derived from release-please and could contain shell metacharacters. In test.yml, the 'Check version' step embeds `${{ env.VERSION }}` directly inside a run: block string (`if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]`), which is interpolated by the YAML template engine before the shell sees it.

Locations:

- `.github/workflows/release-please.yml:40`
- `.github/workflows/release-please.yml:41`
- `.github/workflows/release-please.yml:42`
- `.github/workflows/release-please.yml:43`
- `.github/workflows/release-please.yml:44`
- `.github/workflows/release-please.yml:45`
- `.github/workflows/release-please.yml:49`
- `.github/workflows/test.yml:65`

### script-injection (severity: high)

Rule (b): In dependabot.yml, the env var $PR_URL is set from the untrusted value `${{ github.event.pull_request.html_url }}` and then used unquoted in two run: shell commands: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. An unquoted shell variable expansion allows shell metacharacters embedded in the URL to be interpreted by the shell. The variable should be double-quoted: `"$PR_URL"`.

Locations:

- `.github/workflows/dependabot.yml:20`
- `.github/workflows/dependabot.yml:23`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 6 workflow files:

1. unpinned-uses: Pinned all 6 action references to full 40-char SHAs with tag comments preserved:
   - actions/checkout@v7 → @3d3c42e5aac5ba805825da76410c181273ba90b1
   - actions/setup-node@v7 → @820762786026740c76f36085b0efc47a31fe5020
   - stefanzweifel/git-auto-commit-action@v7 → @4a55954c782fc1ea30b9056cd3e7a2b40ca8887d
   - googleapis/release-please-action@v5 → @45996ed1f6d02564a971a2fa1b5860e934307cf7
   - actions/cache@v6 → @55cc8345863c7cc4c66a329aec7e433d2d1c52a9
   - codecov/codecov-action@v7 → @fb8b3582c8e4def4969c97caa2f19720cb33a72f

2. script-injection (release-please.yml): Moved needs.release.outputs.major, .minor, and .tag_name into env: blocks (MAJOR, MINOR, TAG_NAME) and used quoted shell variables in run: commands.

3. script-injection (test.yml): Moved env.VERSION into an env: block as EXPECTED_VERSION in the 'Check version' step and referenced it as "$EXPECTED_VERSION" in the shell script.

4. script-injection (dependabot.yml): Added double-quotes around $PR_URL in both gh pr review and gh pr merge commands to prevent shell metacharacter injection.

