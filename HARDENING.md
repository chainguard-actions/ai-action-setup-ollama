<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.71

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **ai-action--setup-ollama/v2.0.71** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All workflow files reference actions using mutable version tags (e.g. @v7, @v5, @v6) instead of full 40-character commit SHA digests. This exposes the workflow to supply-chain attacks if a tag is moved or a repository is compromised. Affected references include: actions/checkout@v7, actions/setup-node@v7, stefanzweifel/git-auto-commit-action@v7, googleapis/release-please-action@v5, codecov/codecov-action@v7, actions/cache@v6.

Locations:

- `.github/workflows/build.yml:11`
- `.github/workflows/build.yml:16`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:11`
- `.github/workflows/commitlint.yml:16`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:16`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:33`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:18`
- `.github/workflows/test.yml:30`
- `.github/workflows/test.yml:55`
- `.github/workflows/version.yml:15`
- `.github/workflows/version.yml:24`

### script-injection (severity: high)

Rule (a): GitHub Actions expressions are interpolated directly inside run: shell command strings. In release-please.yml, the 'Tag major and minor versions' step embeds ${{ needs.release.outputs.major }} and ${{ needs.release.outputs.minor }} directly in git tag and git push commands (e.g. `git tag -d v${{ needs.release.outputs.major }} || true`). The 'Tag latest release' step embeds ${{ needs.release.outputs.tag_name }} directly in a gh CLI command (`gh release edit ${{ needs.release.outputs.tag_name }} --latest`). In test.yml, the 'Check version' step embeds ${{ env.VERSION }} directly in a run: block (`if [[ "$(ollama-cli --version)" != *'${{ env.VERSION }}'* ]]; then`). YAML template substitution occurs before the shell sees the script, so these are script-injection risks regardless of single-quoting.

Locations:

- `.github/workflows/release-please.yml:40`
- `.github/workflows/release-please.yml:48`
- `.github/workflows/test.yml:72`

### script-injection (severity: high)

Rule (b): Unquoted shell variable expansion of untrusted data. In dependabot.yml, the env var PR_URL is set from ${{ github.event.pull_request.html_url }} (an attacker-controllable value via pull_request_target) and then expanded unquoted in two run: steps: `gh pr review --approve $PR_URL` and `gh pr merge --auto --squash $PR_URL`. Unquoted expansion allows shell metacharacters in the URL to be interpreted by the shell, enabling command injection.

Locations:

- `.github/workflows/dependabot.yml:20`
- `.github/workflows/dependabot.yml:23`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all findings across 6 workflow files:

1. unpinned-uses: Pinned all 6 action references to full 40-char commit SHAs with tag comments preserved: actions/checkout@v7→3d3c42e5, actions/setup-node@v7→820762786, stefanzweifel/git-auto-commit-action@v7→4a55954c, googleapis/release-please-action@v5→45996ed1, codecov/codecov-action@v7→fb8b3582, actions/cache@v6→55cc8345.

2. script-injection (release-please.yml): Moved needs.release.outputs.major, needs.release.outputs.minor into MAJOR/MINOR env vars in the 'Tag major and minor versions' step; moved needs.release.outputs.tag_name into TAG_NAME env var in the 'Tag latest release' step. All shell references now use properly quoted $MAJOR, $MINOR, $TAG_NAME.

3. script-injection (test.yml): Replaced ${{ env.VERSION }} interpolated directly in the shell script with the plain $VERSION environment variable (already set at job level), using double-quotes so the shell variable expands correctly without template injection.

4. script-injection (dependabot.yml): Added double-quotes around $PR_URL in both gh commands to prevent shell metacharacter injection from the attacker-controllable pull_request.html_url value.

