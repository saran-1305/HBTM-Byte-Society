from backend.schemas.recommendation import RecommendationContext

class ContextBuilder:
    def __init__(self):
        pass

    def build_context(self, user_profile: dict, recent_history: list, available_time: int) -> RecommendationContext:
        """
        Builds the context for the AI Recommendation Engine.
        """
        # Extract from user_profile. For now, defaulting if not found.
        aspiration = user_profile.get("aspiration", "Become a better version of myself")
        stage = user_profile.get("stage", "Beginner")
        domain = user_profile.get("domain", "General")
        habits = user_profile.get("habits", [])
        
        recent_topics = []
        feedback = []
        for hist in recent_history:
            recent_topics.append(hist.title)
            if hist.feedback:
                feedback.append(f"Title: {hist.title}, Feedback: {hist.feedback}")

        # Construct and return the Context object
        return RecommendationContext(
            aspiration=aspiration,
            stage=stage,
            available_time=available_time,
            domain=domain,
            recent_topics=recent_topics[-5:], # Keep last 5
            completed_items=[], # Could be populated from history
            feedback=feedback,
            habits=habits
        )
