import re
from datetime import datetime

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_MISSING = object()


def normalize_due_date(value):
    """Повертає None якщо дати немає. ValueError якщо рядок некоректний."""
    if value is None or value == "":
        return None
    if not isinstance(value, str) or not _DATE_RE.match(value):
        raise ValueError("due_date має бути у форматі РРРР-ММ-ДД")
    datetime.strptime(value, "%Y-%m-%d")
    return value


def _row_to_task(row):
    return {
        "id": row["id"],
        "list_id": row["list_id"],
        "title": row["title"],
        "is_done": bool(row["is_done"]),
        "due_date": row["due_date"],
        "created_at": row["created_at"],
    }


def list_tasks(db, user_id, list_id):
    cur = db.execute(
        """
        SELECT t.id, t.list_id, t.title, t.is_done, t.due_date, t.created_at
        FROM tasks t
        INNER JOIN task_lists l ON l.id = t.list_id AND l.user_id = t.user_id
        WHERE t.user_id = ? AND t.list_id = ?
        ORDER BY (t.due_date IS NULL), t.due_date ASC, t.id ASC
        """,
        (user_id, list_id),
    )
    return [_row_to_task(r) for r in cur.fetchall()]


def get_task_by_id(db, user_id, task_id):
    cur = db.execute(
        """
        SELECT id, list_id, title, is_done, due_date, created_at
        FROM tasks
        WHERE id = ? AND user_id = ?
        """,
        (task_id, user_id),
    )
    row = cur.fetchone()
    return _row_to_task(row) if row else None


def create_task(db, user_id, list_id, title, due_date=None):
    cur = db.execute(
        "INSERT INTO tasks (user_id, list_id, title, due_date) VALUES (?, ?, ?, ?)",
        (user_id, list_id, title.strip(), due_date),
    )
    db.commit()
    return get_task_by_id(db, user_id, cur.lastrowid)


def update_task(db, user_id, task_id, title=None, is_done=None, due_date=_MISSING):
    cur = db.execute(
        "SELECT id, title, is_done, due_date FROM tasks WHERE id = ? AND user_id = ?",
        (task_id, user_id),
    )
    row = cur.fetchone()
    if row is None:
        return None

    new_title = row["title"] if title is None else title.strip()
    if not new_title:
        raise ValueError("title не може бути порожнім")

    if is_done is None:
        new_done = row["is_done"]
    else:
        new_done = 1 if bool(is_done) else 0

    if due_date is _MISSING:
        new_due = row["due_date"]
    else:
        new_due = due_date

    db.execute(
        """
        UPDATE tasks
        SET title = ?, is_done = ?, due_date = ?
        WHERE id = ? AND user_id = ?
        """,
        (new_title, new_done, new_due, task_id, user_id),
    )
    db.commit()
    return get_task_by_id(db, user_id, task_id)


def delete_task(db, user_id, task_id):
    cur = db.execute(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        (task_id, user_id),
    )
    db.commit()
    return cur.rowcount > 0
