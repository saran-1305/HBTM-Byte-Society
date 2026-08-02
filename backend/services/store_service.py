import json
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from backend.services.provider_manager import ProviderManager
from backend.schemas.store import StoreProduct, StoreRecommendationResponse
from backend.agents.identity.repository import IdentityRepository
from backend.repositories.arc_repository import ARCRepository
import uuid

class StoreService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.identity_repo = IdentityRepository(db)
        self.arc_repo = ARCRepository(db)
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
        
        Generate exactly 8 highly relevant, real-world physical products that someone in this stage would buy.
        CRITICAL RULES:
        1. MAXIMUM 2 books allowed.
        2. The other 6 items MUST be physical gear (e.g. wellness tools, desk accessories, productivity gadgets, apparel, fitness equipment, journals).
        
        Return ONLY valid JSON matching this exact structure:
        {{
            "products": [
                {{
                    "title": "Product Title",
                    "description": "Short 1-2 sentence description",
                    "price": "$XX.XX",
                    "brand": "Brand Name",
                    "store_link": "A real amazon search link, e.g. https://www.amazon.com/s?k=keyword",
                    "match_percentage": 95
                }}
            ]
        }}
        """

        # 3. Call LLM
        provider_name, response_text = await self.provider.generate_json(prompt)
        
        # Clean response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].strip()
            
        try:
            data = json.loads(response_text)
            products = data.get("products", [])
        except json.JSONDecodeError:
            products = []

        # Fallback products if LLM fails or returns no products
        if not products:
            products = [
                {
                    "title": "Atomic Habits",
                    "description": "Build better habits as you explore new possibilities.",
                    "price": "$21.99",
                    "brand": "James Clear",
                    "image_url": "https://loremflickr.com/400/400/Atomic,Habits,book?lock=101",
                    "store_link": "https://www.amazon.com/s?k=atomic+habits",
                    "match_percentage": 98
                },
                {
                    "title": "Minimalist Desk Lamp",
                    "description": "Clean workspace, clear mind. Perfect for late night learning.",
                    "price": "$45.00",
                    "brand": "Lumina",
                    "image_url": "https://loremflickr.com/400/400/Minimalist,Desk,Lamp?lock=102",
                    "store_link": "https://www.amazon.com/s?k=minimalist+desk+lamp",
                    "match_percentage": 92
                },
                {
                    "title": "Insulated Water Bottle",
                    "description": "Stay hydrated, stay focused on your journey.",
                    "price": "$32.99",
                    "brand": "HydroFlow",
                    "image_url": "https://loremflickr.com/400/400/Insulated,Water,Bottle?lock=103",
                    "store_link": "https://www.amazon.com/s?k=insulated+water+bottle",
                    "match_percentage": 90
                },
                {
                    "title": "Blue Light Glasses",
                    "description": "Reduce eye strain during long study or screen time.",
                    "price": "$29.99",
                    "brand": "OpticShield",
                    "image_url": "https://loremflickr.com/400/400/Blue,Light,Glasses?lock=104",
                    "store_link": "https://www.amazon.com/s?k=blue+light+glasses",
                    "match_percentage": 88
                }
            ]

        # Ensure valid StoreProducts
        parsed_products = []
        for p in products:
            try:
                import urllib.parse
                import random
                # Use LoremFlickr to fetch realistic product photography based on title keywords
                # Replace spaces with commas for the keyword search
                keywords = p.get("title", "product").replace(" ", ",")
                safe_keywords = urllib.parse.quote(keywords)
                # Add a unique lock parameter so the browser doesn't cache and duplicate the same image
                lock_id = random.randint(1, 10000)
                p["image_url"] = f"https://loremflickr.com/400/400/{safe_keywords},product?lock={lock_id}"
                
                parsed_products.append(StoreProduct(**p))
            except Exception:
                continue

        return StoreRecommendationResponse(
            user_id=user_id,
            stage=stage,
            products=parsed_products
        )
