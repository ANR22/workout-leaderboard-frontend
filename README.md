# Workout Leaderboard — Frontend

A React + TypeScript frontend for the Workout Leaderboard app. Users can browse workout challenges, join them, submit scores, and view live leaderboards. Authentication is handled via JWT issued by the backend.

---

## Features

- **Challenge listing** — browse all active workout challenges with imagery
- **Challenge detail** — view challenge info and a ranked leaderboard
- **Score submission** — authenticated users can submit scores after joining a challenge
- **JWT authentication** — login and sign up via backend endpoints; token persisted in `localStorage`
- **Auth-gated actions** — joining and submitting scores require a logged-in account
- **Responsive light UI** — built with Tailwind CSS v3

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v3 |
| Routing | React Router DOM v7 |
| State | React Context API |
| Auth | JWT (stored in `localStorage`) |
| Backend | Spring Boot at `http://localhost:8080` |

---

## Prerequisites

- **Node.js v20+** (v18 is not supported by Vite 7)
- The [Workout Leaderboard backend](https://github.com/ANR22/workout-leaderboard) running on `http://localhost:8080`

If you're using `nvm`:
```bash
nvm install 20
nvm use 20
```

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/ANR22/workout-leaderboard-frontend.git
cd workout-leaderboard-frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Backend API

All requests are sent to `http://localhost:8080`. The following endpoints are consumed:

| Method | Path | Auth required | Description |
|---|---|---|---|
| `POST` | `/login` | No | Log in; returns `userId`, `fullName`, `token` |
| `POST` | `/signup` | No | Create account; returns same shape as login |
| `GET` | `/leaderboard/challenges` | Yes | List all challenges |
| `GET` | `/leaderboard/challenge/:id` | Yes | Get leaderboard for a challenge |
| `POST` | `/submit-score` | Yes | Submit a score entry |

The JWT token is attached as `Authorization: Bearer <token>` on all authenticated requests.

---

## Project Structure

```
src/
├── api.ts                  # All API calls, token helpers, shared types
├── App.tsx                 # Router setup and AuthProvider wrapping
├── contexts/
│   └── AuthContext.tsx     # Global auth state, login/logout/signup logic
├── pages/
│   ├── ChallengesPage.tsx  # Home page — challenge card grid
│   ├── ChallengeDetailPage.tsx  # Challenge detail + leaderboard
│   └── AuthPage.tsx        # Login / sign up form
├── components/
│   ├── Leaderboard.tsx     # Ranked leaderboard table component
│   └── SubmitScoreModal.tsx # Score submission modal
└── utils/
    └── challengeImages.ts  # Maps challenge ID to a workout SVG image

public/
└── workouts/
    ├── running.svg
    ├── gym.svg
    ├── pushup.svg
    └── default.svg
```

---

## Authentication Flow

1. User visits `/auth` and logs in or signs up.
2. On success, the backend returns a JWT and user info (`userId`, `fullName`).
3. The token is saved to `localStorage` under the key `leaderboard_token`.
4. All subsequent API requests attach the token as a Bearer header.
5. On page reload, the session is restored from `localStorage` if both the user record and token are present.
6. Logout clears both from storage and resets the auth context.

---

## Notes

- The "Join Challenge" button is local state only — there is no backend join endpoint yet.
- The leaderboard displays `User {userId}` as the display name since the backend does not return names in leaderboard entries.
- Workout images are assigned to challenges using a pseudo-random seed derived from the challenge ID so the mapping is stable across renders.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
