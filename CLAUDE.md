# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 4646 (custom port configured)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

This is a Next.js 11 admin dashboard for a food delivery service with Russian UI. Key architectural components:

### Framework Stack
- **Next.js 11** with TypeScript
- **Antd 4.16** for UI components + **Tailwind CSS** for styling
- **React Query 3.34** for server state management
- **React Hook Form 7.9** for form handling

### Authentication & State
- User authentication stored in localStorage under key `mijoz` (base64 encoded JSON)
- Custom context provider `ManagedUIContext` wraps entire app in `_app.tsx`
- User state managed via `UIContext` with reducer pattern in `components/ui/context.tsx`
- Google reCAPTCHA v3 integration for forms

### API Configuration
- API proxy configured in `next.config.js` - routes `/api/*` to external API via `API_URL` env var
- Public runtime config exposes `apiUrl` and `captchaKey` to client

### Layout & Navigation
- Main layout in `components/ui/MainLayout.tsx` with collapsible sidebar
- Dark mode support via `next-dark-mode`
- Extensive sidebar navigation with 20+ admin modules including:
  - Organizations, Cities, Terminals
  - Catalog, Menus, Modifiers
  - News, Promotions, SMS Templates
  - User management, Settings, Reports

### Component Organization
- UI components in `components/ui/` directory
- Page components follow Next.js pages router convention
- Each major feature has dedicated page component (e.g., `CatalogPage.tsx`, `NewsPage.tsx`)

### Key Dependencies
- `@heroicons/react` for additional icons
- `axios` for HTTP requests
- `luxon` for date handling
- `react-quill` for rich text editing
- `xlsx` and `file-saver` for file export functionality

## Environment Variables Required
- `API_URL` - Backend API base URL
- `CAPTCHA_KEY` - Google reCAPTCHA site key