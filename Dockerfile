# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config to handle React Router client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
