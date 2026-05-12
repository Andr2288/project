import sqlite3
from pathlib import Path

from flask import current_app, g


def get_db():
    if "db" not in g:
        path = current_app.config["DATABASE_PATH"]
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        g.db = conn
    return g.db


def close_db(_e=None):
    conn = g.pop("db", None)
    if conn is not None:
        conn.close()


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            reset_token TEXT,
            reset_token_expires TEXT
        );
        """
    )

    cur = db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'",
    )
    if cur.fetchone() is None:
        db.execute(
            """
            CREATE TABLE tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                is_done INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
        )
    else:
        info = db.execute("PRAGMA table_info(tasks)").fetchall()
        cols = {row[1] for row in info}
        if "user_id" not in cols:
            db.execute("ALTER TABLE tasks ADD COLUMN user_id INTEGER")
            db.execute("DELETE FROM tasks")
    db.commit()
