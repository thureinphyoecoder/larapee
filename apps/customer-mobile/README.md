# LaraPee Customer Mobile (React Native)

## Purpose

Customer-facing mobile app for browsing products, managing cart, placing orders, and tracking order status.

## Stack

- Expo + React Native
- TypeScript
- NativeWind
- Laravel API (`/api/v1`)

## Folder Structure

- `App.tsx`: App shell and screen orchestration.
- `src/hooks`: App state and orchestration hooks.
- `src/services`: API integrations only.
- `src/screens`: Presentation-level page screens.
- `src/components`: Reusable UI components.
- `src/lib`: Cross-cutting utilities (HTTP, storage).
- `src/i18n`: Locale dictionaries and translation helper.
- `src/types`: Shared domain and response typings.
- `src/mocks`: Fallback sample data for offline/dev.
- `src/config`: Developer-controlled environment constants.

## Start

```bash
cd apps/customer-mobile
npm install
npm run start:lan
```

## API Base URL

Set `src/config/server.ts` to your Laravel host:

```ts
export const API_BASE_URL = "http://192.168.1.33:8001/api/v1";
```

