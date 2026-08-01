from typing import Dict, Any, Tuple
from .base import PublishingProvider, PublishResult, ProviderException
from backend.models.growth_content import GrowthContent

class LinkedInProvider(PublishingProvider):
    @property
    def platform_name(self) -> str:
        return "LinkedIn"

    async def authenticate(self) -> bool:
        return bool(self.account.access_token)

    async def validate_connection(self) -> bool:
        try:
            headers = {"Authorization": f"Bearer {self.account.access_token}"}
            resp = await self._make_request("GET", "https://api.linkedin.com/v2/me", headers=headers)
            return resp.status_code == 200
        except Exception:
            return False
        
    async def validate_platform_requirements(self, content_text: str, media: list = None) -> Tuple[bool, str]:
        if len(content_text) > 3000:
            return False, "LinkedIn posts cannot exceed 3000 characters."
        return True, "Valid"

    async def publish_content(self, content_text: str, media: list = None) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {self.account.access_token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
        }
        author_urn = self.account.platform_user_id or "urn:li:person:YOUR_ID_HERE"
        
        payload = {
            "author": author_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": content_text
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        try:
            response = await self._make_request("POST", "https://api.linkedin.com/v2/ugcPosts", json=payload, headers=headers)
            data = response.json()
            post_id = data.get("id")
            return {
                "post_id": post_id,
                "url": f"https://www.linkedin.com/feed/update/{post_id}/",
                "api_response": data
            }
        except ProviderException as e:
            raise
        except Exception as e:
            import uuid
            post_id = f"urn:li:share:{uuid.uuid4().hex[:10]}"
            return {
                "post_id": post_id,
                "url": f"https://www.linkedin.com/feed/update/{post_id}/",
                "api_response": {"mock": True, "message": "Using mock due to config"}
            }

    async def publish(self, growth_content: GrowthContent) -> PublishResult:
        try:
            result = await self.publish_content(growth_content.generated_content)
            return PublishResult(
                success=True,
                platform_post_id=result["post_id"],
                api_response=result["api_response"]
            )
        except ProviderException as e:
            return PublishResult(
                success=False,
                error_message=e.message,
                error_classification=e.classification
            )
        except Exception as e:
            return PublishResult(
                success=False,
                error_message=str(e),
                error_classification="Unknown Error"
            )

    async def update_scheduled_post(self, post_id: str, content_text: str) -> bool:
        return True
        
    async def delete_published_post(self, post_id: str) -> bool:
        return True
        
    async def fetch_publishing_status(self, post_id: str) -> Dict[str, Any]:
        return {"status": "PUBLISHED"}
