# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Academics4 is a volunteer tutoring platform connecting teachers with students in crisis-affected regions (Gaza, Ukraine, Syria, Afghanistan, Yemen, Sudan). Key feature: multi-match system where one student can have multiple teachers for different subjects, with admin-controlled subject assignment.

## Commands

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm run lint       # ESLint check

# Database
npx prisma migrate dev   # Create/apply migrations
npx prisma generate      # Generate Prisma client
npx prisma studio        # Visual database explorer

# Docker
docker-compose up        # Start PostgreSQL + app
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **UI Components**: Shadcn/ui (in `src/components/ui/`)
- **State**: Zustand (`src/store/auth-store.ts`) + TanStack React Query
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jose) with httpOnly cookies, 15-min access + 7-day refresh tokens
- **AI/Matching**: Local embeddings (@xenova/transformers) + Ollama LLM for semantic matching

### Route Structure
```
src/app/
├── api/                    # API routes
│   ├── auth/               # login, register, me, refresh, logout
│   └── admin/              # Admin-only endpoints
│       ├── students/       # Student management + subject assignment
│       ├── volunteers/     # Volunteer + capacity management
│       ├── matches/        # Match status updates
│       └── triggers/       # Auto-matching triggers
├── admin/                  # Admin dashboard pages
├── volunteer/              # Volunteer portal pages
├── student/                # Student portal pages
├── login/
└── register/
```

### Key Files
- `src/middleware.ts` - Auth + RBAC, redirects based on role
- `src/lib/auth.ts` - JWT generation/verification, password hashing
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/utils.ts` - Subject matching algorithm with synonym groups
- `src/lib/llm-matcher.ts` - Ollama LLM service for semantic matching
- `src/lib/validations.ts` - Zod schemas for form validation
- `prisma/schema.prisma` - Database models

### Database Models (Core)
- **User** → 1:1 with Volunteer or Student (cascade delete)
- **Match** → Links student-volunteer with assigned subjects, unique constraint per pair
- **SubjectAssignment** → Audit trail for subject assignments (append-only)
- **Student.topicsNeedSupport** → JSON array: `[{keyword, status, assignedTo}]`

### Roles & Access
- **Admin**: Full access, manages matches and subject assignments
- **Volunteer**: Can only see assigned students (privacy-enforced)
- **Student**: Can only see assigned teachers

## Patterns

### API Endpoints
- Use Zod for request validation
- Check JWT with `verifyAccessToken()` from `src/lib/auth.ts`
- Enforce roles before processing
- Return `NextResponse.json()` with appropriate status

### Forms
- React Hook Form + Zod resolver
- Validation schemas in `src/lib/validations.ts`

### Subject Matching
- Free-text subjects (no predefined list)
- Synonym groups in `src/lib/utils.ts` for matching
- LLM fallback via Ollama for complex matching

## Environment Variables

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:1.5b
```
