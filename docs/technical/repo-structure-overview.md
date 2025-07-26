# Repository Overview – *SuiteCRM Real Estate Pro*

> A high-level map so new contributors can quickly orient themselves inside the 1.8 M-line legacy codebase and the new modernization scaffolding.

---

## 1. Top-level layout

| Path | What lives here | Why it matters |
|------|-----------------|----------------|
| `docker-compose.yml` | 2-container dev stack (MariaDB + SuiteCRM) | One-command local bootstrap. Edit here when you need extra services (e.g. Redis, Elastic). |
| `backend/` | **Up-stream SuiteCRM 7.14** PHP application (≈9 600 files) | The legacy system we are modernising. 100 % vendor code – keep read-only unless patching bugs that block work. |
| `frontend/` | Placeholder for the new React/Next (or your choice) UI | Keeps modernization code isolated from legacy PHP. |
| `docs/` | All project documentation (PRD, checklists, tech notes, AI logs) | Source-of-truth for project knowledge; rendered by GitHub automatically. |
| `tests/` | High-level regression tests we add while refactoring | Ensures we don’t break critical flows during modernisation. |
| `scripts/` | Helper CLI/automation (DB seeders, data-migrators, lint hooks) | Anything that doesn’t belong inside SuiteCRM itself. |

> Inside **`backend/`** there is another large hierarchy; see section 3.

---

## 2. DevOps / local-dev helpers

Directory | Contents
|----------|---------|
| `.git/`, `.gitattributes`, `.gitignore` | Standard Git metadata – nothing special here. |
| `.github/` | Templates & CI hooks inherited from SuiteCRM. |
| `docker-compose.yml` | Starts
  * `db` – `mariadb:10.6`
  * `crm` – `bitnami/suitecrm:7` → exposed on `localhost:8080`
  Environment vars & volumes are defined here. |
| `scripts/` | • `db-reset.sh` *(planned)* – drop & re-seed demo data  
  • `lint-all.ps1` – enforce Prettier/ESLint  
  *(Feel free to add more little utilities.)* |

---

## 3. Legacy **SuiteCRM** tree (`backend/`)

Only the **essential sub-trees** are listed – focus here when you need to trace bugs or extend functionality.

Path | Purpose | Typical tasks
|-----|---------|--------------|
| `modules/` | **Business modules** (Accounts, Contacts, Leads, …). Each folder is an MVC mini-app: `*Bean.php`, `controller.php`, `metadata/`, `views/`. | • Add/override logic hooks  
• Study existing workflows  |
| `custom/` | All *non-core* customisations go here (empty right now). Anything here overrides files with the same path in core. | **Safe place** for patches or new modules – survives upgrades. |
| `include/` | Framework/kernel (routing, DB layer, SugarBean, Logger). | Dive when you need to understand platform internals. |
| `themes/` | Legacy SuiteP UI (Smarty + CSS). | Reference only – we’re replacing UI. |
| `install/`, `install.php` | Interactive & silent installers. | Rarely touched after first-boot. |
| `cron.php`, `run_job.php` | Scheduler entry-points (workflow, emails). | Wire new batch jobs or debug cron issues. |
| `api/`, `service/v4_1`, `service/v8` | REST/SOAP API endpoints. | Useful for migration to an API-first architecture. |
| `composer.json`, `lib/` | Third-party PHP deps managed by Composer. | If you add a library, update `composer.json` **inside backend** and run `composer install` in container. |
| `tests/` (inside backend) | Up-stream Codeception tests. | Good reference when adding our own tests. |

---

## 4. Modernisation surface

Component | Location | Notes
|----------|----------|------|
| **New frontend** | `frontend/` | Will hold a stand-alone SPA/Next.js app that talks to SuiteCRM via REST. CI build can then be Nginx, Vite, etc. |
| **Domain micro-services** | *(future)* `services/` | e.g. Property-search service, Notification service, etc. Compose can grow as needed. |
| **Data-migration / ETL** | `scripts/migrations/` | One-off scripts to reshape legacy DB to new structures. |

---

## 5. Documentation tree (`docs/`)

```
docs/
├── PRD_SuiteCRM_Modernization.md      # product vision & requirements
├── Project_Checklist_*.md            # 7-day sprint plan
├── ai-utilization/                   # automatic log of AI prompts
├── technical/
│   ├── suitecrm-architecture-deep-dive.md
│   └── repo-structure-overview.md    # ← you are here
└── user/                             # eventual user-facing docs
```

Add any new technical note under `docs/technical/` and link it from the README.

---

## 6. How to navigate quickly

1. **Need to change a screen?**  
   Legacy UI → `backend/modules/<Module>/` views  
   New UI → `frontend/`
2. **Business logic / DB writes?**  
   Start at the module’s `*Bean.php`, look for logic hooks.  
3. **Global framework behaviour?**  
   Search in `backend/include/` (DB, auth, routing).
4. **Custom extensions (safe zone)**  
   Create mirrors inside `backend/custom/`.
5. **Modern code only** → stay out of `backend/` completely and build green-field inside `frontend/` or micro-services.

---

### :bulb:  Tip – fastest grep

```bash
# find where a field is defined for Contacts
rg "city_c" backend/modules

# jump to code in VS Code
code backend/modules/Contacts/Contact.php
```

---

## 7. Next steps for new contributors

1. Bring the stack up: `docker compose up -d` and log in at `localhost:8080`.
2. Read `docs/technical/suitecrm-architecture-deep-dive.md` for deeper internals.
3. Add any *new* PHP/JS under `custom/` or `frontend/` – never hack core directly.
4. When you create something substantial, update this overview if paths change.

Happy hacking! ✨ 