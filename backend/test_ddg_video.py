from duckduckgo_search import DDGS
import json

try:
    with DDGS() as ddgs:
        videos = list(ddgs.videos("react tutorial site:youtube.com", max_results=2))
        with open("ddg_video_out.json", "w", encoding="utf-8") as f:
            json.dump(videos, f)
except Exception as e:
    with open("ddg_video_out.json", "w") as f:
        f.write(str(e))
