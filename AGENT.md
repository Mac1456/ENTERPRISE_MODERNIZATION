# AGENT.md - Enterprise Modernization Project

## Commands
**Frontend:** `cd frontend && npm run dev` (development), `npm run build` (build), `npm run lint` (lint), `npm run type-check` (TypeScript check)  
**Backend:** `cd backend && composer install`, `composer test` (PHPUnit), `composer phpstan` (static analysis), `composer cs-fix` (code style)  
**Docker:** `docker-compose up` (MariaDB + SuiteCRM), `docker-compose up -d` (detached)

## Architecture
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + React Query + Zustand  
- **Backend:** PHP 8+ SuiteCRM 7 + Slim 4 API + Doctrine DBAL + MariaDB  
- **API:** RESTful endpoints in `backend/src/Api/`, Domain models in `backend/src/Domain/`  
- **Database:** MariaDB 10.6 (Docker), SuiteCRM database schema  

## Code Style
**TypeScript:** Use strict typing, avoid `any`, prefix unused args with `_`, imports with `@/` alias  
**React:** Functional components, hooks, TanStack Query for data fetching, react-hot-toast for notifications  
**PHP:** PSR-4 autoloading, strict types, namespace `App\`, domain-driven structure, PHP-CS-Fixer formatting  
**Testing:** Frontend uses Jest/RTL (needs setup), Backend uses PHPUnit + Codeception  

## Key Files
- `frontend/src/pages/` - React pages, `frontend/src/components/` - Reusable components  
- `backend/src/Domain/` - Business logic, `backend/src/Api/` - API controllers  
- `backend/tests/` - Comprehensive test suites, `docker-compose.yml` - Local development setup
