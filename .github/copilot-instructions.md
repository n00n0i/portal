# AI Copilot Instructions for Portal

## Project Overview

**Portal** is a multi-user web application dashboard that aggregates links to web apps with category organization, user authentication, and admin management. Built with:
- **Frontend**: React 19 + TypeScript, Vite, localStorage for client storage
- **Backend**: Express.js, MySQL 8.0 for auth/user persistence
- **AI**: Google Gemini API for auto-generating app descriptions
- **Deployment**: Docker Compose (dev), Kubernetes (prod), nginx (frontend serving)

## Architecture Decisions

### Hybrid Storage Pattern
- **Frontend apps/categories**: Stored in `localStorage` via `storageService`—client-side app discovery without backend
- **User data**: Persisted in MySQL (`server/db.ts`)—auth requires server validation
- **Why split**: Light demo UX for apps + secure user management for auth/admin features

### Key Data Flows
1. **Authentication**: User login → `AuthScreens` component → `storageService.login()` → store JWT/session → redirect to portal
2. **Admin User Management**: Only admin users see `AdminUserList` component (role check in `App.tsx`)
3. **App CRUD**: User actions → `storageService` → localStorage sync → `setApps()` state update → re-render
4. **Gemini Integration**: `AddAppModal` form submit → `geminiService.generateAppDescription()` → auto-fill description field

### Component Hierarchy
```
App.tsx (root state, auth flow, view routing)
├── AuthScreens (login/signup/password reset)
├── AdminUserList (visible if currentUser.role === 'admin')
└── Portal View
    ├── AppCard[] (map apps, edit/delete modes)
    ├── AddAppModal (create/edit app + Gemini description)
    ├── Category filter (selectedCategory state)
    └── Search filter (searchQuery state)
```

## Critical Workflows

### Local Development
```bash
npm run dev              # Frontend on port 3000 (Vite)
npm run server          # Backend on port 5000 (ts-node-dev, watches changes)
npm run server:prod     # Production server (single run)
```

### Docker Development
```bash
docker compose up       # Runs Node app + MySQL at ports 3000, 3306
# Default MySQL: user=portal, pass=portalpass, db=portal
```

### Environment Variables
- **Frontend**: `GEMINI_API_KEY` (exposed in build via `vite.config.ts` `define`)
- **Backend**: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `SMTP_*` (email)
- **File**: `.env.local` (create from `.env.local.example`)

### Database Initialization
`server/db.ts:initDb()` auto-creates `users` table on server startup and seeds default admin if missing:
- Email: `admin@portal.com`, Password: `admin`

## Project-Specific Patterns

### Type System (`types.ts`)
- Use exported interfaces (`User`, `AppEntry`, `CreateAppFormData`, `AuthResponse`) for all component props and state
- `UserRole` = `'admin' | 'user'`, `UserStatus` = `'pending' | 'approved' | 'rejected'`
- Default categories in `DEFAULT_CATEGORIES` array

### Storage Service (`services/storageService.ts`)
- **Pattern**: Each entity has `get*()`, `save*()`, `add*()`, `update*()`, `delete*()` functions
- **Error handling**: Try-catch with fallback to defaults (no throws)
- **Session management**: `login()`, `logout()`, `getCurrentUser()` for auth state persistence
- Example:
  ```tsx
  const apps = storageService.getApps();
  const updated = storageService.updateApp(editedApp);
  setApps(updated); // Local state sync
  ```

### Authentication Boundary
- `AuthScreens` component handles login/signup/password-reset UI
- On successful login, call `handleLogin(user)` to set `currentUser` state and show portal
- Check `currentUser.role === 'admin'` to conditionally render admin features

### Gemini API Integration (`services/geminiService.ts`)
- Lazy initialize client in `getClient()`; throw if `API_KEY` missing
- **Fallback behavior**: Function returns default text if API fails—never crashes
- Used in `AddAppModal` to auto-generate descriptions on user request
- Model: `gemini-2.5-flash`

### Button Component (`components/Button.tsx`)
- Reusable button with flexible styling
- Used throughout UI for consistency

### UI Icons
- All icons from `lucide-react` (e.g., `Plus`, `Settings`, `LogOut`, `Users`)
- Consistent with portal's visual design

## Common Modifications

### Adding a New Admin Feature
1. Create component in `components/` (e.g., `AdminReports.tsx`)
2. Import and conditionally render in `App.tsx` inside `{currentUser?.role === 'admin' && <AdminReports />}`
3. Use `storageService` for data access (or add new service if needed)
4. Add TypeScript interfaces to `types.ts`

### Extending User Properties
1. Update `User` interface in `types.ts`
2. Update MySQL schema in `server/db.ts:initDb()` (add column)
3. Update seed logic if needed
4. Update signup logic in `AuthScreens` and `storageService`

### Adding New Categories
- Categories are managed via `storageService.addCategory()` / `deleteCategory()`
- No hard enum—dynamically loaded from localStorage or MySQL
- Filter UI in `App.tsx` uses `selectedCategory` state

### Modifying App Structure (adding fields to `AppEntry`)
1. Update `AppEntry` interface in `types.ts`
2. Update `DEFAULT_APPS` seed data in `storageService.ts`
3. Update `AppCard` component to render new fields
4. Update `CreateAppFormData` form validation in `AddAppModal`

## Build & Deployment

### Production Docker Build
```bash
docker build --build-arg GEMINI_API_KEY=<key> -t portal-frontend:latest .
```
- Two-stage build: builder stage (node) → runtime (nginx serving static files)
- Vite embeds `GEMINI_API_KEY` at build time via `define` in `vite.config.ts`

### Kubernetes Deployment
- Manual kubectl apply workflow: secrets → MySQL PVC/deployment → frontend deployment/service
- See `deploy/k8s/` for manifests
- Frontend served by nginx (see `deploy/nginx.conf`)

## Testing & Debugging

### Common Issues
- **Gemini API key missing**: Check `.env.local` and Vite define config; function returns fallback text, won't crash
- **MySQL connection fails**: Verify `MYSQL_HOST` (in Docker: use service name `mysql`), port 3306, credentials
- **SMTP email fails**: Optional—`sendResetEmail()` in `server/email.ts` throws only if SMTP_HOST missing; handle gracefully in reset flow
- **localStorage cleared**: `storageService` returns defaults (safe fallback)

### Local Testing
- Manual sign-ups create users in localStorage (non-persistent across restart unless MySQL enabled)
- Admin features require role check; test by setting `currentUser.role = 'admin'` in browser DevTools
