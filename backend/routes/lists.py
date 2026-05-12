from flask import jsonify, request, session

from models.database import get_db
from models.activity import log_activity
from models.lists import (
    create_list,
    delete_list,
    ensure_default_list,
    get_list,
    list_lists,
    rename_list,
)

from . import api_bp
from .decorators import login_required


def _current_user_id():
    return int(session["user_id"])


@api_bp.get("/lists")
@login_required
def lists_index():
    db = get_db()
    uid = _current_user_id()
    ensure_default_list(db, uid)
    return jsonify(list_lists(db, uid))


@api_bp.post("/lists")
@login_required
def lists_create():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "")
    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Поле name обов'язкове"}), 400
    db = get_db()
    uid = _current_user_id()
    try:
        lst = create_list(db, uid, name)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    log_activity(db, uid, "list_create", f"Створено список «{lst['name']}»")
    return jsonify(lst), 201


@api_bp.patch("/lists/<int:list_id>")
@login_required
def lists_patch(list_id):
    data = request.get_json(silent=True) or {}
    name = data.get("name", "")
    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Поле name обов'язкове"}), 400
    db = get_db()
    uid = _current_user_id()
    prev = get_list(db, uid, list_id)
    try:
        lst = rename_list(db, uid, list_id, name)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if lst is None:
        return jsonify({"error": "Список не знайдено"}), 404
    if prev:
        log_activity(
            db,
            uid,
            "list_rename",
            f"Перейменовано список «{prev['name']}» → «{lst['name']}»",
        )
    return jsonify(lst)


@api_bp.delete("/lists/<int:list_id>")
@login_required
def lists_delete(list_id):
    db = get_db()
    uid = _current_user_id()
    prev = get_list(db, uid, list_id)
    if not delete_list(db, uid, list_id):
        return jsonify({"error": "Список не знайдено"}), 404
    if prev:
        log_activity(db, uid, "list_delete", f"Видалено список «{prev['name']}» разом із задачами")
    return "", 204
