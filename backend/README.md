# NIVASA Backend

Secure Express REST API for the existing NIVASA Supabase project.

## Run locally

```powershell
cd backend
Copy-Item .env.example .env
# Fill SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm.cmd install
npm.cmd test
npm.cmd start
```

The API listens on `http://localhost:5000` by default. Public checks are `GET /api/health/live`, `GET /api/health/ready`, and `GET /api/health`.

## Configuration

- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never put it in the frontend or commit `.env`.
- `CLIENT_URL` accepts a comma-separated allowlist of frontend origins.
- Every protected endpoint requires `Authorization: Bearer <Supabase access token>`.
- The server verifies the token with Supabase Auth, then loads `user_profiles`; the client cannot grant itself admin access.
- Expected profile roles are `student`, `hostel_admin`, and `super_admin`; legacy operational roles may remain during migration. Students must have a linked `student_id`, and hostel admins must have a `hostel` scope of `boys` or `girls`.

## API groups

- `/api/auth/me`
- `/api/auth/login` (email or normalized username; no public signup route)
- `/api/accounts` (protected invitation-based provisioning, resend, deactivation)
- `/api/students`
- `/api/hostels`, `/api/blocks`, `/api/rooms`
- `/api/allocations`
- `/api/fees`
- `/api/movements`
- `/api/grievances`
- `/api/notices`
- `/api/mess`
- `/api/dashboard`

List responses use `{ data, pagination: { page, limit, total, totalPages } }`. Errors use `{ error: { code, message, details? } }`. Students can only list their own fees, movements, and grievances; admin roles manage the complete collections.

## Existing-schema safety

`supabase/schema.sql` is a legacy reference and is not safe to execute against the existing project: it uses `fees`/`mess_menu`, while the project instructions identify `fee_records`/`mess_menus` and additional hierarchy tables. Do not run it.

Run the read-only checker after network access is available:

```powershell
npm.cmd run check:schema
```

The supplied migrations are additive: `20261014_atomic_room_allocations.sql` and `20261014_usernames.sql`. Review their column names against the live tables before applying them. The API refuses allocation/vacation with `MIGRATION_REQUIRED` until the RPC functions exist; it never performs an unsafe read-then-write fallback.

## First Super Admin bootstrap

Create the first user through Supabase Auth using an email you control. After confirming its Auth UUID, run a narrowly scoped SQL update in the Supabase SQL editor (replace both placeholders manually):

```sql
update public.user_profiles
set role = 'super_admin', status = 'active'
where id = '<verified-auth-user-uuid>';
```

Do not expose this as an API endpoint and do not select the account by an unauthenticated email parameter. Once the first Super Admin signs in, use `/api/accounts/admins` to invite assigned hostel admins.

## Frontend integration

Create a frontend API client using `supabase.auth.getSession()` and send the session access token as a Bearer token to `VITE_API_URL` (for example `http://localhost:5000/api`). Replace mock service calls in `src/services/*` incrementally; keep the existing UI field mapping in one adapter module.

## Render deployment

- Build command: `npm ci`
- Start command: `npm start`
- Root directory: `backend`
- Set `NODE_ENV=production`, `CLIENT_URL` to the deployed frontend origin, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in Render environment variables.
- Do not expose the service-role key in Vite variables.
- Verify `/api/health/ready` and `/api/health` after deployment.
