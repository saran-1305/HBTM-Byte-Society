from backend.models.publishing import PlatformAccount
from backend.publishing.providers.base import BaseProvider
from backend.publishing.providers.linkedin import LinkedInProvider

class ProviderFactory:
    @staticmethod
    def get_provider(account: PlatformAccount) -> BaseProvider:
        platform = account.platform_name.lower()
        if platform == "linkedin":
            return LinkedInProvider(account)
        else:
            raise ValueError(f"No provider found for platform: {platform}")
