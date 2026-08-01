import httpx
import uuid
import urllib.parse
import os
from sqlalchemy.orm import Session
from backend.models.publishing import OAuthState

class OAuthHandler:
    LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
    LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"

    def __init__(self, db: Session):
        self.db = db

    def generate_state(self, platform_name: str) -> str:
        state = str(uuid.uuid4())
        oauth_state = OAuthState(state=state, platform_name=platform_name)
        self.db.add(oauth_state)
        self.db.commit()
        return state

    def validate_state(self, state: str, platform_name: str) -> bool:
        oauth_state = self.db.query(OAuthState).filter(
            OAuthState.state == state,
            OAuthState.platform_name == platform_name
        ).first()
        if oauth_state:
            self.db.delete(oauth_state)
            self.db.commit()
            return True
        return False

    def get_authorization_url(self, platform_name: str) -> str:
        state = self.generate_state(platform_name)
        
        if platform_name.lower() == "linkedin":
            client_id = os.getenv('LINKEDIN_CLIENT_ID')
            if not client_id:
                raise ValueError("LINKEDIN_CLIENT_ID not configured")
            params = {
                "response_type": "code",
                "client_id": client_id,
                "redirect_uri": os.getenv('OAUTH_REDIRECT_URI', 'http://localhost:8000/api/publishing/callback'),
                "state": state,
                "scope": "openid profile email w_member_social"
            }
            url = f"{self.LINKEDIN_AUTH_URL}?{urllib.parse.urlencode(params)}"
            return url
            
        raise ValueError(f"Unsupported platform: {platform_name}")

    async def exchange_code_for_token(self, platform_name: str, code: str) -> dict:
        async with httpx.AsyncClient() as client:
            if platform_name.lower() == "linkedin":
                data = {
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": os.getenv('OAUTH_REDIRECT_URI', 'http://localhost:8000/api/publishing/callback'),
                    "client_id": os.getenv('LINKEDIN_CLIENT_ID', ''),
                    "client_secret": os.getenv('LINKEDIN_CLIENT_SECRET', '')
                }
                headers = {"Content-Type": "application/x-www-form-urlencoded"}
                resp = await client.post(self.LINKEDIN_TOKEN_URL, data=data, headers=headers)
                if resp.status_code >= 400:
                    raise ValueError(f"LinkedIn Token Error {resp.status_code}: {resp.text}")
                resp.raise_for_status()
                return resp.json()

        raise ValueError(f"Unsupported platform: {platform_name}")
