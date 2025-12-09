# Portal - Installation Guide

## Overview

Portal is a multi-user web application dashboard that aggregates links to web apps with category organization, user authentication, and admin management.

### Architecture
- **Frontend**: React 19 + TypeScript, served by Nginx (Alpine)
- **Backend API**: Express.js + Node.js (Alpine)
- **Database**: MySQL 8.0
- **Email**: MailDev for testing

### Docker Images
All images are built with Alpine Linux for minimal size:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| Frontend | `n00n0i/portal-frontend:latest` | 80 | React SPA (Nginx) |
| API | `n00n0i/portal-api:latest` | 4000 | Express server |
| Database | `n00n0i/portal-mysql:latest` | 3306 | MySQL with schema pre-initialized |
| MailDev | `n00n0i/portal-maildev:latest` | 1080, 1025 | Email testing UI + SMTP |

---

## Quick Start with Docker Compose

### Prerequisites
- Docker & Docker Compose installed
- `.env.local` file (copy from `.env.local.example`)

### 1. Setup Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your settings:
```env
GEMINI_API_KEY=your-api-key-here
MYSQL_PASSWORD=portalpass
MYSQL_ROOT_PASSWORD=rootpass
```

### 2. Run All Services
```bash
docker compose up
```

This starts:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **MailDev**: http://localhost:1080
- **MySQL**: localhost:3306

### 3. Default Login
- Email: `admin@portal.com`
- Password: `admin`

---

## Running Individual Services

### Pull Images from Docker Hub
```bash
docker pull n00n0i/portal-frontend:latest
docker pull n00n0i/portal-api:latest
docker pull n00n0i/portal-mysql:latest
docker pull n00n0i/portal-maildev:latest
```

### Run Frontend
```bash
docker run -p 80:80 n00n0i/portal-frontend:latest
```

### Run API
```bash
docker run -p 4000:4000 \
  -e MYSQL_HOST=mysql \
  -e MYSQL_USER=portal \
  -e MYSQL_PASSWORD=portalpass \
  n00n0i/portal-api:latest
```

### Run MailDev
```bash
docker run -p 1080:1080 -p 1025:1025 n00n0i/portal-maildev:latest
```

### Run MySQL
```bash
docker run -p 3306:3306 \
  -e MYSQL_DATABASE=portal \
  -e MYSQL_USER=portal \
  -e MYSQL_PASSWORD=portalpass \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -v mysql_data:/var/lib/mysql \
  n00n0i/portal-mysql:latest
```

**Note**: Schema and tables are auto-created on first run. Admin user is pre-seeded:
- Email: `admin@portal.com`
- Password: `admin`

---

## Production Deployment with Kubernetes

### 1. Create Secrets
```bash
kubectl create secret generic portal-secrets \
  --from-literal=GEMINI_API_KEY=your-api-key \
  --from-literal=MYSQL_ROOT_PASSWORD=strongpass \
  --from-literal=MYSQL_PASSWORD=strongpass

kubectl create secret generic smtp-config \
  --from-literal=SMTP_HOST=smtp.example.com \
  --from-literal=SMTP_USER=user@example.com \
  --from-literal=SMTP_PASS=password
```

### 2. Create MySQL PVC and Deployment
```bash
kubectl apply -f deploy/k8s/mysql-pvc.yaml
kubectl apply -f deploy/k8s/mysql-deployment.yaml
kubectl apply -f deploy/k8s/mysql-service.yaml
```

### 3. Deploy API Backend
```bash
kubectl apply -f deploy/k8s/api-deployment.yaml
kubectl apply -f deploy/k8s/api-service.yaml
```

### 4. Deploy Frontend
Update image in `deploy/k8s/frontend-deployment.yaml`:
```yaml
image: n00n0i/portal-frontend:latest
```

Then apply:
```bash
kubectl apply -f deploy/k8s/frontend-deployment.yaml
kubectl apply -f deploy/k8s/frontend-service.yaml
```

### 5. Expose with Ingress
```bash
kubectl apply -f - << EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: portal-ingress
spec:
  rules:
  - host: portal.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: portal-frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: portal-api
            port:
              number: 4000
EOF
```

---

## Local Development

### Development without Docker
```bash
# Install dependencies
npm install

# Frontend (Vite on 3000)
npm run dev

# Backend API (on 4000, in another terminal)
npm run server
```

### Development with Docker Compose (Live Reload)
```bash
docker compose up
```

Services auto-reload on code changes via volume mounts.

---

## Environment Variables

### Frontend
- `GEMINI_API_KEY`: Google Gemini API key for auto-generating app descriptions

### API
- `MYSQL_HOST`: MySQL host (default: mysql)
- `MYSQL_PORT`: MySQL port (default: 3306)
- `MYSQL_DATABASE`: Database name (default: portal)
- `MYSQL_USER`: Database user (default: portal)
- `MYSQL_PASSWORD`: Database password
- `SMTP_HOST`: SMTP server for email (optional)
- `SMTP_PORT`: SMTP port (default: 1025)
- `SMTP_USER`: SMTP username (optional)
- `SMTP_PASS`: SMTP password (optional)
- `API_PORT`: API port (default: 4000)

---

## Troubleshooting

### Frontend not loading
- Check if Nginx is serving on port 80
- Verify `.env.local` has `GEMINI_API_KEY` set
- Check browser console for errors

### API connection fails
- Ensure API container is running: `docker ps`
- Check API logs: `docker compose logs api`
- Verify MySQL is running and accessible

### MySQL connection errors
- Verify credentials in environment variables
- Check MySQL is healthy: `docker compose logs mysql`
- Ensure `mysql_data` volume is mounted

### Email not working
- MailDev is for testing only - not production ready
- Check SMTP settings in `.env.local`
- Access MailDev UI at http://localhost:1080

---

## Features

### For Users
- 🔐 User authentication & authorization
- 📱 Add, edit, delete web applications
- 🏷️ Organize apps by categories
- 🔍 Search & filter functionality
- 🎨 Modern dark theme UI

### For Admins
- 👥 User management & approval workflow
- 🔧 User role assignment
- 🎨 Design system documentation
- 📊 View all user accounts

### AI Integration
- 🤖 Auto-generate app descriptions using Google Gemini API
- Fallback text if API fails

---

## Default Credentials

After initial setup:
- **Admin User**: `admin@portal.com` / `admin`

Change password immediately in production!

---

## Support & Issues

For issues or questions, refer to the main README.md or check the copilot-instructions.md for development guidelines.

---

**Last Updated**: December 2025
**Status**: Active Development
