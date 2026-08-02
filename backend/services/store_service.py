import json
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from backend.services.provider_manager import ProviderManager
from backend.schemas.store import StoreProduct, StoreRecommendationResponse
from backend.agents.identity.repository import IdentityRepository
from backend.repositories.arc_repository import ArcRepository
import uuid

class StoreService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.identity_repo = IdentityRepository(db)
        self.arc_repo = ArcRepository(db)
        self.provider = ProviderManager()

    async def get_store_recommendations(self, user_id: str) -> StoreRecommendationResponse:
        uid = uuid.UUID(user_id)
        
        # 1. Fetch user context
        profile = await self.identity_repo.get_by_user_id(uid)
        arc_profile = await self.arc_repo.get_profile(uid)
        
        stage = arc_profile.current_stage if arc_profile else "explore"
        interests = profile.interests if profile and profile.interests else ["Self Improvement"]
        long_term_goal = profile.long_term_goal if profile else "Personal Growth"
        
        # 2. Prompt LLM to generate products
        prompt = f"""
        You are an expert e-commerce curator for a personal growth brand.
        The user is currently in the ARC Stage: '{stage}'.
        Their interests are: {', '.join(interests)}.
        Their long-term goal is: {long_term_goal}.
        
        Generate exactly 8 highly relevant, real-world physical products (books, wellness tools, desk accessories, productivity gear) that someone in this stage would buy.
        
        Return ONLY valid JSON matching this exact structure:
        {{
            "products": [
                {{
                    "title": "Product Title (e.g. Atomic Habits)",
                    "description": "Short 1-2 sentence description highlighting the material or benefit",
                    "price": "$XX.XX",
                    "brand": "Brand Name or Author",
                    "image_url": "URL to a realistic image or leave as empty string if unsure",
                    "store_link": "A real amazon search link, e.g. https://www.amazon.com/s?k=atomic+habits",
                    "match_percentage": 95
                }}
            ]
        }}
        """

        messages = [
            {"role": "system", "content": "You output strictly valid JSON."},
            {"role": "user", "content": prompt}
        ]

        # 3. Call LLM
        response_text = await self.provider.generate_response(messages)
        
        # Clean response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].strip()
            
        try:
            data = json.loads(response_text)
            products = data.get("products", [])
        except json.JSONDecodeError:
            # Fallback products if LLM fails
            products = [
                {
                    "title": "Atomic Habits",
                    "description": "Build better habits as you explore new possibilities.",
                    "price": "$21.99",
                    "brand": "James Clear",
                    "image_url": "",
                    "store_link": "https://www.amazon.com/s?k=atomic+habits",
                    "match_percentage": 98
                }
            ]

        # Ensure valid StoreProducts
        parsed_products = []
        for p in products:
            try:
                # Add default images based on category if empty
                if not p.get("image_url"):
                    q = p.get("title", "").replace(" ", "+")
                    p["image_url"] = f"https://source.unsplash.com/400x400/?{q},product"
                
                parsed_products.append(StoreProduct(**p))
            except Exception:
                continue

        return StoreRecommendationResponse(
            user_id=user_id,
            stage=stage,
            products=parsed_products
        )
