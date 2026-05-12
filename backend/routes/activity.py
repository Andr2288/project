from flask import jsonify, request, session

from models.activity import list_user_activity
from models.database import get_db

from . import api_bp
from .decorators import login_required


def _current_user_id():
    return int(session["user_id"])


@api_bp.get("/activity")
@login_required
def activity_index():
    day = request.args.get("date", type=str)
    raw_q = request.args.get("q", type=str, default="") or ""
    search = raw_q.strip() or None
    limit = request.args.get("limit", type=int)

    db = get_db()
    try:
        rows = list_user_activity(
            db,
            _current_user_id(),
            day=day,
            search=search,
            limit=limit,
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify(rows)
