# Move Existing Loading Screen to "Enter IRL.OS" Button Action

Reposition the workspace initialization loading phase so the public landing page appears immediately upon opening the website, and the existing "Loading your workspace…" screen is displayed when the user clicks "Enter IRL.OS" before routing to `/home`.

## User Review & Critical Decisions

> [!IMPORTANT]
> The landing page hero, slogan, styling, button, and overall 9-page app structure are strictly preserved. Only the timing and trigger of the workspace loading screen transition are modified.

- **Confirmed Choice**: Landing page (`/` or `/landing`) bypasses initial blocking loading states so visitors immediately see the hero slogan and "Enter IRL.OS" button.
- **Transition Flow**: Clicking "Enter IRL.OS" triggers an explicit workspace initialization state, rendering the existing "Loading your workspace..." screen while loading session & user state, then cleanly navigating to `/home` (or `/welcome` for first-time users).
- **Double-Click & Safety**: Button click enters an `isInitializing` state to prevent duplicate calls, with an inline error & retry action if initialization fails.

## 1. Overview & Core Concept

- **Goal**: Provide a frictionless landing page entry experience where the landing page hero loads instantly, and clicking "Enter IRL.OS" provides immediate visual feedback with the existing "Loading your workspace..." component as data is prepared.
- **User Experience**:
  1. User opens `/` or `/landing` -> Landing page hero appears instantly with zero pre-loader delay.
  2. User clicks "Enter IRL.OS" button -> Landing page transitions to the existing "Opening your workspace..." loading screen with spinning indicator and LiveWave canvas background.
  3. Workspace finishes restoring user state -> User is redirected smoothly to the Home dashboard (`/home`) or Welcome screen (`/welcome`).

## 2. User Experience & Visual Design

- **Landing Page Hero (Instant Load)**:
  - Preserves exact deep space horizon glow, slogan typography ("Your life. Your system. Your next move."), and illuminated "Enter IRL.OS" button.
- **Workspace Loading Transition Screen**:
  - Reuses the existing loading screen component with `LiveWaveCanvas`, the pulsing `IRL` logo box, spinning cyan indicator, and `"Opening your workspace..."` label.
  - Adds an error boundary state with a "Retry Workspace Initialization" button in case of network or storage restoration failure.

```
┌────────────────────────────────────────────────────────┐
│                   Public Landing Page                  │
│   "Your life. Your system. Your next move."           │
│                    [ Enter IRL.OS ]                    │
└───────────────────────────┬────────────────────────────┘
                            │ Click "Enter IRL.OS"
                            ▼
┌────────────────────────────────────────────────────────┐
│            Existing Workspace Loading Screen           │
│              (Pulse IRL Logo + Spinner)                │
│             "Opening your workspace..."                │
└───────────────────────────┬────────────────────────────┘
                            │ Initialization Complete
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Home Dashboard                     │
│                        (/home)                         │
└───────────────────────────┬────────────────────────────┘
```

## 3. Technical Architecture & Component Changes

- **`src/App.tsx`**:
  - Update route rendering logic so that `pathName === '/' || pathName === '/landing'` renders `LandingPage` directly even if background auth/session initialization is still in progress.
  - Introduce an explicit `isEnteringWorkspace` state variable. When the user clicks "Enter IRL.OS" on the landing page, `isEnteringWorkspace` is set to `true`.
  - While `isEnteringWorkspace` (or `authLoading` when transitioning into app routes) is `true`, render the existing workspace loading screen component.
  - Handle completion of `authLoading` and data restoration inside a transition effect, automatically navigating to `/home` (or `/welcome`).
  - Add an initialization timeout or error state with a clean "Retry" action.
- **`src/pages/LandingPage.tsx`**:
  - Accept an `isLoading` boolean prop to disable the "Enter IRL.OS" button during transition and prevent duplicate triggers.

## 4. Verification & Acceptance Testing Plan

1. **Direct Landing Load**: Open `/` and confirm landing page hero appears immediately without a pre-loader.
2. **Interactive Transition**: Click "Enter IRL.OS" and verify the existing "Opening your workspace..." screen displays.
3. **Workspace Entry**: Verify automatic navigation to `/home` once data restoration finishes.
4. **Data Persistence**: Confirm user tasks, goals, focus timer state, and user stats persist intact.
5. **Lint & Build**: Run `compile_applet` and `lint_applet` to confirm zero build or lint issues.
