import os

os.environ["MYSQL_URL"] = "sqlite:///./test_rag_chatbot.db"

from fastapi.testclient import TestClient

from app.main import app


def test_health() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_session_history_and_patch() -> None:
    with TestClient(app) as client:
        created = client.post("/sessions", json={"title": "My chat"})
        assert created.status_code == 201
        session_id = created.json()["id"]

        renamed = client.patch(
            f"/sessions/{session_id}", json={"title": "Renamed chat"}
        )
        assert renamed.status_code == 200
        assert renamed.json()["title"] == "Renamed chat"

        history = client.get(f"/history/{session_id}")
        assert history.status_code == 200
        assert history.json()["messages"] == []

