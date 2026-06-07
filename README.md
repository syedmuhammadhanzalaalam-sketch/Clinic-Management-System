# Clinic Management System — Next.js + Neon PostgreSQL

## Setup in 4 Steps

### Step 1 — Create .env file
Create a file called `.env` in the project root:

```env
DATABASE_URL="postgresql://neondb_owner:npg_t2REPg7AxmGN@ep-small-wildflower-aq66un2j-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_t2REPg7AxmGN@ep-small-wildflower-aq66un2j-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
APP_SECRET="any-strong-secret-string"
AI_PROVIDER="local"
NEXT_PUBLIC_API_URL=""
```

### Step 2 — Create tables in Neon
1. Go to https://console.neon.tech
2. Open your project → click "SQL Editor"
3. Paste the entire contents of `neon-setup.sql`
4. Click Run

### Step 3 — Install & setup
```bash
npm install
npx prisma generate
node seed.js
```

### Step 4 — Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Login Credentials
| Role    | Email                | Password |
|---------|----------------------|----------|
| Admin   | admin@clinic.test    | password |
| Doctor  | doctor@clinic.test   | password |
| Patient | patient@clinic.test  | password |

---

## Deploy to Netlify
1. Push to GitHub
2. Connect repo to Netlify
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables in Netlify dashboard:
   - `DATABASE_URL` — your Neon connection string
   - `DIRECT_URL` — same as DATABASE_URL
   - `APP_SECRET` — any strong secret
   - `NEXT_PUBLIC_API_URL` — leave empty
6. Deploy!
