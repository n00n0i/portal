FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG GEMINI_API_KEY
ARG VITE_API_BASE_URL
ARG VITE_MAILDEV_URL

# Build-time env for Vite (values must be passed via --build-arg)
ENV GEMINI_API_KEY=${GEMINI_API_KEY}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_MAILDEV_URL=${VITE_MAILDEV_URL}
RUN npm run build

# Runtime image - lightweight Alpine
FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
