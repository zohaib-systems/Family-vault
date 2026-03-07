# Family Vault Deployment

## Architecture
- Backend: Node.js + Express + MongoDB Atlas
- Frontend: Vite React static site

## 1. Deploy Backend (Render)
1. Push this repo to GitHub.
2. Create a new Web Service in Render from this repo.
3. Configure:
- Root Directory: `.`
- Build Command: `npm install`
- Start Command: `npm start`
4. Add environment variables from `.env.example`:
- `PORT` (Render sets this automatically; optional)
- `MONGODB_URI`
- `JWT_SECRET`
- `ENCRYPTION_SECRET`
- `FRONTEND_ORIGIN` (set this after frontend URL is known)
5. Deploy and verify:
- `GET https://<your-backend>/health`
- `GET https://<your-backend>/pingdb`

## 2. Deploy Frontend (Netlify)
1. Create new site from GitHub repo.
2. Configure:
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
3. Add environment variable:
- `VITE_API_BASE_URL=https://<your-backend-domain>`
4. Deploy.

## 3. Final CORS update
1. Copy frontend production URL.
2. Set backend env var `FRONTEND_ORIGIN` to that URL.
3. Redeploy backend.

## 4. Smoke test in production
1. Signup a user.
2. Login.
3. Generate and add a password.
4. List and view password.

## Notes
- Do not commit real `.env` files.
- Rotate secrets if exposed.
