import re

from app.retrieval.vector_search import SearchResult


def _terms(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def rerank_results(
    question: str,
    results: list[SearchResult],
    top_k: int,
) -> list[SearchResult]:
    """A lightweight reranker suitable for a beginner project.

    It preserves most of the retrieval score and adds a small exact-term-overlap
    bonus. Replace it with a cross-encoder only after the basic project works.
    """

    question_terms = _terms(question)
    reranked: list[SearchResult] = []
    for result in results:
        chunk_terms = _terms(result.text)
        overlap = len(question_terms & chunk_terms) / max(1, len(question_terms))
        score = (0.85 * result.score) + (0.15 * overlap)
        reranked.append(result.with_score(score, source=f"{result.source}+rerank"))

    reranked.sort(key=lambda item: item.score, reverse=True)
    return reranked[:top_k]

