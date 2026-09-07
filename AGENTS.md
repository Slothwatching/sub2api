# Sub9API development continuity

The canonical private records repository is `Slothwatching/sub9api-ops`, checked out at `/Users/victorwu/Developer/sub9api-ops`. Its `decisions/sub9api-development-log.md` is the source of truth; the existing external log path is a compatibility symlink. Update and commit/push authorized decision/operations records in that private repository; keep secrets out.

Before starting work and before each batch of changes, read the effective decisions and relevant history in `/Users/victorwu/Developer/sub9api-development-log.md`. Append the purpose, affected scope, decision references, validation results, and remaining work after each batch. Preserve superseded decisions as history; do not overwrite their rationale. Never log credentials or private user data.

The current UI work is a **full-feature visual redesign** using the warm ivory / forest green direction and a coordinated dark theme. Preserve all routes, controls, fields, filters, exports, bulk actions, client integrations, permission checks, feature switches, and Chinese/English localization. Do not reintroduce the superseded plan to hide payments, orders, affiliates, or other features.

Keep branding driven by existing administrative settings. Do not rename internal protocol or locale-storage identifiers. Preserve the Sub2API stack, APIs, routing, authentication, scheduling, billing, and schemas. Remove only verified static third-party advertising, never user-configured content or business features. Retain license and source attribution records.

If the external log is unavailable on another machine, follow these constraints and report the missing history; do not infer that old, superseded decisions are active.

The latest user explicitly authorized removing static repository promotion links from the product UI; retain LICENSE/source records, operational update/rollback tools, functional help and administrator-configured content. The latest layout direction uses a desktop top workspace navigation for users, a contained administration workspace, split authentication, and responsive workbenches. Theme preserves saved light/dark; only explicit `system` follows the system, and missing or invalid preferences default to light using the existing `theme` key.

The current commercial-experience phase is authorized to add /connect, getting-started guidance, accurate status/billing explanations, and administrator-configured community cards through the existing settings API. Preserve existing routes and core APIs; no core schema, gateway, scheduling or billing changes. The proposed ticket system was superseded by community links: do not implement tickets, support message tables, invoicing or withdrawals. Upstream automation prepares tested PRs only; it never merges or deploys automatically.
