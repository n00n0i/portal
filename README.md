# Portal - Multi-User Web Application Dashboard

A modern web application dashboard that aggregates links to web apps with category organization, user authentication, and admin management. Built with React, Express, MySQL, and enhanced with Google Gemini AI for auto-generating app descriptions.

**View your app in AI Studio**: https://ai.studio/apps/drive/1R5a8GDLKoIyFRMzdWbYr4DIm65Quqpvk

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```bash
cp .env.local.example .env.local
# Edit .env.local with your GEMINI_API_KEY
docker compose up
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 🔧 API: http://localhost:4000
- 📧 MailDev: http://localhost:1080

### Option 2: Local Development
```bash
npm install
npm run dev              # Frontend on port 3000
npm run server          # API on port 4000 (in another terminal)
```

---

## 📦 Docker Images on Docker Hub

All images are available and optimized with Alpine Linux:

| Image | Size | Purpose |
|-------|------|---------|
| [`n00n0i/portal-frontend:latest`](https://hub.docker.com/r/n00n0i/portal-frontend) | ~45 MB | React SPA served by Nginx (Alpine) |
| [`n00n0i/portal-api:latest`](https://hub.docker.com/r/n00n0i/portal-api) | ~150 MB | Express backend API (Node Alpine) |
| [`n00n0i/portal-mysql:latest`](https://hub.docker.com/r/n00n0i/portal-mysql) | ~580 MB | MySQL 8.0 with pre-initialized schema |
| [`n00n0i/portal-maildev:latest`](https://hub.docker.com/r/n00n0i/portal-maildev) | ~246 MB | Email testing service (SMTP + Web UI) |

### Pull All Images
```bash
docker pull n00n0i/portal-frontend:latest
docker pull n00n0i/portal-api:latest
docker pull n00n0i/portal-mysql:latest
docker pull n00n0i/portal-maildev:latest
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│         Frontend (React 19 + Vite)                   │
│    n00n0i/portal-frontend:latest                     │
│    Nginx Alpine - Port 80                            │
└──────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        │               │               │
   ┌────▼─────┐   ┌─────▼──────┐  ┌────▼──────┐
   │ API       │   │ MailDev    │  │ MySQL     │
   │ Backend   │   │ SMTP       │  │ Database  │
   │ Express   │   │ Port 1025  │  │ Port 3306 │
   │ Port 4000 │   │ Port 1080  │  │           │
   │ n00n0i/   │   │ n00n0i/    │  │ n00n0i/   │
   │ portal-   │   │ portal-    │  │ portal-   │
   │ api:      │   │ maildev:   │  │ mysql:    │
   │ latest    │   │ latest     │  │ latest    │
   └───────────┘   └────────────┘  └───────────┘
```

---

## ✨ Features

### For All Users
- 🔐 **User Authentication** - Signup, login, password reset
- 📱 **Web App Dashboard** - Add, edit, delete application links
- 🏷️ **Category Organization** - Organize apps by custom categories
- 🔍 **Search & Filter** - Find apps quickly by name or description
- 🎨 **Modern UI** - Dark theme with responsive design (Tailwind CSS)

### For Admins
- 👥 **User Management** - Approve/reject user registrations
- 🔧 **Role Assignment** - Grant admin access to users
- 🎨 **Design System** - View component library and design tokens
- 📊 **User Monitoring** - Track all registered users and their status

### AI Integration
- 🤖 **Auto-Generate Descriptions** - Uses Google Gemini 2.5 Flash API
- ⚡ **Fallback Support** - Gracefully handles API failures
- 🎯 **One-Click Enhancement** - Auto-fill description on app creation

---

## 🔧 Environment Variables

Create `.env.local` from `.env.local.example`:

```env
# Frontend - Google Gemini API Key
GEMINI_API_KEY=your-google-gemini-api-key-here

# MySQL Database
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=portal
MYSQL_USER=portal
MYSQL_PASSWORD=portalpass
MYSQL_ROOT_PASSWORD=rootpass

# Email (Optional - Maildev used for dev)
SMTP_HOST=maildev
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=portal@example.com

# API Server
API_PORT=4000
API_PUBLIC_URL=http://localhost:4000
API_BASE_URL=http://api:4000
```

---

## 📖 Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Complete installation & deployment guide
  - Docker Compose setup
  - Kubernetes deployment
  - Environment variables reference
  - Troubleshooting tips

- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Development guidelines
  - Architecture decisions
  - Project patterns & conventions
  - Common workflows
  - Code examples

---

## 🔐 Default Credentials

After first run, login with:
- **Email**: `admin@portal.com`
- **Password**: `admin`

⚠️ **Change password immediately in production!**

---

## 📋 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, lucide-react
- **Backend**: Express.js, TypeScript, bcryptjs, mysql2
- **Database**: MySQL 8.0 with auto-initialization
- **Container**: Docker, Docker Compose, Kubernetes-ready
- **AI**: Google Gemini 2.5 Flash API
- **Email**: MailDev (dev), Nodemailer (production)
- **Package Manager**: npm

---

## 🚀 Deployment Options

### Development (Docker Compose)
```bash
docker compose up
```
All services start with live reload and auto-initialization.

### Production (Docker Compose)
```bash
docker compose -f docker-compose.yml up -d
```
Uses optimized Alpine-based images.

### Production (Kubernetes)
See [INSTALLATION.md](INSTALLATION.md) for complete Kubernetes deployment including:
- ConfigMaps & Secrets
- MySQL StatefulSet with PVC
- API Deployment & Service
- Frontend Deployment & Service
- Ingress configuration

---

## 📁 Project Structure

```
portal/
├── components/                    # React components
│   ├── App.tsx                   # Main app & routing
│   ├── AuthScreens.tsx           # Login/signup/password reset
│   ├── AdminUserList.tsx         # User management admin view
│   ├── DesignSystem.tsx          # Design tokens & components library
│   ├── AddAppModal.tsx           # Create/edit app form
│   ├── AppCard.tsx               # Individual app card
│   ├── Button.tsx                # Reusable button component
│   └── ChangePasswordModal.tsx   # Password change dialog
│
├── server/                        # Express backend
│   ├── index.ts                  # API routes & initialization
│   ├── db.ts                     # MySQL pool & schema auto-init
│   └── email.ts                  # Nodemailer SMTP service
│
├── services/                      # Frontend services
│   ├── storageService.ts         # App, user, category CRUD + auth
│   └── geminiService.ts          # Google Gemini API integration
│
├── deploy/                        # Production deployment
│   ├── k8s/                      # Kubernetes manifests
│   │   ├── mysql-*.yaml          # MySQL StatefulSet
│   │   ├── api-*.yaml            # API deployment
│   │   └── frontend-*.yaml       # Frontend deployment
│   └── nginx.conf                # Nginx configuration
│
├── types.ts                       # TypeScript interfaces & types
├── App.tsx                        # React app root
├── index.tsx                      # React DOM render
│
├── Dockerfile                     # Frontend Nginx image
├── Dockerfile.api                # API Express image (Alpine)
├── Dockerfile.mysql              # MySQL image with schema
├── Dockerfile.maildev            # MailDev image
│
├── docker-compose.yml            # Dev/test compose file
├── db-init.sql                   # MySQL schema initialization
├── tsconfig.json                 # Frontend TypeScript config
├── tsconfig.server.json          # Backend TypeScript config
├── vite.config.ts                # Vite configuration
│
├── INSTALLATION.md               # Setup & deployment guide
├── README.md                      # This file
└── package.json                  # Dependencies & scripts
```

---

## 🛠️ Development Workflow

### Add a New Feature
1. Create component in `components/`
2. Use `storageService` for data persistence
3. Update types in `types.ts` if needed
4. Test locally: `npm run dev`
5. Build Docker images as needed
6. Push to Docker Hub

### Database Schema Changes
1. Update `initDb()` in `server/db.ts`
2. Update `db-init.sql` for MySQL image
3. Rebuild MySQL image:
   ```bash
   docker build -f Dockerfile.mysql -t n00n0i/portal-mysql:latest .
   docker push n00n0i/portal-mysql:latest
   ```

### Update Images
```bash
# Frontend
docker build -t n00n0i/portal-frontend:latest --build-arg GEMINI_API_KEY=demo-key .
docker push n00n0i/portal-frontend:latest

# API
docker build -f Dockerfile.api -t n00n0i/portal-api:latest .
docker push n00n0i/portal-api:latest

# All at once with docker compose
docker compose build
```

---

## 🐛 Troubleshooting

### Frontend not loading
- Check browser console for errors (F12)
- Verify `GEMINI_API_KEY` is set in `.env.local`
- Clear cache: Ctrl+Shift+Del, then refresh

### API connection fails
- Check API is running: `docker ps`
- View logs: `docker compose logs api`
- Verify MySQL is ready (wait 10-15s on first startup)

### Database issues
- Check credentials in `.env.local`
- View MySQL logs: `docker compose logs mysql`
- Reset database: `docker compose down -v` then `docker compose up`

### Email not working
- MailDev is development only - not for production
- Production: set SMTP_HOST, SMTP_USER, SMTP_PASS
- View emails: http://localhost:1080

### Port already in use
- Frontend (3000): `lsof -i :3000` to find process
- API (4000): `lsof -i :4000`
- MySQL (3306): `lsof -i :3306`

---

## 📝 Key Endpoints (API)

```
Authentication:
  POST /api/auth/signup          { name, email, password }
  POST /api/auth/login           { email, password }
  POST /api/auth/forgot          { email }
  GET  /api/auth/verify          ?token=...
  POST /api/auth/change-password { email, currentPassword, newPassword }

User Management:
  GET    /api/users              (admin only)
  PATCH  /api/users/:id/status   { status } (admin only)
  DELETE /api/users/:id          (admin only)
  POST   /api/users/:id/password { newPassword } (admin only)
```

---

## 🤝 Contributing

To contribute:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test locally
4. Build & test Docker images
5. Push changes and create pull request

---

## 📄 License

This project is provided as-is for personal and commercial use.

---

## 🔗 Resources

- **Docker Hub**: https://hub.docker.com/u/n00n0i
- **Frontend**: React 19 docs
- **Backend**: Express.js docs
- **Database**: MySQL 8.0 docs
- **AI**: Google Gemini API docs

---

**Last Updated**: December 9, 2025  
**Status**: Active Development  
**Docker Hub Repository**: https://hub.docker.com/u/n00n0i
