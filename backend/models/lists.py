def _row(row):
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "name": row["name"],
        "created_at": row["created_at"],
    }


def list_lists(db, user_id):
    cur = db.execute(
        """
        SELECT id, user_id, name, created_at
        FROM task_lists
        WHERE user_id = ?
        ORDER BY id ASC
        """,
        (user_id,),
    )
    return [_row(r) for r in cur.fetchall()]


def get_list(db, user_id, list_id):
    cur = db.execute(
        """
        SELECT id, user_id, name, created_at
        FROM task_lists
        WHERE id = ? AND user_id = ?
        """,
        (list_id, user_id),
    )
    row = cur.fetchone()
    return _row(row) if row else None


def create_list(db, user_id, name):
    trimmed = name.strip()
    if not trimmed:
        raise ValueError("Назва списку не може бути порожньою")
    cur = db.execute(
        "INSERT INTO task_lists (user_id, name) VALUES (?, ?)",
        (user_id, trimmed),
    )
    db.commit()
    return get_list(db, user_id, cur.lastrowid)


def ensure_default_list(db, user_id):
    existing = list_lists(db, user_id)
    if existing:
        return existing[0]
    return create_list(db, user_id, "Мої задачі")


def rename_list(db, user_id, list_id, name):
    if get_list(db, user_id, list_id) is None:
        return None
    trimmed = name.strip()
    if not trimmed:
        raise ValueError("Назва списку не може бути порожньою")
    db.execute(
        "UPDATE task_lists SET name = ? WHERE id = ? AND user_id = ?",
        (trimmed, list_id, user_id),
    )
    db.commit()
    return get_list(db, user_id, list_id)


def delete_list(db, user_id, list_id):
    if get_list(db, user_id, list_id) is None:
        return False

    db.execute(
        "DELETE FROM tasks WHERE list_id = ? AND user_id = ?",
        (list_id, user_id),
    )
    db.execute(
        "DELETE FROM task_lists WHERE id = ? AND user_id = ?",
        (list_id, user_id),
    )
    db.commit()
    return True
