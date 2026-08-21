import re

from app.retrieval.vector_search import SearchResult


NOT_FOUND_MESSAGE = "I could not find this information in the uploaded document."


def validate_question(question: str) -> str:
    cleaned = " ".join(question.split())
    if not cleaned:
        raise ValueError("Question cannot be empty.")
    if len(cleaned) > 2000:
        raise ValueError("Question is too long. Keep it below 2,000 characters.")
    return cleaned


def filter_retrieved_chunks(
    results: list[SearchResult],
    minimum_score: float,
    limit: int,
) -> list[SearchResult]:
    return [result for result in results if result.score >= minimum_score][:limit]


def sanitize_context(text: str) -> str:
    """Mark common document prompt-injection phrases as untrusted text."""

    patterns = [
        r"ignore (all|any|the) previous instructions?",
        r"system prompt",
        r"developer message",
        r"act as (an?|the)",
    ]
    sanitized = text
    for pattern in patterns:
        sanitized = re.sub(pattern, "[untrusted instruction removed]", sanitized, flags=re.I)
    return sanitized


def validate_answer(answer: str, has_context: bool) -> str:
    if not has_context:
        return NOT_FOUND_MESSAGE
    cleaned = answer.strip()
    return cleaned or NOT_FOUND_MESSAGE

