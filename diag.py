import asyncio
import httpx

BASE = "http://localhost:8000"

async def main():
    async with httpx.AsyncClient(timeout=30) as client:
        # 1. Register / Login
        print("=== 1. AUTH ===")
        reg = await client.post(f"{BASE}/api/auth/register", json={
            "email": "test_diag@daskalos.ai",
            "password": "daskalos_default_pw",
            "name": "Diagnostic User"
        })
        if reg.status_code == 200:
            token = reg.json()["access_token"]
            print(f"Registered OK. Token: {token[:30]}...")
        else:
            login = await client.post(f"{BASE}/api/auth/login", json={
                "email": "test_diag@daskalos.ai",
                "password": "daskalos_default_pw"
            })
            if login.status_code == 200:
                token = login.json()["access_token"]
                print(f"Logged in OK. Token: {token[:30]}...")
            else:
                print(f"AUTH FAILED: {login.status_code} {login.text}")
                return

        headers = {"Authorization": f"Bearer {token}"}

        # 2. Onboarding
        print("\n=== 2. ONBOARDING ===")
        await client.post(f"{BASE}/api/onboarding/start", headers=headers)
        save = await client.post(f"{BASE}/api/onboarding/save", headers=headers, json={
            "long_term_goal": "Become an AI Engineer",
            "timeframe": "This year",
            "current_habits": ["coding practice", "reading"],
            "stuck_points": "Getting distracted easily",
            "interests": ["Artificial Intelligence", "Machine Learning"]
        })
        print(f"Save: {save.status_code}")
        complete = await client.post(f"{BASE}/api/onboarding/complete", headers=headers)
        print(f"Complete: {complete.status_code}")
        if complete.status_code == 200:
            data = complete.json()
            print(f"Identity Summary: {str(data.get('identity_summary', ''))[:100]}...")
        else:
            print(f"Complete Error: {complete.text[:300]}")

        # 3. Identity
        print("\n=== 3. IDENTITY ===")
        ident = await client.get(f"{BASE}/api/identity/summary", headers=headers)
        print(f"Identity: {ident.status_code}")
        if ident.status_code == 200:
            d = ident.json()
            print(f"  Goal: {d.get('long_term_goal')}")
            print(f"  Interests: {d.get('interests')}")

        # 4. Knowledge recommendations
        print("\n=== 4. KNOWLEDGE RECOMMENDATIONS ===")
        recs = await client.get(f"{BASE}/api/knowledge/recommendations", headers=headers, timeout=120)
        print(f"Recommendations: {recs.status_code}")
        if recs.status_code == 200:
            data = recs.json()
            print(f"  Count: {len(data)}")
            for r in data[:3]:
                src = r.get("source", {})
                print(f"  - [{src.get('provider')}] {src.get('title')} | {r.get('relevance_score')}% | {src.get('url', '')[:60]}")
        else:
            print(f"  Error: {recs.text[:300]}")

        # 5. Growth plan
        print("\n=== 5. GROWTH PLAN ===")
        gp = await client.get(f"{BASE}/api/growth/plan", headers=headers)
        print(f"Growth Plan: {gp.status_code}")
        if gp.status_code == 200:
            d = gp.json()
            print(f"  Milestones: {len(d.get('milestones', []))}")
        else:
            print(f"  Error: {gp.text[:200]}")

asyncio.run(main())
