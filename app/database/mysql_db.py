from collections.abc import Generator

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


settings = get_settings()


class Base(DeclarativeBase):
    pass


engine_options: dict = {
    "pool_pre_ping": True,
}

if settings.mysql_url.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine: Engine = create_engine(settings.mysql_url, **engine_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


if settings.mysql_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _add_missing_columns() -> None:
    """Add columns introduced after a table already existed.

    create_all() only creates missing tables, not missing columns on tables
    that are already there. This keeps existing SQLite/MySQL databases in
    sync without needing a full migration tool.
    """

    inspector = inspect(engine)
    if "chat_sessions" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("chat_sessions")}
    if "document_id" in columns:
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN document_id VARCHAR(36)"))


def init_db() -> None:
    # Importing models registers them on Base.metadata before create_all.
    from app.database import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _add_missing_columns()

