import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from config import get_config
from models.database import close_db, init_db
from routes import register_blueprints

load_dotenv()

_DEV_ORIGINS = (
    "http://127.0.0.1:5173",
    "http://localhost:5173",
)


def create_app():
    app = Flask(__name__)
    cfg = get_config()
    app.config.from_object(cfg)
    app.config.setdefault("SESSION_COOKIE_SAMESITE", "Lax")
    app.config.setdefault("SESSION_COOKIE_HTTPONLY", True)
    app.config.setdefault("SESSION_COOKIE_SECURE", False)

    CORS(
        app,
        resources={r"/api/*": {"origins": list(_DEV_ORIGINS)}},
        supports_credentials=True,
    )

    app.teardown_appcontext(close_db)

    with app.app_context():
        init_db()

    register_blueprints(app)

    return app


app = create_app()

if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host="127.0.0.1", port=5000, debug=debug)
