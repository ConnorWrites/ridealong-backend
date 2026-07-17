# RideAlong — Backend

The backend API for **RideAlong**, a full-stack ridesharing application. Handles authentication, ride management, ride requests, and routing coordination.

🔗 Frontend repo: [ridealong-frontend]()

## Features

- 🔐 JWT authentication with HTTP-only cookies
- 🚗 Ride creation and management (CRUD)
- 🤝 Ride request matching (rider ↔ driver)
- 🗺️ Routing coordination via OSRM
- 🖼️ Image upload/storage handling

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Runtime    | Node.js, Express, TypeScript |
| Database   | PostgreSQL, Prisma ORM |
| Routing    | OSRM (routing engine) |
| Auth       | JWT, HTTP-only cookies |

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL instance (local or hosted)
- npm or yarn

### Installation

```bash
git clone 
cd ridealong-backend

npm install

cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, OSRM_BASE_URL, CORS_ORIGIN, etc.

npx prisma migrate dev

npm run dev
```

### Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/ridealong
JWT_SECRET=your-secret-here
OSRM_BASE_URL=https://your-osrm-instance
CORS_ORIGIN=http://localhost:5173
COOKIE_DOMAIN=localhost
```

## Project Structure

```
ridealong-backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── ...
├── prisma/
│   └── schema.prisma
└── README.md
```

## API Overview

| Endpoint            | Method | Description |
|----------------------|--------|--------------|
| `/api/auth/signup`   | POST   | Register a new user |
| `/api/auth/login`    | POST   | Log in, sets auth cookie |
| `/api/rides`         | GET/POST | List or create rides |
| `/api/ride-requests` | GET/POST | List or create ride requests |


## Architecture Notes

- **Auth**: JWT stored in HTTP-only cookies rather than localStorage, to reduce XSS token-theft risk. Currently 7-day expiry, under review for shared-device scenarios.
- **Cross-origin cookies**: `CORS_ORIGIN` and cookie `SameSite`/`Secure`/domain settings must match your frontend's deployed origin, or auth cookies won't be sent/accepted.
- **Database**: Prisma provides type-safe queries and schema-first migrations.

## Known Issues Solved

- Cross-origin cookie handling between frontend and backend origins
- TypeScript config alignment
- Git buffer limits when committing larger assets
- Image storage strategy (kept out of repo/DB directly)

## Roadmap

- [ ] Deploy live instance (Render/Railway)
- [ ] Automated tests
- [ ] Rate limiting on auth routes

## License
??? I don't know what to put here.
