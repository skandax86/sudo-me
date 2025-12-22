# Docker Guide

**Containerization and Deployment Guide for PDS**

---

## 🐳 Docker Setup

### Files Created

- `Dockerfile` - Production build (multi-stage)
- `Dockerfile.dev` - Development build
- `docker-compose.yml` - Orchestration
- `.dockerignore` - Exclude files from build

---

## 🚀 Quick Start

### Build Docker Image

```bash
# Production build
docker build -t sudo-me:latest .

# Development build
docker build -f Dockerfile.dev -t sudo-me:dev .
```

### Run with Docker

```bash
# Production
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain \
  -e NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id \
  -e NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket \
  -e NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id \
  -e NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id \
  sudo-me:latest

# Or use docker-compose
docker-compose up
```

### Run with Docker Compose

```bash
# Production
docker-compose up

# Development (with hot reload)
docker-compose --profile dev up app-dev

# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📋 Environment Variables

Create `.env` file (or use environment variables):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Docker Compose will automatically load from `.env` file.

---

## 🏗️ Build Process

### Production Build (Multi-stage)

1. **Dependencies Stage:**
   - Installs npm dependencies
   - Optimized layer caching

2. **Builder Stage:**
   - Copies dependencies
   - Builds Next.js application
   - Creates standalone output

3. **Runner Stage:**
   - Minimal Alpine image
   - Only production files
   - Non-root user for security
   - Exposes port 3000

### Image Size

- **Production:** ~150-200MB (Alpine-based)
- **Development:** ~300-400MB (with dev dependencies)

---

## 🚢 Deployment Options

### 1. Docker Hub

```bash
# Tag image
docker tag sudo-me:latest yourusername/sudo-me:latest

# Push to Docker Hub
docker push yourusername/sudo-me:latest

# Pull and run anywhere
docker pull yourusername/sudo-me:latest
docker run -p 3000:3000 yourusername/sudo-me:latest
```

### 2. Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/sudo-me

# Deploy to Cloud Run
gcloud run deploy sudo-me \
  --image gcr.io/PROJECT_ID/sudo-me \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 3. AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker build -t sudo-me .
docker tag sudo-me:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/sudo-me:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/sudo-me:latest
```

### 4. Azure Container Instances

```bash
# Build and push to ACR
az acr build --registry REGISTRY_NAME --image sudo-me:latest .
```

### 5. DigitalOcean App Platform

- Connect GitHub repository
- Select Dockerfile
- Add environment variables
- Deploy automatically

---

## 🔧 Docker Commands

### Build

```bash
# Production
docker build -t sudo-me:latest .

# Development
docker build -f Dockerfile.dev -t sudo-me:dev .

# With no cache
docker build --no-cache -t sudo-me:latest .
```

### Run

```bash
# Run container
docker run -p 3000:3000 sudo-me:latest

# Run with environment file
docker run -p 3000:3000 --env-file .env sudo-me:latest

# Run in background
docker run -d -p 3000:3000 --name sudo-me sudo-me:latest

# View logs
docker logs -f sudo-me

# Stop container
docker stop sudo-me

# Remove container
docker rm sudo-me
```

### Docker Compose

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Execute command in container
docker-compose exec app sh
```

---

## 🧪 Testing Docker Build

### Local Test

```bash
# Build image
docker build -t sudo-me:test .

# Run container
docker run -p 3000:3000 \
  --env-file .env.local \
  sudo-me:test

# Test in browser
open http://localhost:3000
```

### Health Check

```bash
# Check if container is running
docker ps

# Check container logs
docker logs <container-id>

# Check container health
docker inspect <container-id> | grep Health
```

---

## 📊 Image Optimization

### Current Setup

- ✅ Multi-stage build (reduces final image size)
- ✅ Alpine Linux (minimal base image)
- ✅ Standalone Next.js output
- ✅ Non-root user (security)
- ✅ Layer caching optimization

### Image Size Breakdown

- Base Alpine: ~5MB
- Node.js runtime: ~40MB
- Application: ~100-150MB
- **Total: ~150-200MB**

---

## 🔒 Security Best Practices

### Implemented

- ✅ Non-root user (nextjs:nodejs)
- ✅ Minimal base image (Alpine)
- ✅ No unnecessary packages
- ✅ Environment variables for secrets
- ✅ .dockerignore to exclude sensitive files

### Recommendations

- Use Docker secrets for production
- Scan images for vulnerabilities
- Keep base images updated
- Use specific version tags

---

## 🚀 Production Deployment Checklist

### Before Deployment

- [ ] Build Docker image locally
- [ ] Test image locally
- [ ] Set up environment variables
- [ ] Configure health checks
- [ ] Set up logging
- [ ] Configure monitoring
- [ ] Set up backup strategy

### Deployment Steps

1. **Build Image:**
   ```bash
   docker build -t sudo-me:latest .
   ```

2. **Tag for Registry:**
   ```bash
   docker tag sudo-me:latest registry/sudo-me:v1.0.0
   ```

3. **Push to Registry:**
   ```bash
   docker push registry/sudo-me:v1.0.0
   ```

4. **Deploy to Platform:**
   - Configure environment variables
   - Set resource limits
   - Configure auto-scaling
   - Set up monitoring

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ Yes | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ Yes | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ Yes | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ Yes | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ Yes | Firebase app ID |
| `GEMINI_API_KEY` | ⚠️ Optional | Gemini API key for LLM features |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Optional | Application URL (default: http://localhost:3000) |

---

## 🐛 Troubleshooting

### Issue: Build fails with "Module not found"
**Solution:** Ensure `package.json` is copied before installing dependencies

### Issue: Container exits immediately
**Solution:** Check logs: `docker logs <container-id>`

### Issue: Port already in use
**Solution:** Change port mapping: `-p 3001:3000`

### Issue: Environment variables not working
**Solution:** Use `--env-file .env` or pass `-e` flags

### Issue: Permission denied
**Solution:** Check file permissions and user in Dockerfile

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Ready for deployment!** Build once, deploy anywhere. 🚀




