def chunk_pages(
    pages: list[dict],
    chunk_size_words: int = 180,
    overlap_words: int = 30,
) -> list[dict]:
    """Split each page into overlapping word chunks.

    Pages are not mixed so every chunk can be cited to one page.
    """

    if chunk_size_words <= 0:
        raise ValueError("chunk_size_words must be greater than zero")
    if overlap_words < 0 or overlap_words >= chunk_size_words:
        raise ValueError("overlap_words must be non-negative and smaller than chunk_size_words")

    chunks: list[dict] = []
    chunk_index = 0
    step = chunk_size_words - overlap_words

    for page in pages:
        words = page["text"].split()
        start = 0
        while start < len(words):
            end = min(start + chunk_size_words, len(words))
            text = " ".join(words[start:end]).strip()
            if text:
                chunks.append(
                    {
                        "chunk_index": chunk_index,
                        "page_number": int(page["page_number"]),
                        "text": text,
                    }
                )
                chunk_index += 1
            if end == len(words):
                break
            start += step

    return chunks

