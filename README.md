# DASKALOS - Agentic AI Personal Growth OS

DASKALOS is an elite Personal Growth Operating System powered by Agentic AI. It acts as your personalized curator, identifying your aspirations, mapping your current stage in the journey, and dynamically generating highly-specific, transformative resources (Videos) tailored to your exact needs, time constraints, and domain.

## 🚀 Features

- **Identity Engine**: Dynamically captures and builds a comprehensive profile of your aspirations, current stage, domain of interest, and available time.
- **Agentic AI Curator (DASKALOS)**: Uses LLMs to deeply analyze your context and orchestrate personalized recommendations.
- **Dual AI Fallback Routing**: Robust load balancing and failover using Groq (Llama 3) and OpenRouter (Anthropic Claude 3 Haiku) via LiteLLM to ensure zero downtime and perfect JSON generation.
- **Cinematic Dashboard**: A premium, Netflix-style interface featuring live YouTube thumbnail extractions, responsive Media Grids, and a seamless Dark Mode aesthetic.
- **Asynchronous FastAPI Backend**: High-performance backend utilizing SQLAlchemy, PostgreSQL (asyncpg), and Pydantic.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS (Vanilla CSS for aesthetic tokens)
- Tabler Icons

**Backend:**
- FastAPI (Python)
- PostgreSQL & AsyncPG
- SQLAlchemy (Async)
- LiteLLM (Groq & OpenRouter integrations)
- Uvicorn

## ⚙️ Local Development Setup

### 1. Database Setup
Ensure you have PostgreSQL installed and running. Create a database (e.g., `HBTM`).

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up your `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/HBTM
   SECRET_KEY=super-secret-key-for-development
   GROQ_API_KEY=your_primary_groq_key
   GROQ_API_KEY_2=your_secondary_groq_key
   OPENROUTER_API_KEY=your_openrouter_key
   AI_MODEL=groq/llama-3.1-8b-instant
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🧠 System Architecture

1. **Identity Engine**: Captures user aspirations and state.
2. **Context Builder**: Merges Identity with historical interactions.
3. **AI Engine**: `litellm` routes prompts to Groq/Claude to generate perfect YouTube video recommendations.
4. **History Cache**: Caches today's feed in Postgres to allow instantaneous reloading and rate-limit protection.

---
*Built with ❤️ by the HBTM Byte Society.*
