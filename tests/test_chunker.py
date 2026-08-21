from app.ingestion.chunker import chunk_pages


def test_chunking_preserves_page_and_overlap() -> None:
    pages = [
        {
            "page_number": 1,
            "text": "one two three four five six seven eight nine ten",
        }
    ]
    chunks = chunk_pages(pages, chunk_size_words=6, overlap_words=2)

    assert len(chunks) == 2
    assert chunks[0]["page_number"] == 1
    assert chunks[0]["text"] == "one two three four five six"
    assert chunks[1]["text"].startswith("five six")


def test_empty_pages_are_skipped() -> None:
    chunks = chunk_pages(
        [
            {"page_number": 1, "text": ""},
            {"page_number": 2, "text": "useful text"},
        ],
        chunk_size_words=10,
        overlap_words=2,
    )

    assert len(chunks) == 1
    assert chunks[0]["page_number"] == 2
