<!-- markdownlint-disable -->

# Hardening Report: ai-action--setup-ollama/v2.0.60

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **ai-action--setup-ollama/v2.0.60** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All uses: references across workflow files use mutable version tags instead of pinned 40-character SHA digests, making the workflows vulnerable to supply-chain attacks if the referenced action tags are moved. Failing references: build.yml: actions/checkout@v7, actions/setup-node@v6, stefanzweifel/git-auto-commit-action@v7; commitlint.yml: actions/checkout@v7, actions/setup-node@v6; lint.yml: actions/checkout@v7, actions/setup-node@v6; release-please.yml: googleapis/release-please-action@v5, actions/checkout@v7; test.yml: actions/checkout@v7, actions/setup-node@v6, codecov/codecov-action@v7, actions/cache@v6; version.yml: actions/checkout@v7, actions/setup-node@v6.

Locations:

- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:16`
- `.github/workflows/build.yml:26`
- `.github/workflows/commitlint.yml:12`
- `.github/workflows/commitlint.yml:17`
- `.github/workflows/lint.yml:11`
- `.github/workflows/lint.yml:15`
- `.github/workflows/release-please.yml:22`
- `.github/workflows/release-please.yml:31`
- `.github/workflows/test.yml:13`
- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:27`
- `.github/workflows/test.yml:55`
- `.github/workflows/version.yml:14`
- `.github/workflows/version.yml:21`

### script-injection (severity: high)

Sub-rule (a): ${{ ... }} expressions are directly interpolated inside run: shell command strings. In release-please.yml, the 'Tag major and minor versions' step uses ${{ needs.release.outputs.major }} and ${{ needs.release.outputs.minor }} directly in git tag/push commands, and the 'Tag latest release' step uses ${{ needs.release.outputs.tag_name }} directly in a gh release edit command. In test.yml, the 'Check version' step uses ${{ env.VERSION }} directly inside a bash string comparison. Sub-rule (b): In dependabot.yml, the env var $PR_URL (set from ${{ github.event.pull_request.html_url }}) is used unquoted in 'gh pr review --approve $PR_URL' and 'gh pr merge --auto --squash $PR_URL', allowing shell metacharacter injection.

Locations:

- `.github/workflows/release-please.yml:43`
- `.github/workflows/release-please.yml:51`
- `.github/workflows/test.yml:68`
- `.github/workflows/dependabot.yml:21`
- `.github/workflows/dependabot.yml:24`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all 15 unpinned action references by pinning to full SHA digests: actions/checkout@v7→9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0, actions/setup-node@v6→48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e, stefanzweifel/git-auto-commit-action@v7→4a55954c782fc1ea30b9056cd3e7a2b40ca8887d, googleapis/release-please-action@v5→45996ed1f6d02564a971a2fa1b5860e934307cf7, codecov/codecov-action@v7→fb8b3582c8e4def4969c97caa2f19720cb33a72f, actions/cache@v6→55cc8345863c7cc4c66a329aec7e433d2d1c52a9. Fixed script injection in release-please.yml by moving needs.release.outputs.major/minor/tag_name into env vars; in test.yml by moving env.VERSION into EXPECTED_VERSION env var; in dependabot.yml by quoting $PR_URL in both gh commands.

