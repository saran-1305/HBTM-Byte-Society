import json
import random
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from backend.services.provider_manager import ProviderManager
from backend.schemas.store import StoreProduct, StoreRecommendationResponse
from backend.agents.identity.repository import IdentityRepository
from backend.repositories.arc_repository import ARCRepository

# ---------------------------------------------------------------------------
# Curated real product photo pools per category
# All from Picsum with deterministic seeds that map to visually relevant images
# OR real hosted CDN images indexed by type
# ---------------------------------------------------------------------------

# These are direct CDN-hosted real product images per keyword
# From reliable public sources (Wikipedia Commons, Reddit, GitHub hosted etc.)
PRODUCT_IMAGE_POOL = {
    "book": [
        "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "journal": [
        "https://images.pexels.com/photos/733857/pexels-photo-733857.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/2062994/pexels-photo-2062994.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1766604/pexels-photo-1766604.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "planner": [
        "https://images.pexels.com/photos/636243/pexels-photo-636243.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/733857/pexels-photo-733857.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/3243/pen-calendar-to-do-checklist.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "notebook": [
        "https://images.pexels.com/photos/733857/pexels-photo-733857.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/2062994/pexels-photo-2062994.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "lamp": [
        "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1329297/pexels-photo-1329297.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1569470/pexels-photo-1569470.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "desk": [
        "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/374918/pexels-photo-374918.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1038916/pexels-photo-1038916.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "bottle": [
        "https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/3737594/pexels-photo-3737594.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "glasses": [
        "https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/413694/pexels-photo-413694.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "headphones": [
        "https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1037993/pexels-photo-1037993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "fitness": [
        "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "yoga": [
        "https://images.pexels.com/photos/3822354/pexels-photo-3822354.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1812964/pexels-photo-1812964.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "mat": [
        "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/3822354/pexels-photo-3822354.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "chair": [
        "https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/159740/library-la-trobe-study-students-159740.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "bag": [
        "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "shoes": [
        "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1240892/pexels-photo-1240892.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "watch": [
        "https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/236915/pexels-photo-236915.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "pen": [
        "https://images.pexels.com/photos/1925536/pexels-photo-1925536.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/159751/book-address-book-learning-read-159751.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "coffee": [
        "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "mug": [
        "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "candle": [
        "https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1028930/pexels-photo-1028930.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "plant": [
        "https://images.pexels.com/photos/1407305/pexels-photo-1407305.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/776656/pexels-photo-776656.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1153895/pexels-photo-1153895.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "keyboard": [
        "https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "monitor": [
        "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "phone": [
        "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "speaker": [
        "https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "towel": [
        "https://images.pexels.com/photos/545058/pexels-photo-545058.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
    "calendar": [
        "https://images.pexels.com/photos/3243/pen-calendar-to-do-checklist.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "https://images.pexels.com/photos/636243/pexels-photo-636243.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    ],
}

FALLBACK_POOL = [
    "https://images.pexels.com/photos/374918/pexels-photo-374918.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
    "https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
]


def _get_unique_product_image(keyword: str, used_urls: set) -> str:
    """Get a relevant Pexels product image URL that hasn't been used in this request."""
    key = keyword.lower().strip()
    
    pool = PRODUCT_IMAGE_POOL.get(key)
    if not pool:
        # Fuzzy match
        for cat_key, imgs in PRODUCT_IMAGE_POOL.items():
            if cat_key in key or key in cat_key:
                pool = imgs
                break
    if not pool:
        pool = FALLBACK_POOL
    
    available = [url for url in pool if url not in used_urls]
    if not available:
        available = pool  # All used — allow repeat
    
    chosen = random.choice(available)
    used_urls.add(chosen)
    return chosen


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
        3. All prices must be in Indian Rupees (INR).
        
        Return ONLY valid JSON matching this exact structure:
        {{
            "products": [
                {{
                    "title": "Product Title",
                    "description": "Short 1-2 sentence description",
                    "price": "₹XXXX",
                    "brand": "Brand Name",
                    "store_link": "https://www.amazon.in/s?k=keyword+for+product",
                    "image_keyword": "ONE simple noun from this exact list ONLY: book, journal, planner, notebook, lamp, desk, bottle, glasses, headphones, fitness, yoga, mat, chair, bag, shoes, watch, pen, coffee, mug, candle, plant, keyboard, monitor, phone, speaker, towel, calendar",
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
                    "price": "₹1799",
                    "brand": "James Clear",
                    "image_keyword": "book",
                    "store_link": "https://www.amazon.in/s?k=atomic+habits",
                    "match_percentage": 98
                },
                {
                    "title": "Minimalist Desk Lamp",
                    "description": "Clean workspace, clear mind. Perfect for late night learning.",
                    "price": "₹3499",
                    "brand": "Syska",
                    "image_keyword": "lamp",
                    "store_link": "https://www.amazon.in/s?k=minimalist+desk+lamp",
                    "match_percentage": 92
                },
                {
                    "title": "Insulated Water Bottle",
                    "description": "Stay hydrated, stay focused on your journey.",
                    "price": "₹899",
                    "brand": "Milton",
                    "image_keyword": "bottle",
                    "store_link": "https://www.amazon.in/s?k=insulated+water+bottle",
                    "match_percentage": 90
                },
                {
                    "title": "Blue Light Glasses",
                    "description": "Reduce eye strain during long study or screen time.",
                    "price": "₹799",
                    "brand": "Specta",
                    "image_keyword": "glasses",
                    "store_link": "https://www.amazon.in/s?k=blue+light+glasses",
                    "match_percentage": 88
                }
            ]

        # Assign relevant product images from curated Pexels pool
        parsed_products = []
        used_urls: set = set()
        
        for p in products:
            try:
                keyword = p.pop("image_keyword", "desk")
                p["image_url"] = _get_unique_product_image(keyword, used_urls)
                parsed_products.append(StoreProduct(**p))
            except Exception:
                continue

        return StoreRecommendationResponse(
            user_id=user_id,
            stage=stage,
            products=parsed_products
        )
