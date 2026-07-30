# Dynasty HQ v2 — Sprint 1 Starter

This is the first runnable foundation for Dynasty HQ v2.

## Included now

- React + TypeScript + Vite project structure
- Firebase initialized once through environment variables
- Email/password signup and login
- Google login
- Anonymous guest login
- Guest-to-permanent account upgrade without changing the Firebase UID
- Password reset
- Email verification message after signup/upgrade
- Persistent or session-only login (“Keep me signed in”)
- Protected routes
- User profile documents
- Multiple cloud-synced dynasty records
- Responsive desktop/mobile dashboard
- Starter Firestore security rules
- A copy of the original v1 source in `legacy/` for migration reference

## 1. Install prerequisites

Install the current Node.js LTS release, Git, and Visual Studio Code.

## 2. Open the project

Open this folder in Visual Studio Code, then run:

```bash
npm install
npm run dev
```

Open the local address shown by Vite, normally `http://localhost:5173`.

## 3. Firebase Console setup

The local `.env.local` file is already filled with the Firebase web config found in the original Dynasty HQ source. It is ignored by Git.

In Firebase Console:

1. Open **Authentication → Sign-in method**.
2. Enable **Email/Password**.
3. Enable **Google** and choose a support email.
4. Enable **Anonymous**.
5. Open **Firestore Database** and create the database if it does not exist.
6. Replace the Firestore rules with `firestore.rules` from this project, then publish them.
7. Under **Authentication → Settings → Authorized domains**, make sure `localhost` is allowed for development. Add your Vercel domain later.

## 4. Create the GitHub repository

From the VS Code terminal:

```bash
git init
git add .
git commit -m "Build Dynasty HQ v2 authentication foundation"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/dynasty-hq-v2.git
git push -u origin main
```

Create the empty `dynasty-hq-v2` repository on GitHub before the last two commands. Do not initialize it with another README if using this command sequence.

## 5. Data structure

```text
users/{uid}
users/{uid}/dynasties/{dynastyId}
```

The next build should give each dynasty its own nested data sections for:

- core career state
- game logs
- recruiting
- newsroom stories
- trophies and milestones
- podcast metadata/audio
- settings and appearance

## Important

This starter does not yet render the 3,000-line v1 application inside each dynasty. The original source is preserved in `legacy/DynastyHQ-v1.jsx.txt`. The next migration sprint should move its data model and feature modules into the new per-dynasty structure without losing the current app.
