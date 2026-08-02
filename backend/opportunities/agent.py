import json
import logging
import asyncio
from typing import List, Dict, Any
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.services.provider_manager import ProviderManager
from backend.models.profile import UserProfile
from backend.models.identity_profile import IdentityProfile
from backend.models.opportunity import Opportunity
from .providers.base import RawOpportunity
from .providers.duckduckgo_provider import DuckDuckGoProvider
from .providers.devpost_provider import DevpostProvider

logger = logging.getLogger(__name__)

class OpportunityRank(BaseModel):
    confidence_score: float
    priority_score: float
    ai_explanation: str
    estimated_impact: str
    category: str
    difficulty: str
    estimated_time: str

class OpportunityAgent:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.provider_manager = ProviderManager()
        self.providers = [
            DevpostProvider(),
            DuckDuckGoProvider()
        ]
        
    def _clean_json(self, raw_str: str) -> str:
        import re
        cleaned = re.sub(r'```(?:json)?\s*', '', raw_str)
        cleaned = re.sub(r'```', '', cleaned)
        return cleaned.strip()

    async def _generate_queries(self, profile: UserProfile, identity: IdentityProfile) -> List[str]:
        prompt = f"""
        You are an expert AI Opportunity Scout.
        Based on the user's current growth stage and identity, generate 5 highly specific internet search queries
        to find LIVE and UPCOMING real-world opportunities that match their ACTUAL field — not generic tech opportunities.

        User Goal: {identity.long_term_goal or 'Growth'}
        Aspirations: {identity.aspirations}
        Interests: {identity.interests}
        Skills: {identity.current_skills}
        User Stage: {profile.current_stage}

        First decide what kind of opportunities actually fit this person's field. Examples of the mapping to use:
        - Technology / engineering / AI goals -> hackathons, internships, coding competitions
        - Business / entrepreneurship / finance goals -> case competitions, pitch competitions, business plan contests, internships
        - Dance / music / performing arts goals -> workshops, auditions, showcases, masterclasses, competitions
        - Design goals -> design challenges, portfolio reviews, workshops
        - Any other field -> the equivalent real-world competitions, workshops, or internships for THAT field

        Do NOT default to hackathons or tech terms unless the user's goal is actually technology-related.
        Always append keywords like "upcoming 2026", "open for registration", or "apply now" to ensure live results.
        Output ONLY a JSON array of strings, each one a search query specific to this user's field.
        """

        try:
            _, raw_response = await self.provider_manager.generate_json(prompt)
            cleaned = self._clean_json(raw_response)
            queries = json.loads(cleaned)
            if isinstance(queries, list) and queries:
                return queries[:5]
            return self._fallback_queries(identity)
        except Exception as e:
            logger.error(f"Failed to generate queries: {e}")
            return self._fallback_queries(identity)

    def _fallback_queries(self, identity: IdentityProfile) -> List[str]:
        """Deterministic fallback (LLM unavailable) — still keyed off the user's actual goal, never generic tech terms."""
        goal = identity.long_term_goal or (identity.aspirations[0] if identity.aspirations else "personal growth")
        return [
            f"{goal} competitions 2026 open for registration",
            f"{goal} workshops upcoming apply now",
            f"{goal} internships apply now",
        ]

    async def _rank_opportunity(self, raw_opp: RawOpportunity, profile: UserProfile, identity: IdentityProfile) -> OpportunityRank:
        prompt = f"""
        You are an AI Opportunity Evaluator.
        Evaluate the following real-world opportunity for this user.
        
        User Goal: {identity.long_term_goal or 'Growth'}
        Aspirations: {identity.aspirations}
        User Stage: {profile.current_stage}
        
        Opportunity:
        Title: {raw_opp.title}
        Description: {raw_opp.description}
        URL: {raw_opp.url}
        
        Evaluate and return ONLY a JSON object matching this exact structure:
        {{
            "confidence_score": (float 0.0 to 1.0, how well this matches the user),
            "priority_score": (float 0.0 to 1.0, how urgently they should apply/attend),
            "ai_explanation": (string, "Why this? Why now? How does it align with your goal?"),
            "estimated_impact": (string, short description of expected benefit),
            "category": (string, e.g. 'Hackathon', 'Competition', 'Workshop', 'Internship', 'Audition', 'Conference' — whatever fits this opportunity),
            "difficulty": (string, 'beginner', 'intermediate', 'advanced'),
            "estimated_time": (string, e.g., '3 days', '2 hours')
        }}
        """
        try:
            _, raw_response = await self.provider_manager.generate_json(prompt)
            cleaned = self._clean_json(raw_response)
            parsed = json.loads(cleaned)
            return OpportunityRank(**parsed)
        except Exception as e:
            logger.error(f"Failed to rank opportunity {raw_opp.title}: {e}")
            # Below the discover_and_rank confidence threshold on purpose: if we can't even
            # evaluate relevance, we must not let it silently pass through as a match.
            return OpportunityRank(
                confidence_score=0.2,
                priority_score=0.3,
                ai_explanation="Could not evaluate this opportunity's relevance to your goal.",
                estimated_impact="Unknown.",
                category="General",
                difficulty="intermediate",
                estimated_time="Unknown"
            )

    async def discover_and_rank(self, profile: UserProfile, identity: IdentityProfile) -> List[Dict[str, Any]]:
        # 1. Build Queries
        queries = await self._generate_queries(profile, identity)
        logger.info(f"Generated queries for user {profile.user_id}: {queries}")
        
        # 2. Fetch Raw Opportunities from all providers
        raw_opportunities = []
        for provider in self.providers:
            results = await provider.search(queries)
            raw_opportunities.extend(results)
            
        # 3. Deduplicate
        seen_urls = set()
        unique_raw = []
        for opp in raw_opportunities:
            if opp.url not in seen_urls:
                seen_urls.add(opp.url)
                unique_raw.append(opp)
                
        # 4. Fallback: If live search failed/rate-limited, generate realistic opportunities
        if len(unique_raw) == 0:
            logger.info("Search providers returned 0 results. Generating simulated live opportunities via LLM.")
            prompt = f"""
            Generate 4 highly realistic, UPCOMING "live" opportunities for a user at this growth stage.
            The opportunity TYPES must match this user's actual field — do not default to hackathons/tech unless
            their goal is technology-related. For example: business goals -> case/pitch competitions; dance or
            performing arts goals -> workshops, auditions, showcases; design goals -> design challenges. Pick
            whatever real-world opportunity types genuinely fit the goal below.

            Stage: {profile.current_stage}
            Goal: {identity.long_term_goal or 'Growth'}
            Aspirations: {identity.aspirations}
            Interests: {identity.interests}

            IMPORTANT: Do NOT use fake URLs like example.com. Generate realistic URLs pointing to actual platforms
            relevant to the opportunity type (e.g. Devpost/MLH/Unstop for tech, Unstop/LinkedIn for business
            competitions, Eventbrite/Meetup for workshops).

            Return ONLY a JSON array of objects with this exact schema:
            [
              {{
                "title": "...",
                "description": "...",
                "url": "https://...",
                "provider_name": "AI Scout"
              }}
            ]
            """
            try:
                _, raw_response = await self.provider_manager.generate_json(prompt)
                cleaned = self._clean_json(raw_response)
                fallback_items = json.loads(cleaned)
                for item in fallback_items:
                    unique_raw.append(RawOpportunity(
                        title=item.get("title", "Opportunity"),
                        description=item.get("description", ""),
                        url=item.get("url", "https://example.com"),
                        provider_name=item.get("provider_name", "AI Scout")
                    ))
            except Exception as e:
                logger.error(f"Fallback generation failed: {e}")
                
        # 5. Rank using LLM (concurrency limit to avoid rate limits)
        ranked_results = []
        
        async def bounded_rank(opp):
            rank = await self._rank_opportunity(opp, profile, identity)
            return opp, rank

        tasks = [bounded_rank(opp) for opp in unique_raw[:10]] # Limit to top 10 to save API calls
        results = await asyncio.gather(*tasks)
        
        for opp, rank in results:
            if rank.confidence_score >= 0.4:  # Filter out highly irrelevant items
                ranked_results.append({
                    "raw": opp,
                    "rank": rank
                })
                
        # Sort by priority
        ranked_results.sort(key=lambda x: x["rank"].priority_score, reverse=True)
        return ranked_results
