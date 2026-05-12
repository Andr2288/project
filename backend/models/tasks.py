import re
from datetime import datetime

from .tags import replace_task_tags, tags_for_task_ids

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_MISSING = object()

_PRIORITY_TO_INT = {"low": 0, "medium": 1, "high": 2}
_INT_TO_PRIORITY = {0: "low", 1: "medium", 2: "high"}


def normalize_due_date(value):
    """Повертає None якщо дати немає. ValueError якщо рядок некоректний."""
    if value is None or value == "":
        return None
    if not isinstance(value, str) or not _DATE_RE.match(value):
        raise ValueError("due_date має бути у форматі РРРР-ММ-ДД")
    datetime.strptime(value, "%Y-%m-%d")
    return value


def normalize_priority(value):
    """Повертає 0..2. ValueError якщо значення некоректне."""
    if value is None:
        raise ValueError("priority не задано")
    if isinstance(value, int) and 0 <= value <= 2:
        return value
    if isinstance(value, str) and value in _PRIORITY_TO_INT:
        return _PRIORITY_TO_INT[value]
    raise ValueError("priority має бути low, medium, high або число 0–2")


def _priority_label(priority_int):
    try:
        v = int(priority_int)
    except (TypeError, ValueError):
        v = 1
    return _INT_TO_PRIORITY.get(v, "medium")


def _row_to_task(row, tags=None):
    return {
        "id": row["id"],
        "list_id": row["list_id"],
        "title": row["title"],
        "is_done": bool(row["is_done"]),
        "due_date": row["due_date"],
        "priority": _priority_label(row["priority"] if "priority" in row.keys() else 1),
        "tags": tags if tags is not None else [],
        "created_at": row["created_at"],
    }


def _attach_tags(db, user_id, tasks):
    ids = [t["id"] for t in tasks]
    by_task = tags_for_task_ids(db, user_id, ids)
    for t in tasks:
        t["tags"] = by_task.get(t["id"], [])


def list_tasks(db, user_id, list_id, search=None, status="all", tag_id=None):
    wh = ["t.user_id = ?", "t.list_id = ?"]
    params = [user_id, list_id]

    if status == "active":
        wh.append("t.is_done = 0")
    elif status == "done":
        wh.append("t.is_done = 1")

    if search:
        wh.append("LOWER(t.title) LIKE '%' || LOWER(?) || '%'")
        params.append(search.strip())

    if tag_id is not None:
        wh.append(
            "EXISTS ("
            "SELECT 1 FROM task_tags tt "
            "INNER JOIN tags tg ON tg.id = tt.tag_id AND tg.user_id = t.user_id "
            "WHERE tt.task_id = t.id AND tt.tag_id = ?"
            ")",
        )
        params.append(tag_id)

    sql = f"""
        SELECT t.id, t.list_id, t.title, t.is_done, t.due_date, t.priority, t.created_at
        FROM tasks t
        INNER JOIN task_lists l ON l.id = t.list_id AND l.user_id = t.user_id
        WHERE {' AND '.join(wh)}
        ORDER BY (t.due_date IS NULL), t.due_date ASC, t.priority DESC, t.id ASC
    """
    cur = db.execute(sql, params)
    tasks = [_row_to_task(r) for r in cur.fetchall()]
    _attach_tags(db, user_id, tasks)
    return tasks


def get_task_by_id(db, user_id, task_id):
    cur = db.execute(
        """
        SELECT id, list_id, title, is_done, due_date, priority, created_at
        FROM tasks
        WHERE id = ? AND user_id = ?
        """,
        (task_id, user_id),
    )
    row = cur.fetchone()
    if row is None:
        return None
    task = _row_to_task(row)
    _attach_tags(db, user_id, [task])
    return task


def create_task(db, user_id, list_id, title, due_date=None, priority=1, tag_names=None):
    if priority not in (0, 1, 2):
        raise ValueError("priority має бути 0, 1 або 2")

    cur = db.execute(
        """
        INSERT INTO tasks (user_id, list_id, title, due_date, priority)
        VALUES (?, ?, ?, ?, ?)
        """,
        (user_id, list_id, title.strip(), due_date, priority),
    )
    task_id = int(cur.lastrowid)
    db.commit()

    if tag_names:
        replace_task_tags(db, user_id, task_id, tag_names)

    return get_task_by_id(db, user_id, task_id)


def update_task(
    db,
    user_id,
    task_id,
    title=None,
    is_done=None,
    due_date=_MISSING,
    priority=_MISSING,
    tags=_MISSING,
):
    cur = db.execute(
        """
        SELECT id, title, is_done, due_date, priority
        FROM tasks
        WHERE id = ? AND user_id = ?
        """,
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

    if priority is _MISSING:
        new_pri = row["priority"]
    else:
        if int(priority) not in (0, 1, 2):
            raise ValueError("priority має бути 0, 1 або 2")
        new_pri = int(priority)

    db.execute(
        """
        UPDATE tasks
        SET title = ?, is_done = ?, due_date = ?, priority = ?
        WHERE id = ? AND user_id = ?
        """,
        (new_title, new_done, new_due, new_pri, task_id, user_id),
    )
    db.commit()

    if tags is not _MISSING:
        if not replace_task_tags(db, user_id, task_id, tags):
            return None

    return get_task_by_id(db, user_id, task_id)


def delete_task(db, user_id, task_id):
    cur = db.execute(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        (task_id, user_id),
    )
    db.commit()
    return cur.rowcount > 0
