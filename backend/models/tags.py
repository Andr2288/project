_TAG_MAX = 64


def normalize_tag_name(name):
    if not isinstance(name, str):
        raise ValueError("тег має бути рядком")
    s = name.strip().lower()
    if not s:
        raise ValueError("порожня назва тега")
    if len(s) > _TAG_MAX:
        raise ValueError(f"тег занадто довгий (макс. {_TAG_MAX} символів)")
    return s


def list_user_tags(db, user_id):
    cur = db.execute(
        """
        SELECT id, name
        FROM tags
        WHERE user_id = ?
        ORDER BY LOWER(name)
        """,
        (user_id,),
    )
    return [{"id": r["id"], "name": r["name"]} for r in cur.fetchall()]


def tag_belongs_to_user(db, user_id, tag_id):
    row = db.execute(
        "SELECT 1 FROM tags WHERE id = ? AND user_id = ?",
        (tag_id, user_id),
    ).fetchone()
    return row is not None


def get_or_create_tag_id(db, user_id, raw_name):
    norm = normalize_tag_name(raw_name)
    row = db.execute(
        "SELECT id FROM tags WHERE user_id = ? AND name = ?",
        (user_id, norm),
    ).fetchone()
    if row:
        return int(row["id"])
    cur = db.execute(
        "INSERT INTO tags (user_id, name) VALUES (?, ?)",
        (user_id, norm),
    )
    return int(cur.lastrowid)


def tags_for_task_ids(db, user_id, task_ids):
    if not task_ids:
        return {}
    placeholders = ",".join("?" * len(task_ids))
    cur = db.execute(
        f"""
        SELECT tt.task_id, g.id AS tag_id, g.name AS tag_name
        FROM task_tags tt
        INNER JOIN tags g ON g.id = tt.tag_id AND g.user_id = ?
        INNER JOIN tasks t ON t.id = tt.task_id AND t.user_id = ?
        WHERE tt.task_id IN ({placeholders})
        ORDER BY LOWER(g.name)
        """,
        (user_id, user_id, *task_ids),
    )
    out = {}
    for r in cur.fetchall():
        tid = int(r["task_id"])
        out.setdefault(tid, []).append({"id": int(r["tag_id"]), "name": r["tag_name"]})
    return out


def replace_task_tags(db, user_id, task_id, tag_names):
    """
    tag_names: iterable of raw strings; duplicates normalized to one.
    Повністю замінює набір тегів задачі.
    """
    row = db.execute(
        "SELECT id FROM tasks WHERE id = ? AND user_id = ?",
        (task_id, user_id),
    ).fetchone()
    if row is None:
        return False

    seen = set()
    ordered_ids = []
    for raw in tag_names:
        if not isinstance(raw, str) or not raw.strip():
            continue
        tid = get_or_create_tag_id(db, user_id, raw)
        if tid not in seen:
            seen.add(tid)
            ordered_ids.append(tid)

    db.execute("DELETE FROM task_tags WHERE task_id = ?", (task_id,))
    for tid in ordered_ids:
        db.execute(
            "INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)",
            (task_id, tid),
        )
    db.commit()
    return True
