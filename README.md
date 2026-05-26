# Dharma

Dharma is a MERN-based project management platform with authentication, workspaces, tasks, analytics, notifications, AI assistance, billing, and time tracking.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Zustand, React Router
- Backend: Node.js, Express, Mongoose, JWT, CORS
- Database: MongoDB
- Infrastructure: Docker, Nginx
- Integrations: Gemini, Razorpay, Nodemailer

## Project Structure

- [backend/](backend) contains the Express API, models, services, controllers, and backend Docker files.
- [Frontend/](Frontend) contains the React app, Vite config, client-side source, and frontend Docker files.
- [docs/](docs) contains additional product and operational documentation.
- [backend/Dockerfile](backend/Dockerfile) and [Frontend/Dockerfile](Frontend/Dockerfile) are the two standalone images.

## Docker Files

- [backend/Dockerfile](backend/Dockerfile): production Node image for the API.
- [backend/.dockerignore](backend/.dockerignore): keeps the backend build context small.
- [backend/.env.example](backend/.env.example): backend environment template.
- [Frontend/Dockerfile](Frontend/Dockerfile): multi-stage React build served by Nginx.
- [Frontend/.dockerignore](Frontend/.dockerignore): excludes local build artifacts and env files.
- [Frontend/nginx/default.conf](Frontend/nginx/default.conf): SPA routing and `/api` reverse proxy to the backend container.
- [Frontend/.env.example](Frontend/.env.example): frontend environment template.
- [.env.example](.env.example): root-level sample environment file for both services.

## Local Setup

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection string

### Backend

```bash
cd backend
npm ci
npm start
```

### Frontend

```bash
cd Frontend
npm ci
npm run dev
```

For local development, set `VITE_API_URL=http://localhost:5000/api` in `Frontend/.env.local` or use the root `.env` file.

## Environment Variables

Copy [.env.example](.env.example) to `.env` and fill in the values before running in production.

### Backend variables

- `PORT`: API port. Defaults to `5000`.
- `NODE_ENV`: runtime mode. Use `production` in Docker and Render.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: signing secret for authentication tokens.
- `FRONTEND_URL`: allowed browser origin for CORS.
- `GEMINI_API_KEY`: Gemini API key for AI features.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: mail server configuration.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`: billing configuration.

### Frontend variables

- `VITE_API_URL`: browser-visible API base URL.
- Use `http://localhost:5000/api` for direct local development.
- Use `/api` for the Dockerized nginx frontend, where Nginx proxies API calls to the backend container.

## Run with Docker Compose

The repo now includes a root [docker-compose.yml](docker-compose.yml) that starts MongoDB, the backend API, and the Nginx frontend together.

```bash
docker compose up --build
```

That gives you:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)
- Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

The frontend image is built with `VITE_API_URL=/api`, so browser requests stay same-origin and Nginx forwards `/api` calls to the backend container.
 
## CI/CD test

## Render Deployment

Deploy the backend and frontend as two Render web services.

### Service settings

- Root directory: `backend`
- Environment: Node
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/health`

### Backend service variables

- `NODE_ENV=production`
- `MONGO_URI=<MongoDB Atlas connection string>`
- `JWT_SECRET=<long random secret>`
- `FRONTEND_URL=<deployed frontend origin>`
- `GEMINI_API_KEY=<Gemini API key>`
- `SMTP_HOST=<smtp host>`
- `SMTP_PORT=<smtp port>`
- `SMTP_USER=<smtp username>`
- `SMTP_PASS=<smtp password>`
- `RAZORPAY_KEY_ID=<key id>`
- `RAZORPAY_KEY_SECRET=<key secret>`
- `RAZORPAY_WEBHOOK_SECRET=<webhook secret>`

Do not set `PORT` in Render. Render injects it automatically, and the backend already listens on `process.env.PORT || 5000`.

### Frontend service variables

- `VITE_API_URL=/api`
- `BACKEND_URL=https://<your-backend>.onrender.com`
- `FRONTEND_URL=https://<your-frontend>.onrender.com` on the backend service

The same frontend image works because Nginx renders its proxy target from `BACKEND_URL` at container start.

## Public Deployment URL Placeholder

- Backend URL: `https://your-backend.onrender.com`
- API URL: `https://your-backend.onrender.com/api`
- Frontend URL: `https://your-frontend-domain.example`

If you deploy the frontend separately, set `VITE_API_URL=https://your-backend.onrender.com/api` and rebuild the frontend image.

## Architecture

```text
Browser
  -> Nginx frontend container on :3000
  -> /api/* proxied to backend container on :5000
  -> MongoDB container on the internal Docker network
```

The frontend is served as static assets by Nginx. API requests stay on the same origin in Docker, which avoids cross-origin browser issues. The backend connects to MongoDB through a shared Docker network and uses environment variables for all external integrations.

## Troubleshooting

- If the backend exits early, check `MONGO_URI` and confirm MongoDB is healthy.
- If frontend requests fail in Docker, verify that Nginx is proxying `/api` to the `backend` container and that both containers share the same network.
- If local development calls fail, confirm `VITE_API_URL=http://localhost:5000/api` and that the backend is running on port `5000`.
- If CORS errors appear on Render, confirm `FRONTEND_URL` exactly matches the deployed frontend origin, including the protocol.
- If billing or AI features fail, confirm the related secrets are present in the environment.

## Manual Follow-Up You May Still Need

- Replace placeholder secrets in `.env` or in Render with real production values.
- Point `MONGO_URI` to MongoDB Atlas for production instead of the local Docker MongoDB service.
- Create the Docker network and run both containers with the same network name so the frontend can resolve `backend`.
