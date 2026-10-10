# Gloryrealm Christian Centre Website

The public website and digital operations platform for Gloryrealm Christian Centre.

Live site: https://grcc-official.vercel.app/

## Delivered now

- Responsive public ministry website
- Sermon publishing and individual sermon pages
- Events, ministries, gallery, blog and contact sections
- School of Discovery information and application workflows
- Contact and ministry application handling
- Administrative routes for supported operational workflows
- Supabase-backed data and storage integrations
- Resend email integration
- Public inaugural-service registration with server-side validation
- Protected registration listing, filtering, summaries and CSV export
- Idempotent registration references for retry-safe submission handling

## In development or dependent on configuration

- Additional content-management expansion
- Further role-based administration improvements
- Payment functionality where separately configured and verified
- Database-driven sections that are not yet populated on the public site

These items must not be presented as delivered production functionality until their configuration, migration and live behavior have been verified.

## Planned

- Continued expansion of the ministry platform as operational requirements are approved
- Additional reporting, communication and content workflows

Planned scope is directional and is not a delivery commitment.

## Technology

- Next.js App Router and TypeScript
- Tailwind CSS
- Supabase/PostgreSQL and Supabase Storage
- Resend
- Server-side routes for privileged operations
- Cookie-protected administrative access in the current implementation

## Security and data boundaries

- Service-role database access must remain server-only.
- Public submission does not require anonymous database-read access.
- Conditional fields are validated on the server.
- Registration reference and idempotency constraints protect retry-sensitive flows.
- Administrative list and export routes must retain their authentication boundary.
- Never commit real credentials, private ministry records or participant data.

The current cookie-based administrative protection should be reviewed before treating it as a long-term role-based authentication system.

## Local setup

1. Create .env.local with the required Supabase, Resend, admin and site configuration.
2. Install dependencies with npm install.
3. Run npm run dev.
4. Open http://localhost:3000.

## Useful checks

    npm run lint
    npx tsc --noEmit
    npm run build

Apply required migrations separately and verify protected routes with non-production data. Local checks do not prove that a migration or deployment is active.

## Public-proof boundary

Public pages and approved anonymised demonstrations may be used as project evidence. Do not publish registration records, contact messages, administrative data or unapproved internal ministry information. Do not claim attendance, conversion or engagement metrics without authorised records.

Developed by [KD Global](https://www.kdevglobal.com/).
