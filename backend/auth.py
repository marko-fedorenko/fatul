import os
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import json

router = APIRouter()

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_SECRETS_FILE = os.path.join(BASE_DIR, "client_secret.json")
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # For local development

# Get URLs from environment variables
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

@router.get("/auth/login")
async def login(request: Request):
    if not os.path.exists(CLIENT_SECRETS_FILE):
        return {"error": "client_secret.json not found. Please place it in the backend directory."}
    
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=f"{BACKEND_URL}/auth/callback"
    )
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    # In a real app, store state in session to validate callback
    return RedirectResponse(authorization_url)

@router.get("/auth/callback")
async def callback(code: str, state: str = None):
    print(f"DEBUG: callback called with code: {code[:20]}... state: {state}")
    try:
        if not os.path.exists(CLIENT_SECRETS_FILE):
            print("DEBUG: client_secret.json missing")
            raise HTTPException(status_code=500, detail="client_secret.json missing")

        print(f"DEBUG: Creating flow from {CLIENT_SECRETS_FILE}")
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri=f"{BACKEND_URL}/auth/callback"
        )
        
        # Disable strict scope validation since Google adds email/profile scopes
        os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'
        
        print("DEBUG: Fetching token...")
        flow.fetch_token(code=code)
        
        credentials = flow.credentials
        
        print("DEBUG: Converting credentials to JSON...")
        creds_json = credentials.to_json()
        print(f"DEBUG: Credentials JSON length: {len(creds_json)}")
        
        # Redirect to frontend with token (or set cookie)
        # Here we'll redirect to frontend dashboard and pass token in query param (simplified)
        # A better way is to set an HttpOnly cookie.
        
        # Redirect to frontend with token (or set cookie)
        # Here we'll redirect to frontend dashboard and pass token in query param (simplified)
        # A better way is to set an HttpOnly cookie.
        
        
        response = RedirectResponse(url=f"{FRONTEND_URL}/dashboard")
        response.set_cookie(key="gsc_token", value=creds_json, httponly=False) # False so JS can read it for now? Or True and backend handles it.
        # If backend handles it, we need to store it in session.
        # Let's return the creds in the URL fragment or query for the frontend to grab and send back in headers.
        
        # Actually, let's just return the credentials as a JSON response if this was an API call, 
        # but since it's a callback from Google, it's a browser navigation.
        # So we MUST redirect.
        
        # We will set a cookie "gsc_credentials"
        print("DEBUG: Setting cookie and redirecting...")
        response.set_cookie(key="gsc_credentials", value=creds_json, max_age=3600, path="/")
        return response
    except Exception as e:
        print(f"DEBUG: Error in callback: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

def get_service(credentials_json: str):
    creds = Credentials.from_authorized_user_info(json.loads(credentials_json), SCOPES)
    service = build('searchconsole', 'v1', credentials=creds)
    return service
