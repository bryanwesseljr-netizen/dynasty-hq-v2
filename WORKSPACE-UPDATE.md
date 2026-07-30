# Dynasty HQ v2 — Workspace Update

This update adds the first playable dynasty workspace on top of the authentication and cloud-save foundation.

## Included

- Dynamic route for each save: `/dynasties/:dynastyId`
- Road to Glory and coach profile editing
- Current season and week tracking
- Debounced Firestore autosave with visible status
- Game log with add, edit, delete, scores, statistics, and notes
- Automatic current-season record calculation
- Recruiting board with rankings, interest, tiers, offers, and notes
- Responsive desktop, tablet, and mobile layouts
- Nested Firestore collections isolated under each dynasty
- Cleanup of game and recruiting documents when a dynasty is deleted

## Firestore structure

```text
users/{userId}
  dynasties/{dynastyId}
    games/{gameId}
    recruiting/{schoolId}
```

The existing v2 Firestore rules already authorize these nested collections, so no rules change is required.

## Apply to your tested local project

1. Stop the Vite server with `Ctrl+C`.
2. Make sure your current work is committed:
   `git status`
3. Copy the contents of this update over your existing `dynasty-hq-v2-starter` folder.
4. Keep your existing `.env.local`. This package intentionally does not include one.
5. Run:
   `npm run build`
6. Start the site:
   `npm run dev`
7. Test one existing dynasty and one newly created dynasty.

## Commit after testing

```bash
git add .
git commit -m "Add dynasty workspace game log and recruiting board"
git push
```

## Important

This is the separate Dynasty HQ v2 development project. It does not deploy over or modify the original live website unless you intentionally deploy it to the original site's hosting project or domain.
