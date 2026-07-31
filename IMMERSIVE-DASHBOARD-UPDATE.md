# Dynasty HQ v2 — Immersive Dashboard Update

## Install

1. Stop the Vite server with `Ctrl+C`.
2. Copy the contents of this update package into your existing `dynasty-hq-v2-starter` folder.
3. Choose **Replace the files in the destination** when Windows asks.
4. Run:

```powershell
npm run build
npm run dev
```

Your `.env.local`, Firebase project, Firestore rules, existing users, dynasties, games, and recruiting data are not replaced by this update.

## Test checklist

- Open an existing dynasty and confirm the new Home tab appears.
- Open Settings and enter the next opponent, kickoff, broadcast, weekly focus, and season goal.
- Change the primary and secondary colors.
- Wait for **Saved to cloud**.
- Refresh the page and confirm the matchup, goals, headline, and colors remain.
- Confirm existing game logs and recruiting schools still appear.
- Create a new dynasty and confirm it receives the new dashboard defaults.

## Save the milestone

```powershell
git add .
git commit -m "Add immersive dynasty home dashboard"
git push
```
