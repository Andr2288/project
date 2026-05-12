import sqlite3

from flask import jsonify, request, session

from models.database import get_db
from models.users import (
    create_user,
    get_user_by_id,
    get_user_by_username,
    get_user_id_by_reset_token,
    make_reset_token,
    set_reset_token,
    update_password_clear_reset,
    verify_login,
)

from . import api_bp


def _validate_username(value):
    if not isinstance(value, str) or len(value.strip()) < 3:
        raise ValueError("Ім'я користувача: мінімум 3 символи")
    return value.strip()


def _validate_password(value):
    if not isinstance(value, str) or len(value) < 6:
        raise ValueError("Пароль: мінімум 6 символів")
    return value


@api_bp.get("/auth/me")
def auth_me():
    uid = session.get("user_id")
    if uid is None:
        return jsonify({"user": None})
    db = get_db()
    user = get_user_by_id(db, int(uid))
    if user is None:
        session.clear()
        return jsonify({"user": None})
    return jsonify({"user": user})


@api_bp.post("/auth/register")
def auth_register():
    data = request.get_json(silent=True) or {}
    try:
        username = _validate_username(data.get("username", ""))
        password = _validate_password(data.get("password", ""))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    db = get_db()
    try:
        user = create_user(db, username, password)
    except sqlite3.IntegrityError:
        return jsonify({"error": "Таке ім'я користувача вже зайняте"}), 409

    session.clear()
    session["user_id"] = user["id"]
    session.permanent = True
    return jsonify({"user": user}), 201


@api_bp.post("/auth/login")
def auth_login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "")
    password = data.get("password", "")
    if not isinstance(username, str) or not isinstance(password, str):
        return jsonify({"error": "Невірний формат даних"}), 400

    db = get_db()
    user = verify_login(db, username, password)
    if user is None:
        return jsonify({"error": "Невірне ім'я користувача або пароль"}), 401

    session.clear()
    session["user_id"] = user["id"]
    session.permanent = True
    return jsonify({"user": user})


@api_bp.post("/auth/logout")
def auth_logout():
    session.clear()
    return "", 204


@api_bp.post("/auth/forgot-password")
def auth_forgot_password():
    """
    Демо: токен повертається в JSON замість листа.
    У продакшні токен надсилали б лише на email і не показували в API.
    """
    data = request.get_json(silent=True) or {}
    username = data.get("username", "")
    if not isinstance(username, str) or not username.strip():
        return jsonify({"error": "Вкажіть ім'я користувача"}), 400

    db = get_db()
    row = get_user_by_username(db, username)
    if row is None:
        return jsonify(
            {
                "message": "Якщо обліковий запис існує, на email було б надіслано посилання для скидання.",
                "simulation": True,
                "note": "Демо: користувача з таким іменем не знайдено.",
            },
        )

    token = make_reset_token()
    set_reset_token(db, row["id"], token)
    exp_row = db.execute(
        "SELECT reset_token_expires FROM users WHERE id = ?",
        (row["id"],),
    ).fetchone()
    expires_at = exp_row[0] if exp_row else None

    return jsonify(
        {
            "message": "Демо-режим: замість листа токен показано тут. У продакшні його не повертали б у відповіді.",
            "reset_token": token,
            "simulation": True,
            "expires_at": expires_at,
        },
    )


@api_bp.post("/auth/reset-password")
def auth_reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token", "")
    new_password = data.get("new_password", "")
    if not isinstance(token, str) or not token.strip():
        return jsonify({"error": "Вкажіть токен скидання"}), 400
    try:
        new_password = _validate_password(new_password)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    db = get_db()
    user_id = get_user_id_by_reset_token(db, token.strip())
    if user_id is None:
        return jsonify({"error": "Токен недійсний або прострочений"}), 400

    update_password_clear_reset(db, user_id, new_password)
    return jsonify({"message": "Пароль оновлено. Увійдіть з новим паролем."})
