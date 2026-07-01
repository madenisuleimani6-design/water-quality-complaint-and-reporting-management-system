# DAWASA Water Quality API

Base URL (development): `http://localhost:8000`

## Authentication

Staff endpoints require JWT. Obtain tokens via:

```http
POST /api/auth/token/
Content-Type: application/json

{"username": "staff_user", "password": "your_password"}
```

Response:

```json
{"access": "<token>", "refresh": "<token>"}
```

Refresh:

```http
POST /api/auth/token/refresh/
Content-Type: application/json

{"refresh": "<refresh_token>"}
```

Send `Authorization: Bearer <access>` on protected requests.

---

## Public endpoints (citizen app)

### Submit complaint

```http
POST /api/complaints/
Content-Type: multipart/form-data
```

| Field | Type | Required |
|-------|------|----------|
| photo | file (JPEG/PNG, max 5 MB) | Yes |
| latitude | float | No |
| longitude | float | No |
| note | string | No |
| phone | string | No |
| area_name | string | No |

Response `201`:

```json
{"id": "uuid", "status": "new"}
```

### List complaints by phone

```http
GET /api/complaints/?phone=0712345678
```

Response `200`:

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "status": "new",
      "areaName": "Kinondoni",
      "submittedAt": "2026-06-10T12:00:00Z",
      "note": "Brown water"
    }
  ]
}
```

### Send OTP

```http
POST /api/citizens/otp/send/
Content-Type: application/json

{"phone": "0712345678"}
```

Response `200`:

```json
{
  "sessionId": "uuid",
  "expiresIn": 300,
  "phone": "+255712345678",
  "devCode": "1234"
}
```

`devCode` is included only when `OTP_MOCK_MODE=true` (local development).

### Verify OTP

```http
POST /api/citizens/otp/verify/
Content-Type: application/json

{"phone": "0712345678", "sessionId": "uuid", "code": "1234"}
```

**Existing user** — response `200`:

```json
{
  "status": "existing",
  "account": { "id": "uuid", "phone": "+255712345678", "fullName": "Jane Citizen" },
  "access": "jwt-access-token",
  "refresh": "jwt-refresh-token"
}
```

**New user** — response `200`:

```json
{
  "status": "new",
  "phone": "+255712345678",
  "access": "registration-jwt",
  "refresh": "registration-refresh-jwt"
}
```

### Register citizen (after OTP, new users only)

```http
POST /api/citizens/register/
Authorization: Bearer <registration-jwt>
Content-Type: application/json
```

```json
{
  "fullName": "Jane Citizen",
  "area": "Kinondoni",
  "latitude": -6.792354,
  "longitude": 39.208328
}
```

Phone is taken from the verified registration token. Response `201`:

```json
{
  "account": {
    "id": "uuid",
    "phone": "+255712345678",
    "fullName": "Jane Citizen",
    "area": "Kinondoni"
  },
  "access": "jwt-access-token",
  "refresh": "jwt-refresh-token"
}
```

Duplicate phone returns `409`.

### Refresh citizen token

```http
POST /api/citizens/token/refresh/
Content-Type: application/json

{"refresh": "jwt-refresh-token"}
```

### Get citizen profile

```http
GET /api/citizens/me/
Authorization: Bearer <citizen-jwt>
```

Response `200` with account fields.

### Update citizen profile

```http
PATCH /api/citizens/me/
Authorization: Bearer <citizen-jwt>
Content-Type: application/json
```

```json
{
  "fullName": "Jane M. Citizen",
  "secondaryPhone": "0712345679",
  "email": "jane@example.com",
  "area": "Temeke",
  "latitude": -6.792354,
  "longitude": 39.208328,
  "newPhone": "0712345679"
}
```

### Login citizen (deprecated)

```http
POST /api/citizens/login/
Content-Type: application/json

{"phone": "0712345678", "fullName": "Jane Citizen"}
```

Legacy name+phone match. Prefer OTP flow for new clients.

Response `200` with account fields, or `404` if no match.

### Update citizen profile (legacy note)

Profile updates now require `Authorization: Bearer <citizen-jwt>`. Do not send `id` or `phone` for identification.

### Send message to DAWASA

```http
POST /api/messages/
Content-Type: application/json
```

```json
{
  "message": "Hello DAWASA",
  "phone": "0712345678",
  "fullName": "Jane Citizen",
  "email": "jane@example.com",
  "area": "Kinondoni"
}
```

Response `201`:

```json
{"id": "uuid", "status": "sent"}
```

---

## Staff endpoints (JWT required)

### List complaints

```http
GET /api/complaints/?status=new&assigned_to=<uuid>
```

Requires staff role (viewer or above).

### Complaint detail

```http
GET /api/complaints/{id}/
```

### Update complaint

```http
PATCH /api/complaints/{id}/
Content-Type: application/json

{"status": "assigned", "assigned_to": "<staff_uuid>"}
```

- Field officers may update complaints assigned to them.
- Supervisors/admins may reassign.

### Add internal note

```http
POST /api/complaints/{id}/notes/
Content-Type: application/json

{"note": "Inspect main line near junction."}
```

### List staff users

```http
GET /api/users/
```

Requires supervisor or admin role.

### List reports

```http
GET /api/reports/
```

### Download report PDF

```http
GET /api/reports/{id}/download/
```

### Generate monthly report

```http
POST /api/reports/generate/
Content-Type: application/json

{"year": 2026, "month": 5}
```

Requires supervisor or admin role.

---

## WebSocket — live complaint status

```text
ws://localhost:8000/ws/complaints/{complaint_id}/
```

On connect, server sends current status:

```json
{"status": "new"}
```

When staff update status in admin, clients receive:

```json
{"status": "investigating"}
```

Valid statuses: `new`, `assigned`, `investigating`, `resolved`.

---

## Admin dashboard

- URL: `http://localhost:8000/admin/`
- Create staff: `python manage.py createsuperuser` (set role in admin)
- Complaint map: Admin → Complaints → Map (`/admin/complaints/complaint/map/`)
- Registered citizens: Admin → Citizens → Registered citizens
- Citizens map: Admin → Citizens → Citizens map (`/admin/complaints/citizenaccount/map/`)

---

## Error responses

Standard DRF format:

```json
{"detail": "Authentication credentials were not provided."}
```

Validation errors:

```json
{"photo": ["This field is required."]}
```
