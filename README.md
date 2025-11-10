## A2SV E-commerce API (Node.js + TypeScript + PostgreSQL)

### Stack
- Node.js + TypeScript, Express
- Prisma ORM + PostgreSQL
- JWT Auth (bcrypt)
- Validation: Zod
- Rate limiting: express-rate-limit
- Optional caching: Redis (ioredis)

### Requirements
- Node.js 18+
- PostgreSQL 13+ (running and reachable)
- Optional: Redis 6+ if you want caching (requires `ioredis`)

### Environment Variables
Create a `.env` file in the project root with the following variables:

```
# Server
PORT=3000
NODE_ENV=development

# Database (required)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/a2sv_ecommerce?schema=public

# JWT (required)
JWT_SECRET=replace-with-a-strong-random-secret
JWT_EXPIRES_IN=7d

# Redis (optional)
# If set, also install ioredis: npm i ioredis
# REDIS_URL=redis://localhost:6379
```

Required: `DATABASE_URL`, `JWT_SECRET`.
Optional: `REDIS_URL` (if not set, caching is disabled gracefully).

### Getting Started
1. Install dependencies:
   - `npm install`
2. Configure environment:
   - Create `.env` as shown above
3. Set up Prisma (database schema & client):
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`
4. Run in development:
   - `npm run dev`
   - Health check: `GET http://localhost:3000/health`
5. Build and run in production:
   - `npm run build`
   - `npm start`

### API Docs (Swagger)
- After starting the server, open: `http://localhost:3000/docs`
- The OpenAPI spec is at `docs/openapi.json`.

### Documentation
- Swagger UI (live): `http://localhost:3000/docs`
- OpenAPI JSON: `docs/openapi.json`
- Markdown reference: `docs/API.md`

### Testing
- Run all tests: `npm test`
- What’s covered: Auth, Products, and Orders endpoints with mocked Prisma (no real DB).

### Seed Admin (optional)
Use Prisma Studio `npx prisma studio` and set a user `role` to `ADMIN`.

### API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (ADMIN)
- `PUT /api/products/:id` (ADMIN)
- `DELETE /api/products/:id` (ADMIN)
- `POST /api/orders` (USER)
- `GET /api/orders` (AUTH)

Full endpoint details: see `docs/API.md`.

### Tests
- `npm test`
- Tests exercise all HTTP routes with mocked Prisma.

### Notes
- If you enable Redis by setting `REDIS_URL`, install `ioredis`:
  - `npm i ioredis`
- Default server port is `3000` (overridable via `PORT`).



