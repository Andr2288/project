from functools import wraps

from flask import jsonify, session


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if session.get("user_id") is None:
            return jsonify({"error": "Потрібна авторизація"}), 401
        return view(*args, **kwargs)

    return wrapped
