from flask import Blueprint

api_bp = Blueprint("api", __name__, url_prefix="/api")


def register_blueprints(app):
    from . import auth  # noqa: F401
    from . import tasks  # noqa: F401

    app.register_blueprint(api_bp)
