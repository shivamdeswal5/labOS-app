# Backend Engineering Standards & Operating Rules (`labOS-service`)

These rules are permanent across all sessions and backend development tasks in `labOS-service`:

## 0. Senior Engineering Mindset & Research Discipline
- **Explain Architectural Decisions:** When proposing changes, always provide clear rationale, highlight trade-offs, and explain why a particular design was chosen over alternatives.
- **Deep Research Before Coding:** When unsure about conventions, patterns, or requirements, **do not guess**. Thoroughly read and analyze relevant files in the codebase, and align with industry-leading production standards and MNC best practices before writing code.
- Keep implementations clean, robust, and maintainable. Avoid speculative abstractions and write production-ready TypeScript.

## 1. Modular Monolith & DDD Bounded Contexts
- All backend code is partitioned strictly into DDD bounded contexts under `src/modules/` (`labs`, `panels`, `reports`, `referrals`, `billing`, `notifications`, `collections`, `websockets`, `shared`).
- **Domain Layer Purity:** Domain entities (`domain/<entity>/<entity>.entity.ts`) and Value Objects must NEVER import NestJS framework decorators (`@Injectable()`, `@Controller()`), HTTP exceptions, or TypeORM drivers into business logic.
- **Rich Value Objects:** Encapsulate validation and domain logic inside Value Objects (e.g. `NormalRange.isOutOfRange(value, sex)`), not procedural helper files.
- **Optimistic Concurrency:** All mutable root entities extend `BaseDomainEntity` carrying the `version` integer column to guard against concurrent overwrites.

## 2. CQRS & Vertical Slice Architecture
- **One Use Case = One Folder:** Each command or query is an isolated vertical slice under `features/<feature>/<slice>/` containing:
  - `<slice>.command.ts` / `<slice>.query.ts` — Typed request intent
  - `<slice>.dto.ts` — Input validation via `class-validator` and `class-transformer`
  - `<slice>.handler.ts` — Pure business logic execution
  - `<slice>.controller.ts` — Dedicated REST route endpoint
  - `<slice>.module.ts` — Slice DI registration module
- **Direct Handler Injection in Controllers:**
  Slice controllers MUST directly inject their dedicated handler (`constructor(private readonly handler: CreateReportHandler)`).
  Never use an untyped dynamic CommandBus returning `Promise<any>`. Direct injection guarantees 100% compile-time type safety, zero reflection lookup overhead, and direct IDE jump navigation.

## 3. Repository Pattern with Dependency Inversion (DIP)
- **Contract in Domain:** Interfaces live in `domain/<entity>/interfaces/<entity>.repository.interface.ts` (e.g. `IReportRepository`).
- **Implementation in Infrastructure:** Concrete TypeORM implementations live in `infrastructure/database/repositories/<entity>.repository.ts` (e.g. `ReportRepository`).
- Handlers inject the repository interface using unique injection tokens (`@Inject(REPORT_REPOSITORY_TOKEN)`). Handlers must never write raw SQL queries or invoke `dataSource.transaction()` directly.

## 4. Integer Enums & ValueTransformers
- **Database:** Smallint integers (`0, 1, 2...`) for compact storage and index speed.
- **TypeScript:** Descriptive string enums (`ReportStatusEnum.FINALIZED = 'FINALIZED'`).
- **Bridge:** Managed via `createEnumTransformer(Mapper, Enum)`.
- **Zero Raw String Equality:** Never write `if (status === 'DRAFT')`. Always compare against first-class enums (`status === ReportStatusEnum.DRAFT`).

## 5. Domain Exceptions & Global Error Handling
- Handlers and domain models must throw typed **Domain Exceptions** (e.g. `EntityNotFoundException`, `LabAlreadyExistsException`).
- **Never throw NestJS HTTP exceptions** (`NotFoundException`, `BadRequestException`) inside application handlers.
- HTTP status mapping is strictly handled at the edge by `AllExceptionsFilter`. This keeps handlers reusable across background workers, CLI seeders, and WebSocket listeners.

## 6. Real-Time WebSockets Standards (`websockets`)
- **CloudEvents Envelope:** All frames broadcast over Socket.IO must conform to `EventMessage<T>` (`channels`, `event`, `timestamp`, `traceId`, `payload`).
- **Room Isolation:** Use `RealtimeRoomBuilder` (`lab:{labId}`, `lab:{labId}:doctors`, `user:{userId}`). Never broadcast globally without tenant scoping.
- **In-Process Domain Event Bridging:** Domain events emitted via `EventEmitter2` are bridged in memory by `DomainEventsBridgeListener` to WebSocket rooms. Never make self-calling HTTP roundtrips.

## 7. Background Job Queue (`pg-boss`)
- Use PostgreSQL-backed `pg-boss` for background tasks (vector PDF generation, batch notifications).
- Zero external Redis/RabbitMQ dependencies. Jobs run reliably on existing Postgres using `SKIP LOCKED` row locks.

## 8. Code Hygiene, Imports & Structure
- **One Entity Per File:** Every database entity must reside in its own dedicated file.
- **Single-Table Migrations:** One dedicated migration per table under `infrastructure/database/migrations/`.
- **Clean Imports:** Use `src/*` path aliases (`import { Lab } from 'src/modules/labs/domain/lab/lab.entity'`). Never use `.js` extensions or deep relative paths (`../../../../`).
- **No Barrel Files in Domain:** Avoid domain `index.ts` barrel files to prevent TypeORM circular relation reference errors.

## 9. Clinical & Operational Guardrails
- **Timestamps:** Store all timestamps in UTC (`timestamptz`). Never format or localize timestamps in database columns.
- **Currency & Prices:** Store all monetary columns as `decimal(10,2)` (e.g. `test_panels.price`, `invoices.total_amount`).
- **Tenant Scope Enforcement:** Every query must enforce `lab_id = user.labId` resolved via `@CurrentUser()`. Never trust client-supplied tenant identifiers.

