import secrets

from werkzeug.security import check_password_hash, generate_password_hash


def _row_to_public_user(row):
    return {"id": row["id"], "username": row["username"]}


def get_user_by_username(db, username):
    cur = db.execute(
        "SELECT id, username, password_hash FROM users WHERE username = ?",
        (username.strip().lower(),),
    )
    row = cur.fetchone()
    return row


def get_user_by_id(db, user_id):
    cur = db.execute(
        "SELECT id, username FROM users WHERE id = ?",
        (user_id,),
    )
    row = cur.fetchone()
    return _row_to_public_user(row) if row else None


def create_user(db, username, password):
    normalized = username.strip().lower()
    pw_hash = generate_password_hash(password)
    cur = db.execute(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        (normalized, pw_hash),
    )
    db.commit()
    return get_user_by_id(db, cur.lastrowid)


def verify_login(db, username, password):
    row = get_user_by_username(db, username)
    if row is None:
        return None
    if not check_password_hash(row["password_hash"], password):
        return None
    return _row_to_public_user(row)


def set_reset_token(db, user_id, token):
    db.execute(
        """
        UPDATE users
        SET reset_token = ?, reset_token_expires = datetime('now', '+1 hour')
        WHERE id = ?
        """,
        (token, user_id),
    )
    db.commit()


def get_user_id_by_reset_token(db, token):
    cur = db.execute(
        """
        SELECT id FROM users
        WHERE reset_token = ?
          AND reset_token_expires IS NOT NULL
          AND reset_token_expires > datetime('now')
        """,
        (token,),
    )
    row = cur.fetchone()
    return row["id"] if row else None


def update_password_clear_reset(db, user_id, new_password):
    pw_hash = generate_password_hash(new_password)
    db.execute(
        """
        UPDATE users
        SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL
        WHERE id = ?
        """,
        (pw_hash, user_id),
    )
    db.commit()


def make_reset_token():
    return secrets.token_urlsafe(32)
