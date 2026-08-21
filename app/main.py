from contextlib import asynccontextmanager
import logging

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database.mysql_db import get_db, init_db
from app.database.schemas import (
    ChatRequest,
    ChatResponse,
    DocumentResponse,
    HistoryResponse,
    SessionCreate,
    SessionResponse,
    SessionUpdate,
)
from app.services.chat_service import (
    answer_question,
    create_session,
    delete_all_sessions,
    delete_session,
    get_history,
    list_sessions,
    update_session,
)
from app.services.document_service import delete_document, ingest_pdf, list_documents


logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A beginner-friendly PDF RAG chatbot using MySQL, Pinecone and Hugging Face.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["System"])
def root() -> dict:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health", tags=["System"])
def health(db: Session = Depends(get_db)) -> dict:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


@app.post(
    "/documents/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Documents"],
)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    try:
        return DocumentResponse.model_validate(ingest_pdf(file, db))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Document ingestion failed")
        raise HTTPException(status_code=500, detail="Document ingestion failed.") from exc


@app.get("/documents", response_model=list[DocumentResponse], tags=["Documents"])
def get_documents(db: Session = Depends(get_db)) -> list[DocumentResponse]:
    return [DocumentResponse.model_validate(item) for item in list_documents(db)]


@app.delete("/documents/{document_id}", tags=["Documents"])
def remove_document(document_id: str, db: Session = Depends(get_db)) -> dict:
    try:
        delete_document(document_id, db)
        return {"message": "Document, chunks, file and vectors were deleted."}
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Document deletion failed")
        raise HTTPException(status_code=502, detail="Could not delete the document completely.") from exc


@app.post(
    "/sessions",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Chat sessions"],
)
def new_session(payload: SessionCreate, db: Session = Depends(get_db)) -> SessionResponse:
    return SessionResponse.model_validate(create_session(payload, db))


@app.get("/sessions", response_model=list[SessionResponse], tags=["Chat sessions"])
def get_sessions(db: Session = Depends(get_db)) -> list[SessionResponse]:
    return [SessionResponse.model_validate(item) for item in list_sessions(db)]


@app.patch(
    "/sessions/{session_id}",
    response_model=SessionResponse,
    tags=["Chat sessions"],
)
def patch_session(
    session_id: str,
    payload: SessionUpdate,
    db: Session = Depends(get_db),
) -> SessionResponse:
    try:
        return SessionResponse.model_validate(update_session(session_id, payload, db))
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

@app.delete("/sessions", tags=["Chat sessions"])
def remove_all_sessions(db: Session = Depends(get_db)) -> dict:
    deleted_count = delete_all_sessions(db)

    return {
        "message": "All chat sessions and messages were deleted.",
        "deleted_sessions": deleted_count,
    }


@app.delete("/sessions/{session_id}", tags=["Chat sessions"])
def remove_session(
    session_id: str,
    db: Session = Depends(get_db),
) -> dict:
    try:
        delete_session(session_id, db)

        return {
            "message": "Chat session and its messages were deleted."
        }
    except LookupError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc


@app.get(
    "/history/{session_id}",
    response_model=HistoryResponse,
    tags=["Chat sessions"],
)
def history(session_id: str, db: Session = Depends(get_db)) -> HistoryResponse:
    try:
        return get_history(session_id, db)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
def chat(payload: ChatRequest, db: Session = Depends(get_db)) -> ChatResponse:
    try:
        return answer_question(
            session_id=payload.session_id,
            document_id=payload.document_id,
            question=payload.question,
            db=db,
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Chat request failed")
        raise HTTPException(status_code=500, detail="The chat request failed.") from exc

