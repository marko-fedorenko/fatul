# How to Deploy to Railway

This guide explains how to deploy the GSC Fresh Analytics app to Railway.

## Prerequisites
1.  **GitHub Account**: You need access to the repository: [https://github.com/marko-fedorenko/tra-pa-tu](https://github.com/marko-fedorenko/tra-pa-tu)
2.  **Railway Account**: Sign up at [railway.app](https://railway.app).

## Step 1: Create Project on Railway
1.  Go to your Railway Dashboard.
2.  Click **"New Project"**.
3.  Select **"Deploy from GitHub repo"**.
4.  Select the repository `marko-fedorenko/tra-pa-tu`.
5.  Click **"Deploy Now"**.

## Step 2: Configure Environment Variables
Once the project is created, go to the **Settings** or **Variables** tab of your service. Add the following variables:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | (Optional) Railway usually sets this automatically, but good to be explicit. |
| `FRONTEND_URL` | `https://<your-project-url>.up.railway.app` | The URL Railway assigns to your app. You can find this in the Settings -> Networking section after the first build (or generate a domain first). |
| `BACKEND_URL` | `https://<your-project-url>.up.railway.app` | Same as above (since it's a single app serving both). |
| `GOOGLE_CREDENTIALS` | *[Paste JSON Content]* | **CRITICAL:** Open your local `client_secret.json` file, copy the **entire content**, and paste it here as the value. This allows the app to authenticate without committing the secret file. |

## Step 3: Update Google Cloud Console
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Navigate to **APIs & Services** > **Credentials**.
3.  Edit your OAuth 2.0 Client ID.
4.  Under **Authorized redirect URIs**, add your Railway URL:
    *   `https://<your-project-url>.up.railway.app/api/auth/callback`
    *   (Replace `<your-project-url>` with the actual domain from Railway).
5.  Save changes.

## Step 4: Redeploy
1.  Railway usually redeploys automatically when you change variables. If not, click **"Redeploy"**.
2.  Open your app URL.
3.  Login with Google. It should work!

## Troubleshooting
-   **Redirect URI Mismatch**: Ensure the URL in Google Cloud Console EXACTLY matches your Railway URL + `/api/auth/callback`.
-   **Credentials Not Found**: Ensure you pasted the `client_secret.json` content correctly into the `GOOGLE_CREDENTIALS` variable.
