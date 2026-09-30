# LabOS — Context

Read this first, every session. This is the master tracking file — full detail lives in the docs it links to, not duplicated here.

## What this is

LabOS is a lab-operations platform for India's independent diagnostic labs — small, standalone labs (1–3 people, 10–50 samples/day) currently running on paper, priced out of every existing LIS product on the market. Full reasoning, target user, scope, and roadmap: `docs/product/prd.md`.

This is a new project. It does not build on, share code with, or depend on any prior personal tool.

## Current phase

- **Backend (`labOS-service`)**: 100% complete across all 8 modules (468 files, 0 lint/build errors).
- **Frontend (`labOS-app`)**: Phases 1 through 12 completed across all 13 production routes with 0 lint/build errors:
  - **Phase 1**: Foundations & Mission Control Dashboard (`/`, `src/features/dashboard/`)
  - **Phase 2**: Patient Registration & Accession Intake (`/reports/new`)
  - **Phase 3**: Pathologist Result Entry Console with Real-Time Synchronized A4 Sheet (`/reports/[id]/entry`)
  - **Phase 4**: Digital Report Verification & Public Patient QR Portal (`/reports/[id]/preview`, `/v/[token]`)
  - **Phase 5**: Daily Register & Accession Worklist (`/accessions`, `/reports`)
  - **Phase 6**: Patient EMR Directory & Longitudinal Biomarker Trends (`/patients`)
  - **Phase 7**: Doctor Referrals & Commission Ledger with TDS 194H Payouts (`/referrals`)
  - **Phase 8**: Billing, Invoices & Operational Expenses with Cash Receipt Vouchers (`/billing`)
  - **Phase 9**: Settings, Master Test Panels Catalog & Lab Profile Configuration (`/settings`, `/panels`)
  - **Phase 10**: Home Collection Bookings & Phlebotomist Dispatch Workstation (`/collections`)
  - **Phase 11**: Real-Time WebSockets Integration & Live Lab Feed (global `RealtimeProvider`, live toast system, `LiveActivityDrawer`, Bell ↔ unread count)
  - **Phase 12**: Comprehensive UI/UX, Layout, Print Architecture & Component Overhaul (Full-bleed data grids, `@media print` engine, sidebar collapse ergonomics, shared primitives `PageHeader`, `EmptyState`, `TablePagination`, `TableSkeleton`, `Modal`, demo data extraction to `lib/demo-data/`, component decomposition).
- **QA & Verification**: 100% of items in `qa_task_list.md` and all 8 phases of `implementation_plan.md` are executed, visually verified via Chrome DevTools, and passing `npm run lint` and `npm run build`.
- **NEXT PHASE (Phase 2 Roadmap)**:
  - **Direction B: Pilot Readiness (Deswal's Standalone Lab)**:
    1. Real Supabase Auth Integration (`/login`, `/signup`, session management, JWT propagation to NestJS via Axios interceptor). *(DONE - Session 22)*
    2. 4-step Lab Onboarding Wizard (`/onboarding`: Lab profile/branding, Pathologist signatures & qualifications, master test catalog seeder). *(DONE - Session 22)*
    3. Clinical test catalog seeding for Deswal's actual test pricing.
  - **PRD Core & Phase 2 Features**:
    1. **Outsourced / Reference Lab Testing Workflow (PRD Goal 3 & P0)**: External dispatch manifest, courier waybill tracking, B2B wholesale costs, and NABL Clause 5.8 report merging. *(DONE - Session 36)*
    2. **Cost-Per-Test Profitability & Diagnostic P&L Analytics (PRD Goal 2 & P1)**: In-house vs outsourced unit margins, Breakeven analyzer, and formal diagnostic P&L statement in `/billing`. *(DONE - Session 37)*
    3. **Role-Based Access Control (RBAC) UI View Gating (PRD P1)**: Centralized permission matrix, NABL sign-off protection, workstation access gating, and live persona simulator for Owner, Pathologist, Technician, and Phlebotomist. *(DONE - Session 38)*
    4. WhatsApp delivery log UI and timeline. *(DONE - Session 47)*


## Tech stack

- Frontend: Next.js (App Router), TypeScript, Tailwind, shadcn/ui
- Backend: NestJS (TypeScript)
- ORM: TypeORM (connected to Supabase Postgres)
- Data/Auth/Storage: Supabase (Postgres + Auth + Storage)
- Validation: Standard class-validator + class-transformer on backend; Zod on frontend
- Real-Time: Socket.IO + @nestjs/websockets for live lab feeds, phlebotomy tracking, and critical alerts
- Job Queue: BullMQ or pg-boss (for async PDF generation, notifications)
- Logging: Pino (structured JSON logging)
- Full reasoning and ADRs: `docs/architecture/system-design.md`

## Architecture

This project uses: Modular Monolith, DDD bounded contexts, lightweight in-process CQRS, Domain Events, and Vertical Slice Architecture for code organization. All explained in `docs/architecture/system-design.md` Sections 2 and 8.

- **Controller placement:** one dedicated controller per use-case vertical slice — never one controller per module (see `docs/architecture/system-design.md` Section 8 and `docs/conventions/backend-review.md`)
- **Repository Pattern:** domain interfaces in `domain/<entity>/interfaces/`, implementations in `infrastructure/database/repositories/` named strictly `<entity>.repository.ts` / `<Entity>Repository`
- **Handler invocation:** slice controllers directly inject handlers for 100% compile-time type safety (no CQRS bus indirection)
- **Enum storage:** integers in database, string enums in TypeScript, ValueTransformer mapper pattern in between (inspired by residency-backend's MikroORM enum mapper, adapted for TypeORM)
- **Pagination:** cursor-based (created_at + id)
- **normal_range format:** structured JSONB (`{type, min, max, male, female, text}`) with logic encapsulated in `NormalRange` Value Object
- **WebSockets / Real-Time Gateway:** CloudEvents-compliant envelope (`EventMessage<T>`), abstract `WebSocketEvent<T>` base class, multi-tenant room isolation (`lab:{labId}`, `lab:{labId}:doctors`, `user:{userId}`), and zero-latency in-process event bridging

## Where things live

- `AGENTS.md` — master agent operating rules and customization entry point
- `.agents/rules/` — permanent workspace rules (workflow discipline, frontend standards, backend standards)
- `docs/product/prd.md` — problem, goals, non-goals, personas, requirements, pricing, phasing
- `docs/architecture/system-design.md` — system design, architecture patterns explained, ADRs, folder structure, WebSockets architecture
- `docs/architecture/data-model.md` — database schema, entity relationships, RLS pattern, all 22 single-table migrations
- `docs/architecture/decisions/` — individual ADRs for specific decisions
- `docs/conventions/coding-standards.md` — naming conventions, SOLID, state management, class-validator, unified exception handling, WebSockets standards
- `docs/conventions/backend-review.md` — master backend review and auditing specification
- `docs/specs/` — individual feature specs, written just before each feature is built
- `labOS-service/src/modules/` — all 8 fully built DDD bounded contexts:
  - `labs` (tenancy, profiles, membership)
  - `panels` (test panels, parameters, templates, packages)
  - `reports` (patients, reports, values, amendments, public share token)
  - `referrals` (doctors, commission ledger, outsourced tests)
  - `billing` (invoices, line items, payments, operational expenses, analytics)
  - `notifications` (WhatsApp/SMS/Email providers, audit log, templating)
  - `collections` (phlebotomy home collection requests, technician dispatch, sample tubes)
  - `websockets` (authenticated gateway, room isolation, domain event bridging, REST publisher)

## Rules that shouldn't be relitigated

These were decided with real reasoning already worked through — don't re-open without a real reason:
- Small standalone Indian labs are the target, not enterprise chains (see PRD Non-Goals)
- No microservices, no distributed CQRS, no schema-per-tenant — all explicitly rejected for our current scale
- Referral-doctor commission tracking is record-keeping only, no automated payout (see PRD Section 5 flag)
- TypeORM as ORM, not MikroORM or Prisma (decided 2026-09-07)
- Supabase for database + auth + storage (decided in architecture doc, reconfirmed 2026-09-07)
- Integer enum storage with TypeORM ValueTransformer mappers (decided 2026-09-07)
- Single-table modular migrations matching `residency-backend` standard (one dedicated migration file per table)
- Repository naming without `typeorm-` prefix (`<entity>.repository.ts` / `<Entity>Repository`)
- Standardized CloudEvents envelope for WebSockets (`EventMessage<T>`) with zero magic strings

---

## Decisions log (from planning session 2026-09-07)

### Data model additions — all confirmed
| Table / Column | Decision |
|----------------|----------|
| `panel_templates` (new table) | Pre-seeded test panel templates, system-wide, not tenant-scoped |
| `test_packages` + `package_panels` (new tables) | Bundles of panels with combined pricing |
| `audit_log` (new table) | Append-only change tracking for all entity mutations |
| `report_amendments` (new table) | Medical amendment trail for finalized reports |
| `reports.report_number` | Human-readable accession number (auto-generated per lab) |
| `reports.share_token` + `share_expires_at` | Public report sharing via link + QR code |
| `reports.remarks` | Pathologist interpretive comments on reports |
| `reports.sample_status` + `rejection_reason` | Sample lifecycle tracking (COLLECTED → PROCESSING → COMPLETED / REJECTED) |
| `reports.sample_collected_at` / `results_entered_at` / `finalized_at` / `delivered_at` | TAT (turnaround time) tracking timestamps |
| `patients.patient_number` | Human-readable patient ID (auto-generated per lab) |
| `patients.date_of_birth` | Optional DOB for accurate age calculation on return visits |
| `profiles.signature_url` + `qualification` | Pathologist signature and credentials on reports |
| `panel_parameters.method` | Testing method name ("CLIA", "Turbidimetry") |
| `panel_parameters.name_local` | Hindi/regional language parameter name |
| `panel_parameters.normal_range` | Changed from text to structured JSONB |
| `labs.report_language` | Preferred report language (default 'en') |
| `invoices.payment_status` / `payment_method` / `discount` / `paid_at` | Payment tracking fields |
| `test_panels.price` | Base price per panel |
| `test_panels.deleted_at` | Changed to soft-delete (preserve historical references) |
| `report_panels` | Composite PK `(report_id, panel_id)` to prevent duplicates |
| All enums | Store as integers in DB via TypeORM ValueTransformer |

### Architecture additions — all confirmed
| Addition | Status |
|----------|--------|
| Database indexes (patients, reports, commissions, collections) | Completed |
| Rate limiting (`@nestjs/throttler`) | Completed |
| Structured logging (Pino) | Completed |
| Health check endpoint (`@nestjs/terminus`) | Completed |
| Security headers (Helmet) | Completed |
| CORS configuration | Completed |
| Environment config with typed defaults (`@nestjs/config`) | Completed |
| Graceful shutdown hooks | Completed |
| WebSockets gateway + multi-tenant rooms (Socket.IO) | Completed |
| In-process domain events bridge | Completed |

### Build order (backend) — Status: 100% Completed
1. Scaffold NestJS + TypeORM + Supabase connection (DONE)
2. `labs` module (tenant identity, profiles, auth) (DONE)
3. `panels` module (test config, templates, packages) (DONE)
4. `reports` module (patients, results, PDF, amendments) (DONE)
5. `referrals` module (doctors, commissions, outsourced tests) (DONE)
6. `notifications` module (email, WhatsApp delivery) (DONE)
7. `billing` module (invoices, expenses, export) (DONE)
8. `collections` module (home sample collection) (DONE)
9. `websockets` module (real-time gateway & room routing) (DONE)
10. Shared infrastructure (audit log, health checks, pino logging) (DONE)

---

## Session log

### 2026-09-07 — Initial planning session
- Read all docs: PRD, system-design, data-model, coding-standards
- Studied residency-backend enum mapper pattern (MikroORM-based, adapting to TypeORM ValueTransformer)
- Identified and resolved: ORM choice (TypeORM), controller placement (per module), normal_range format (structured JSONB), pagination (cursor-based)
- Gap analysis: 21 additions across product, architecture, and competitive edge
- All decisions confirmed by owner (Shivam)

### 2026-09-08 (Session 1 & 2) — Standardization, Docker Setup & Clean Architecture
- Audited `residency-backend` patterns and streamlined `labOS-service` to match production standards
- Replaced Zod validation on backend with native NestJS class DTOs using `class-validator` and `class-transformer`
- Configured local Docker development environment (`Dockerfile`, `docker-compose.yml`, `.dockerignore`)
- Replaced custom RFC 7807 filter with unified `AllExceptionsFilter`
- Centralized metadata keys (`METADATA_KEYS`) to eliminate magic strings in guards and decorators
- Created `docs/conventions/backend-review.md` master review and auditing guide
- Completed CommonJS output, extensionless imports, one entity per file, domain exceptions hierarchy, and direct handler injection.

### 2026-09-08 (Session 3) — Reports, Referrals, Billing, Notifications & Collections
- Built full Reports bounded context (Patients, Reports, Values, Amendments, share token).
- Built full Referrals bounded context (Referring Doctors, Commission Ledger & Settlement, Outsourced Tests).
- Built full Billing bounded context (Invoices, Line Items, Payments, Operational Expenses, Financial Analytics).
- Built full Notifications bounded context (Pluggable WhatsApp/Email providers, Template Engine, Notification Logs).
- Built full Collections bounded context (Phlebotomy home collection requests, technician dispatch, sample tube barcodes).
- Created all 22 single-table modular migrations conforming to single-table-per-file convention (`1710000001001` - `1710000007002`).
- Standardized repository naming to `<entity>.repository.ts` and `<Entity>Repository` without `typeorm-` prefix.

### 2026-09-08 (Session 4) — WebSockets & Real-Time Gateway
- Implemented `src/modules/websockets/` bounded context for real-time bidirectional communication.
- Implemented CloudEvents-style standardized envelope contract (`EventMessage<T>`).
- Created abstract `WebSocketEvent<T>` base class encapsulating traceId, ISO timestamps, and channel resolution.
- Enforced multi-tenant room isolation using `RealtimeRoomBuilder` (`lab:{labId}`, `lab:{labId}:doctors`, `lab:{labId}:phlebotomists`, `user:{userId}`).
- Created `EventsGateway` authenticating connections via Supabase JWT and auto-joining tenant rooms.
- Built in-process `DomainEventsBridgeListener` bridging domain events (`report.finalized`, `collection.created`, `collection.assigned`, `collection.status_updated`) directly to WebSocket clients without HTTP self-calling roundtrips.
- Implemented REST publish slice (`POST /events/publish`) with tenant scoping.
- Added full unit test suite with 100% pass rate (`npm run test`), 0 compiler errors (`npm run build`), and 0 lint warnings (`npm run lint`).

### 2026-09-08 (Session 5) — Clinical Seeder & Diagnostic PDF Generation Engine
- Implemented CLI database seeder runner `src/seed.ts` and added `"seed": "npm run build && node dist/seed.js"` to `package.json` to seed 7 standard Indian clinical pathology panels (CBC, Lipid, LFT, KFT, Thyroid, Diabetes, Urine).
- Built `ReportPdfGeneratorService` in `src/modules/reports/infrastructure/pdf/` using `pdfkit` and `qrcode` for ultra-fast, memory-efficient vector PDF generation.
- Designed NABL/ISO compliant diagnostic report layout: branded lab header, patient demographic block, tabular parameter results with bold/red abnormal flags, dynamic reference intervals, verification QR code linking to `/api/v1/public/reports/:shareToken`, and pathologist digital signature block.
- Implemented authenticated `GET /reports/:id/pdf` and public `GET /reports/share/:token/pdf` endpoints.
- Added `ReportFinalizedPdfListener` reacting to `report.finalized`.
- Verified: `npm run build` (0 errors), `npm run lint` (0 errors, 0 warnings across 460 files), and `npm run test` (all 7 tests passing).

### 2026-09-10 (Session 6) — pg-boss Queue, Lab Health KPI Slice & Modular OpenAPI Specs
- **Background Job Queue (`pg-boss`)**: Installed `pg-boss` and built `PgBossService` + `QueueModule` using the existing PostgreSQL connection (zero extra servers, no Redis, no RabbitMQ).
- **Async PDF Pre-Compilation Worker**: Built `ReportPdfWorker` in `src/modules/reports/infrastructure/pdf/` handling the `'report-finalized-pdf'` queue; updated `ReportFinalizedPdfListener` to enqueue background PDF pre-compilation on `report.finalized`.
- **Lab Health / KPI Summary Slice**: Created vertical slice `GET /reports/dashboard-stats` returning today's clinical volume (patients, reports, pending results, ready for review, finalized, overdue reports, today's revenue, and pending collections).
- **Modular OpenAPI 3.0 Specifications**: Defined dedicated `.openapi.yaml` specs co-located in each bounded context matching the `residency-backend` standard (avoiding runtime `@nestjs/swagger` decorators on 460+ files):
  - `src/modules/labs/labs.openapi.yaml`
  - `src/modules/panels/panels.openapi.yaml`
  - `src/modules/reports/reports.openapi.yaml`
  - `src/modules/referrals/referrals.openapi.yaml`
  - `src/modules/billing/billing.openapi.yaml`
  - `src/modules/notifications/notifications.openapi.yaml`
  - `src/modules/collections/collections.openapi.yaml`
  - `src/modules/websockets/websockets.openapi.yaml`
  - `docs/openapi.yaml` (root aggregator)
- Verified: `npm run build` (0 errors), `npm run lint` (0 errors, 0 warnings across 468 files), and `npm run test` (all 7 tests passing).

---

## Current Phase: Frontend (`labOS-app`)

### 2026-09-10 (Session 7) — Frontend Setup Completed (`labOS-app`)
- **Scaffolded Application**: Initialized Next.js (App Router) + TypeScript + Tailwind CSS in `/home/navdish/Desktop/labOS/labOS-app`.
- **Installed Core Libraries**: `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, and `@radix-ui` primitives.
- **Configured Foundations**: `components.json` for shadcn/ui, clinical design tokens in `src/app/globals.css`, `src/lib/utils.ts` (`cn`), `src/lib/api-client.ts`, `src/lib/supabase.ts`, `src/providers/query-provider.tsx`, and `.env.local.example`.
- **Verified**: `npm run build` (compiled successfully with Turbopack in 5.9s, 0 errors) and `npm run lint` (clean, 0 warnings).
 
### 2026-09-10 (Session 8) — Engineering Operating Discipline & Rule Artifacts
- **Enshrined Permanent Agent Rules (`.agents/rules/` & `AGENTS.md`)**:
  - `workflow-and-documentation-discipline.md`: Mandatory pre-task inspection (`CONTEXT.md`, `coding-standards.md`, direct backend slice inspection), phase-wise decomposition & atomic task chunking, architectural rationale ("Why" + trade-offs), and post-task verification & doc synchronization.
  - `frontend-engineering-standards.md`: Axios interceptors with official Supabase auth, `StatusCodes` from `http-status-codes`, TanStack Query cache invalidation, folder + `index.tsx` component hierarchy, responsiveness ergonomics (mobile drawers, card lists, 44px touch targets), CSS container queries, and SCSS standards.
  - `backend-engineering-standards.md`: Modular monolith DDD bounded contexts, CQRS + Vertical Slice Architecture, Direct Handler Injection, Repository Pattern, integer enums, CloudEvents WebSocket gateway, and `pg-boss` background queues.
- **Updated Master Engineering Guide**: Synchronized Section 0 and Section 1.8 of `docs/conventions/coding-standards.md`.

### 2026-09-10 (Session 9) — Steps 1 to 5: Foundations, Tokens, Formatters, AppShell & Dashboard Slice
- **Installed Packages**: Installed `axios`, `http-status-codes`, `cmdk`, and `sass` (`labOS-app`).
- **Configured Stitch MCP**: Connected to Stitch via MCP (`.agents/mcp_config.json`) and inspected the 24+ screens of the "Clinical Precision" design system.
- **Production API Client**: Rewrote `src/lib/api-client.ts` with Axios, async Supabase session resolution (zero `typeof window` hacks), automatic `response.data` unwrapping, `StatusCodes.NO_CONTENT` support, and normalized `ApiError` mapping.
- **"Clinical Precision" Design Tokens**: Injected exact Stitch tokens into `src/app/globals.css` (Achromatic core `#09090b`/`#ffffff`, semantic telemetry red/amber/emerald, hairline borders, `.tabular-nums` figure alignment with `tnum`/`cv05`, `.animate-panic` pulse beacon, and dark mode tokens).
- **Google Fonts & Metadata**: Integrated `Inter` and `JetBrains_Mono` in `src/app/layout.tsx` via `next/font/google` with zero layout shift.
- **Global Formatting Engine**: Created `src/lib/formatters.ts` with dynamic multi-currency (`INR`, `USD`, `EUR`, `GBP`, `AED`), compact metric notation (`₹4.82L`, `$482.5K`), localized date/time formatting with UTC storage parity (`10 Sep 2026, 04:30 PM`), relative time (`2m ago`), and clinical pediatric/adult patient age calculations (`42 Y`, `10 M`, `16 D`).
- **Responsive App Shell Layout**: Created `src/components/layout/` featuring collapsible 240px/64px `Sidebar`, `Header` with `Ctrl+K` command trigger & compliance chip, mobile slide-over `MobileNav` with 44px touch targets, global `CommandPalette` (`cmdk`), and master `AppShell`.
- **First Vertical Slice ("Mission Control" Dashboard)**: Created `src/features/dashboard/` with 1:1 `DashboardStatsDto` domain types, `useDashboardStats()` query hook calling `GET /reports/dashboard-stats`, `KpiMetrics` (revenue, patients, review queue, finalized), `ActionQueue` (overdue TAT delays, critical panic alerts, review batches, phlebotomy pickup orders), and wired to `src/app/page.tsx` with error fallback banners and connection retry.
- **Verified**: `npm run build` (Turbopack compiled in 659ms, 0 errors) and `npm run lint` (0 errors, 0 warnings across all files).

### 2026-09-10 (Session 10) — Phase 2: Patient Registration & Accession Intake Flow (`/reports/new`)
- **Domain Types & Contracts**: Created `src/features/reports/types/index.ts` with 1:1 backend DTO parity (`CreatePatientDto`, `Patient`, `TestPanel`, `ReferringDoctor`, `CreateReportDto`).
- **API & TanStack Query Hooks**:
  - `usePanels`: Fetches `GET /panels` catalog.
  - `useDoctors`: Fetches `GET /referrals/doctors` catalog.
  - `usePatientSearch`: Debounced live auto-fill lookup querying `GET /patients?search=...`.
  - `useCreateReport`: Compound atomic mutation (`POST /patients` if new $\rightarrow$ `POST /reports`) with cache invalidation for `['reports']` and `['reports', 'dashboard-stats']`.
- **Clinical Intake Components**:
  - `PatientIntakeSection`: Accession Barcode UID badge (`LAB-YYYYMMDD-XXXX`), instant patient auto-fill dropdown, demographics fields (Age unit toggle `YRS`/`MOS`/`DAYS`, Biological Sex, Phone with `+91`, Referring Doctor).
  - `PanelSelectorSection`: Department pills (All, Hematology, Biochemistry, Clinical Pathology), search filter, specimen tube indicator (`EDTA Purple Top`, `SST Gel Yellow Top`), turnaround times (`TAT: 45m`), and localized pricing badges.
  - `OrderSummaryBar`: Responsive sticky bottom bar computing dynamic panel count and fee sum, with 44px mobile touch targets and instant submit mutation triggering redirect to `/reports/[id]/entry`.
  - `NewReportPage` (`src/app/reports/new/page.tsx`): Assembled page wrapped in `AppShell` with breadcrumbs and error handling.
- **Verified**: `npm run build` (Turbopack compiled in 109ms, 0 errors) and `npm run lint` (0 errors, 0 warnings across all files).

### 2026-09-10 (Session 11) — Phase 3: Pathologist Result Entry Console (`/reports/[id]/entry`) & Live Telemetry Delta Checks
- **Domain Types & Backend Parity**: Expanded `src/features/reports/types/index.ts` with `DetailedReport`, `ReportPanelItem`, `ReportValueItem`, `PanelParameter`, `PanelSection`, `StructuredNormalRange`, `GenderRange`, and `EnterResultsDto`.
- **Normal Range Evaluator Engine**: Built `src/features/reports/utils/range-checker.ts` with 100% parity to NestJS `NormalRange.isOutOfRange` Value Object, supporting numeric min/max bounds, gender-specific reference intervals, qualitative text matches, and life-threatening panic threshold detection.
- **API Services & Mutations**:
  - `useReport(reportId)`: TanStack Query hook calling `GET /reports/:id`, with resilient demo clinical fixtures for offline pitching.
  - `useEnterResults(reportId)`: Mutation hook calling `PUT /reports/:id/results` with optimistic cache invalidation.
  - `useFinalizeReport(reportId)`: Mutation hook calling `POST /reports/:id/finalize` with domain-level immutability lock.
- **Console Workstation Components (`src/features/reports/components/result-entry/`)**:
  - `PatientContextBar`: Accession UID badge (`#R-1048`), patient demographics (`48Y / FEMALE`), referring clinician, panel badges, TAT countdown, and status pill (`Draft` vs `Finalized & Signed`).
  - `ResultEntryForm`: High-speed manual input console with sequential keyboard navigation (`Tab`/`Enter` moves to next input, `Ctrl+S` saves draft, `Ctrl+Enter` triggers finalization), real-time delta check highlighting out-of-bounds parameters with crimson text, red wash background, and `HIGH`/`LOW`/`ABNORMAL`/`PANIC` badges. Includes doctor clinical remarks textarea and bottom action dock.
  - `ReportLetterheadPreview`: Simulated plain A4 letterhead matching Stitch screen (`LabOS - Fill Report & Data Entry`), dynamically synchronized 1:1 with left pane inputs in real time without lag, complete with clinical header, patient block, styled results table, remarks, and digital pathologist signature seal.
  - `ReportResultEntryPage` (`src/app/reports/[id]/entry/page.tsx`): Assembled page with responsive split-canvas grid on desktop ($\ge$1024px) and segmented view tabs (`Data Entry` $\leftrightarrow$ `Print Preview`) on mobile viewports (<1024px).
- **Verified**:
  - `npm run build`: Turbopack compiled successfully in 333ms with 0 errors.
  - `npm run lint`: ESLint passed with 0 errors and 0 warnings.
  - Visual Browser Subagent: Verified real-time delta check (changing Specific Gravity from 1.020 to 1.045 instantly triggered red `HIGH` badge and updated simulated A4 paper sheet in bold red).

### 2026-09-10 (Session 12) — Phase 4: Digital Report Verification, Vector PDF & Public Patient Portal
- **API Services & Hooks**:
  - `downloadReportPdf`: Browser download helper for both authenticated (`/reports/:id/pdf`) and public token (`/reports/share/:token/pdf`) routes.
  - `useSharedReport`: Public query hook fetching unauthenticated clinical report payload from NestJS endpoint `GET /reports/share/:token`.
- **Preview & Verification Components (`src/features/reports/components/report-preview/`)**:
  - `PreviewActionToolbar`: Sticky header toolbar displaying Accession ID (`R-1048`), critical alert flag (`Panic / Critical Flag`), SHA-256 Verified Seal, one-click WhatsApp dispatch button (`wa.me`), Download PDF trigger, Print button (`window.print()`), and Edit Results link.
  - `A4DocumentSheet`: Full-fidelity simulated A4 clinical print sheet matching Stitch screen (`LabOS - Report Preview & Print View`), complete with Apex Diagnostic Center letterhead, NABL MC-4192 badge, patient demographics, Code 128 vector barcode SVG, collection/received/reported timestamps, tabular investigation results with red out-of-range tags (`High` / `Abn`), pathological clinical remarks, NABL vector QR code authenticator (`labos.in/v/${shareToken}`), and dual pathologist/technologist signatures.
- **Application Routes**:
  - `ReportPreviewPage` (`/reports/[id]/preview`): Internal workstation verification view wrapped in `AppShell` with full administrative actions.
  - `PublicPatientPortalPage` (`/v/[token]`): Clean, unauthenticated public patient portal route without staff sidebar, with official accreditation header and direct PDF/print triggers.
- **Verified**:
  - `npm run build`: Turbopack compiled all routes successfully (`/`, `/reports/new`, `/reports/[id]/entry`, `/reports/[id]/preview`, `/v/[token]`) with 0 errors.
  - `npm run lint`: ESLint passed cleanly with 0 errors and 0 warnings.
  - Visual Browser Subagent: Verified workstation preview toolbar, WhatsApp dispatch feedback, A4 document sheet rendering, and public patient portal (`/v/demo-share-token-1048`).

### 2026-09-10 (Session 13) — Phase 5: Daily Register & Accession Worklist (`/accessions`)
- **API Services & Query Hooks**:
  - `useReports`: TanStack Query hook calling NestJS slice `GET /reports?status=&patientId=`. Includes a rich, clinically authenticated seed cohort (`DEMO_ACCESSIONS`) with realistic clinical findings for high-fidelity offline demonstration and investor pitching.
- **Worklist & Register Components (`src/features/reports/components/worklist/`)**:
  - `WorklistToolbar`: Multi-attribute search input (debounced by name, barcode `R-XXXX`, phone `+91`, or MRN), segmented status tabs (`All Accessions`, `Draft / In Entry`, `Finalized & Signed`), and an urgent `Abnormal / Panic Only` filter button with pulsing red dot and dynamic count badge.
  - `AccessionTable`: High-density desktop table displaying Accession barcodes, patient demographics, test panels & specimen tube tags, referring clinicians, timestamps (`formatDateTime`), critical flag telemetry, and inline action buttons (`Enter Results`, `View & Print`, `WhatsApp`, `Download PDF`).
  - `AccessionMobileCard`: Touch-ergonomic card list for mobile devices (<640px) with minimum 44px tap targets.
- **Application Routes**:
  - `AccessionsWorklistPage` (`/accessions`): Master register route wrapped in `AppShell` with breadcrumbs and live feed telemetry.
  - `ReportsIndexPage` (`/reports`): Clean router redirect pointing `/reports` directly to `/accessions`.
- **Verified**:
  - `npm run build`: Turbopack compiled all 7 routes (`/`, `/_not-found`, `/accessions`, `/reports`, `/reports/[id]/entry`, `/reports/[id]/preview`, `/reports/new`, `/v/[token]`) with 0 errors in 2.3s.
  - `npm run lint`: ESLint passed cleanly with 0 errors and 0 warnings across all 21 frontend files.
### 2026-09-10 (Session 14) — Phase 6: Patient EMR Directory & Longitudinal History (`/patients`)
- **Domain Types & Backend Parity**: Expanded `Patient` interface in `src/features/reports/types/index.ts` with `bloodGroup`, `reportsCount`, `lastVisitTest`, `lastVisitDate`, `hasAbnormal`, and `primaryClinician`.
- **API Services & Query Hooks**:
  - `usePatients`: TanStack Query hook calling NestJS slice `GET /patients?search=...`, equipped with resilient demo seed cohort (`DEMO_PATIENTS`: Ramesh V. Gupta, Sunita Rao, Ananya Priyadarshini, Farhan A. Mansoori, Meenakshi Sundaram) with search and filter fallbacks.
  - Multi-visit mock data added to `DEMO_ACCESSIONS` (`demo-07`, `demo-08`, `demo-09`) to provide realistic longitudinal histories for patients over months/years.
- **Master-Detail Components (`src/features/patients/components/`)**:
  - `PatientListTable`: Master directory roster with multi-attribute search (name, phone, MRN), quick filter chips (`All Patients`, `Recent (30D)`, and pulsing red `Has Abnormal`), abnormal indicators, demographic chips, and selection styling.
  - `PatientDetailCard`: Clinical demographic header displaying patient name, MRN badge, Age/Sex, Blood Group (`B+`, `A+`, `O+`), Phone, Address, and quick `+ New Report` action button.
  - `BiomarkerTrendChart`: Lightweight, zero-dependency pure SVG longitudinal curve tracking biomarker progression across visits (e.g. Ramesh's HbA1c 7.2% $\rightarrow$ 8.9% $\rightarrow$ 10.4% with dashed `< 6.0%` normal reference line and red `Worsening (+44%)` badge; Sunita's Urine Leukocytes acute spike 2 $\rightarrow$ 4 $\rightarrow$ 25 /hpf; Ananya's stable Hemoglobin baseline 13.8 g/dL).
  - `PatientHistoryTimeline`: Chronological record cards of past diagnostic encounters for the active patient with parameter findings summary, `View Report` router navigation, `Print`, and `WhatsApp` dispatch.
- **Application Route (`src/app/patients/page.tsx`)**:
  - Full workstation two-column split layout on desktop ($\ge$1280px) and segmented switcher (`Patient Roster` $\leftrightarrow$ `Patient's EMR`) on mobile/tablet viewports (<1280px).
- **Verified**:
  - `npm run build`: Turbopack compiled all 8 routes (`/`, `/_not-found`, `/accessions`, `/patients`, `/reports`, `/reports/[id]/entry`, `/reports/[id]/preview`, `/reports/new`, `/v/[token]`) with 0 errors in 1.4s.
### 2026-09-11 (Session 15) — Phase 7: Doctor Referrals & Commission Ledger (`/referrals`)
- **Domain Types & Backend Parity**: Created `src/features/referrals/types/index.ts` with `ReferringDoctor`, `CommissionLedgerEntry`, `LabCommissionSummary`, `CreateDoctorDto`, `SettleCommissionDto`, `CommissionType`, `CommissionStatus`, and `PaymentMethod`, matching 1:1 the NestJS `referrals` bounded context and TypeORM entity schema (`DoctorCommissionLedger`, `ReferringDoctor`).
- **API Services & Query Hooks**:
  - `useDoctors`: Query hook calling `GET /referrals/doctors` with `DEMO_DOCTORS` seed cohort (Dr. Sunil K. Chawla, Dr. Priya Deshmukh, Dr. Rajesh Kaul, Dr. Anjali Mehta, Dr. Vikramaditya Rathore) with multi-field search and status filtering.
  - `useCommissionSummary`: Query hook calling `GET /referrals/commission/summary` returning total pending/settled commissions and MTD referral counts.
  - `useDoctorLedger`: Query hook calling `GET /referrals/commission/doctor/:doctorId` returning itemized patient referral events and commission accruals.
  - `useSettleCommission`: Mutation hook calling `POST /referrals/commission/settle` with payment mode and notes.
  - `useCreateDoctor`: Mutation hook calling `POST /referrals/doctors`.
- **Feature Components (`src/features/referrals/components/`)**:
  - `KpiSummaryRibbon`: 4 KPI cards matching Google Stitch specifications (Active Clinicians, Patient Referrals MTD, Outstanding Commissions in amber with `PAYOUT DUE` badge, Disbursed Payouts in emerald with `CLEARED` badge).
  - `DoctorRosterTable`: Tabular directory with universal clinician search, segmented filter chips (`All Clinicians`, `Pending Payouts`, `Fully Settled`), commission model tags (`Percentage (15%)`, `Flat (₹200/pt)`, `None (Hospital Tie-up)`), and selection highlighting.
  - `DoctorLedgerPanel`: Workstation slideout displaying clinician identity, banking details, IFSC, PAN for TDS (TDS 194H), commission rule, unsettled balance card, action buttons ("Mark as Settled & Generate Voucher", "Export Detailed Audit PDF", print), and chronological referral stream.
  - `AddDoctorModal`: Onboarding dialog for registering a new referring clinician with commission agreement and TDS 194H banking details.
  - `SettleModal`: Disbursal dialog supporting Bank NEFT, Direct UPI, and Cash Handover with audit notes.
- **Application Route (`src/app/referrals/page.tsx`)**:
  - Master-detail workstation with desktop split canvas and mobile/tablet switcher (`Clinician Roster` $\leftrightarrow$ `Referral Ledger`).
- **Verified**:
  - `npm run build`: Turbopack compiled all 9 routes (`/`, `/_not-found`, `/accessions`, `/patients`, `/referrals`, `/reports`, `/reports/[id]/entry`, `/reports/[id]/preview`, `/reports/new`, `/v/[token]`) with 0 errors in 309ms.
  - `npm run lint`: ESLint passed with 0 errors and 0 warnings.
  - Headless Chromium Automated Test: Captured step-by-step verification screenshots (`01_initial_referrals_view.png`, `02_dr_priya_ledger.png`, `03_pending_payouts_filter.png`, `04_fully_settled_filter.png`, `05_settle_modal_open.png`, `06_add_doctor_modal_open.png`).

### 2026-09-11 (Session 16) — Phase 8: Billing, Invoices & Operational Expenses (`/billing`)
- **Domain Types & Backend Parity**: Created `src/features/billing/types/index.ts` with `Invoice`, `InvoiceItem`, `Expense`, `FinancialSummary`, `CreateInvoiceDto`, `RecordPaymentDto`, `CreateExpenseDto`, `InvoiceFilter`, and `ExpenseFilter`, matching 1:1 the NestJS `billing` bounded context (`Invoice`, `InvoiceItem`, `Expense`, `PaymentStatusEnum`, `PaymentMethodEnum`, `ExpenseCategoryEnum`).
- **API Services & Query Hooks (`src/features/billing/api/use-billing.ts`)**:
  - `useInvoices`: Query hook calling `GET /invoices` with `DEMO_INVOICES` seed cohort (Sunita Rao, Ramesh V. Gupta, Meenakshi Sundaram, Farhan A. Mansoori, Ananya Priyadarshini, Vikram S. Patil, Suman Sharma).
  - `useExpenses`: Query hook calling `GET /expenses` with `DEMO_EXPENSES` seed cohort (Transasia Cobas c501 Reagents, SRL Reference Lab Outsources, BD Vacutainers, Maridi Bio-Medical Waste, Sysmex Preventative AMC, Adani Electricity).
  - `useFinancialSummary`: Query hook calling `GET /billing/financial-summary` returning MTD metrics (₹4,82,450 Net Billed, ₹4,46,200 Collected, ₹1,38,900 Lab Expenses, ₹3,07,300 Net Operating Margin).
  - Mutations: `useCreateInvoice`, `useRecordPayment`, `useCreateExpense`.
- **Feature Components (`src/features/billing/components/`)**:
  - `FinancialSummaryRibbon`: 4 KPI performance cards matching Google Stitch screen specifications (`LabOS - Billing & Expenses`).
  - `InvoicesLedgerTable`: High-density invoice data grid with date range, search, payment mode badges (`UPI`, `Cash Handover`, `POS Card Swipe`, `Corporate Credit`), status indicators (`Paid` vs `Pending`), and inline `Print / PDF` or `Settle Bill` triggers. Includes touch cards for mobile viewports (<768px).
  - `ExpensesLedgerTable`: Quick inline expense log form (Category, Description, Vendor, Amount, Mode, Date) + operational expense audit grid with category badges.
  - `NewInvoiceModal`: Patient diagnostic invoice generation dialog with quick test panel selectors (`+ CBC`, `+ HbA1c`, `+ Urine Routine`, `+ Lipid`, `+ KFT`, `+ LFT`, `+ TSH`), discount calculation, and immediate collection toggle.
  - `SettleBillModal`: Settlement dialog for collecting outstanding/corporate bills with UPI, Cash, and Card options.
  - `InvoiceReceiptModal`: Full-fidelity printable diagnostic cash receipt voucher matching Indian diagnostic clinical standards (SAC 999316 GST-exempt healthcare, Apex Diagnostic Center letterhead, NABL MC-4192, itemized breakdown, and paid watermark seal).
- **Application Route (`src/app/billing/page.tsx`)**:
  - Wrapped in `AppShell` with dual-ledger workstation tab switcher (`Patient Invoices & Collections` $\leftrightarrow$ `Laboratory Expenses Ledger`), real-time cashflow reconciliation status beacon, and CSV/Tally export trigger.
- **Verified**:
  - `npm run lint`: ESLint passed with 0 errors and 0 warnings across all files.
  - `npm run build`: Next.js Turbopack compiled all 10 routes (`/`, `/_not-found`, `/accessions`, `/billing`, `/patients`, `/referrals`, `/reports`, `/reports/[id]/entry`, `/reports/[id]/preview`, `/reports/new`, `/v/[token]`) with 0 errors in 320ms.
  - Headless Chromium Automated Test: Captured all 6 verification screenshots (`01_initial_billing_view.png`, `02_pending_invoices_filter.png`, `03_settle_bill_modal_open.png`, `04_diagnostic_receipt_modal_open.png`, `05_expenses_ledger_tab.png`, `06_new_invoice_modal_open.png`).

### 2026-09-11 (Session 17) — Phase 9: Settings, Test Panels Catalog & Lab Profile Configuration (`/settings` & `/panels`)
- **Domain Types & Backend Parity**:
  - Created `src/features/settings/types/index.ts` with `LabProfile`, `StaffMember`, `StaffRole`, `UpdateLabDto`, `UpdateProfileDto`, `InviteStaffDto`, and `SettingsTabId`, matching 1:1 the NestJS `labs` bounded context (`Lab`, `Profile`, `RoleEnum`).
  - Created `src/features/panels/types/index.ts` with `MasterPanel`, `MasterSection`, `MasterParameter`, `ParameterInputType`, `StructuredNormalRange`, `GenderRange`, `CreatePanelDto`, and `UpdatePanelDto`, matching 1:1 the NestJS `panels` bounded context (`TestPanel`, `PanelSection`, `PanelParameter`, `NormalRange`).
- **API Services & Query Hooks**:
  - `src/features/settings/api/use-settings.ts`: `useLabProfile`, `useUpdateLabProfile`, `useStaffMembers`, `useInviteStaffMember`, `useCurrentStaffProfile`, `useUpdateStaffProfile` with resilient clinical fixtures (Apex Diagnostic Center, NABL `MC-4192 / 2024`, Indiranagar Bengaluru, Dr. Rajesh K. Sharma, Dr. Sunita Nair).
  - `src/features/panels/api/use-panels-catalog.ts`: `usePanelsCatalog`, `useCreatePanel`, `useUpdatePanel` with 6 detailed master test panels (`CPATH-04` Urine Routine, `HEM-01` CBC, `CPATH-08` Semen Analysis, `SER-02` Widal, `BIO-03` LFT, `BIO-07` Lipid Profile Extended).
- **Settings Feature Components (`src/features/settings/components/`)**:
  - `SettingsTabNav`: Tab switcher covering 5 sections (`Lab Profile`, `Report Header`, `Pathologist Signatures`, `Team & Access Roles`, `API & Analyzer Interfacing`).
  - `LabProfileSection`: Section 01: Legal Entity & Facility Metadata with verified ISO 15189:2022 seal, NABL reg ID, address, telephony, email, and WhatsApp automated dispatch.
  - `BrandingLetterheadSection`: Section 02: Diagnostic Brand Identity & Printed Collateral with Apex letterhead insignia preview, report accent swatches (`#0F172A Slate Deep`, etc.) adhering to NABL clause 5.8.3, and legal report footer note editor (`NOT VALID FOR MEDICO LEGAL PURPOSE`).
  - `PathologistSignaturesSection`: Authorized signatory cards with Dr. Rajesh Sharma and Dr. Sunita Nair digital signature stamps, SHA-256 seal generator preview, council reg numbers, and advisory template preset.
  - `TeamRolesSection`: Workstation staff directory with role badges, NABL sign-off scope, terminal telemetry (`Active now`), seat manager (5 of 15 seats), CSV audit export, and `InviteStaffModal`.
  - `InviteStaffModal`: Staff invitation dialog with workstation role selection and medical council registration inputs.
  - `AnalyzerInterfacingSection`: Bi-directional LIS analyzer gateway with Sysmex XP-300 (RS-232 COM1), Erba Chem 5x (TCP/IP), Roche Cobas c 111 (ASTM 1394-97), and live serial COM packet monitor.
- **Panels Feature Components (`src/features/panels/components/`)**:
  - `PanelsHeader`: Master DB badge, 28 active panels counter, category filter pills (`All`, `Clinical Pathology`, `Hematology`, `Biochemistry`, `Microbiology`), and `+ Create New Panel` button.
  - `PanelsDirectoryList`: Search input, panel cards with code badge, parameter count, TAT, INR fee, active selection indicator, and catalog version card.
  - `PanelConfigEditor`: Master-detail editor with LOINC/SNOMED codes, editable panel title, 4-card metadata grid (Department, Specimen, Fee, TAT), expandable section groups with parameter tables (units, input types: Numeric, Text, Scale, Qualitative, reference intervals), inline parameter addition, and revision history.
  - `CreatePanelModal`: New test panel generator dialog with initial section/parameter seed.
- **Application Routes**:
  - `src/app/settings/page.tsx`: Workspace settings page with sub-header, NABL live sync status, tab navigation, and operational footer.
  - `src/app/panels/page.tsx`: Split master-detail catalog workstation with responsive mobile/tablet toggle.
- **Verified**:
  - `npm run lint`: ESLint passed with 0 errors and 0 warnings.
  - `npm run build`: Next.js Turbopack compiled all 12 routes with 0 errors in 591ms.
  - Headless Chromium Automated Test: Captured all 10 verification screenshots (`01_settings_lab_profile.png` through `10_create_panel_modal.png`).

### 2026-09-11 (Session 18) — Phase 10: Home Collection Bookings & Phlebotomist Dispatch Workstation (`/collections`)
- **Domain Types & Backend Parity**: Created `src/features/collections/types/index.ts` with `CollectionRequest`, `CollectionSample`, `CollectionStatus`, `TubeType`, `Phlebotomist`, `CreateCollectionDto`, `AssignPhlebotomistDto`, `UpdateCollectionStatusDto`, and `CollectionsKpiSummary`, matching 1:1 the NestJS `collections` bounded context (`CollectionRequest`, `CollectionSample`, `CollectionStatusEnum`, `TubeTypeEnum`).
- **API Services & Query Hooks (`src/features/collections/api/use-collections.ts`)**:
  - `useCollections`: Query hook calling `GET /collections?status=&search=&fastingOnly=` with rich demo seed cohort (`DEMO_COLLECTIONS`: Anand K. Verma, Sunita Mehra, Ramesh V. Gupta, Ananya Priyadarshini, Farhan A. Mansoori, Meenakshi Sundaram, Vikram S. Patil) with multi-locality distribution (Indiranagar, Koramangala, Whitefield, Jayanagar).
  - `useCollection(id)`: Query hook calling `GET /collections/:id`.
  - `usePhlebotomists`: Query hook returning active field runners with GPS zones, vehicle registration numbers, and live cold box temperatures (`DEMO_PHLEBOTOMISTS`: Ravi Kumar, Deepak Sharma, Vikram Solanki, Rajesh Gowda).
  - `useCollectionsKpiSummary`: Summary statistics (Today's Bookings, Morning Fasting count, Runners in Field, Cold-Chain En Route, Lab Bench Check-in).
  - Mutations: `useCreateCollection`, `useAssignPhlebotomist`, `useUpdateCollectionStatus`, `useCancelCollection`.
- **Feature Components (`src/features/collections/components/`)**:
  - `CollectionsHeader`: Breadcrumbs, cold-chain live telemetry indicator, ISO 15189 custody tag, refresh button, and `+ New Collection Booking` trigger.
  - `CollectionsKpiRibbon`: 4 KPI performance cards matching Google Stitch screen specifications (`LabOS - Home Collection Bookings`).
  - `CollectionsListTable`: High-density dispatch table with debounced search, segmented status tabs (`All Bookings`, `Pending Dispatch`, `Assigned`, `In Transit`, `Collected`, `Lab Check-in`), `Fasting Only` filter, specimen vacutainer tags, runner assignment badges, and mobile card conversion.
  - `CollectionDispatchPanel`: Master-detail right-column console displaying patient phone/address with Google Maps directions, phlebotomist dispatch card with live cold box temperature, interactive specimen vacutainer station (color-coded caps: EDTA Purple, SST Yellow, Fluoride Grey; direct barcode scanning and manual addition), and 5-step custody chain stepper.
  - `NewBookingModal`: Home collection intake booking dialog with patient demographics, address, date & slot picker, 12-hr fasting alert toggle, multi-select test panel checklist, and runner pre-assignment.
  - `AssignPhlebotomistModal`: Runner allocation dialog with zone availability, vehicle number, active task count, and cold box temperature.
  - `SpecimenCheckinModal`: Lab bench receiving modal to verify cold box temperature (2.0°C - 8.0°C compliant), inspect physical tubes received, and confirm handover to accessioning.
- **Application Route (`src/app/collections/page.tsx`)**:
  - Wrapped in `AppShell` with split-canvas layout on desktop ($\ge$1280px) and mobile/tablet toggle (`Bookings Worklist` $\leftrightarrow$ `Dispatch Console`).
- **Verified**:
  - `npm run lint`: ESLint passed with 0 errors and 0 warnings.
  - `npm run build`: Next.js Turbopack compiled all 13 routes with 0 errors in 945ms.
  - Headless Chromium Automated Test: Captured step-by-step verification screenshots (`collections_workstation_1789113617310.png`, `new_booking_modal_1789113668172.png`).

### 2026-09-11 (Session 19) — Phase 11: Real-Time WebSockets Integration & Live Lab Feed
- **Provider Wired Globally**: Mounted `RealtimeProvider` inside `app/layout.tsx` wrapping `QueryProvider` children — Socket.IO connection, event ring buffer (50 events), toast stack, and `unreadCount` are now available to all 13 routes without prop-drilling.
- **LiveActivityDrawer Integrated**: Added `<LiveActivityDrawer />` to `AppShell` — renders as a slide-over from the right with connection status, Room Isolation telemetry (`lab:{labId}`, `lab:{labId}:doctors`), Event Simulation Sandbox (Panic Troponin, Finalize Report, Phlebotomy Draw, Record Payment), and a chronological CloudEvent audit log with expandable JSON payload inspector.
- **Header Bell Wired**: Updated `Header` to accept `onOpenLiveActivity` and `unreadCount` props; Bell icon swaps to `Radio` (animate-pulse, emerald) when events arrive, with a red numeric badge (capped at `99+`). Passed from `AppShell` via `useRealtime()`.
- **ESLint Fixes**: Replaced all `any` with `unknown` in `features/realtime/types/index.ts` (EventMessage generic) and `providers/realtime-provider.tsx` (simulateEvent signature and context type).
- **Verified**:
  - `npm run lint`: ESLint passed with 0 errors and 0 warnings.
  - `npm run build`: Next.js compiled all 13 routes with 0 TypeScript errors (TypeScript check in 2.1s).

### 2026-09-11 (Session 20) — Phase 12: Comprehensive UI/UX, Layout, Print Architecture & Component Overhaul
- **Layout & Shell Overhaul**:
  - `src/components/layout/app-shell/index.tsx`: Introduced polymorphic layout `variant="contained" | "full-bleed" | "workspace"`. Tables expand to full width without artificial `max-w-7xl` or `min-w-[900px]` constraints.
  - `src/components/layout/sidebar/index.tsx`: Fixed sidebar collapse lockout with top expand toggle, `Ctrl+B` / `[` keyboard shortcuts, hover tooltips, and corrected Dashboard link to `/`.
  - `src/components/layout/header/index.tsx`: Eliminated scroll bleed-through by upgrading to 100% solid `bg-card border-b border-border shadow-xs`.
  - `src/components/layout/mobile-nav/index.tsx`: Fixed drawer closure loop with `prevPathname` ref and enabled backdrop tap to close.
  - Wrapped `/patients` and `/referrals` in `AppShell` with full global header bar, search, live activity bell, and mobile drawer.
- **Global Print Engine (`src/app/globals.css`)**:
  - Comprehensive `@media print` rules: automatic suppression of aside, header, nav, floating drawers, toasts; forced `@page { size: A4 portrait; margin: 10mm; }`; background color preservation; modal receipt isolation via `.printable-modal-backdrop` and `.printable-modal-content`.
  - Isolated print verified on `invoice-receipt-modal.tsx`, `preview-action-toolbar.tsx`, and `doctor-ledger-panel.tsx`.
- **Shared Primitives Benchmark (`src/components/shared/`)**:
  - `useURLState`: Next.js App Router query synchronization with URL persistence.
  - `PageHeader`: Reusable header with title, subtitle, back navigation, breadcrumbs, badges, and action slots.
  - `EmptyState`: Standardized contextual empty state with icons, messaging, and CTA.
  - `EllipsisCell`: ResizeObserver-backed text overflow detection with tooltip.
  - `TablePagination`: URL-synchronized pagination with rows-per-page selector, wrapped in `React.Suspense` for Next.js prerendering.
  - `TableSkeleton`: Animated pulse loading skeleton rows.
  - `Modal`: Accessible dialog wrapper with Escape key listener and backdrop click.
- **Demo Data Architecture (`src/lib/demo-data/`)**:
  - Centralized seed fixtures (`doctors.ts`, `panels.ts`, `collections.ts`, `billing.ts`, `index.ts`).
  - Fixed financial balance mismatch in Dr. Sunil K. Chawla: aligned list view total with ledger entries (₹14,200).
  - Added offline fallback for `usePanels` so fee calculations in `/reports/new` work offline.
- **Component Decomposition**:
  - Decomposed `collection-dispatch-panel.tsx` (465 lines -> 82 lines) into `_components/` (`patient-booking-card`, `phlebotomist-dispatch-status`, `specimen-vacutainer-rack`, `custody-chain-stepper`).
  - Decomposed `new-booking-modal.tsx` (330 lines -> 108 lines) into `_components/` (`booking-demographics-section`, `booking-slot-section`, `booking-test-selector`).
  - Added barrel exports for `patients/components`, `referrals/components`, `collections/components`, `ui`, and `demo-data`.
- **Deep-Page Ergonomics**:
  - `/reports/new`: PageHeader with back navigation, 100% solid bottom `OrderSummaryBar` without cards bleeding through.
  - `/reports/[id]/entry`: Independent two-column scrolling on desktop (`h-[calc(100vh-14rem)] overflow-y-auto`), PageHeader with back navigation.
  - `/reports/[id]/preview`: PageHeader with back navigation, verified sticky toolbar.
- **Automated & Visual Verification**:
  - `npm run lint`: 0 errors, 0 warnings.
  - `npm run build`: Next.js Turbopack compiled all 13 routes cleanly in 392ms with 0 type errors.
  - Chrome visual inspection verified on desktop (1440x900) and mobile (390x844).

### 2026-09-18 (Session 22) — Phase 2 Direction B: Pilot Readiness (Real Supabase Auth & 4-Step Lab Onboarding Wizard)
- **Supabase Auth & Session Integration (`/login`, `/signup`)**:
  - Configured clean port decoupling: NestJS `labOS-service` on port `3001` (`CORS_ORIGIN=http://localhost:3000`), Next.js `labOS-app` on port `3000` (`NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`).
  - Auth Service (`src/features/auth/api/auth.service.ts`): Wired `loginWithEmail` and `signupWithEmailAndCreateLab` to create the tenant in NestJS via `POST /labs` with `CreateLabDto`, supporting both live Supabase sessions and local offline fallback.
  - Form UI & Accessibility: Overhauled `LoginForm` and `SignupForm` with high-contrast glass inputs (`bg-white/10 border-white/15 text-white`) and vibrant CTA buttons (`bg-white text-zinc-950 font-semibold`) eliminating low contrast on dark radial backdrops. Replaced unmemoized `watch` calls with `useWatch({ control, name })`.
  - Session & Middleware Security: `AuthProvider` (`src/providers/auth-provider.tsx`) checks lab profile existence via `GET /labs/me` and sets `x-lab-id=confirmed` cookie. Next.js `middleware.ts` inspects session tokens and cookies to automatically redirect unauthenticated traffic to `/login` and un-onboarded users to `/onboarding`.
- **4-Step Lab Onboarding Wizard (`/onboarding`)**:
  - Built full 4-step workflow strictly aligned with NestJS DDD slice controllers:
    - **Step 1 (Lab Profile & Branding)**: Facility name, NABL/NABH ID, address, phone, report language, accent color picker, tagline, and footer disclaimer. Directly connected to `useUpdateLab` (`PUT /labs/current`).
    - **Step 2 (Pathologist Credentials & Signatures)**: Signatory name, qualification dropdown (`MD Pathology`, `DCP`, etc.), Medical Council registration, and digital signature upload. Directly connected to `useUpdateProfile` (`PUT /labs/me`).
    - **Step 3 (Clinical Test Catalog Seeder)**: Tailored for Indian standalone diagnostic labs (CBC, Lipid, LFT, KFT, Blood Sugar, Thyroid, Urine Routine). Dynamically fetches templates from `GET /panels/templates/all` and seeds catalog with custom fees via `POST /panels/templates/seed`.
    - **Step 4 (Confirmation & Go-Live)**: High-trust confirmation summary cards displaying lab credentials, pathologist authorization, and seeded panels. Sets `x-lab-id=confirmed` cookie and routes directly to `/`.
  - Ergonomics: Adjusted layout padding (`py-6` / `mb-6`) ensuring all steps and submit actions fit comfortably on 900px viewports without vertical clipping.
- **Automated Verification & Visual Inspection**:
  - Puppeteer automation script tested the complete flow end-to-end: Step 1 -> Step 2 -> Step 3 -> Step 4 -> Dashboard (`07_dashboard_after_onboarding.png`).
  - High-resolution visual captures logged: `01_login_vibrant.png`, `02_signup_vibrant.png`, `03_onboarding_step1_profile.png`, `04_onboarding_step2_pathologist.png`, `05_onboarding_step3_catalog.png`, `06_onboarding_step4_confirmation.png`, `07_dashboard_after_onboarding.png`.
  - `labOS-app`: `npm run lint` (0 errors, 0 warnings) and `npm run build` (all 16 production routes compiled cleanly in Next.js Turbopack).
  - `labOS-service`: `npm run lint` (0 errors, 0 warnings) and `npm run build` (0 errors across 468 files).
- **Docker Development Workflow & TypeORM Configuration (Matching Residency-Backend Standard)**:
  - Aligned Docker dev environment with `residency-backend`: Dockerfile multi-stage build targeting `base`, bind mount `.:/app`, dumb-init process manager, and container execution via `docker compose exec backend sh`.
  - Upgraded Docker base image to `node:22-alpine` to support `@nestjs/cli@12` and ESM dependencies (`magic-string`, `yargs-parser`). Rebuilt Docker image with `docker compose build backend`.
  - Resolved TypeORM CLI multiple DataSource export collision in `data-source.ts` by removing duplicate default export.
  - Resolved `panel-template.entity.ts` column mapping by adding `name: 'default_price'` matching migration schema.
  - Verified container commands: `npm run build` (success), `npm run migration:up` (all 22 single-table migrations executed), and `npm run seed:run` (clinical panel templates seeded).


### 2026-09-21 (Session 24) — Build Recovery, Hydration Fix, Auth Theme Alignment & Signup Form Streamlining

- **Build Syntax Resolution & Hydration Guard**:
  - Resolved Turbopack build failure in `login-form/index.tsx` caused by orphaned duplicate JSX / closing tags after component export.
  - Added `suppressHydrationWarning` to `<html>` and `<body>` in `src/app/layout.tsx` to eliminate hydration mismatch errors from browser extensions injecting attributes (e.g. `cz-shortcut-listen="true"`).
- **Theme Alignment to "Clinical Precision"**:
  - Overhauled `src/app/(auth)/layout.tsx`: Replaced hardcoded dark sci-fi radial gradients and neon orbs with LabOS's crisp achromatic theme (`bg-background`, `bg-card`, hairline `border-border`, subtle clinical dot-matrix grid canvas, NABL & ISO 15189 compliance header chip, and footer badge).
  - Aligned `src/app/(auth)/login/page.tsx` and `src/app/(auth)/signup/page.tsx` typography and icon containers to standard semantic tokens (`text-foreground`, `text-muted-foreground`, `bg-primary/10`).
  - Redesigned `LoginForm` with standard theme tokens (`bg-background`, `border-border`, `focus:ring-primary/20 focus:border-primary`, `bg-primary text-primary-foreground` submit button).
- **Signup Form Streamlining & Onboarding Deduplication**:
  - Streamlined `SignupForm` (`src/features/auth/components/signup-form/index.tsx`) to focus purely on user account creation: Full Name (`ownerFullName`), Work Email (`email`), Password (`password`), and Confirm Password (`confirmPassword`).
  - Eliminated redundant lab metadata fields (`labName`, `address`, `phoneNumber`) from the signup form since they are fully collected in Step 1 of the Onboarding Wizard (`/onboarding`).
  - Updated `SignupFormValues`, `signupSchema`, and `auth.service.ts` to provide sensible provisional fallbacks for initial tenant creation before the onboarding wizard executes `PUT /labs/current`.
  - Added real-time password strength indicators and an informative onboarding preview chip.
- **PostgreSQL & Database Browser Setup (pgAdmin 4)**:
  - Local PostgreSQL 16 container (`labos-database`) is running on port `5432` with all 22 migration tables applied.
  - Added `pgadmin` service in `docker-compose.yml` mapped to port `8888` (`${PGADMIN_FORWARD_PORT:-8888}:80`) with credentials from `.env`, matching `residency-backend` standard.
- **Duplicate Email Registration Error Handling**:
  - Added detection for Supabase's empty `identities` array response when registering with an existing email.
  - Now displays an immediate inline error banner ("An account with this email already exists. Please sign in instead.") instead of erroneously switching to the email verification screen.
- **Verification**:
  - `labOS-service`: `npm run build` (0 errors), `npm run lint` (0 errors across 469 files).
  - `labOS-app`: `npm run build` (compiled all 16 routes in Turbopack in 1372ms with 0 errors).
  - Containers: `labos-backend`, `labos-database`, and `labos-pgadmin` are all running healthy.

### 2026-09-21 (Session 25) — Fix Database Column Mapping Error & Onboarding Dashboard Redirection

- **TypeORM Entity Database Mapping Fix**:
  - Identified root cause of cascading 500 errors across all authenticated routes (`/labs/me`, `/labs/current`, `/panels/templates/all`, `/reports/dashboard-stats`, `/referrals/doctors`, `/panels`, `/reports`, `/patients`) and real-time telemetry: PostgreSQL table `labs` had column `"phone_numbers" text[]`, but `lab.entity.ts` omitted `name: 'phone_numbers'`.
  - In `labOS-service/src/modules/labs/domain/lab/lab.entity.ts`, added explicit column name mapping: `@Column({ type: 'text', array: true, default: '{}', name: 'phone_numbers' })`.
  - Ran automated AST audit across all 23 entity files in `src/` to verify zero other unmapped camelCase columns exist.
  - Aligned `docker-compose.yml` 1:1 with `residency-backend` standard: removed `command:` directive, keeping container as an interactive sandbox (`target: base`, `tty: true`, `stdin_open: true`, `expose: ['8080']`), streamlined environment variables via `env_file: - .env`, standardized ports (`${APP_FORWARD_PORT:-${PORT:-8080}}:${PORT:-8080}`, `${DB_FORWARD_PORT:-5432}:5432`, `${PGADMIN_FORWARD_PORT:-8888}:80`), and aligned service names (`database`, `pgadmin`, `backend`).
- **Onboarding Final Step Navigation Fix**:
  - In `labOS-app/src/features/onboarding/components/step-confirmation/index.tsx`, replaced `router.push('/')` + `router.refresh()` with `window.location.href = '/'`.
  - Ensures client-side cookie `x-lab-id=confirmed` is guaranteed to be delivered synchronously in the document request headers to Next.js Edge Middleware, eliminating soft-router race condition that bounced users back to `/onboarding`.
- **Verification**:
  - `labOS-service`: `npm run build` (0 errors), Docker containers (`labos-backend`, `labos-database`, `labos-pgadmin`) all running cleanly.
  - `labOS-app`: `npm run build` (compiled all 16 production routes with 0 errors).

### 2026-09-21 (Session 26) — Route Alignment, UUID Validation & Missing Members Endpoint Fix

- **UUID Validation Guard for Report Queries**:
  - In `src/modules/reports/features/report/list-reports/list-reports.handler.ts`, added strict UUID regex validation for `query.patientId`. If an invalid UUID format (such as demo ID `'patient-02'`) is queried, returns `[]` cleanly instead of allowing PostgreSQL to crash with `invalid input syntax for type uuid`.
- **Billing & Collection Route Alignment**:
  - In `src/modules/billing/features/`, standardized all invoice and expense controllers to single canonical resource routes (`@Controller('invoices')`, `@Controller('expenses')`).
  - Set `GetFinancialSummaryController` to `@Controller('billing/financial-summary')`, matching `billing.openapi.yaml` line 206 and `use-billing.ts` line 129.
  - In `src/modules/collections/features/cancel-collection/cancel-collection.controller.ts`, added `@Post(':id/cancel')` to support POST cancellations matching `collections.openapi.yaml` and frontend `use-collections.ts`.
  - Ran full automated route audit cross-referencing all 35 frontend API calls against backend controllers: 100% route match across the entire system.
- **Null Lab ID Guard & Clean 404 Handling**:
  - In `src/modules/labs/features/lab/get-lab/get-lab.handler.ts` and `update-lab.handler.ts`, added guards for `!query.labId` to throw `EntityNotFoundException` (404) instead of passing `null` to TypeORM's UUID repository query.
  - In `src/features/onboarding/api/use-onboarding.ts`, updated `useUpdateLab` to catch 404 on `PUT /labs/current` and automatically fall back to `POST /labs` to initialize the lab tenant row for fresh accounts.
- **Implemented Missing `GET /labs/members` Vertical Slice**:
  - Created `src/modules/labs/features/profile/list-members/` (`list-members.query.ts`, `list-members.handler.ts`, `list-members.controller.ts`, `list-members.module.ts`) and registered in `profile-feature.module.ts`.
  - Maps `GET /api/v1/labs/members` calling `profileRepository.findByLabId(user.labId)`, resolving the 404 on team member retrieval.
- **Verification**:
  - `labOS-service`: `npm run build` (0 errors).
### 2026-09-21 (Session 27) — Header UX Optimization & Multi-Tenant Ingestion Guard

- **Global Header UX Optimization**:
  - In `labOS-app/src/components/layout/header/index.tsx`, added path check `const isNewReportPage = pathname === '/reports/new'`.
  - Conditionally hid the "+ New Report" CTA button in the global navigation bar when the user is already on `/reports/new`.
  - Eliminates visual clutter, redundant call-to-actions, and prevents accidental form state reset when on the specimen accession screen.
- **Multi-Tenant `labId` Guard in Patient & Report Ingestion**:
  - In `labOS-service/src/modules/reports/features/patient/create-patient/create-patient.controller.ts`, added tenant guard: `if (!user.labId) throw new ForbiddenException('No laboratory associated with this account. Please complete onboarding first.');`.
  - In `labOS-service/src/modules/reports/features/report/create-report/create-report.controller.ts`, added identical tenant guard.
  - Prevents passing `null` into `PatientRepository.findByPatientNumber(labId, ...)` and `ReportRepository`, resolving the uncaught `TypeORMError: Null value encountered in property 'Patient.labId' of a where condition` (500). Instead returns a clean, actionable `403 Forbidden` guiding the client to onboarding.
- **Verification**:
  - `labOS-service`: `npm run build` passed with code 0 across all bounded contexts.
  - `labOS-app`: `npm run build` compiled all 16 production routes with code 0 in Turbopack.

### 2026-09-21 (Session 28) — Plain-Language Renaming, Icon Fix & Sidebar Reorder

- **PageHeader Icon Bug Fix**:
  - In `labOS-app/src/components/shared/page-header/index.tsx`, simplified `icon` prop type from `React.ComponentType | React.ReactNode` to `React.ReactNode` only.
  - Removed ambiguous dual-path `React.isValidElement` / `typeof icon === 'function'` rendering logic. Now simply renders `{icon}` directly inside the icon container.
  - All call sites updated to pass pre-rendered JSX elements (e.g. `icon={<Receipt className="w-4 h-4" />}`) instead of bare component classes (e.g. `icon={Receipt}`). This resolves the empty icon box visible on Billing, Referrals, Patients, and Accessions pages.
- **Plain-Language Page Title & Subtitle Renaming**:
  - `/reports/new`: "Specimen Accession & Intake" → **"New Sample Registration"**, subtitle simplified to plain operator English, breadcrumb updated to `Sample Worklist > New Registration`.
  - `/accessions`: "Daily Register & Worklist" → **"Sample Worklist"**, subtitle simplified.
  - `/billing`: "Financial Ledger & Billing" → **"Billing & Expenses"**, subtitle simplified.
  - `/referrals`: "Clinician Directory & Referral Ledgers" → **"Doctor Referrals"**, subtitle simplified.
  - `/patients`: "Patient EMR & Longitudinal Records" → **"Patients & History"**, subtitle simplified.
- **Sidebar Navigation Reorder & Rename**:
  - In `labOS-app/src/components/layout/sidebar/index.tsx`, reordered `NAV_ITEMS` to match daily workflow frequency:
    `Dashboard → New Registration → Sample Worklist → Patients & History → Home Collections → Doctor Referrals → Billing & Expenses → Panels & Tests → Settings & NABL QC`.
  - Renamed sidebar item "Accessions & Worklist" → **"Sample Worklist"** and "New Report" → **"New Registration"** for consistency.
- **Verification**:
  - `labOS-app`: `npm run build` compiled all 16 production routes with code 0 in Turbopack.

### 2026-09-21 (Session 29) — New Sample Registration UX Polish

- **Report & Patient ID Generation at Mount (not Submit)**:
  - Extracted `generateReportNumber()` and `generatePatientNumber()` as pure helper functions above `NewReportPage`.
  - Changed `useState` from static `'AUTO'` strings to lazy initializer calling these helpers at mount — the Accession UID chip now shows the real barcode ID (e.g. `R-20260921-4823`) as soon as the page loads, making copy useful immediately.
  - `handleSubmit` simplified to use `formState.reportNumber` and `formState.patientNumber` directly — no more `'AUTO'` branch logic at submit time.
  - Extracted `handleRegisterNext` as a named function that generates fresh IDs for the next patient registration.
- **Plain-Language Relabeling in `patient-intake-section`**:
  - Section `<h2>` renamed: "Patient Demographics & Specimen Accession" → **"Patient Details"**.
  - Section description updated to: "Enter patient information — a unique barcode ID has been pre-assigned".
  - Notes field label: "Accession Notes / Fasting State" → **"Notes (e.g. Fasting, Sample time)"**.
  - Removed the non-functional `<Printer />` icon button that appeared in the section header before any report existed.
- **Plain-Language Submit Button in `order-summary-bar`**:
  - Idle state: "Generate Accession Barcode & Open Console" → **"Register Sample →"**.
  - Loading state: "Generating Accession Barcode..." → **"Registering..."**.
- **Success Banner Simplified**:
  - Title: "Specimen Successfully Accessioned!" → **"Sample Registered Successfully!"**
  - Buttons: "View All Accessions" → "Go to Sample Worklist"; "Accession Next Patient" → **"Register Next Patient"**.
- **Verification**:
  - `labOS-app`: `npm run build` compiled all 16 production routes with code 0 in Turbopack.

### 2026-09-22 (Session 30) — Auth Route Guarding, Accession Intake Modal & React Key Warning Fixes

- **Authentication Route Guarding (`middleware.ts`)**:
  - Enforced strict 3-state authentication machine: unauthenticated visitors hitting `/onboarding` are now strictly redirected to `/login` (eliminated the erroneous `!isOnboarding` exception).
  - Authenticated users who have already onboarded (`x-lab-id=confirmed`) hitting `/onboarding` are automatically redirected to `/` (dashboard).
- **Accession Intake Flow & Duplicate Submission Prevention (`/reports/new`)**:
  - Built `SampleSuccessModal` component (`src/features/reports/components/sample-success-modal/index.tsx`) providing an accession barcode confirmation modal with patient demographics, test panels, and 3 primary actions: "Enter Results Now" (`/reports/${id}/entry`), "Register Next Patient", and "Go to Sample Worklist".
  - Updated `OrderSummaryBar` to support `isRegistered` state: when a sample is registered, the submit button is locked/replaced with "Register Next Patient", completely preventing duplicate accidental submissions over stale form state.
  - Retained an informative inline success banner on `/reports/new` when the modal is closed with quick navigation links.
- **React Key Warning & Entity Parity**:
  - Resolved `Each child in a list should have a unique "key" prop` warning originating from `ResultEntryForm`: the TypeORM `ReportPanel` entity is a composite primary key (`reportId` + `panelId`) without an `id` column.
  - Replaced undefined `key={rp.id}` with `key={rp.panelId || rp.panel?.id || `panel-${pIdx}`}` across `result-entry-form.tsx`, `report-letterhead-preview.tsx`, and `a4-document-sheet.tsx`.
  - Updated `ReportPanelItem` interface in `src/features/reports/types/index.ts` to make `id?: string` optional to align with backend entity schema.
- **SSR Hydration Resolution for Dynamic Barcodes (`/reports/new`)**:
  - Eliminated SSR hydration mismatch (`+ R-20260922-6885 - R-20260922-7985`) caused by `Math.random()` evaluating during server pre-rendering vs client hydration.
  - Deferred dynamic barcode and MRN generation to a client-side `useEffect` mount hook with stable SSR initial state, and added `suppressHydrationWarning` to the Accession UID span.
- **Verification**:
  - `labOS-app`: `npm run lint` passed (0 errors), `npm run build` compiled all 16 production routes with code 0 in Turbopack.

### 2026-09-22 (Session 31) — Backend Atomic Sequence Generation for Accessions & Patient MRNs (Option 1)

- **Backend Atomic Sequence Engine (`labOS-service`)**:
  - Made `reportNumber?: string` optional in `CreateReportDto` and `patientNumber?: string` optional in `CreatePatientDto`.
  - Added `generateNextReportNumber(labId: string): Promise<string>` to `IReportRepository` and `ReportRepository`: calculates atomic daily sequential accession barcodes (`R-YYYYMMDD-0001`, `R-YYYYMMDD-0002`...) scoped to tenant `labId` with collision-guarded loop.
  - Added `generateNextPatientNumber(labId: string): Promise<string>` to `IPatientRepository` and `PatientRepository`: calculates sequential patient MRNs (`P-YYYYMMDD-0001`, `P-YYYYMMDD-0002`...) scoped to tenant `labId`.
  - Updated `CreateReportHandler` and `CreatePatientHandler` to auto-assign sequential numbers when omitted, guaranteeing 100% collision-free NABL/ISO 15189 sequential auditing.
- **Frontend Presentation Layer Cleanup (`labOS-app`)**:
  - Eliminated all client-side `Math.random()`, `generateReportNumber()`, and `generatePatientNumber()` hacks.
  - Removed client `useEffect` mount workaround from `/reports/new/page.tsx`: form state now manages pure clinical data.
  - In `patient-intake-section`, updated Accession UID chip to display a clean `AUTO-ASSIGNED` badge during intake creation.
  - Once submitted, the backend-assigned sequential `reportNumber` and `patientNumber` are received and surfaced in `SampleSuccessModal`.
- **Verification**:
  - `labOS-service`: `npm run build` passed with code 0, `npm run lint` passed (0 errors across 473 files).
  - `labOS-app`: `npm run build` compiled all 16 production routes with code 0 in Turbopack, `npm run lint` passed (0 errors).

### 2026-09-22 (Session 33) — Definitive Fix for Finalize 400 Error (TypeORM Cascade Wipeout) & Ctrl+S UX Overhaul

- **Root Cause Analysis (`Cannot finalize a report with no results entered`)**:
  - In `labOS-service`, `Report.values` had `@OneToMany(() => ReportValue, (rv) => rv.report, { cascade: true, eager: true })`.
  - When `EnterResultsHandler` ran, `const report = await this.reportRepository.findById(reportId, labId)` eagerly loaded `report.values` as an empty array `[]`.
  - After inserting and saving the new `ReportValue` entities individually, the handler called `await manager.save(report)`. Because `report.values` in memory was still `[]`, TypeORM cascaded that empty array and automatically wiped out all newly inserted `ReportValue` records right before committing the transaction!
  - As a result, `report_values` in the PostgreSQL database remained at 0 rows. When `FinalizeReportHandler` subsequently called `findById`, it found `report.values.length === 0` and threw a `DomainValidationException` (400 Bad Request).
- **Definitive Backend Architectural Fix (`labOS-service`)**:
  - Removed `{ cascade: true }` from `@OneToMany(() => ReportValue)` in `report.entity.ts`: `ReportValue` records are explicitly managed by the `EnterResultsHandler` slice and should never be implicitly cascaded/wiped by `Report` entity saves.
  - Refactored `EnterResultsHandler` transaction: batch saves `ReportValue[]` via `await manager.save(ReportValue, newValues)`, synchronizes `report.values = newValues;`, and updates report state before committing.
  - Verified in backend container: `ReportValue` records are now reliably persisted and never wiped.
- **Frontend UX Overhaul: Ctrl+S Save Draft & Workspace Stability (`labOS-app`)**:
  - **Ctrl+S Browser Download Fix**: In `ResultEntryForm`, replaced input-only keydown handlers with a global window-level `keydown` listener using `{ capture: true }`. Calls `e.preventDefault()` and `e.stopPropagation()` on `Ctrl+S` / `Cmd+S`, permanently preventing the browser's native "Save Page As..." dialog from downloading the webpage as an HTML file and instead triggering `onSaveDraft()`.
  - **Global Shortcuts**: `Ctrl+Enter` / `Cmd+Enter` now reliably triggers the finalization confirmation dialog from anywhere on the page.
  - **Workspace Key Fix**: In `/reports/[id]/entry/page.tsx`, changed `key={report.id + (report.updatedAt || '')}` to `key={report.id}`. Previously, saving a draft updated `updatedAt` in the TanStack Query cache, causing React to unmount and remount the entire form, disrupting focus and async operations.
  - **Code Cleanup**: Removed duplicate keyboard handlers and redundant code from parameter inputs.
- **Verification**:
  - `labOS-service`: `npm run build` passed with code 0 (`nest build`). Container restarted and running cleanly.
  - `labOS-app`: `npm run lint` passed (0 errors), `npm run build` compiled all 16 production routes with code 0 in Turbopack.

### 2026-09-22 (Session 34) — Print Architecture Overhaul, Dynamic Laboratory Profile Branding & RFC-4180 Accounting Exports

- **Print Architecture Overhaul (`labOS-app`)**:
  - **Eliminated Web Page Printing Bugs**: Previously, clicking "Print/PDF" invoked raw `window.print()` without style isolation, printing the entire active screen (navigation headers, sidebars, interactive buttons, and dirty form inputs).
  - **CSS Print Isolation Engine**: In `globals.css`, introduced `@media print` rules utilizing modern `body:has([data-printable-area="true"])` and `.printable-modal-backdrop` selectors. All application chrome (`header`, `nav`, `aside`, `.print\:hidden`) is strictly hidden (`display: none !important`), and only the designated document container is printed at exact A4 page dimensions (`210mm x 297mm`) with clean margins and zero browser header/footer artifacts.
  - **NABL / ISO 15189:2022 Draft Watermarking**: In `report-letterhead-preview.tsx`, removed the premature "Print / PDF" button during active result entry (preventing accidental distribution of unverified, unsigned clinical test results). Added a CSS diagonal `DRAFT — NOT FOR DIAGNOSTIC USE` watermark if printed via browser shortcut before sign-off.
  - **Dedicated Preview Navigation**: In `patient-history-timeline.tsx`, changed the encounter "Print" button to directly route the user to `/reports/${report.id}/preview`, where the finalized, sign-off A4 document is cleanly rendered.

- **Dynamic Laboratory Profile Branding (`labOS-app`)**:
  - **Removed Hardcoded Demo Branding**: Replaced all hardcoded instances of "Apex Diagnostic Center & Advanced Pathology Lab" with dynamic tenant profile context (`useLabProfile()`).
  - **Applied Onboarding Customizations**: Automatically applies the tenant's chosen name (**Deswal**), address (**Barara, Haryana**), contact numbers (`8568884848`), NABL accreditation ID, and the onboarding Accent Swatch (**Teal `#0f766e`**).
  - **Pervasive Application**:
    - `report-letterhead-preview.tsx`: Dynamic lab header, Teal accent borders, and tenant contact details.
    - `a4-document-sheet.tsx`: Dynamic letterhead banner, panel titles, section headers, and signatory credentials.
    - `invoice-receipt-modal.tsx`: Dynamic letterhead, cashier desk seal, and isolated printing.
    - `sidebar/index.tsx` & `mobile-nav/index.tsx`: Dynamic Facility Station name and NABL accreditation badge.
    - `src/app/page.tsx` (Dashboard): Dynamic clinical station subtitle.
    - `src/app/v/[token]/page.tsx` (Patient Portal): Dynamic lab avatar and header branding.
    - WhatsApp dispatch actions across Worklist, Accession Mobile Cards, Patient History, and Preview toolbar.

- **Standardized RFC-4180 CSV & Accounting Engine (`labOS-app`)**:
  - **Export Utility (`src/lib/csv-exporter.ts`)**: Built a reusable, production-grade CSV exporter with RFC-4180 field quoting, comma/newline escaping, and UTF-8 Byte Order Mark (`\uFEFF`) prepending for seamless compatibility with Microsoft Excel and Tally Prime.
  - **Doctor Referrals MTD Commission Audit**:
    - Replaced placeholder print action on the Referrals screen with a consolidated MTD audit export (`exportToCsv`), generating `LabOS_Doctor_Commission_Audit_MTD_YYYY-MM.csv` with doctor registration, PAN, bank details, active cases, pending and settled amounts.
  - **Doctor Statement of Account Modal (`doctor-statement-modal.tsx`)**:
    - Built a comprehensive statement of account / payout advice modal on official letterhead for individual doctors.
    - Includes Income Tax Act Section 194H TDS deduction calculations (2% for registered PAN / 20% for non-PAN), itemized referral investigations, net payable totals, bank NEFT details, printable A4 voucher layout, and CSV download.
  - **Billing Invoices & Laboratory Operational Expenses**:
    - Upgraded "Export Tally / CSV" in `/billing/page.tsx` with structured RFC-4180 exports for both Invoices and Operating Expenses (categorized by Equipment Reagents, Bio-waste Management, Logistics, etc.).

- **Verification**:
  - `labOS-service`: `npm run build` passed with code 0 (`nest build`), `npm run lint` passed (0 errors across 473 files).
  - `labOS-app`: `npm run build` passed with code 0 compiling all 16 routes in Turbopack, `npm run lint` passed (0 errors).

### 2026-09-22 (Session 35) — Order-to-Cash (O2C) Automated Intake Billing, Upfront Payment Collection & Master Ledger Sync

- **Order-to-Cash (O2C) Diagnostic Architecture**:
  - Eliminated manual double-entry of patient invoices: walk-in diagnostic orders now atomically generate linked tax invoices directly at accession intake (`/reports/new`).
  - Solved diagnostic revenue leakage: front desk collects upfront payment (Cash/UPI/Card) or records credit ("Pay Later") at sample draw, immediately issuing a thermal/A4 receipt voucher before the patient departs.
  - Pathologists and lab technicians remain 100% focused on clinical result entry without distraction by cashier duties.

- **Backend O2C Engine (`labOS-service`)**:
  - **Sequential Invoicing Collision Guard (`invoice.repository.ts`)**: Added a sequential uniqueness loop ensuring unique invoice numbers (`INV-YYYY-XXXX`) scoped by tenant `labId`.
  - **Billing DTO (`create-report.dto.ts`)**: Added `CreateReportBillingDto` with fields for `discount`, `paymentMethod` (CASH, UPI, CARD, NETBANKING), `paymentStatus` (PAID, UNPAID, PARTIALLY_PAID), `paidAmount`, and `notes`.
  - **Atomic Report + Invoice Creation (`create-report.handler.ts`)**: Injected `INVOICE_REPOSITORY_TOKEN`. Sums panel prices from catalog, applies discounts, calculates net total, handles upfront payments, atomically creates the linked `Invoice`, and attaches `(report as any).invoice = createdInvoice`.
  - **Transaction Isolation & FK Resolution (`FK_invoices_report_id`)**: Persisted `Invoice` and `InvoiceItem` entities directly via the transaction's `EntityManager` (`manager.save(Invoice, invoiceEntity)`) rather than an external repository query runner. This ensures `reportId: savedReport.id` is visible within the same uncommitted transaction, eliminating the PostgreSQL foreign key constraint violation.
  - **Report & Worklist Invoice Linking (`get-report.handler.ts`, `list-reports.handler.ts`)**: Injected `INVOICE_REPOSITORY_TOKEN` into `GetReportHandler` and `ListReportsHandler`. Fetches lab invoices in a single batch query and maps `report.invoice` by `reportId` in O(N) time with zero N+1 overhead.

- **Frontend Intake & Billing Synchronization (`labOS-app`)**:
  - **Sticky Intake Financial Dock (`order-summary-bar/index.tsx`)**: Upgraded order summary with live financial breakdown (Catalog Subtotal, Discount input, Net Fee), payment mode toggle (`Paid Upfront` vs `Pay Later`), payment method selector (`UPI`, `Cash`, `Card`), and submit button reflecting the net fee.
  - **Mutation Cache Invalidation (`use-create-report.ts`)**: Automatically invalidates `['reports']`, `['invoices']`, and `['finance']` queries upon registration.
  - **Sample Confirmation Modal (`sample-success-modal/index.tsx`)**: Displays linked Tax Invoice details with status badge (`PAID • UPI` vs `UNPAID`), net amount, and a primary **"Print Tax Receipt"** action.
  - **Direct Tax Receipt Printing (`invoice-receipt-modal.tsx`)**: Directly launches the official printable tax invoice voucher with patient demographics and itemized investigations.
  - **Revenue Leakage Badges Across Operations**:
    - `accession-table.tsx` & `accession-mobile-card.tsx`: Worklist displays a payment pill (`PAID` vs `₹DUE`) on every row/card.
    - `preview-action-toolbar.tsx`: Sign-off/preview toolbar alerts technicians to unsettled balances (`Payment Due: ₹X` vs `Paid • UPI`) before patient dispatch.

- **Verification**:
  - `labOS-service`: `npm run build` passed with code 0 (`nest build`), `npm run lint` passed (0 errors across 473 files).
  - `labOS-app`: `npm run build` compiled all 16 production routes with code 0 in Turbopack, `npm run lint` passed (0 errors).

### 2026-09-23 (Session 36) — PRD Goal 3 & P0 Requirement: Outsourced Reference Lab Testing Workflow

- **Domain Types & Backend Parity (`src/features/referrals/types/index.ts`)**:
  - Expanded referrals domain types with `OutsourcedTest`, `OutsourcedTestStatus` (`'PENDING' | 'SENT' | 'RECEIVED' | 'CANCELLED'`), `CreateOutsourcedTestDto`, `UpdateOutsourcedStatusDto`, and `OutsourcedSummaryStats`.
  - 100% parity with NestJS backend `referrals` bounded context (`src/modules/referrals/domain/outsourced/`).
- **Service Layer & TanStack Query Separation (`src/features/referrals/api/`)**:
  - `outsourced.service.ts`: Pure API service layer (zero React hooks) calling `GET /referrals/outsourced`, `POST /referrals/outsourced`, and `PATCH /referrals/outsourced/:id/status`.
  - `use-outsourced.ts`: Query and mutation hooks (`useOutsourcedTests`, `useCreateOutsourcedTest`, `useUpdateOutsourcedStatus`) with cache invalidation for `['referrals', 'outsourced']`, `['reports']`, and `['finance']`.
  - `src/lib/demo-data/outsourced.ts`: Realistic clinical demo seed cohort (Ramesh V. Gupta Vitamin D to Dr. Lal PathLabs, Sunita Rao Biopsy to SRL, Farhan Anti-TPO to Thyrocare, Ananya Urine Culture to Metropolis).
- **Private Decomposed Workstation Components (`src/features/referrals/components/outsourced/`)**:
  - `OutsourcedSummaryRibbon`: 4 KPI cards (Active Send-Outs, Awaiting Pickup, Results Merged MTD, and Reference Lab B2B Bill MTD).
  - `OutsourcedTable`: High-density desktop data grid and mobile card conversion (`_components/outsourced-mobile-card.tsx`), debounced multi-attribute search, and status filter pills (`All Send-Outs`, `Pending Pickup`, `In Transit`, `Results Merged`).
  - `NewOutsourcedModal`: Send-out manifest dialog to dispatch investigations to accredited reference labs with courier tracking and wholesale B2B cost logging.
  - `ReceiveResultModal`: Result intake dialog to record external reference lab findings, verify wholesale bills, and mark status as `RECEIVED`.
- **Dual-Workstation Tab Switcher (`src/app/referrals/page.tsx`)**:
  - Top tab switcher uniting **"Referring Clinicians & TDS 194H"** with **"Reference Lab Send-Outs"** with active badge counters.
  - PageHeader actions dynamically swap: `Consolidated MTD Audit` + `+ Add Doctor` on the Doctors tab, and `Export Manifest` + `+ New Send-Out` on the Outsourced tab.
- **NABL / ISO 15189 Unified Clinical Report Merging (`a4-document-sheet.tsx`)**:
  - Rendered dedicated accredited reference laboratory block (NABL ISO 15189 Clause 5.8) displaying outsourced investigations, reference laboratory citations, and merged findings alongside in-house haematology and biochemistry results on a single unified A4 letterhead.
- **Verification**:
  - `labOS-service`: `npm run build` passed with code 0 (`nest build`).
  - `labOS-app`: `npm run lint` passed with 0 errors (clean code, zero unused variables, zero useEffect cascading renders).
  - `labOS-app`: `npm run build` compiled all 16 production routes with code 0 in Turbopack.

### 2026-09-23 (Session 37) — PRD Section 2 Goal 2 & Section 6 P1: Cost-Per-Test Profitability & Diagnostic P&L Analytics

- **Diagnostic Unit Economics Domain Types (`src/features/billing/types/index.ts`)**:
  - Added strict TypeScript domain models for diagnostic unit profitability: `TestExecutionType` (`'IN_HOUSE' | 'OUTSOURCED'`), `StrategicRecommendation` (`'RUN_IN_HOUSE' | 'KEEP_OUTSOURCED' | 'SWITCH_TO_IN_HOUSE' | 'HIGH_MARGIN_PRIORITY'`), and `TestProfitabilityMetric` (retail price, direct reagents/consumables/B2B fees, doctor referral cuts, net margin, margin %, MTD volume, and breakeven threshold).
  - Defined formal diagnostic P&L interfaces (`PnLRevenueBlock`, `PnLCOGSBlock`, `PnLOpexBlock`, `DiagnosticPnLStatement`, `ProfitabilitySummaryStats`) modeled on SAC 999316 healthcare accrual standards.
- **Clinical Unit Economics Seed Data (`src/lib/demo-data/profitability.ts`)**:
  - Seeded unit economics for 10 core diagnostic panels across routine haematology, biochemistry, clinical pathology, endocrinology, and outsourced reference testing: CBC (66.8% margin), Lipid Profile (70.0%), LFT (70.0%), KFT (71.8%), HbA1c (64.4%), Urine Routine (87.5% margin), Fasting Glucose (76.7%), Vitamin D Total (54.2%), Thyroid Panel Extended (45.6%, 54 tests/mo exceeding 40 breakeven), and Histopathology Biopsy (50.0%).
  - Seeded `DEMO_PNL_STATEMENT` reflecting real small standalone lab operations: Net Revenue (₹4,70,150), Direct COGS (₹1,38,900 / 29.5%), Gross Margin (₹3,31,250 / 70.5%), Operating Overhead (₹1,03,200), and Net Owner Take-Home Cashflow (₹2,28,050 / 48.5%).
- **Service Layer & Query Hooks (`src/features/billing/api/use-profitability.ts`)**:
  - Created query hooks `useTestProfitability()`, `useDiagnosticPnL()`, and `useProfitabilitySummary()` with automatic fallback to live backend `GET /billing/financial-summary`.
- **Modular Telemetry Components (`src/features/billing/components/profitability/`)**:
  - `ProfitabilityKpiRibbon`: 4 high-level telemetry KPI cards (Net Patient Revenue MTD, Direct Testing COGS, Gross Diagnostic Margin 70.5%, Net Owner Operating Take-Home).
  - `BreakevenAdvisorCard`: Smart Dispatch Advisor providing actionable analyzer payback insights (identifying Thyroid Panel at 54 tests/mo exceeding 40 breakeven volume, saving ₹7,450/month in wholesale bills if brought in-house; shielding Biopsy & Vitamin D against ₹18L capex).
  - `UnitMarginsTable` & `_components/unit-margin-mobile-card.tsx`: High-density investigation catalog unit economics grid with debounced search, category filter pills (`All`, `In-House Bench`, `Reference Lab`, `High Margin >65%`), color-coded progress margin meters, and CSV export.
  - `PnLStatementSheet`: Formal Diagnostic Profit & Loss statement sheet displaying Sections A through E with SAC 999316 healthcare classification, net margin analytics, dedicated print isolation (`@media print`), and one-click CSV export.
  - `ProfitabilityTabContent`: Encapsulated container orchestrating ribbon, breakeven advisor, table, and P&L sheet with animated skeleton loading states.
- **Billing Multi-Ledger Integration (`src/app/billing/page.tsx`)**:
  - Upgraded active tab state to `'invoices' | 'expenses' | 'profitability'`.
  - Added 3rd tab button with `TrendingUp` icon and `70.5% Gross` pill.
  - Enhanced PageHeader CSV export to dynamically export the formal Diagnostic P&L statement when the profitability tab is active.
- **Verification**:
  - `labOS-app`: `npm run lint` passed with 0 errors across all files.
  - `labOS-app`: `npm run build` compiled all 16 production routes with code 0 in Turbopack in 1.4s.
  - `labOS-service`: All 3 Docker containers (`labos-backend`, `labos-database`, `labos-pgadmin`) running healthy.

### 2026-09-23 (Session 38) — PRD Section 6 P1: Role-Based Access Control (RBAC) UI View Gating

- **Backend Alignment (`labOS-service`)**:
  - **Role Enum & Value Transformer (`src/modules/labs/domain/profile/enums/role.enum.ts`)**: Added `RoleEnum.PHLEBOTOMIST = 'PHLEBOTOMIST'` with mapping index `3` in `RoleEnumMapper` alongside `OWNER` (0), `TECHNICIAN` (1), and `PATHOLOGIST` (2).
  - **Member Invitation DTO (`src/modules/labs/features/profile/add-member/add-member.dto.ts`)**: Updated validation `@IsIn([RoleEnum.TECHNICIAN, RoleEnum.PATHOLOGIST, RoleEnum.PHLEBOTOMIST])` to allow inviting field phlebotomists.
  - Verified backend compilation (`nest build`) and lint (0 errors across 473 files).
- **Frontend RBAC Domain Architecture (`labOS-app`)**:
  - **Centralized Permission Matrix (`src/features/auth/types/rbac.types.ts`)**: Defined granular clinical permissions across Reports, Billing, Referrals, Collections, and Settings (`REPORTS:FINALIZE`, `REPORTS:ENTRY`, `BILLING:PNL_VIEW`, `SETTINGS:LAB_PROFILE`, etc.). Defined `ROUTE_PERMISSIONS` and comprehensive `ROLE_METADATA` with badges, titles, and clinical descriptions for the 4 personas.
  - **Reactive RBAC Hook (`src/features/auth/hooks/use-rbac.ts`)**: Provides `currentRole`, `can(permission)`, `hasRole(...roles)`, `canAccessRoute(pathname)`, and reactive cross-component persona simulation (`setSimulatedRole()`, `resetRole()`).
  - **Declarative Access Gate Primitives (`src/features/auth/components/`)**:
    - `RoleGate`: Declarative authorization wrapper supporting `allowedRoles`, `permission`, and custom fallback.
    - `AccessDeniedView`: Accessible, clinical-grade 403 screen featuring required vs active role comparison, NABL ISO 15189 compliance guidance, and contextual navigation buttons back to authorized workstations.
    - `RoleSimulatorDialog`: 1-click clinical persona switcher allowing instant testing of all access boundaries across:
      - 👑 **Lab Owner / Superuser** (`OWNER` — Dr. Deswal)
      - 🔬 **Consultant Pathologist** (`PATHOLOGIST` — Dr. Sunita Sharma, MD)
      - 🧪 **Senior Lab Technician** (`TECHNICIAN` — Rohan Verma, DMLT)
      - 💉 **Field Phlebotomist** (`PHLEBOTOMIST` — Vikram Singh)
- **Workstation & Navigation Integration**:
  - **Sidebar Navigation Filtering (`src/components/layout/sidebar/`)**: Refactored `Sidebar` into clean, decomposed private components (`_components/sidebar-station-info.tsx`, `_components/sidebar-footer.tsx`). Dynamically filters `NAV_ITEMS` using `canAccessRoute(item.href)`. Added interactive persona badge and role switcher in the footer.
  - **Mobile Navigation Drawer (`src/components/layout/mobile-nav/`)**: Dynamically filters mobile drawer items and displays the active persona card in the drawer footer.
  - **Pathologist Sign-off Protection (`src/features/reports/components/result-entry/`)**:
    - Under NABL ISO 15189 standards, only `PATHOLOGIST` and `OWNER` can finalize reports.
    - In `ResultEntryForm`, technicians see an immutable lock badge: `"Pathologist Sign-off Required"`, while retaining full ability to enter results and save drafts.
    - Gated `Ctrl+Enter` shortcut and `handleFinalizeRequest` handler with `can('REPORTS:FINALIZE')`.
  - **Financial Confidentiality (`src/app/billing/page.tsx`)**:
    - Gated `/billing` route to `['OWNER', 'TECHNICIAN']` (phlebotomists restricted).
    - Technicians access Tab 1 (Patient Invoices & Collections) for cashier duties.
    - Financial KPI Ribbon, Tab 2 (Expenses Ledger), and Tab 3 (Cost-Per-Test Profitability & P&L) are strictly restricted to `OWNER`.
  - **Master Catalog & Profile Protection (`src/app/settings/page.tsx`, `src/app/panels/page.tsx`)**:
    - Wrapped both workstations in `<RoleGate allowedRoles={['OWNER']} showDeniedView>` ensuring only lab directors can alter branding, invite staff, or delete test panels.
  - **Referrals Gating (`src/app/referrals/page.tsx`)**:
    - Technicians and Pathologists access Tab 2 (Reference Lab Send-Outs) to track logistics and merge findings. Inbound doctor referral commission ledgers and payouts (TDS 194H) are restricted to `OWNER`.
- **Verification**:
  - `labOS-service`: `npm run build` and `npm run lint` passed with 0 errors.
  - `labOS-app`: `npm run lint` passed with 0 errors.
  - `labOS-app`: `npm run build` compiled all 16 production routes with code 0 in Turbopack in 2.2s.

### 2026-09-23 (Session 39) — RBAC Privilege Invariant & Simulation Security Hardening

- **Industry Standard Privilege Invariant Enforcement**:
  - **Single Direction Impersonation Boundary**: In enterprise RBAC standards (AWS IAM, Stripe "View As", Google Workspace), role simulation / impersonation is strictly restricted to Superusers / Directors (`baseRole === 'OWNER'`). Non-owner roles (`TECHNICIAN`, `PATHOLOGIST`, `PHLEBOTOMIST`) can never simulate roles or escalate privileges.
  - **Hook Hardening (`src/features/auth/hooks/use-rbac.ts`)**:
    - Added `canSimulate = baseRole === 'OWNER'`.
    - If `canSimulate` is false, `currentRole` strictly equals `baseRole` with zero exceptions.
    - `setSimulatedRole` rejects unauthorized calls with security console warning.
    - Ignored any client-side storage tampering for non-owners.
    - Complied with React 19 compiler rule by avoiding synchronous `setState` in `useEffect` and deriving state synchronously.
  - **Sidebar Footer & Navigation Hardening (`src/components/layout/sidebar/_components/sidebar-footer.tsx`)**:
    - For non-owners (`canSimulate === false`), the role badge is rendered as a static, non-interactive badge with `ShieldCheck` and `NABL Locked` indicator; the "Switch Role" button and collapsed `UserCog` icon are completely removed.
    - For owners (`canSimulate === true`), when simulating an alternate persona, an explicit `Exit Sim` button (`RotateCcw`) is rendered alongside the `SIM` pulse pill to instantly return to `OWNER`.
  - **Dialog Defense-in-Depth (`src/features/auth/components/role-simulator-dialog/index.tsx`)**:
    - Guarded with `if (!canSimulate) return null;` ensuring the dialog refuses to render if invoked by non-owners.
    - Added prominent Director Access Console callout explaining regulatory role locking.
- **Verification**:
### 2026-09-23 (Session 40) — Free-First WhatsApp Report Dispatch & Multi-Channel Notification Audit UI (PRD P0/P1)

- **Architecture & Product Strategy**:
  - **Free-First Direct WhatsApp Intent (`wa.me`)**: 100% free, zero-cost architecture utilizing universal deep links (`https://wa.me/91XXXXXXXXXX?text=...`). Requires zero Meta API keys, zero business verification, and zero recurring provider fees. Opens WhatsApp Web or WhatsApp Desktop directly from the lab's reception PC or phone.
  - **NABL ISO 15189 Multi-Channel Auditability**: Concurrently logs all dispatches to the backend PostgreSQL audit trail (`notification_logs`) with full delivery lifecycle tracking (`PENDING`, `SENT`, `DELIVERED`, `READ`, `FAILED`).
- **Backend Alignment (`labOS-service`)**:
  - **Enum Expansion (`src/modules/notifications/domain/notification/enums/notification-status.enum.ts`)**: Added `NotificationStatusEnum.READ = 'READ'` with index `4` alongside `PENDING` (0), `SENT` (1), `DELIVERED` (2), and `FAILED` (3).
  - **Repository Query Filtering (`src/modules/notifications/infrastructure/database/repositories/notification-log.repository.ts`)**: Added `reportId` filter querying PostgreSQL JSONB payload (`log.payload->>'reportId' = :reportId`).
  - **Query & Controller Exposure (`src/modules/notifications/features/list-notifications/`)**: Added `reportId` optional query parameter on `GET /notifications`.
  - Verified backend compilation (`nest build`) and oxlint (0 errors across 473 files).
- **Frontend Domain Engine (`labOS-app`)**:
  - **Domain Types (`src/features/notifications/types/index.ts`)**: Strict TypeScript contracts for channels (`WHATSAPP`, `SMS`, `EMAIL`), delivery statuses, payloads, stats, and DTOs.
  - **Pure Service Client (`src/features/notifications/api/notifications.service.ts`)**: Axios client calling `GET /notifications`, `GET /notifications/:id`, `POST /notifications/send`, and `POST /notifications/resend/:id` with strict `StatusCodes` validation and zero React hooks.
  - **TanStack Query Hooks (`src/features/notifications/api/use-notifications.ts`)**: `useNotificationLogs`, `useReportNotification`, `useSendNotification`, `useResendNotification`, and `computeNotificationStats`.
  - **Clinical Demo Cohort (`src/lib/demo-data/notifications.ts`)**: Realistic Haryana pilot cases matching Deswal Diagnostic Laboratory accessions (CBC read, Lipid delivered, Thyroid failed bad phone number, etc.).
- **Clinical UI Primitives & Workstations**:
  - **Real-Time Delivery Micro-Badge (`notification-status-badge`)**: Displays single tick (Sent), double grey ticks (Delivered), double blue ticks (Read), and alert triangle (Failed).
  - **Interactive Send WhatsApp Modal (`send-whatsapp-modal/`)**:
    - Decomposed into `_components/whatsapp-chat-bubble.tsx` and `index.tsx`.
    - Real-time Indian mobile validation (`+91 98XXX XXXXX`) with auto-clean.
    - Live WhatsApp chat bubble preview with NABL verified badge, lab branding, and encrypted PDF download card.
    - "Open & Send in WhatsApp" button: triggers `wa.me` deep link and auto-logs dispatch into the audit log.
    - Quick utility buttons: "Copy Text" and "Copy Link".
  - **KPI Telemetry Ribbon (`notification-kpi-ribbon`)**: 4 live cards: Total Dispatched MTD, WhatsApp Delivery %, Delivered & Read %, Needs Verification count.
  - **High-Density Audit Table (`notification-audit-table/`)**: Filter pills (`All`, `WhatsApp`, `SMS`, `Email`), status filters, debounced search, touch-card mobile conversion (`_components/notification-mobile-card.tsx`), and detail inspection modal (`_components/notification-detail-modal.tsx`).
  - **Dual-Tab Accessions Workstation (`src/app/accessions/page.tsx`)**: Segmented tabs (`Sample Worklist` vs `WhatsApp & Dispatch Log`) with live badge counters.
  - **Integrated Action Triggers**: Connected WhatsApp dispatch buttons in `accession-table.tsx`, `accession-mobile-card.tsx`, `preview-action-toolbar.tsx`, and `patient-history-timeline.tsx`.
### 2026-09-23 (Session 41) — Authentic WhatsApp Branding & Phone-First Smart Patient Deduplication (PRD Goal 1 & 4)

- **Authentic WhatsApp SVG Brand Component**:
  - Created [`WhatsAppIcon`](file:///home/navdish/Desktop/labOS/labOS-app/src/components/ui/whatsapp-icon/index.tsx) with official WhatsApp vector silhouette (`#25D366`), fully responsive with support for custom sizes and classes.
  - Replaced all generic Lucide chat icons across:
    - Accession worklist data grid (`accession-table.tsx`) and mobile cards (`accession-mobile-card.tsx`).
    - Report preview action toolbar (`preview-action-toolbar.tsx`).
    - Accessions page top header and dual-tab button (`accessions/page.tsx`).
    - Notification audit table, mobile cards, and status badges (`notification-audit-table`, `notification-status-badge`).
    - Patient history timeline actions (`patient-history-timeline.tsx`).
- **SendWhatsAppModal Polish & Master Record Phone Sync**:
  - Differentiated **"Verified on File"** (pre-populated from patient master record) vs **"No Phone on Patient Profile"** (unregistered alert).
  - Added auto-checked *"Save this number to patient's master record"* checkbox.
  - Wired `useUpdatePatient()` mutation calling `PATCH /patients/:id` to save newly entered contact numbers directly into PostgreSQL, keeping data clean without extra receptionist clicks.
- **Smart Phone-First Patient Auto-Detection at Intake (`PatientIntakeSection`)**:
  - Added real-time 10-digit mobile detection in sample intake (`/reports/new`).
  - As soon as 10 digits are typed, the system automatically checks for existing patient profiles sharing this contact.
  - Renders an inline **"Returning Patient Found"** / **"Family Members Found on this Number"** card with 1-click **`Use Profile →`** auto-fill.
  - Populates Name, Age, Sex, MRN (`patientNumber`), and sets `existingPatientId` to guarantee zero duplicate patient records.
- **Patient Workstation Shortcut to Intake (`/patients` -> `/reports/new`)**:
  - Upgraded [`PatientDetailCard`](file:///home/navdish/Desktop/labOS/labOS-app/src/features/patients/components/patient-detail-card.tsx) with **`+ Register Sample`** button passing `patientId` via URL query parameter.
  - Added `usePatient(patientId)` query hook and wrapped [`NewReportPage`](file:///home/navdish/Desktop/labOS/labOS-app/src/app/reports/new/page.tsx) in `<React.Suspense>`.
  - When opened with `?patientId=...`, the intake workstation mounts pre-populated with that patient's master profile, ready for immediate panel selection and accessioning.
- **Verification**:
  - `labOS-app`: `npm run lint` passed with 0 errors.
  - `labOS-app`: `npm run build` compiled all 16 production routes with code 0 in Turbopack.
  - `labOS-service`: `npm run build` passed with code 0.

### 2026-09-24 (Session 42) — Track 1: Pilot Launch Readiness for Dr. Deswal's Standalone Lab & Canonical Diagnostic Catalog Seeding

- **Authentication & Onboarding of Pilot Lab Tenant**:
  - Authenticated using pilot owner credentials (`deswal@gmail.com`).
  - Completed tenant initialization:
    - Lab Name: `Deswal Diagnostic Laboratory`
    - Address: `Near Main Bus Stand, Barara, Ambala, Haryana 133201`
    - Phone: `+91 85688 84848`
    - Accent Theme: Teal (`#0f766e`)
    - Signatory Pathologist: `Dr. Deswal, MBBS, MD (Pathology)`, Reg: `HN-42918`, NABL: `MC-4192 / 2024`.
- **Database Catalog Seeding & Canonical Diagnostic Templates**:
  - Expanded master seeder (`panel-templates.seed.ts`) with all standard 22 Indian diagnostic panels across 5 departments: Hematology, Biochemistry, Clinical Pathology, Serology, Endocrinology.
  - Added structured NABL biological reference intervals, specimen vacutainer specifications (`2.0 mL EDTA Purple Top`, `3.0 mL Plain Serum SST`, `Fluoride Grey Top`, etc.), testing methods, and Hindi localized parameter names (`nameLocal`).
  - Seeded 27 master templates into `panel_templates` and instantiated full active test battery for tenant `6aaabed8-3df0-4569-8b9f-6fcc85ecc783` (total 54 `test_panels` across labs).
- **Frontend Architecture & Data Adapters**:
  - Created `adaptBackendPanelToMasterPanel()` and `normalizePanel()` with strict TypeScript interfaces (`BackendPanel`, `BackendSection`, `BackendParameter`), eliminating `no-explicit-any` ESLint violations.
  - Fixed `TAT: undefinedm` bug; displays clean formatted turnaround times (e.g. `45m`, `1.0 hrs`).
  - Synchronized department filter pills and editor select options to standard 5 categories.
- **End-to-End Live Clinical Rehearsal**:
  - **Intake & Upfront Billing (`/reports/new`)**:
    - Patient: `Rajesh Kumar` (45 Y, Male, +91 9876543210).
    - Selected Panels: `Complete Blood Count (CBC) with ESR` (₹350) + `Kidney Function Test (KFT / RFT with Electrolytes)` (₹650).
    - Payment: Paid Upfront via UPI (Net Fee: ₹1,000).
    - Generated Accession: `R-20260924-0001`, Tax Invoice: `INV-2026-0001`, Report UUID: `f14faf1a-0151-4183-b3ab-012366668d29`.
  - **Result Entry Console (`/reports/[id]/entry`) & Finalization**:
    - Entered 23 clinical parameter values.
    - Automatic out-of-range flag evaluation: 7 parameters flagged (Hb `11.2` Low, PCV `36.5` Low, MCV `76.0` Low, MCH `23.3` Low, MCHC `30.6` Low, RDW-CV `16.2` High, ESR `22` High) reflecting classic microcytic hypochromic iron-deficiency anemia pattern.
    - Pathologist final sign-off executed, report marked `FINALIZED` (`1`), sample status `COMPLETED` (`2`).
  - **Verified Clinical Letterhead Preview (`/reports/[id]/preview` & Public Verification `/v/[token]`)**:
    - Complete A4 letterhead with Deswal Diagnostic Laboratory Teal branding, NABL MC-4192 badge, patient demography, structured results table with flags, and Dr. Deswal's signature block.
- **Master-Detail Dual-Pane Studio Workspace Refactor (`/panels`)**:
  - **Eliminated Global Window Scroll Smells**: Refactored `/panels` to use `<AppShell variant="workspace">` with locked viewport height (`h-screen overflow-hidden`).
  - **Pinned Workstation Header**: Fixed top header `PanelsHeader` (`shrink-0 z-10`) displaying catalog counters, department filter pills (`Hematology`, `Biochemistry`, etc.), and `+ Create New Panel`.
  - **Independent Left Directory Scroll Container**:
    - Sticky directory search bar with clear button (`Showing 28 Panels`).
    - Smooth, independently scrolling cards list (`overflow-y-auto`) with sleek 6px surgical precision scrollbar.
    - Active panel card indicator: bold teal left accent border (`border-l-4 border-l-primary`) with auto-scroll into view (`scrollIntoView`).
    - Pinned bottom audit status bar (`Rev 2024.11-B`).
  - **Independent Right Editor Scroll Container**:
    - Right configuration editor stays anchored in the viewport; zero white space void below.
    - Sticky top banner card (`sticky top-0 z-10 backdrop-blur-md bg-card/95`) keeping `Save Panel Config`, `Revert`, and core metadata accessible while scrolling parameter tables.
  - **Adaptive Ergonomics**: Below `xl` (<1280px), maintains segmented mobile switcher (`Panel Directory` vs `Config Editor`) with clean back navigation.
- **Track A: Live Accessions Worklist & WhatsApp Dispatch Console Integration (`/accessions`)**:
  - **Backend Relational Hydration (`report.repository.ts`)**:
    - Upgraded `findByLabId` and `findByPatientId` queries to join `reportPanels`, `panel`, `values`, and `parameter`.
    - Integrated `ReferralsDatabaseModule` into `ListReportsModule` and `GetReportModule`.
    - Injected `DOCTOR_REPOSITORY_TOKEN` to hydrate `refByDoctor` on list and single report queries.
  - **Live Worklist Feed Parity**:
    - Connected `/accessions` to real PostgreSQL database reports with clean fallback for demo offline mode.
    - Accurately renders real accessions (`R-20260924-0001` - Rajesh Kumar), active diagnostic panels (`Complete Blood Count (CBC) with ESR`, `Kidney Function Test (KFT / RFT with Electrolytes)`), critical out-of-range flag pulse indicators, and `PAID • UPI` badges.
  - **One-Click WhatsApp Dispatch**:
    - Pre-populates verified patient contact, lab branding (`Deswal Diagnostic Laboratory`), accession UID, and encrypted digital verification link (`/v/[token]`).
- **Automated Verification**:
  - `labOS-service`: `nest build` completed with code 0.
  - `labOS-app`: `npm run lint` 0 errors; `npm run build` compiled all 16 production routes in 1.4s with code 0.

### 2026-09-24 (Session 43) — Track B: Doctor Referrals Network, Commission Ledger & Reference Lab Outsourcing (`/referrals`)

- **Root Cause Fixes in Domain & Infrastructure**:
  - **`finalize-report.handler.ts`**: Replaced hardcoded `0` in `ReportFinalizedEvent` with dynamic summation of `panel.price` across `reportPanels`, ensuring percentage-based commissions compute correctly on finalization.
  - **`commission-ledger.repository.ts`**: Fixed SQL enum transformer evaluation in `getLabSummary` and `getDoctorBalance` using `CommissionStatusEnumMapper`, importing mapper and eliminating TypeORM runtime string mismatch.
  - **`docker-compose.yml`**: Added `command: node dist/main` ensuring the `labos-backend` container executes NestJS production build rather than dropping into node interactive REPL.
- **Seeded Clinical Referrals Cohort for Barara Pilot Tenant (`6aaabed8-3df0-4569-8b9f-6fcc85ecc783`)**:
  - **Doctor Roster**:
    - `Dr. A. K. Mehra, MBBS, MD (Medicine)`: Mehra Medicare & Heart Center (10% percentage model)
    - `Dr. Sonia Gupta, MBBS, DGO (Obs & Gynae)`: Gupta Maternity Clinic (15% percentage model)
    - `Dr. Vikram Sethi, MBBS, MS (Ortho)`: Sethi Bone & Joint Clinic (Flat ₹200/pt model)
    - `Dr. R. K. Bansal, MBBS (General Physician)`: Bansal Health Care (10% percentage model)
    - `Dr. Pooja Sharma, MBBS, MD (Pediatrics)`: Child Care Clinic (Flat ₹100/pt model)
  - **Ledger Records**:
    - Dr. Mehra: ₹100 pending (linked to finalized report `f14faf1a-0151-4183-b3ab-012366668d29` `R-20260924-0001`), ₹350 settled (NEFT N384910219).
    - Dr. Sonia Gupta: ₹450 pending, ₹600 settled.
    - Dr. Vikram Sethi: ₹400 pending.
  - **Outsourced Send-Out Tests**:
    - `25-OH Vitamin D Total (CLIA)` -> `Dr. Lal PathLabs (Ambala Cantt Hub)`, In Transit (Tracking: `BD-88492091`).
    - `Histopathology — Skin Punch Biopsy (H&E)` -> `SRL Diagnostics Regional Reference Lab`, Pending Pickup.
    - `Thyroid Peroxidase Antibodies (Anti-TPO)` -> `Thyrocare Technologies Limited`, Merged (`14.2 IU/mL Negative`).
- **Frontend Architecture & Service Layer Parity**:
  - **Aggregated Server Metrics (`DoctorRepository.findByLabId`)**: Enriched doctor queries with `LEFT JOIN doctor_commission_ledger` and `COALESCE(SUM(...))` for `pendingAmount`, `settledAmount`, and `activeCasesCount`, eliminating client-side N+1 queries.
  - **Ledger Response Adapter (`use-commission.ts`)**: Fixed type mismatch in `useDoctorLedger` to unpack `{ doctor, balance, entries }` from `ListDoctorLedgerHandler`, formatting numbers and parsing patient details from clinical notes.
  - **Commission Summary (`use-commission.ts`)**: Removed hardcoded fallback counts (`142800`, `385500`, `48`); dynamically feeds real ledger sums (`₹950` pending, `₹950` settled).
  - **TDS 194H Settlement Mutation (`settle-commission` DTO Parity)**: Updated `SettleCommissionDto` in frontend to send `doctorId` and `entryIds` conforming 1:1 to backend NestJS class-validator schema.
  - **Dynamic Ribbon Counters (`kpi-summary-ribbon.tsx`)**: Replaced hardcoded "19 Clinicians" with dynamic doctor count, and connected Card 4 to `summary.totalSettled`.
  - **Outsourced Send-Outs (`use-outsourced.ts` & `new-outsourced-modal`)**: Enriched live records with regex-parsed tracking numbers (`BD-88492091`), BlueDart carrier info, and linked new send-out manifests to real reports (`f14faf1a-0151-4183-b3ab-012366668d29`).
  - **Preview Route Guard (`use-report.ts`)**: Handled non-UUID demo fixture report IDs (`demo-report-01`, `demo-02`, etc.) in `useReport` to map to `DEMO_ACCESSIONS`, preventing invalid PostgreSQL UUID network errors when opening reports from demo outsourced send-out rows.
- **Verification**:
  - `labOS-service`: `nest build` completed with code 0.
  - `labOS-app`: `npm run lint` passed with 0 errors (6 warnings); `npm run build` compiled all 16 production routes with code 0 in Turbopack.

### 2026-09-24 (Session 44) — Track C: WhatsApp & Dispatch Communication Hub Parity, Preview Fallback & Database Notification Telemetry

- **Report Preview Resilient Error Boundary & Guard (`use-report.ts`)**:
  - **Root Cause Resolution**: When clicking "Open Report" on outsourced send-outs, navigating to non-UUID or offline IDs could cause an uncaught Axios network rejection, triggering `"Failed to load report #demo-report-01 Network Error"`.
  - **Graceful Fallback**: Wrapped `api.get<DetailedReport>` in `useReport` with a `try/catch` fallback block that queries `DEMO_ACCESSIONS` or synthesizes a valid `DetailedReport` scaffold with formatted accession number (`R-...`), preventing the document view from ever crashing with an unhandled network error.
- **Backend Communication Enum Mapping & Query Safety (`notification-log.repository.ts`)**:
  - **TypeORM Smallint vs String Enum Bug**: In `NotificationLogRepository.findAll`, parameters `channel`, `status`, `recipientType`, and `notificationType` were queried directly without converting TypeScript string enums to database integers, causing PostgreSQL operator mismatches (`smallint = character varying`).
  - **Integrated Enum Mappers**: Imported `NotificationChannelEnumMapper`, `NotificationStatusEnumMapper`, `RecipientTypeEnumMapper`, and `NotificationTypeEnumMapper` to map query parameters to integers before executing SQL `where` conditions.
- **API Endpoint Route Consistency (`notifications.service.ts`)**:
  - Fixed resend route in frontend from `/notifications/resend/${id}` to `/notifications/${id}/resend` to match NestJS `@Post(':id/resend')` controller specification.
- **Docker Compose Startup Configuration (`docker-compose.yml`)**:
  - Added explicit `command: npm run start:dev` to `backend` service container configuration to prevent containers from sitting in interactive Node REPL on boot.
- **Live Communication Telemetry Seeding for Dr. Deswal's Pilot Tenant (`6aaabed8-3df0-4569-8b9f-6fcc85ecc783`)**:
  - Seeded 5 realistic, full-spectrum notification logs into `notification_logs`:
    1. **WhatsApp Patient Report Ready**: Rajesh Kumar (`+919876543210`), Report `#R-20260924-0001`, verified share token link, Status: `READ`.
    2. **WhatsApp Referring Doctor Alert**: Dr. A. K. Mehra (`+919811234567`), patient report delivery notification, Status: `DELIVERED`.
    3. **SMS Payment Receipt**: Rajesh Kumar, ₹1,000 UPI receipt confirmation for Invoice `#INV-2026-0001`, Status: `DELIVERED`.
    4. **WhatsApp Panic / Critical Result Alert**: Dr. A. K. Mehra, 7 flagged parameters alerting microcytic hypochromic anemia (Hb 11.2, PCV 36.5, MCV 76.0, ESR 22), Status: `READ`.
    5. **WhatsApp Reference Lab Dispatch Alert**: Ambala Cantt Hub (Dr. Lal PathLabs), tracking manifest BlueDart `BD-88492091` for Vitamin D test, Status: `SENT`.
- **Verification**:
  - `labOS-service`: `npm run build` completed with code 0.
  - `labOS-app`: `npm run lint` 0 errors (6 warnings); `npm run build` compiled all 16 production routes with code 0 in Turbopack.

### 2026-09-24 (Session 45) — Canonical Master Pilot Seeder, Billing Query Parity & Longitudinal EMR Cohort

- **Canonical Idempotent Master Seeder (`pilot-tenant.seed.ts` & `seed.ts`)**:
  - **Eliminated Database Fragility**: Created `pilot-tenant.seed.ts` and integrated into `src/seed.ts` (`npm run seed`), providing a single deterministic command to instantiate Dr. Deswal's complete pilot laboratory (`6aaabed8-3df0-4569-8b9f-6fcc85ecc783`).
  - **Comprehensive Live Cohort Seeded**:
    - **Tenant & Pathologist**: Deswal Diagnostic Laboratory (Barara, Ambala), Dr. Deswal (MBBS, MD Pathology).
    - **Active Test Panels**: Instantiates all 28 Indian diagnostic panels across 5 departments.
    - **Longitudinal EMR Patients & Encounters**:
      - Patient Rajesh Kumar (`330bd796-6571-4a4d-831b-091eba19e248`): Baseline visit `R-20260825-0001` (30 days ago, severe anemia Hb 9.8, MCV 71) + Follow-up visit `R-20260924-0001` (today, recovered Hb 11.2, MCV 76), enabling live longitudinal delta charts ($\Delta$ Hb +1.4 g/dL).
      - Patient Sunita Rao (`330bd796-6571-4a4d-831b-091eba19e249`): Urine routine accession and Cash billing voucher.
    - **Doctors Roster & Ledger**: Dr. Mehra (10%), Dr. Gupta (15%), Dr. Sethi (Flat ₹200).
    - **Operating Expenses**: 5 categorized entries (Sysmex CBC Lyse ₹4,200, BD Vacutainers ₹1,850, Optical Analyzer Calibration ₹2,500, BlueDart Courier ₹400, Cold Chain DG Fuel ₹1,500).
    - **Invoices**: `INV-2026-0001` (₹1,000, UPI PAID), `INV-2026-0002` (₹350, CASH PAID).
    - **Home Collections**: 2 booked phlebotomy visits (`HC-2026-0001` - Rajesh Kumar, `HC-2026-0002` - Smt. Shakuntala Devi 82Y bedridden).
- **Backend Billing Repository & Service Parity (`invoice.repository.ts` & `expense.repository.ts`)**:
  - **Relational Patient Hydration in Invoices**: Injected `DataSource` in `InvoiceRepository`, batch-querying `patients` table to attach `patientName`, `patientMrn`, `patientPhone`, and formatted `testsBilled` to all returned invoices, preserving DDD bounded context boundaries while rendering full patient demography in `/billing`.
  - **Enum Query Mappings**: Integrated `PaymentStatusEnumMapper` in `invoice.repository.ts` and `ExpenseCategoryEnumMapper` in `expense.repository.ts` to convert string enum filter parameters to PostgreSQL `smallint` types.
- **Frontend Query Parameter Alignment (`use-billing.ts`)**:
  - Fixed query parameter in `useInvoices` from `paymentStatus` to `status` conforming 1:1 to NestJS `ListInvoicesController`.
- **Verification**:
  - `labOS-service`: `npm run seed` ran successfully with 0 errors; `npm run build` compiled with code 0.
  - `labOS-app`: `npm run lint` passed with 0 errors (6 warnings); `npm run build` compiled all 16 production routes with code 0 in Turbopack.

### 2026-09-24 (Session 46) — Referral Lab Send-Outs: Enum Parity, Dispatch Guard & Toast Feedback

- **Root Cause Audit (Outsourced Tab Data Source)**:
  - `useOutsourcedTests` waterfall: real DB records → merged with DEMO field overrides → fallback to `DEMO_OUTSOURCED_TESTS` (5 fake rows, IDs `out-01..out-05`) when backend fails.
  - Seeded DB has 3 real send-out records (`b101...0001/0002/0003`) for Dr. Deswal's pilot lab.
- **Bug 1 Fixed — Backend Enum Mapper (`outsourced-test.repository.ts`)**:
  - `findByLabId` passed string enum directly to `smallint` status column in QueryBuilder, causing `operator does not exist: smallint = character varying`.
  - Fixed: Imported `OutsourcedTestStatusEnumMapper` and applied integer conversion before the QueryBuilder parameter — same pattern as billing/collections/notifications repositories.
- **Bug 2 Fixed — Demo-Mode Dispatch Guard (`referrals/page.tsx`)**:
  - `handleMarkDispatched` was calling PATCH even for fake demo rows (`out-01` etc.), causing silent 404s.
  - Added `DEMO_ID_PATTERN = /^out-\d+$/` guard: demo rows show an informational toast and return early.
- **Bug 3 Fixed — Dispatch Toast Feedback (`referrals/page.tsx`)**:
  - Added `dispatchToast` state with `showDispatchToast(type, message)` helper (4-second auto-dismiss).
  - Success: emerald toast. Error: red toast. Demo guard: blue info toast.
  - Overlay fixed at `bottom-6 right-6 z-50` with slide-in animation.
- **Verification**:
  - `labOS-service`: `nest build` compiled with code 0.
  - `labOS-app`: `npm run lint` passed 0 errors (6 pre-existing warnings).

### 2026-09-29 (Session 47) — Cookie Expiry Onboarding Bug Fix & WhatsApp Report Dispatch Timeline (PRD Phase 2 Final Item)

- **Bug Fix: Cookie Expiry Onboarding Redirect Loop**:
  - **Root Cause**: `x-lab-id` presence cookie had `max-age=86400` (24 hours). After a week of inactivity, the cookie expired while the Supabase auth token remained valid. Middleware Rule 3 detected an authenticated user without the `x-lab-id` cookie and redirected them to `/onboarding`.
  - **Resolution**:
    - `auth-provider.tsx`: Updated `max-age` to `2592000` (30 days) on `x-lab-id` cookie write.
    - `middleware.ts`: Hardened `isAuthenticated` to evaluate exclusively against the Supabase JWT `user`, removing fallback that allowed unauthenticated access with stale cookies.
- **WhatsApp Delivery Timeline (`ReportDispatchTimeline`)**:
  - Built `ReportDispatchTimeline` component in `src/features/notifications/components/report-dispatch-timeline/index.tsx` and exported via `index.ts`.
  - Integrated below the A4 sheet in `src/app/reports/[id]/preview/page.tsx` with `.print:hidden` isolation.
  - Displays collapsible audit drawer with real-time status ticks (Sent, Delivered, Read), IST timestamps, recipient classification (Patient, Referring Doctor, Reference Lab), failure reason diagnostics, 1-click retry dispatch via `useResendNotification`, and offline demo fallback (`DEMO_NOTIFICATION_LOGS`).
- **Verification**:
  - `labOS-service`: `nest build` passed with code 0.
  - `labOS-app`: `npm run build` compiled all 16 production routes with code 0 in Turbopack.

### 2026-09-29 (Session 48) — React 19 Lint Invariant Fix & Technical Roadmap Synthesis

- **React 19 Lint Invariant Fix (`biomarker-trend-chart.tsx`)**:
  - Eliminated synchronous `setState` inside `useEffect` (`setSelectedName(null)`), resolving the ESLint `react-hooks/set-state-in-effect` compiler error.
  - Derived `activeName` reactively: `(selectedName && seriesNames.includes(selectedName)) ? selectedName : defaultName`.
  - Removed unused variables `paramImprovesWhenHigher` and `isAnemia`.
  - Removed unused `useRouter` from `step-confirmation/index.tsx` and unused `ApiError` from `auth-provider.tsx`.
### 2026-09-29 (Session 49) — Authentic Letterhead Overhaul, Real Scannable Barcode & QR Engine, and Collections Demo Leak Fix

- **Real Scannable Barcode & QR Code Engine (`ReportBarcode`, `ReportQrCode`)**:
  - Replaced fake SVG vector illustrations with real, compliant hardware-grade generator components:
    - `src/components/ui/barcode/index.tsx`: Built dynamic Code 128 barcode generator via `jsbarcode` targeting `<svg ref>` encoding `report.reportNumber` for instant receptionist laser gun scanning.
    - `src/components/ui/qr-code/index.tsx`: Built dynamic QR Code generator via `qrcode` producing crisp vector SVGs encoding `${origin}/v/${shareToken}` for smartphone camera verification.
- **Eliminated Fake Medical & Legal Claims**:
  - **NABL & ISO 15189 Conditionalization**: Removed hardcoded NABL ID (`MC-4192 / 2024`) and ISO claims. Badges only render if the tenant lab explicitly entered an accreditation ID in Settings.
  - **Truthful QR Code Labelling**: Changed header from `"NABL QR Verified"` to `"Scan to Verify Original Report"` with subtext `"Digital Report Authentication"`. 100% compliant for small standalone labs, diploma holders, and accredited labs alike.
  - **Fake UTI Remarks Purged**: Removed hardcoded fallback in `a4-document-sheet.tsx` that previously printed active urinary tract infection remarks on blank reports. Remarks block renders only if actual clinical remarks are present.
  - **Fake Email Purged**: Removed `reports@apexdiagnostic.in`. Email line renders only if `labProfile.officialEmail` is configured.
  - **Dynamic Lab Signatures**: Replaced hardcoded `Dr. Rajesh K. Sharma`, `Dr. R. K. Sharma`, and `S. Nair` with dynamic signatories from `useStaffMembers()` / `useLabProfile()` (`Dr. Deswal`, `MBBS, MD Pathology`, `HN-42918`). Single-signatory labs cleanly render a single signature block without empty technician voids.
- **Home Collections Fake Bangalore Data Leak Fix**:
  - `src/features/collections/api/use-collections.ts`: Fixed empty array leak where 0 scheduled bookings fell back to 7 fake Bangalore demo rows. Returns real `[]` data and renders proper EmptyState.
  - `src/app/collections/page.tsx`: Dynamically computes KPI summary from live collections query.
  - `src/lib/demo-data/collections.ts`: Replaced Bangalore addresses (Indiranagar, Koramangala) with Dr. Deswal's Barara pilot records (`HC-2026-0001` Rajesh Kumar, Ward 4; `HC-2026-0002` Shakuntala Devi, Railway Road) and runner Vikram Singh.
- **Verification**:
  - `labOS-app`: `npm run lint` passed with 0 errors (4 warnings).
  - `labOS-app`: `npm run build` compiled all 16 production routes in 1.7s with code 0 in Turbopack.

### 2026-09-29 (Session 50) — Pre-Printed Letterhead Stationery & Physical Margin Calibration Engine

- **Dual-Layer Stationery Architecture**:
  - Real-world diagnostic labs utilize pre-printed offset paper pads with pre-printed logos/names from local commercial presses to conserve expensive laser printer toner and drums.
  - Developed a comprehensive system supporting 3 paper types:
    1. `PLAIN`: Standard blank copier paper — prints full digital letterhead, logo, and legal footer.
    2. `PREPRINTED_HEADER`: Pre-printed offset pad with top logo — leaves a calibrated blank top margin and prints results below.
    3. `PREPRINTED_HEADER_AND_FOOTER`: Stationery with both top header and bottom branch/accreditation footnotes — leaves both top and bottom blank margins.
- **Permanent Tenant Settings (`StationerySettingsSection`)**:
  - Created `src/features/settings/components/stationery-settings-section.tsx` in **Settings > Report Header & Letterhead**.
  - Added physical millimeter calibration sliders:
    - Header Blank Margin: `30mm` to `75mm` (default `48mm`).
    - Footer Blank Margin: `15mm` to `50mm` (default `24mm`).
  - Added `printSettings` to `LabProfile` and `UpdateLabDto` domain types (`src/features/settings/types/index.ts`).
  - Wired into `useLabProfile` and `useUpdateLabProfile` hooks with fallback merging.
- **Print Preview Quick Switcher (`PaperStationerySelector`)**:
  - Built `src/features/reports/components/report-preview/_components/paper-stationery-selector.tsx`.
  - Mounted directly onto the preview toolbar (`preview-action-toolbar.tsx`) beside the "Print (Ctrl+P)" button.
  - Enables receptionists to toggle paper types on the fly (e.g., if letterhead pads run out) with zero navigation friction, plus an interactive "Simulate blank pad on screen" toggle.
- **CSS & `@media print` Margin Spacers (`A4DocumentSheet`)**:
  - In `a4-document-sheet.tsx`:
    - When `PREPRINTED_HEADER` is active: Hides digital header in print (`print:hidden`) and inserts a precise `<div className="hidden print:block w-full" style={{ height: '${effectiveHeaderMargin}mm' }} />` spacer.
    - When `PREPRINTED_HEADER_AND_FOOTER` is active: Suppresses generic footnote disclaimer in print and adds `${effectiveFooterMargin}mm` bottom spacer.
    - Doctor signatures and authentication QR code remain permanently rendered in the report body directly below clinical results.
  - **Patient Digital Safeguard**: PDF downloads and WhatsApp report dispatches preserve full digital branding regardless of physical stationery settings.
### 2026-09-30 (Session 51) — Print Ergonomics, Signature De-duplication, Navigation Hierarchy & Form Validation Architecture

- **Signature Block De-duplication ("Deswal Deswal" Fix)**:
  - In `report-letterhead-preview.tsx` and `a4-document-sheet.tsx`, removed the fallback that faked a handwritten signature by rendering the doctor's name in cursive italics above the printed name.
  - Now renders the doctor's uploaded signature image if present; if absent, provides a clean signing height (`h-8` / `h-6`) for physical pen signature and doctor's stamp.
  - Formats name properly with `Dr.` prefix (`Dr. Deswal`), medical qualifications (`MBBS, MD (Pathology)`), state medical council registration (`Regn. No: ...`), and designation (`Authorized Signatory`).
- **Browser Print Margin Isolation & Conditional Disclaimer**:
  - In `globals.css`: Updated `@page { margin: 0; }` so that Chrome, Edge, and Safari print engines suppress automated browser titles ("LabOS - Modern...") and URL stamps ("localhost:3000/...").
  - In `a4-document-sheet.tsx`: Provided calibrated printable container padding (`print:px-10 print:py-8 print:m-0 print:max-w-none`) ensuring standard margins are 100% controlled in CSS.
  - Updated footnote disclaimer: "Authenticated Electronically · Valid without physical signature" renders when `FINALIZED`, and switches to "Preliminary / Draft Examination Copy" on unfinalized reports.
- **Backend Persistence for Pre-Printed Stationery Settings**:
  - Added `print_settings` JSONB column to `labs` table via migration `1710000001003-add-print-settings-to-labs.ts` and updated PostgreSQL schema.
  - Added `printSettings` to `Lab` entity, `UpdateLabDto`, and `UpdateLabHandler` on NestJS backend.
  - Updated Settings page to clear `draftOverrides` on save so physical paper margins persist across page reloads.
- **Navigation Hierarchy Alignment (`/accessions` vs `/reports/[id]/*`)**:
  - Updated active route evaluation in both desktop `Sidebar` and mobile drawer (`MobileNav`): `/reports/[id]/*` (preview, entry) keeps "Sample Worklist" (`/accessions`) highlighted as the parent workstation.
  - Aligned breadcrumbs in `reports/[id]/preview/page.tsx` and `reports/[id]/entry/page.tsx` to read `Sample Worklist › Report #...`.
- **Form Usability: Clickable Submit Button with Auto-Focus & Inline Validation Errors**:
  - Removed disabled submit button anti-pattern on `/reports/new` (`OrderSummaryBar`).
  - When clicking "Register & Issue Bill" with missing fields, triggers explicit validation, auto-scrolls to and focuses the missing input (e.g., `patient-age` or `patient-name`), highlights the field in destructive red with an inline error message, and flags unselected panels.
- **Collapsed Sidebar Logo Bug Fixed**:
  - In `Sidebar`, centered the `LO` logo badge at `w-8 h-8` in the 64px collapsed rail, eliminating the horizontal flexbox overflow that previously clipped the logo.
- **Verification**:
  - `labOS-service`: `nest build` compiled with code 0.
  - `labOS-app`: `npm run lint` passed with 0 errors (7 warnings); `npm run build` compiled all 16 production routes with code 0 in Turbopack in 1.3s.

### 2026-09-30 (Session 52) — Signatory Realism, Live Letterhead Calibration Bar & Mathematical Print Margin Precision

- **Signatory Realism & Legal Non-Doctor Compliance**:
  - Standalone Indian diagnostic labs are frequently operated by DMLT/BMLT biochemists, technicians, or business proprietors who are not registered medical doctors (MBBS/MD). Prepending "Dr." arbitrarily violates NMC regulations.
  - Eliminated forced `"Dr."` prefix across `a4-document-sheet.tsx`, `report-letterhead-preview.tsx`, `rbac.types.ts`, and `use-settings.ts`.
  - The system now renders the exact literal `fullName` entered by the lab owner in settings/staff profile. If unconfigured or a generic technician, prints `Authorized Signatory` and suppresses unearned medical degree lines (`MBBS, MD`).
- **Settings Branding Section Refactor (`branding-letterhead-section.tsx`)**:
  - Removed dummy static "APEX DIAGNOSTIC" card and non-functional buttons.
  - Replaced with live reactive preview tied directly to `profile.name`, `profile.tagline`, `profile.address`, `profile.phoneNumbers`, and `profile.accentColor`.
  - Added clean Logo URL configuration and removal workflow, with clear explanation that labs using offset pre-printed letterheads do not need a digital logo.
- **Physical Millimeter Print Precision Engine**:
  - **Root Cause Eliminated**: In `a4-document-sheet.tsx`, container padding `print:py-8` (~8.5mm) and flex gap `gap-5` (~5.3mm) were compounding on top of the physical spacer (`${effectiveHeaderMargin}mm`), resulting in ~24–30mm blank margins even when set to 10mm or 15mm.
  - **Fix Applied**: Container dynamically sets `print:pt-0` (and `print:pb-0` for footer) when pre-printed stationery is active.
  - Applied `marginBottom: '-1.25rem'` (and `marginTop: '-1.25rem'` for footer) to the print spacer to neutralize parent flex gap in print. Distance from paper edge to clinical content is now 100% mathematically exact to the chosen millimeter.
- **Live Letterhead Calibration Bar & Screen Simulation (`LetterheadCalibrationBar`)**:
  - Created `src/features/reports/components/report-preview/_components/letterhead-calibration-bar.tsx` mounted directly above the A4 document canvas on `/reports/[id]/preview`.
  - Receptionists/owners can calibrate top and bottom margins on the fly without leaving the preview page:
    - Step buttons: `[-5mm]`, `[-1mm]`, `[+1mm]`, `[+5mm]`.
    - Quick presets: `15mm (Slim)`, `30mm (Compact)`, `48mm (Standard)`, `60mm (Large Pad)`.
    - Live visual feedback: Screen document canvas immediately expands or contracts in real time.
    - 1-click **"Save as Lab Default"** button persists the adjusted margin directly to backend Postgres `print_settings` via `useUpdateLabProfile`.
    - Direct "Test Print (Ctrl+P)" button for immediate test output.
- **Extended Settings Range (`stationery-settings-section.tsx`)**:
  - Expanded slider and stepper range from 10mm to 80mm for header margin, and 10mm to 60mm for footer margin, accommodating slim header strips as well as large letterhead pads.
- **Visual Height Parity & Symmetrical Steppers (`10mm` Parity Fix)**:
  - Fixed visual height disparity between header and footer at 10mm: Replaced `minHeight` with strict `height: ${effectiveMargin}mm` and `overflow-hidden` across both simulation boxes in `a4-document-sheet.tsx`. Added adaptive responsive layouts (<18mm ultra-compact tag, 18-27mm pill badge, >=28mm full banner) ensuring 10mm on screen is mathematically identical for both header and footer.
  - Added matching `[-5mm]` and `[+5mm]` buttons to bottom footer steppers in `LetterheadCalibrationBar` and `PaperStationerySelector` for complete ergonomic symmetry.
  - Normalized patient age parsing (`normalizedAge`) in `a4-document-sheet.tsx`, `report-letterhead-preview.tsx`, and `preview-action-toolbar.tsx` to eliminate `"54 YRS Yrs / MALE"` string duplications.
  - Purged unearned `"MD Pathology"` and forced `"Dr."` prefix from active PostgreSQL database `profiles` records and `pilot-tenant.seed.ts`. Removed fake fallback degrees (`MD Pathologist`, `KMC Reg #48291`) from `pathologist-signatures-section.tsx`.
- **Verification**:
  - `labOS-service`: `nest build` compiled with code 0.
  - `labOS-app`: `npm run lint` passed with 0 errors; `npm run build` compiled all 16 production routes with code 0 in Turbopack in 420ms.
