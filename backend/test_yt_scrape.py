import urllib.request
import urllib.parse
import re
import json

def search_youtube_videos(query, limit=5):
    search_query = urllib.parse.quote(query)
    url = f"https://www.youtube.com/results?search_query={search_query}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    html = urllib.request.urlopen(req).read().decode()
    video_ids = re.findall(r'"videoId":"(.{11})"', html)
    unique_ids = []
    for vid in video_ids:
        if vid not in unique_ids:
            unique_ids.append(vid)
    return unique_ids[:limit]

def get_video_metadata(video_id):
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req).read().decode()
        data = json.loads(resp)
        return {
            "title": data.get("title"),
            "author_name": data.get("author_name"),
            "thumbnail_url": data.get("thumbnail_url")
        }
    except Exception as e:
        return {
            "title": "Video",
            "author_name": "YouTube",
            "thumbnail_url": f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
        }

ids = search_youtube_videos("AI engineering tutorial for beginners", limit=3)
print("IDs:", ids)
for vid_id in ids[:2]:
    meta = get_video_metadata(vid_id)
    print("Meta:", meta)
