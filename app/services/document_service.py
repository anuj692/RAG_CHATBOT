from pathlib import Path

from fastapi import UploadFile
from langchain_core.documents import Document as LangchainDocument
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database.models import Chunk, Document, new_uuid
from app.ingestion.chunker import chunk_pages
from app.ingestion.pdf_loader import load_pdf
from app.vectorstore.pinecone_db import delete_document_vectors, get_vector_store


def _validate_pdf(upload: UploadFile) -> None:
    filename = upload.filename or ""
    if Path(filename).suffix.lower() != ".pdf":
        raise ValueError("Only PDF files are supported in version 1.")
    if upload.content_type and upload.content_type not in {
        "application/pdf",
        "application/x-pdf",
        "application/octet-stream",
    }:
        raise ValueError("The uploaded file does not appear to be a PDF.")


def _save_upload(upload: UploadFile, destination: Path, max_bytes: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    total = 0
    try:
        with destination.open("wb") as output:
            while data := upload.file.read(1024 * 1024):
                total += len(data)
                if total > max_bytes:
                    raise ValueError(f"File is larger than {max_bytes // (1024 * 1024)} MB.")
                output.write(data)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        upload.file.close()


def ingest_pdf(upload: UploadFile, db: Session) -> Document:
    settings = get_settings()
    _validate_pdf(upload)

    document_id = new_uuid()
    destination = Path(settings.upload_dir) / f"{document_id}.pdf"
    _save_upload(upload, destination, settings.max_upload_mb * 1024 * 1024)

    document = Document(
        id=document_id,
        file_name=Path(upload.filename or "document.pdf").name,
        file_path=str(destination),
        status="processing",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        pages = load_pdf(destination)
        chunks_data = chunk_pages(
            pages,
            chunk_size_words=settings.chunk_size_words,
            overlap_words=settings.chunk_overlap_words,
        )
        if not chunks_data:
            raise ValueError("The PDF did not produce any searchable chunks.")

        chunks: list[Chunk] = []
        for data in chunks_data:
            chunk_id = new_uuid()
            chunks.append(
                Chunk(
                    id=chunk_id,
                    document_id=document.id,
                    chunk_index=data["chunk_index"],
                    chunk_text=data["text"],
                    page_number=data["page_number"],
                    pinecone_vector_id=chunk_id,
                )
            )

        db.add_all(chunks)
        db.commit()

        documents = [
            LangchainDocument(
                page_content=chunk.chunk_text,
                metadata={
                    "document_id": document.id,
                    "chunk_id": chunk.id,
                    "page_number": chunk.page_number,
                    "chunk_index": chunk.chunk_index,
                },
            )
            for chunk in chunks
        ]
        # add_documents embeds each chunk (via the HuggingFaceEmbeddings model)
        # and upserts the vectors in one call, using each chunk's own id as
        # its Pinecone vector id.
        get_vector_store().add_documents(documents, ids=[chunk.id for chunk in chunks])

        document.status = "ready"
        document.total_chunks = len(chunks)
        document.error_message = None
        db.commit()
        db.refresh(document)
        return document
    except Exception as exc:
        # Clean partial data so re-uploading the same PDF cannot create duplicate
        # chunks or vectors.
        try:
            delete_document_vectors(document.id)
        except Exception:
            pass
        db.execute(delete(Chunk).where(Chunk.document_id == document.id))
        document.status = "failed"
        document.total_chunks = 0
        document.error_message = str(exc)[:2000]
        db.commit()
        raise


def list_documents(db: Session) -> list[Document]:
    return list(db.scalars(select(Document).order_by(Document.created_at.desc())).all())


def delete_document(document_id: str, db: Session) -> None:
    document = db.get(Document, document_id)
    if document is None:
        raise LookupError("Document not found.")

    if document.total_chunks > 0:
        delete_document_vectors(document.id)

    file_path = Path(document.file_path)
    db.delete(document)
    db.commit()
    file_path.unlink(missing_ok=True)
