from flask import jsonify, request, session

from models.database import get_db
from models.lists import get_list
from models.tasks import create_task, delete_task, list_tasks, update_task

from . import api_bp
from .decorators import login_required


@api_bp.get("/health")
def health():
    return {"status": "ok"}


def _current_user_id():
    return int(session["user_id"])


@api_bp.get("/tasks")
@login_required
def tasks_list():
    list_id = request.args.get("list_id", type=int)
    if list_id is None:
        return jsonify({"error": "Потрібен query-параметр list_id"}), 400
    db = get_db()
    uid = _current_user_id()
    if get_list(db, uid, list_id) is None:
        return jsonify({"error": "Список не знайдено"}), 404
    return jsonify(list_tasks(db, uid, list_id))


@api_bp.post("/tasks")
@login_required
def tasks_create():
    data = request.get_json(silent=True) or {}
    title = data.get("title", "")
    list_id = data.get("list_id")
    if not isinstance(title, str) or not title.strip():
        return jsonify({"error": "Поле title обов'язкове"}), 400
    if not isinstance(list_id, int):
        return jsonify({"error": "Поле list_id обов'язкове (число)"}), 400

    db = get_db()
    uid = _current_user_id()
    if get_list(db, uid, list_id) is None:
        return jsonify({"error": "Список не знайдено"}), 404

    task = create_task(db, uid, list_id, title)
    return jsonify(task), 201


@api_bp.patch("/tasks/<int:task_id>")
@login_required
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
        task = update_task(db, _current_user_id(), task_id, title=title, is_done=is_done)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if task is None:
        return jsonify({"error": "Задачу не знайдено"}), 404

    return jsonify(task)


@api_bp.delete("/tasks/<int:task_id>")
@login_required
def tasks_delete(task_id):
    db = get_db()
    if not delete_task(db, _current_user_id(), task_id):
        return jsonify({"error": "Задачу не знайдено"}), 404
    return "", 204
