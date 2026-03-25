# LearnOva

## Current State
Email/password authentication only. Internet Identity (II) was previously removed. The `useInternetIdentity` hook and `InternetIdentityProvider` are still in the codebase (main.tsx wraps the app), but II is not surfaced in the UI. `useActor` already uses II identity to create authenticated actors. Two user systems exist: email users (`EmailUserPublic`) and ICP principal-based users (`UserProfile`).

## Requested Changes (Diff)

### Add
- "Sign in with Internet Identity" button on LoginPage
- "Sign up with Internet Identity" button on SignupPage  
- After II login success: if user has a saved role in localStorage, load their profile from backend and set session; if not, show RegisterModal to pick name/email/role
- `loginWithII` function in AuthContext and useGlobalAuth
- II logout (call `clear()`) when user logs out
- II session auto-detection on app load (if II identity exists from prior session, restore auth state)

### Modify
- `useGlobalAuth.ts`: import `useInternetIdentity`, detect II identity changes, auto-set currentUser when II principal has a saved role + profile
- `AuthContext.tsx`: expose `loginWithII`, update `showRegisterModal` logic to work with II flow
- `LoginPage.tsx`: add II button with fingerprint/shield icon and "Internet Identity" label
- `SignupPage.tsx`: add II button as alternative signup path
- `logout` in useGlobalAuth: also call II `clear()` when logging out

### Remove
- Nothing removed

## Implementation Plan
1. Modify `useGlobalAuth.ts`:
   - Import `useInternetIdentity` and `useEffect`
   - When II `identity` becomes non-anonymous and no email session exists:
     - Check localStorage for `learnova_role_{principal}`
     - If role + actor available, call `getUserProfile(principal)` and set LocalUser from profile
     - If no role found, set `needsIIRegistration = true` state
   - Expose `loginWithII` (calls ii.login()), `needsIIRegistration`, `clearIIRegistration`
   - On logout, also call ii.clear()
2. Modify `AuthContext.tsx`:
   - Wire `loginWithII`, update `showRegisterModal` to be `needsIIRegistration`
   - `setShowRegisterModal` clears the registration flag
3. Modify `LoginPage.tsx`: add divider + II button
4. Modify `SignupPage.tsx`: add divider + II button
5. `RegisterModal.tsx` already handles the post-II registration flow correctly (saves role to localStorage, creates backend profile)
