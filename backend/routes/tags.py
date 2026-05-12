from flask import jsonify, session

from models.database import get_db
from models.tags import list_user_tags

from . import api_bp
from .decorators import login_required


def _current_user_id():
    return int(session["user_id"])


@api_bp.get("/tags")
@login_required
def tags_list():
    db = get_db()
    return jsonify(list_user_tags(db, _current_user_id()))
