from fastapi import FastAPI, Depends, HTTPException, Cookie
from fastapi.middleware.cors import CORSMiddleware
from .auth import router as auth_router
from .gsc_service import get_sites, get_analytics, get_urls_analytics, get_url_time_series
import json
import os
from typing import Optional

app = FastAPI()

# Get frontend URL from environment variable, default to localhost for development
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

origins = [
    FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "GSC Analytics API is running"}

@app.get("/api/sites")
def list_sites(gsc_credentials: Optional[str] = Cookie(None)):
    import sys
    print(f"DEBUG: list_sites called. Creds present: {bool(gsc_credentials)}", flush=True)
    sys.stdout.flush()
    if not gsc_credentials:
        print("DEBUG: No credentials found in cookie", flush=True)
        sys.stdout.flush()
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        print(f"DEBUG: calling get_sites with creds length: {len(gsc_credentials)}", flush=True)
        sys.stdout.flush()
        sites = get_sites(gsc_credentials)
        print(f"DEBUG: get_sites returned: {len(sites)} sites", flush=True)
        sys.stdout.flush()
        return sites
    except Exception as e:
        print(f"DEBUG: Error in list_sites: {e}", flush=True)
        import traceback
        traceback.print_exc()
        sys.stdout.flush()
        # Also write to file
        with open('error.log', 'a') as f:
            f.write(f"\n\n=== Error at {__import__('datetime').datetime.now()} ===\n")
            f.write(f"Error: {e}\n")
            traceback.print_exc(file=f)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data")
def get_data(site_url: str, page_filter: Optional[str] = None, gsc_credentials: Optional[str] = Cookie(None)):
    if not gsc_credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        data = get_analytics(gsc_credentials, site_url, page_filter)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/urls")
def get_urls(site_url: str, page_filter: Optional[str] = None, gsc_credentials: Optional[str] = Cookie(None)):
    if not gsc_credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        data = get_urls_analytics(gsc_credentials, site_url, page_filter)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/url-timeseries")
def get_url_ts(site_url: str, page_url: str, gsc_credentials: Optional[str] = Cookie(None)):
    if not gsc_credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        data = get_url_time_series(gsc_credentials, site_url, page_url)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
