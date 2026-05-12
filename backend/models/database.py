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

    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS task_lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
                list_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                is_done INTEGER NOT NULL DEFAULT 0,
                due_date TEXT,
                priority INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (list_id) REFERENCES task_lists(id) ON DELETE CASCADE
            );
            """,
        )
    else:
        cols = {row[1] for row in db.execute("PRAGMA table_info(tasks)").fetchall()}
        if "user_id" not in cols:
            db.execute("ALTER TABLE tasks ADD COLUMN user_id INTEGER")
            db.execute("DELETE FROM tasks")
        if "list_id" not in cols:
            db.execute("ALTER TABLE tasks ADD COLUMN list_id INTEGER")
            rows = db.execute(
                "SELECT DISTINCT user_id FROM tasks WHERE user_id IS NOT NULL",
            ).fetchall()
            for (uid,) in rows:
                db.execute(
                    "INSERT INTO task_lists (user_id, name) VALUES (?, ?)",
                    (uid, "Мої задачі"),
                )
                lid = db.execute("SELECT last_insert_rowid()").fetchone()[0]
                db.execute(
                    "UPDATE tasks SET list_id = ? WHERE user_id = ? AND list_id IS NULL",
                    (lid, uid),
                )
            db.execute("DELETE FROM tasks WHERE list_id IS NULL")
        if "due_date" not in cols:
            db.execute("ALTER TABLE tasks ADD COLUMN due_date TEXT")
        if "priority" not in cols:
            db.execute(
                "ALTER TABLE tasks ADD COLUMN priority INTEGER NOT NULL DEFAULT 1",
            )

    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (user_id, name)
        );
        CREATE TABLE IF NOT EXISTS task_tags (
            task_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (task_id, tag_id),
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS user_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            summary TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_user_activity_user_created
        ON user_activity (user_id, created_at);
        """,
    )
    db.commit()
