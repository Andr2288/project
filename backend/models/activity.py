import re
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SUMMARY_MAX = 1000
_DEFAULT_LIMIT = 500
_KYIV = ZoneInfo("Europe/Kyiv")
_UTC = ZoneInfo("UTC")


def log_activity(db, user_id, action, summary):
    """Додає запис у історію дій користувача. action — короткий код; summary — текст для показу та пошуку."""
    s = (summary or "")[:SUMMARY_MAX]
    db.execute(
        "INSERT INTO user_activity (user_id, action, summary) VALUES (?, ?, ?)",
        (user_id, action, s),
    )
    db.commit()


def _validate_day(value):
    if value is None or value == "":
        return None
    if not isinstance(value, str) or not _DATE_RE.match(value):
        raise ValueError("date має бути у форматі РРРР-ММ-ДД")
    return value


def _kyiv_day_utc_bounds(day_str: str) -> tuple[str, str]:
    try:
        d = datetime.strptime(day_str, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("date має бути у форматі РРРР-ММ-ДД") from None
    start_kyiv = datetime(d.year, d.month, d.day, 0, 0, 0, tzinfo=_KYIV)
    end_kyiv = start_kyiv + timedelta(days=1)
    start_utc = start_kyiv.astimezone(_UTC).replace(tzinfo=None)
    end_utc = end_kyiv.astimezone(_UTC).replace(tzinfo=None)
    return (
        start_utc.strftime("%Y-%m-%d %H:%M:%S"),
        end_utc.strftime("%Y-%m-%d %H:%M:%S"),
    )


def list_user_activity(db, user_id, day=None, search=None, limit=_DEFAULT_LIMIT):
    day = _validate_day(day)

    lim = int(limit) if limit is not None else _DEFAULT_LIMIT
    if lim < 1 or lim > 2000:
        lim = _DEFAULT_LIMIT

    wh = ["user_id = ?"]
    params = [user_id]

    if day:
        start_utc_s, end_utc_s = _kyiv_day_utc_bounds(day)
        wh.append(
            "datetime(created_at) >= datetime(?) AND datetime(created_at) < datetime(?)"
        )
        params.extend([start_utc_s, end_utc_s])
    if search and search.strip():
        wh.append("LOWER(summary) LIKE '%' || LOWER(?) || '%'")
        params.append(search.strip())

    sql = f"""
        SELECT id, action, summary, created_at
        FROM user_activity
        WHERE {' AND '.join(wh)}
        ORDER BY datetime(created_at) DESC, id DESC
        LIMIT ?
    """
    params.append(lim)
    cur = db.execute(sql, params)
    return [
        {
            "id": r["id"],
            "action": r["action"],
            "summary": r["summary"],
            "created_at": r["created_at"],
        }
        for r in cur.fetchall()
    ]
