from youtubesearchpython import VideosSearch
import json

try:
    videosSearch = VideosSearch('react tutorial', limit = 2)
    with open('yt_out.json', 'w') as f:
        json.dump(videosSearch.result(), f)
except Exception as e:
    print(f"Error: {e}")
