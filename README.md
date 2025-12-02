# OpenBanking Frontend

این پروژه frontend بانکداری باز است که با Next.js ساخته شده.

## اجرای با Docker (SSL Enabled)

پروژه برای اجرا روی IP `192.168.50.49` با SSL خودامضا تنظیم شده.

### پیش‌نیازها

- Docker
- Docker Compose

### اجرای سریع

```bash
# Build و run با docker-compose
npm run docker:up

# یا مستقیم
docker-compose up --build
```

### دسترسی به برنامه

- **HTTPS URL**: https://192.168.50.49
- **HTTP URL**: http://192.168.50.49 (redirect می‌شود به HTTPS)

### SSL Certificate

- برنامه از SSL certificate خودامضا استفاده می‌کند
- برای مرورگرهای مدرن، باید certificate رو accept کنید
- Certificate برای IP `192.168.50.49` تولید شده

### متوقف کردن

```bash
npm run docker:down
# یا
docker-compose down
```

## Development

```bash
npm install
npm run dev
```

# Docker Build & Run

This project uses Docker and Docker Compose for development and production builds.

## Environment Variables

Copy `env.example` to `.env` and set the values. Key variables:

- `IMAGE_NAME`: Docker image name (default: `opencbanking`)
- `IMAGE_TAG`: Docker image tag (default: `latest`)
- `NEXT_PUBLIC_BASE_URL`: API base URL (runtime only, not embedded in build)

## Build & Run with Custom Tags

### One-off Tag Override (No File Changes)

You can override the image tag inline without editing any files:

```bash
# Build with custom tag
IMAGE_TAG=1.2.3 docker compose build --no-cache web

# Run with custom tag
IMAGE_TAG=1.2.3 docker compose up -d web

# Build and run together
IMAGE_TAG=1.2.3 docker compose up -d --build web

# Override both name and tag
IMAGE_NAME=myregistry/opencbanking IMAGE_TAG=v1.2.3 docker compose up -d --build web
```

### Build & Push to Registry

After building with a custom tag, push to a registry:

```bash
# Build with tag
IMAGE_TAG=1.2.3 docker compose build --no-cache web

# Tag for registry (replace 'myuser' with your registry username)
docker tag opencbanking:1.2.3 myuser/opencbanking:1.2.3

# Push to registry
docker push myuser/opencbanking:1.2.3
```

## Notes

- `NEXT_PUBLIC_BASE_URL` is only used at runtime (not embedded in client bundle since you use nginx proxy)
- The container uses npm for builds (switched from yarn due to network issues in Docker)
- Use `docker exec -it opencbanking-pwa printenv` to validate environment variables
- The `.env` file is gitignored; never commit secrets

```

```
