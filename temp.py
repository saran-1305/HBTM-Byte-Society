import requests
import re
try:
    res = requests.get('http://localhost:8000/api/identity/123e4567-e89b-12d3-a456-426614174000')
    print('GET:', res.status_code)
    text = res.text
    clean = re.sub(r'<[^>]+>', '', text)
    print(clean.strip()[:2000])
except Exception as e:
    print('Error:', e)
