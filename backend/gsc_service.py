from datetime import datetime, timedelta
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import json
import pandas as pd

SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']

def get_service(credentials_json):
    import json
    creds_data = json.loads(credentials_json)
    
    # If it doesn't have refresh_token, try to use it as-is with other fields
    # The credentials object should have token, which is enough for API calls
    from google.oauth2.credentials import Credentials
    
    creds = Credentials(
        token=creds_data.get('token'),
        refresh_token=creds_data.get('refresh_token'),
        token_uri=creds_data.get('token_uri'),
        client_id=creds_data.get('client_id'),
        client_secret=creds_data.get('client_secret'),
        scopes=creds_data.get('scopes', SCOPES)
    )
    
    return build('searchconsole', 'v1', credentials=creds)

def get_sites(credentials_json):
    service = get_service(credentials_json)
    site_list = service.sites().list().execute()
    return site_list.get('siteEntry', [])

def get_analytics(credentials_json, site_url, page_filter=None):
    service = get_service(credentials_json)
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=10)
    
    request = {
        'startDate': start_date.isoformat(),
        'endDate': end_date.isoformat(),
        'dimensions': ['date'],
        'rowLimit': 25000,
        'dataState': 'all'
    }
    
    if page_filter:
        request['dimensionFilterGroups'] = [{
            'filters': [{
                'dimension': 'page',
                'operator': 'contains',
                'expression': page_filter
            }]
        }]
        
    response = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
    rows = response.get('rows', [])
    
    # Process data into a cleaner format
    data = []
    for row in rows:
        data.append({
            'date': row['keys'][0],
            'clicks': row['clicks'],
            'impressions': row['impressions'],
            'ctr': row['ctr'],
            'position': row['position']
        })
        
    # Sort by date
    data.sort(key=lambda x: x['date'])
    
    return data

def get_urls_analytics(credentials_json, site_url, page_filter=None):
    service = get_service(credentials_json)
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=10)
    
    request = {
        'startDate': start_date.isoformat(),
        'endDate': end_date.isoformat(),
        'dimensions': ['page'],
        'rowLimit': 25000,
        'dataState': 'all'
    }
    
    if page_filter:
        request['dimensionFilterGroups'] = [{
            'filters': [{
                'dimension': 'page',
                'operator': 'contains',
                'expression': page_filter
            }]
        }]
    
    response = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
    rows = response.get('rows', [])
    
    # Process data into a cleaner format
    data = []
    for row in rows:
        data.append({
            'url': row['keys'][0],
            'clicks': row['clicks'],
            'impressions': row['impressions'],
            'ctr': row['ctr'],
            'position': row['position']
        })
    
    # Sort by clicks descending
    data.sort(key=lambda x: x['clicks'], reverse=True)
    
    return data

def get_url_time_series(credentials_json, site_url, page_url):
    service = get_service(credentials_json)
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=10)
    
    request = {
        'startDate': start_date.isoformat(),
        'endDate': end_date.isoformat(),
        'dimensions': ['date'],
        'dimensionFilterGroups': [{
            'filters': [{
                'dimension': 'page',
                'operator': 'equals',
                'expression': page_url
            }]
        }],
        'rowLimit': 25000,
        'dataState': 'all'
    }
    
    response = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
    rows = response.get('rows', [])
    
    # Process data into a cleaner format
    data = []
    for row in rows:
        data.append({
            'date': row['keys'][0],
            'clicks': row['clicks'],
            'impressions': row['impressions'],
            'ctr': row['ctr'],
            'position': row['position']
        })
    
    # Sort by date
    data.sort(key=lambda x: x['date'])
    
    return data
