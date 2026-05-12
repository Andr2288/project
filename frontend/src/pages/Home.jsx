import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLists } from "../api/lists.js";
import { fetchTags } from "../api/tags.js";
import { createTask, deleteTask, fetchTasks, patchTask } from "../api/tasks.js";
import { sortTasksLikeApi } from "../utils/tasks.js";
import { AlertModal } from "../components/Modal.jsx";
import { AddTaskForm } from "../components/AddTaskForm.jsx";
import { TaskItem } from "../components/TaskItem.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export function Home() {
  const { listId } = useParams();
  const listIdNum = Number(listId);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [listTitle, setListTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setTagFilter("");
  }, [listId]);

  const loadAll = useCallback(async () => {
    if (!Number.isFinite(listIdNum) || listIdNum <= 0) {
      setError("Некоректний ідентифікатор списку");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    const tagIdNum = tagFilter === "" ? null : Number(tagFilter);
    const tagIdParam = tagFilter !== "" && Number.isFinite(tagIdNum) ? tagIdNum : null;
    try {
      const [taskData, lists, tagsData] = await Promise.all([
        fetchTasks(listIdNum, {
          q: debouncedSearch,
          status: statusFilter,
          tagId: tagIdParam,
        }),
        fetchLists(),
        fetchTags(),
      ]);
      setTasks(sortTasksLikeApi(taskData));
      const title = lists.find((l) => l.id === listIdNum)?.name ?? "";
      setListTitle(title);
      setTagOptions(tagsData);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не вдалося завантажити дані";
      if (msg === "Потрібна авторизація") {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      if (msg.includes("не знайдено") || msg.includes("Список")) {
        navigate("/", { replace: true });
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [listIdNum, logout, navigate, debouncedSearch, statusFilter, tagFilter]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleAdd(title, dueDate, priority, tags) {
    setError(null);
    try {
      const payload = { title, listId: listIdNum, priority };
      if (dueDate) payload.dueDate = dueDate;
      if (tags?.length) payload.tags = tags;
      const task = await createTask(payload);
      setTasks((prev) => sortTasksLikeApi([...prev, task]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося створити задачу");
    }
  }

  async function handleToggleDone(task) {
    setError(null);
    try {
      const updated = await patchTask(task.id, { is_done: !task.is_done });
      setTasks((prev) => sortTasksLikeApi(prev.map((t) => (t.id === updated.id ? updated : t))));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося оновити задачу");
    }
  }

  async function handleSaveTitle(task, title) {
    setError(null);
    try {
      const updated = await patchTask(task.id, { title });
      setTasks((prev) => sortTasksLikeApi(prev.map((t) => (t.id === updated.id ? updated : t))));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося зберегти назву");
    }
  }

  async function handleSaveDueDate(task, dueDate) {
    setError(null);
    try {
      const updated = await patchTask(task.id, { due_date: dueDate });
      setTasks((prev) => sortTasksLikeApi(prev.map((t) => (t.id === updated.id ? updated : t))));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не вдалося зберегти термін";
      setError(msg);
      throw e;
    }
  }

  async function handlePatchTask(task, partial) {
    setError(null);
    try {
      const updated = await patchTask(task.id, partial);
      setTasks((prev) => sortTasksLikeApi(prev.map((t) => (t.id === updated.id ? updated : t))));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося оновити задачу");
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося видалити задачу");
    }
  }

  const filtersActive =
    Boolean(debouncedSearch) || statusFilter !== "all" || tagFilter !== "";

  return (
    <div className="px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-ms-text">{listTitle || "Задачі"}</h1>
      <p className="mt-1 text-sm text-ms-muted">
        Дедлайн і пріоритет визначають порядок; без дати — в кінці. Прострочені підсвічуються. Пошук без урахування регістру;
        теги унікальні для вашого облікового запису.
      </p>

      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-ms-border bg-ms-white p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-md">
          <label htmlFor="task-search" className="text-xs font-medium text-ms-muted">
            Пошук за назвою
          </label>
          <input
            id="task-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="фрагмент назви…"
            disabled={loading || !Number.isFinite(listIdNum) || listIdNum <= 0}
            className="rounded-md border border-ms-border bg-ms-canvas/40 px-3 py-2 text-sm text-ms-text outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ms-muted">Статус</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading || !Number.isFinite(listIdNum) || listIdNum <= 0}
            className="rounded-md border border-ms-border bg-ms-white px-2 py-2 text-sm text-ms-text outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
          >
            <option value="all">Усі</option>
            <option value="active">Лише активні</option>
            <option value="done">Лише виконані</option>
          </select>
        </div>
        <div className="flex min-w-0 flex-col gap-1 sm:max-w-xs">
          <span className="text-xs font-medium text-ms-muted">Тег</span>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            disabled={loading || !Number.isFinite(listIdNum) || listIdNum <= 0}
            className="rounded-md border border-ms-border bg-ms-white px-2 py-2 text-sm text-ms-text outline-none ring-ms-blue focus:border-ms-blue focus:ring-2 disabled:opacity-60"
          >
            <option value="">Усі теги</option>
            {tagOptions.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AddTaskForm onAdd={handleAdd} disabled={loading || !Number.isFinite(listIdNum) || listIdNum <= 0} />

      {loading ? (
        <p className="mt-6 text-sm text-ms-muted">Завантаження…</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {tasks.length === 0 ? (
            <li className="rounded-lg border border-dashed border-ms-border bg-ms-white px-4 py-8 text-center text-sm text-ms-muted shadow-card">
              {filtersActive
                ? "Немає задач за обраними фільтрами. Спробуйте змінити пошук, статус або тег."
                : "Поки немає задач у цьому списку. Додайте першу вище."}
            </li>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => handleToggleDone(task)}
                onSaveTitle={(title) => handleSaveTitle(task, title)}
                onSaveDueDate={(due) => handleSaveDueDate(task, due)}
                onPatch={(partial) => handlePatchTask(task, partial)}
                onDelete={() => handleDelete(task.id)}
              />
            ))
          )}
        </ul>
      )}

      <AlertModal open={Boolean(error)} message={error || ""} onClose={() => setError(null)} />
    </div>
  );
}
