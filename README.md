
# renart-case (final, CDN images)

This bundle is ready for:
- Local dev with Vite (client) + optional Express API
- Zero-cost deploy on Cloudflare Pages (Functions included)
- Docker compose (client+api)

## Dev
```
cd client
cp .env.example .env
npm install
npm run dev   # http://localhost:5173

# optional API
cd ../server
cp .env.example .env
npm install
npm run dev   # http://localhost:8080/api/health
```

## Docker
```
docker compose up -d --build
# App: http://localhost
```

## Cloudflare Pages
- Build command: `npm --prefix client ci && npm --prefix client run build`
- Output directory: `client/dist`
- Functions directory: `functions/api`
