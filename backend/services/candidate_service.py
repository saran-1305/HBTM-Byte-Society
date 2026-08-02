import asyncio
import urllib.request
import urllib.parse
import re
import json
from typing import List, Optional
from uuid import UUID

from backend.schemas.candidate import RecommendationItem
from backend.services.stage_service import StageService


class YouTubeSearchProvider:
    """Scrapes YouTube search results and fetches metadata via oEmbed — no API key needed."""

    def _sync_search_with_metadata(self, query: str, limit: int = 8) -> List[dict]:
        """
        Scrapes YouTube search results page and extracts video ID, title, author, and thumbnail
        in a single HTTP request — no API key, no rate limits.
        """
        try:
            search_query = urllib.parse.quote(query)
            url = f"https://www.youtube.com/results?search_query={search_query}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            html = urllib.request.urlopen(req, timeout=8).read().decode()

            # YouTube bakes all video data into a single ytInitialData JSON blob in the page.
            # We extract just the videoRenderer objects which contain everything we need.
            match = re.search(r'var ytInitialData = ({.+?});</script>', html, re.DOTALL)
            if not match:
                print("[YouTubeSearch] Could not find ytInitialData")
                return []

            data = json.loads(match.group(1))

            results = []
            seen_ids: set = set()

            # Walk into the contents structure
            try:
                sections = (
                    data["contents"]["twoColumnSearchResultsRenderer"]
                    ["primaryContents"]["sectionListRenderer"]["contents"]
                )
            except (KeyError, TypeError):
                return []

            for section in sections:
                items = section.get("itemSectionRenderer", {}).get("contents", [])
                for item in items:
                    renderer = item.get("videoRenderer")
                    if not renderer:
                        continue

                    video_id = renderer.get("videoId", "")
                    if not video_id or video_id in seen_ids:
                        continue
                    seen_ids.add(video_id)

                    # Title
                    title = ""
                    try:
                        title = renderer["title"]["runs"][0]["text"]
                    except (KeyError, IndexError):
                        title = "YouTube Video"

                    # Channel name
                    author = ""
                    try:
                        author = renderer["ownerText"]["runs"][0]["text"]
                    except (KeyError, IndexError):
                        author = "YouTube Creator"

                    # Thumbnail — pick the highest-res available
                    thumbnail = f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg"
                    try:
                        thumbs = renderer["thumbnail"]["thumbnails"]
                        if thumbs:
                            thumbnail = thumbs[-1]["url"]
                            # Ensure no query params that break img tags
                            thumbnail = thumbnail.split("?")[0]
                    except (KeyError, IndexError):
                        pass

                    results.append({
                        "video_id": video_id,
                        "url": f"https://www.youtube.com/watch?v={video_id}",
                        "title": title,
                        "author_name": author,
                        "thumbnail_url": thumbnail,
                    })

                    if len(results) >= limit:
                        return results

            return results
        except Exception as e:
            print(f"[YouTubeSearch] Error: {e}")
            return []

    async def search(self, query: str, limit: int = 8) -> List[dict]:
        results = await asyncio.to_thread(self._sync_search_with_metadata, query, limit)
        return results


class CandidateService:
    def __init__(self, content_repo=None):
        self.repo = content_repo  # Kept for backward-compat but unused
        self.stage_service = StageService()
        self.yt = YouTubeSearchProvider()

    def _build_search_query(self, domain: str, current_stage: str) -> str:
        """
        Build a specific, targeted YouTube search query from the user's goal + ARC stage.
        Each stage's modifier reflects a distinct intent, not just a difficulty label:
          explore    - broad exposure across specializations within their field
          commit     - active, hands-on practice that produces small consistent progress
          struggle   - troubleshooting + motivation for someone hitting real setbacks
          breakthrough - solidifying fundamentals around their first real success
          integrate  - expert-level, mentorship-oriented, real-world case studies
        """
        stage_modifiers = {
            "explore": "overview different specializations and career paths beginner introduction",
            "commit": "practical hands-on exercises step by step project",
            "struggle": "overcoming common mistakes troubleshooting tips motivation",
            "breakthrough": "core fundamentals mastery real project case study",
            "integrate": "expert insights mentoring real world case studies industry",
        }
        modifier = stage_modifiers.get(current_stage, "tutorial")
        return f"{domain} {modifier}"

    async def get_candidates(self, current_stage: str, domain: Optional[str] = None) -> List[RecommendationItem]:
        """
        Fetches live, goal-relevant YouTube videos for the user.
        Uses YouTube search scraping + oEmbed for metadata — no rate-limits, no API keys.
        """
        all_stages = [s.value for s in self.stage_service.get_all_stages()]

        try:
            current_index = all_stages.index(current_stage)
        except ValueError:
            current_index = 0

        allowed_max_index = min(current_index + 1, len(all_stages) - 1)
        allowed_stages = all_stages[:allowed_max_index + 1]

        search_term = domain if domain else "productivity"
        query = self._build_search_query(search_term, current_stage)

        print(f"[CandidateService] Searching YouTube for: '{query}'")
        raw_results = await self.yt.search(query, limit=8)

        candidates: List[RecommendationItem] = []
        for idx, r in enumerate(raw_results):
            assigned_stage = allowed_stages[idx % len(allowed_stages)]
            candidates.append(RecommendationItem(
                id=f"youtube_{r['video_id']}",
                title=r["title"],
                description=f"Watch this video to advance your journey in {search_term}.",
                url=r["url"],
                thumbnail=r["thumbnail_url"],
                author=r["author_name"],
                stage=assigned_stage,
                domain=domain or "productivity",
                content_type="video",
                estimated_time="10-20 mins",
                difficulty="beginner" if idx % 2 == 0 else "intermediate",
                tags=["youtube", "live", search_term.lower().replace(" ", "-")],
            ))

        if not candidates:
            # Network fallback — a guaranteed embeddable AI video
            candidates.append(RecommendationItem(
                id="fallback_ai_intro",
                title=f"Getting Started with {search_term.title()}",
                description="A curated intro to help you get started on your journey.",
                url="https://www.youtube.com/watch?v=ad79nYk2keg",
                thumbnail="https://i.ytimg.com/vi/ad79nYk2keg/mqdefault.jpg",
                author="Google",
                stage=current_stage,
                domain=domain or "productivity",
                content_type="video",
                estimated_time="10 mins",
                difficulty="beginner",
                tags=["fallback", "intro"],
            ))

        return candidates
