from typing import Any, Dict, List

MAX_ACTIONS = 4


def normalize_actions(raw_actions: Any) -> List[Dict[str, str]]:
    """Validates and normalizes the LLM's suggested_actions into a consistent [{action, why}] shape."""
    if not isinstance(raw_actions, list):
        return []

    normalized = []
    for item in raw_actions:
        if isinstance(item, dict) and item.get("action"):
            normalized.append({
                "action": str(item.get("action")).strip(),
                "why": str(item.get("why", "")).strip(),
            })
        elif isinstance(item, str) and item.strip():
            normalized.append({"action": item.strip(), "why": ""})

        if len(normalized) >= MAX_ACTIONS:
            break

    return normalized


def normalize_string_list(raw: Any, max_items: int = 4) -> List[str]:
    """Validates and normalizes a list of evidence/strength/weakness strings from the LLM response."""
    if not isinstance(raw, list):
        return []
    return [str(item).strip() for item in raw if isinstance(item, (str, int, float)) and str(item).strip()][:max_items]
