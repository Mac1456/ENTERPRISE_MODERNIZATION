# Agent Development Guide
## SuiteCRM Real Estate Pro Modernization

### Build Commands
- **Setup:** `docker-compose up -d` (PHP 8.0+, MySQL 8.0+, Redis)
- **Install Dependencies:** `composer install && npm install`
- **Build Frontend:** `npm run build` (React/Vue.js + TypeScript)
- **Tests:** `vendor/bin/phpunit` (backend), `npm test` (frontend)
- **Single Test:** `vendor/bin/phpunit --filter testName`
- **Lint:** `vendor/bin/php-cs-fixer fix` (PHP), `npm run lint` (JS/TS)
- **Type Check:** `npm run type-check` (TypeScript)

### Architecture
- **Legacy Core:** SuiteCRM 7.14.6 (1.8M+ lines PHP, preserve business logic)
- **Modernized Stack:** React/Vue.js frontend, RESTful APIs, MySQL optimized
- **Key Modules:** `/modules/Accounts`, `/modules/Contacts`, `/modules/Leads`, `/modules/Opportunities`
- **API Layer:** `/api/` (new JWT-based endpoints)
- **Real Estate Features:** Lead assignment, property matching, transaction pipeline

### Code Style
- **PHP:** PSR-12 standards, type hints, modern OOP patterns
- **Frontend:** TypeScript strict mode, functional components, Tailwind CSS
- **API:** RESTful conventions, JSON responses, proper HTTP status codes
- **Database:** Optimized queries, proper indexing, connection pooling
- **Security:** Input validation, CSRF protection, JWT authentication
