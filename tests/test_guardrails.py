import pytest

from app.guardrails.basic_guardrails import validate_question


def test_question_is_trimmed() -> None:
    assert validate_question("  What is RAG?  ") == "What is RAG?"


def test_blank_question_is_rejected() -> None:
    with pytest.raises(ValueError, match="empty"):
        validate_question("   ")


def test_oversized_question_is_rejected() -> None:
    with pytest.raises(ValueError, match="long"):
        validate_question("x" * 4001)

