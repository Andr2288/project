def _row_to_task(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "is_done": bool(row["is_done"]),
        "created_at": row["created_at"],
    }


def list_tasks(db):
    cur = db.execute(
        "SELECT id, title, is_done, created_at FROM tasks ORDER BY id ASC",
    )
    return [_row_to_task(r) for r in cur.fetchall()]


def get_task_by_id(db, task_id):
    cur = db.execute(
        "SELECT id, title, is_done, created_at FROM tasks WHERE id = ?",
        (task_id,),
    )
    row = cur.fetchone()
    return _row_to_task(row) if row else None


def create_task(db, title):
    cur = db.execute(
        "INSERT INTO tasks (title) VALUES (?)",
        (title.strip(),),
    )
    db.commit()
    return get_task_by_id(db, cur.lastrowid)


def update_task(db, task_id, title=None, is_done=None):
    cur = db.execute(
        "SELECT id, title, is_done FROM tasks WHERE id = ?",
        (task_id,),
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
        "UPDATE tasks SET title = ?, is_done = ? WHERE id = ?",
        (new_title, new_done, task_id),
    )
    db.commit()
    return get_task_by_id(db, task_id)


def delete_task(db, task_id):
    cur = db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    db.commit()
    return cur.rowcount > 0
