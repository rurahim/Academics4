# Academics4

A volunteer tutoring platform connecting tutors with students in crisis-affected regions (Gaza, Ukraine, Syria, Afghanistan, Yemen, Sudan).

## Features

- **Multi-Match System**: One student can have multiple tutors for different subjects
- **Admin-Controlled Matching**: Admins manage subject assignments with full audit trail
- **Smart Subject Matching**: Semantic matching using local LLM (Ollama) and synonym groups
- **Role-Based Access**: Admin, Tutor, and Student portals with strict access controls
- **Session Tracking**: Track tutoring sessions with platform selection (Zoom, WhatsApp, etc.)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **UI Components**: Shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with httpOnly cookies
- **State Management**: Zustand + TanStack React Query
- **AI/Matching**: @xenova/transformers (local embeddings) + Ollama LLM

---

## Quick Start (Development)

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/rurahim/Academics4.git
cd Academics4

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run dev
```

Visit http://localhost:3000

---

## Production Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/rurahim/Academics4.git
cd Academics4

# Create production environment file
cp .env.example .env.production

# Edit .env.production with secure values:
# - Generate secure JWT secrets: openssl rand -base64 32
# - Set strong POSTGRES_PASSWORD
# - Update NEXT_PUBLIC_APP_URL to your domain

# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 2: Manual Deployment

```bash
# Build the application
npm run build

# Set environment variables
export DATABASE_URL="postgresql://..."
export JWT_SECRET="..."
export JWT_REFRESH_SECRET="..."
export NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Run migrations
npx prisma migrate deploy

# Start production server
npm start
```

### Option 3: Platform-Specific

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

#### Railway / Render
1. Connect your GitHub repository
2. Add PostgreSQL addon
3. Set environment variables in dashboard
4. Deploy

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of the application |
| `POSTGRES_USER` | Docker | PostgreSQL username |
| `POSTGRES_PASSWORD` | Docker | PostgreSQL password |
| `POSTGRES_DB` | Docker | Database name |
| `OLLAMA_URL` | No | Ollama server URL for LLM matching |
| `OLLAMA_MODEL` | No | Ollama model name |
| `SENDGRID_API_KEY` | No | SendGrid API key for emails |

---

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   ├── admin/              # Admin dashboard
│   │   ├── volunteer/          # Tutor portal
│   │   ├── student/            # Student portal
│   │   └── (auth)/             # Login/Register
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   └── store/                  # Zustand stores
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── docker-compose.yml          # Development Docker
├── docker-compose.prod.yml     # Production Docker
├── Dockerfile                  # Multi-stage build
└── .env.example                # Environment template
```

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run ESLint

# Database
npx prisma migrate dev   # Create migration
npx prisma migrate deploy # Apply migrations
npx prisma studio        # Visual database editor
npx prisma generate      # Regenerate client

# Docker
docker-compose up -d                           # Start dev containers
docker-compose -f docker-compose.prod.yml up -d # Start prod containers
docker-compose logs -f                          # View logs
docker-compose down                             # Stop containers
```

---

## Health Check

The application exposes a health endpoint:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "database": "connected"
}
```

---

## Default Admin Account

After first deployment, create an admin user:

```bash
# Using Prisma Studio
npx prisma studio

# Or via API (if enabled)
# POST /api/admin/create-first-admin
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs db

# Reset database (development only)
npx prisma migrate reset
```

### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

---

## License

MIT

---

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/rurahim/Academics4/issues) page.
