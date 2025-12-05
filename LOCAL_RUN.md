# How to Run Locally (Node.js Version)

The application has been migrated to a Node.js backend.

## Prerequisites
- Node.js installed.
- `client_secret.json` placed in the `backend/` folder (or root).

## Setup
1.  Install dependencies for both backend and frontend:
    ```bash
    npm install
    cd frontend
    npm install
    cd ..
    ```

## Running the App
1.  From the root directory (`gsc-fresh-analytics`), run:
    ```bash
    npm run dev
    ```
    This command uses `concurrently` to start both the Node.js backend (port 3000) and the Vite frontend (port 5173).

2.  Open your browser to `http://localhost:5173`.

## Deployment (Railway)
- The project is configured for Railway.
- `Procfile` is set to `web: node server.js`.
- Ensure you set `FRONTEND_URL` and `BACKEND_URL` environment variables in Railway.
