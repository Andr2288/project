def _row_to_task(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "is_done": bool(row["is_done"]),
        "created_at": row["created_at"],
    }


def list_tasks(db, user_id):
    cur = db.execute(
        """
        SELECT id, title, is_done, created_at
        FROM tasks
        WHERE user_id = ?
        ORDER BY id ASC
        """,
        (user_id,),
    )
    return [_row_to_task(r) for r in cur.fetchall()]


def get_task_by_id(db, user_id, task_id):
    cur = db.execute(
        """
        SELECT id, title, is_done, created_at
        FROM tasks
        WHERE id = ? AND user_id = ?
        """,
        (task_id, user_id),
    )
    row = cur.fetchone()
    return _row_to_task(row) if row else None


def create_task(db, user_id, title):
    cur = db.execute(
        "INSERT INTO tasks (user_id, title) VALUES (?, ?)",
        (user_id, title.strip()),
    )
    db.commit()
    return get_task_by_id(db, user_id, cur.lastrowid)


def update_task(db, user_id, task_id, title=None, is_done=None):
    cur = db.execute(
        "SELECT id, title, is_done FROM tasks WHERE id = ? AND user_id = ?",
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

    db.execute(
        "UPDATE tasks SET title = ?, is_done = ? WHERE id = ? AND user_id = ?",
        (new_title, new_done, task_id, user_id),
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
