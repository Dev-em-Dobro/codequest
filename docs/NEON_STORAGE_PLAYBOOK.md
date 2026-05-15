# Neon Storage Playbook (CodeQuest)

## Objective
Reduce Neon storage growth without affecting normal app usage.

## What was changed
- API now ignores malformed `user_progress` rows (`data` not JSON object) during reads.
- API now skips `updateCode` writes when user code did not change.
- API now caps code payload per language (`MAX_CODE_CHARS_PER_LANGUAGE`, default: `20000`).
- Added storage maintenance script with dry-run by default.

## Commands

### 1) Audit only (safe, no changes)
```bash
npm run db:storage:audit
```

### 2) Cleanup malformed rows (safe target)
```bash
npm run db:storage:cleanup
```

### 3) Optional cleanup for stale incomplete drafts
Default script:
```bash
npm run db:storage:cleanup:stale
```

Custom days:
```bash
cross-env APPLY_CHANGES=true CLEANUP_INCOMPLETE_OLDER_THAN_DAYS=120 node --import tsx scripts/storage-maintenance.ts
```

## Impact and risk
- `db:storage:audit`: no data change (safe for all users).
- `db:storage:cleanup`: deletes only malformed rows where `data` is not a JSON object.
- `db:storage:cleanup:stale`: can delete old incomplete drafts (completed exercises are not targeted).
- `VACUUM (ANALYZE)` reorganizes storage only; it does not change exercise logic or completion state.

## Safe policy for production
1. Always run audit first.
2. Use `db:storage:cleanup` as the default low-risk action.
3. Run stale cleanup only with explicit retention policy approval (for example 90+ days).
4. Before any delete operation, create a Neon branch backup/snapshot.
5. Keep `CLEANUP_INCOMPLETE_OLDER_THAN_DAYS` disabled unless needed.

## Recommended rollout
1. Run `db:storage:audit` and capture output.
2. Run `db:storage:cleanup`.
3. Re-run `db:storage:audit` to compare sizes.
4. If needed, enable stale draft cleanup (90+ days).

## Notes
- `VACUUM (ANALYZE)` runs by default after cleanup.
- To disable vacuum in one run:
```bash
cross-env APPLY_CHANGES=true RUN_VACUUM=false node --import tsx scripts/storage-maintenance.ts
```
- For stricter payload control, set env var `MAX_CODE_CHARS_PER_LANGUAGE`.
