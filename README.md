<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1R5a8GDLKoIyFRMzdWbYr4DIm65Quqpvk

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run with Docker (dev)

1. Copy `.env.local.example` to `.env.local` and fill in `GEMINI_API_KEY` (defaults for MySQL are already set).
2. Start containers (Vite at port 3000, MySQL at port 3306):
   `docker compose up`
   - Frontend: http://localhost:3000
   - API: http://localhost:4000 (Express + MySQL)
   - Maildev UI (captures emails): http://localhost:1080
   - SMTP for Maildev: host `maildev`, port `1025`

## Build container image

Build a production image served by nginx (pass your key at build time so Vite can embed it):
`docker build --build-arg GEMINI_API_KEY=your-key -t portal-frontend:latest .`

## Kubernetes (manual apply)

1. Create secrets + PVC + MySQL:
   ```
   kubectl apply -f deploy/k8s/mysql-secret.yaml
   kubectl apply -f deploy/k8s/mysql-pvc.yaml
   kubectl apply -f deploy/k8s/mysql-deployment.yaml
   kubectl apply -f deploy/k8s/mysql-service.yaml
   ```
2. Build and push the frontend image to your registry, e.g.:
   `docker build --build-arg GEMINI_API_KEY=your-key -t <registry>/portal-frontend:latest . && docker push <registry>/portal-frontend:latest`
3. Update `deploy/k8s/frontend-deployment.yaml` `image:` with your pushed image.
4. Deploy the frontend Service/Deployment:
   ```
   kubectl apply -f deploy/k8s/frontend-deployment.yaml
   kubectl apply -f deploy/k8s/frontend-service.yaml
   ```
5. Expose externally via your Ingress/LoadBalancer as needed.

## Backend API (Express + MySQL + SMTP)

- Dev server: `npm run server` (uses `ts-node-dev`, reads `.env.local`)
- Important env vars: `API_PORT`, `API_BASE_URL`, `API_PUBLIC_URL`, `MYSQL_*`, `SMTP_*`
- Frontend env: `VITE_API_BASE_URL` (defaults to http://localhost:4000), `VITE_MAILDEV_URL` (defaults to http://localhost:1080)
- Endpoints:
  - `POST /api/auth/signup` { name, email, password }
  - `POST /api/auth/login` { email, password }
  - `POST /api/auth/forgot` { email } (sends temporary password via SMTP)
  - `GET /api/auth/verify?token=...` (sent after signup; email must be verified before approval)
  - `POST /api/auth/change-password` { email, currentPassword, newPassword }
  - `GET /api/users` (list users)
  - `PATCH /api/users/:id/status` { status }
  - `DELETE /api/users/:id`
  - `POST /api/users/:id/password` { newPassword } (admin set)
 - Seed admin: email `admin@portal.com`, password `admin` (created automatically)
