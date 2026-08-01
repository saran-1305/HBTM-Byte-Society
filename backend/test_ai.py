import os
import litellm
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

def test_api():
    model = os.getenv("AI_MODEL", "groq/llama-3.1-8b-instant")
    print(f"Testing model: {model}")
    
    try:
        response = litellm.completion(
            model=model,
            messages=[{"role": "user", "content": "Reply exactly with this text: 'Hello, the AI API is working perfectly!'"}]
        )
        print("\nSUCCESS! The API Key is working.")
        print(f"Response from AI: {response.choices[0].message.content}")
    except Exception as e:
        print("\nERROR! The API Key failed.")
        print(str(e))

if __name__ == "__main__":
    test_api()
