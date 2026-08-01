import asyncio
from backend.opportunities.providers.duckduckgo_provider import DuckDuckGoProvider

async def main():
    p = DuckDuckGoProvider()
    res = await p.search(["latest tech hackathons"])
    print(f"Results: {len(res)}")
    for r in res:
        print(r)

if __name__ == "__main__":
    asyncio.run(main())
