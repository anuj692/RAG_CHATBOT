import re
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader


def _clean_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def load_pdf(file_path: str | Path) -> list[dict]:
    """Extract text page by page so citations retain page numbers."""

    try:
        pages = PyPDFLoader(str(file_path)).load()
    except Exception as exc:
        raise ValueError("Password-protected PDFs are not supported.") from exc

    output: list[dict] = []
    for page in pages:
        text = _clean_text(page.page_content)
        if text:
            # PyPDFLoader's "page" metadata is 0-indexed; citations use 1-indexed pages.
            output.append({"page_number": page.metadata["page"] + 1, "text": text})

    if not output:
        raise ValueError("No readable text was found. Scanned PDFs require OCR, which is not included in v1.")

    return output
