import asyncio
from backend.providers.knowledge.google_books import GoogleBooksProvider
from backend.providers.knowledge.arxiv_provider import ArxivProvider

async def main():
    gb = GoogleBooksProvider()
    ar = ArxivProvider()
    
    print("Fetching Google Books...")
    books = await gb.search("artificial intelligence", limit=3)
    print(f"Books found: {len(books)}")
    for b in books:
        print(f" - {b['title']}")
        
    print("\nFetching ArXiv...")
    papers = await ar.search("artificial intelligence", limit=3)
    print(f"Papers found: {len(papers)}")
    for p in papers:
        print(f" - {p['title']}")

if __name__ == "__main__":
    asyncio.run(main())
