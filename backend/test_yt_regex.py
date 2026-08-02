import urllib.request
import urllib.parse
import json
import re

q = urllib.parse.quote("AI Engineer tutorial for beginners")
req = urllib.request.Request(
    f"https://www.youtube.com/results?search_query={q}",
    headers={"User-Agent": "Mozilla/5.0"}
)
html = urllib.request.urlopen(req, timeout=8).read().decode()
ids = re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', html)
seen = []
for i in ids:
    if i not in seen:
        seen.append(i)
print("IDs:", seen[:5])

for vid in seen[:3]:
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        req2 = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        d = json.loads(urllib.request.urlopen(req2, timeout=5).read().decode())
        print(f"{vid}: {d.get('title')} by {d.get('author_name')}")
    except Exception as e:
        print(f"{vid}: Error - {e}")
