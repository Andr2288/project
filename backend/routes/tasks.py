from flask import jsonify, request, session

from models.database import get_db
from models.lists import get_list
from models.tags import tag_belongs_to_user
from models.tasks import (
    create_task,
    delete_task,
    list_tasks,
    normalize_due_date,
    normalize_priority,
    update_task,
)

from . import api_bp
from .decorators import login_required


@api_bp.get("/health")
def health():
    return {"status": "ok"}


def _current_user_id():
    return int(session["user_id"])


def _parse_tag_list(data, key="tags"):
    if key not in data:
        return None
    raw = data.get(key)
    if raw is None:
        return []
    if not isinstance(raw, list):
        raise ValueError("tags має бути масивом рядків")
    out = []
    for item in raw:
        if not isinstance(item, str):
            raise ValueError("кожен тег має бути рядком")
        if item.strip():
            out.append(item)
    return out


@api_bp.get("/tasks")
@login_required
def tasks_list():
    list_id = request.args.get("list_id", type=int)
    if list_id is None:
        return jsonify({"error": "Потрібен query-параметр list_id"}), 400

    status = request.args.get("status", "all")
    if status not in ("all", "active", "done"):
        return jsonify({"error": "status має бути all, active або done"}), 400

    raw_q = request.args.get("q", type=str, default="") or ""
    search = raw_q.strip() or None

    tag_id = request.args.get("tag_id", type=int)

    db = get_db()
    uid = _current_user_id()
    if get_list(db, uid, list_id) is None:
        return jsonify({"error": "Список не знайдено"}), 404

    if tag_id is not None and not tag_belongs_to_user(db, uid, tag_id):
        return jsonify({"error": "Тег не знайдено"}), 404

    return jsonify(list_tasks(db, uid, list_id, search=search, status=status, tag_id=tag_id))


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

    due_date = None
    if "due_date" in data:
        raw = data.get("due_date")
        if raw is None or raw == "":
            due_date = None
        else:
            try:
                due_date = normalize_due_date(raw)
            except ValueError as e:
                return jsonify({"error": str(e)}), 400

    priority = 1
    if "priority" in data:
        try:
            priority = normalize_priority(data.get("priority"))
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    try:
        tag_names = _parse_tag_list(data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    db = get_db()
    uid = _current_user_id()
    if get_list(db, uid, list_id) is None:
        return jsonify({"error": "Список не знайдено"}), 404

    try:
        task = create_task(
            db,
            uid,
            list_id,
            title,
            due_date=due_date,
            priority=priority,
            tag_names=tag_names,
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(task), 201


@api_bp.patch("/tasks/<int:task_id>")
@login_required
def tasks_patch(task_id):
    data = request.get_json(silent=True) or {}
    title = data.get("title", None)
    is_done = data.get("is_done", None)
    has_due = "due_date" in data
    has_priority = "priority" in data

    try:
        has_tags = "tags" in data
        tag_list = _parse_tag_list(data) if has_tags else None
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if title is not None and not isinstance(title, str):
        return jsonify({"error": "title має бути рядком"}), 400
    if is_done is not None and not isinstance(is_done, bool):
        return jsonify({"error": "is_done має бути true або false"}), 400

    due_kw = {}
    if has_due:
        raw = data.get("due_date")
        if raw is None or raw == "":
            due_kw["due_date"] = None
        else:
            try:
                due_kw["due_date"] = normalize_due_date(raw)
            except ValueError as e:
                return jsonify({"error": str(e)}), 400

    if (
        title is None
        and is_done is None
        and not has_due
        and not has_priority
        and not has_tags
    ):
        return jsonify({"error": "Немає полів для оновлення"}), 400

    priority_val = None
    if has_priority:
        try:
            priority_val = normalize_priority(data.get("priority"))
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    db = get_db()
    uid = _current_user_id()

    kwargs = dict(db=db, user_id=uid, task_id=task_id, title=title, is_done=is_done)
    kwargs.update(due_kw)
    if has_priority:
        kwargs["priority"] = priority_val
    if has_tags:
        kwargs["tags"] = tag_list

    try:
        task = update_task(**kwargs)
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
