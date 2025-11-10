## A2SV E-commerce API (Node.js + TypeScript + PostgreSQL)

### Stack
- Node.js + TypeScript, Express
- Prisma ORM + PostgreSQL
- JWT Auth (bcrypt)
- Validation: Zod
- Rate limiting: express-rate-limit
- Optional caching: Redis (ioredis)

### Getting Started
1. Install deps: `npm install`
2. Configure env: create `.env` using `.env.example` values
3. Prisma:
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`
4. Dev: `npm run dev`
5. Build: `npm run build` and `npm start`

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

### Tests
Planned with Jest + Supertest and mocked Prisma.



