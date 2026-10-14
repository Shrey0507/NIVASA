# NIVASA API examples

Protected examples use a Supabase access token:

```http
GET /api/students?page=1&limit=20&status=active
Authorization: Bearer <access-token>
```

```json
{
  "data": [{ "id": "uuid", "usn": "1MS22CS001", "full_name": "Student Name", "status": "active" }],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

Create a grievance as a student:

```http
POST /api/grievances
Authorization: Bearer <access-token>
Content-Type: application/json

{"title":"Water issue","category":"maintenance","description":"No water in block A"}
```

Create a fee record as an admin:

```http
POST /api/fees
Authorization: Bearer <admin-access-token>
Content-Type: application/json

{"student_id":"uuid","amount":45000,"fee_type":"hostel","due_date":"2026-11-01"}
```

Errors are consistent:

```json
{"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action"}}
```

## Authentication and account provisioning

There is no public signup endpoint. `POST /api/auth/signup` is intentionally not registered.

Login accepts an email or normalized username:

```http
POST /api/auth/login
Content-Type: application/json

{"identifier":"student@example.edu","password":"<password>"}
```

Only a verified `super_admin` or assigned `hostel_admin` can provision a student account. The backend sends a Supabase invitation and never returns or stores a password:

```http
POST /api/accounts/students
Authorization: Bearer <admin-access-token>
Content-Type: application/json

{"usn":"1MS22CS001","full_name":"Student Name","email":"student@example.edu","username":"student.001","hostel":"boys","department":"CSE","year":2}
```

Super Admins may create hostel-admin invitations with `POST /api/accounts/admins`. Account listing, invitation resend, and deactivation are protected under `/api/accounts`.
