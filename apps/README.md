# Apps Workspace Structure

This repository follows an app-per-folder approach under `apps/`.

## Current Apps

- `apps/customer-mobile`: Customer Android/iOS app (Expo React Native)
- `apps/delivery-mobile`: Delivery staff Android/iOS app (Expo React Native)
- `apps/pos-electron`: Desktop POS app (Electron + React)

## Structure Rules

1. Keep business logic in `src/hooks` and `src/services`, not in `App.tsx`.
2. Keep API endpoints centralized in `src/config/server.ts`.
3. Keep shared types in `src/types` and avoid ad-hoc inline object types.
4. Keep screens in `src/screens` thin and UI-focused.
5. Keep reusable UI in `src/components` and pure helpers in `src/utils`.
6. Add translation keys in `src/i18n` before hardcoding UI strings.
7. Keep each app independently runnable with its own `package.json`.

## Recommended Maintenance Workflow

1. Add/modify API contract in backend first.
2. Update app `src/types` and `src/services`.
3. Update hook/state layer.
4. Update screens/components.
5. Run typecheck/build for impacted app.

