from duckduckgo_search import DDGS

def main():
    try:
        with DDGS() as ddgs:
            res = list(ddgs.text("latest AI hackathons", backend="lite", max_results=3))
            print("Lite results:", res)
    except Exception as e:
        print("Lite error:", e)

if __name__ == "__main__":
    main()
