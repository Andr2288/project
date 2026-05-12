from flask import jsonify, request, session

from models.database import get_db
from models.lists import (
    create_list,
    delete_list,
    ensure_default_list,
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
    try:
        lst = create_list(db, _current_user_id(), name)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify(lst), 201


@api_bp.patch("/lists/<int:list_id>")
@login_required
def lists_patch(list_id):
    data = request.get_json(silent=True) or {}
    name = data.get("name", "")
    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Поле name обов'язкове"}), 400
    db = get_db()
    try:
        lst = rename_list(db, _current_user_id(), list_id, name)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if lst is None:
        return jsonify({"error": "Список не знайдено"}), 404
    return jsonify(lst)


@api_bp.delete("/lists/<int:list_id>")
@login_required
def lists_delete(list_id):
    db = get_db()
    if not delete_list(db, _current_user_id(), list_id):
        return jsonify({"error": "Список не знайдено"}), 404
    return "", 204
