# PR Title

`feat(core): bump zenzic core pin to v0.22.0 and setup-uv to v8.3.2`

# PR Body

```markdown
## Summary
This PR aligns `zenzic-action` with Zenzic Core `v0.22.0`, which introduces real-time Virtual Site Map (VSM) via ZLS. As a result of this core minor version jump, the GitHub Action version is bumped to `v2.8.0`.

This PR supersedes the dependabot updates for GitHub Actions dependencies (closing `#<DEPENDABOT_PR_NUMBER>` as superseded by this PR #63) to centralize the ecosystem updates into a single release payload.

## Changes
- **Core Pin Update**: Bumped Zenzic Core default version to `0.22.0` in `action.yml`.
- **Ecosystem Sync**: Synchronized `setup-uv` to `v8.3.2` as recommended by dependabot.
- **Version Bump**: Bumped internal `package.json`, `pyproject.toml`, and `.bumpversion.toml` tracking to `2.8.0`.

## Validation
- `just versions` returns `✅ Ecosystem alignment verified.`
- `just verify` exits 0.
```

---

# Release Title

`v2.8.0: Core Parity with Zenzic v0.22.0 (Real-time VSM)`

# Release Body

```markdown
**Zenzic Action v2.8.0** establishes full parity with Zenzic Core `v0.22.0`.

This release forces the advancement of the ecosystem to adopt the updated core, which introduces real-time Virtual Site Map (VSM) building for the Language Server (ZLS). While ZLS does not run directly in the CI pipeline, updating the Action is critical to ensure users leveraging Zenzic in GitHub Actions automatically use the `v0.22.x` lineage.

### What's Changed
- **Pinned Core Version**: Updated the default fallback Zenzic version in `action.yml` to `0.22.0`.
- **Dependency Updates**: Bumped internal actions like `setup-uv` to `v8.3.2`, subsuming previously pending dependabot PRs.

### Upgrade Instructions
If you reference the major version `v2`, you will receive this update automatically:
```yaml
uses: pythonwoods/zenzic-action@v2
```

If you specify an exact version, please update to `v2.8.0`:

```yaml
uses: pythonwoods/zenzic-action@v2.8.0
```

```
