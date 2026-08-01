class ProgressService:
    def __init__(self):
        pass

    def _bound_progress(self, progress: float) -> float:
        """Ensures progress remains between 0.0 and 1.0"""
        return max(0.0, min(1.0, progress))

    def increase_progress(self, current_progress: float, amount: float) -> float:
        """Increases progress by the given amount."""
        if amount < 0:
            raise ValueError("Amount must be positive.")
        return self._bound_progress(current_progress + amount)

    def decrease_progress(self, current_progress: float, amount: float) -> float:
        """Decreases progress by the given amount."""
        if amount < 0:
            raise ValueError("Amount must be positive.")
        return self._bound_progress(current_progress - amount)

    def set_progress(self, value: float) -> float:
        """Sets progress to a specific value."""
        return self._bound_progress(value)

    def reset_progress(self) -> float:
        """Resets progress back to 0.0."""
        return 0.0
