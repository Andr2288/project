from flask import jsonify, request

from models.database import get_db
from models.tasks import create_task, delete_task, list_tasks, update_task

from . import api_bp


@api_bp.get("/health")
def health():
    return {"status": "ok"}


@api_bp.get("/tasks")
def tasks_list():
    db = get_db()
    return jsonify(list_tasks(db))


@api_bp.post("/tasks")
def tasks_create():
    data = request.get_json(silent=True) or {}
    title = data.get("title", "")
    if not isinstance(title, str) or not title.strip():
        return jsonify({"error": "Поле title обов'язкове"}), 400

    db = get_db()
    task = create_task(db, title)
    return jsonify(task), 201


@api_bp.patch("/tasks/<int:task_id>")
def tasks_patch(task_id):
    data = request.get_json(silent=True) or {}
    title = data.get("title", None)
    is_done = data.get("is_done", None)

    if title is not None and not isinstance(title, str):
        return jsonify({"error": "title має бути рядком"}), 400
    if is_done is not None and not isinstance(is_done, bool):
        return jsonify({"error": "is_done має бути true або false"}), 400
    if title is None and is_done is None:
        return jsonify({"error": "Немає полів для оновлення"}), 400

    db = get_db()
    try:
        task = update_task(db, task_id, title=title, is_done=is_done)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if task is None:
        return jsonify({"error": "Задачу не знайдено"}), 404

    return jsonify(task)


@api_bp.delete("/tasks/<int:task_id>")
def tasks_delete(task_id):
    db = get_db()
    if not delete_task(db, task_id):
        return jsonify({"error": "Задачу не знайдено"}), 404
    return "", 204
