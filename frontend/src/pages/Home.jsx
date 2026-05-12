import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLists } from "../api/lists.js";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    if (!Number.isFinite(listIdNum) || listIdNum <= 0) {
      setError("Некоректний ідентифікатор списку");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const [taskData, lists] = await Promise.all([fetchTasks(listIdNum), fetchLists()]);
      setTasks(sortTasksLikeApi(taskData));
      const title = lists.find((l) => l.id === listIdNum)?.name ?? "";
      setListTitle(title);
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
  }, [listIdNum, logout, navigate]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleAdd(title, dueDate) {
    setError(null);
    try {
      const payload = { title, listId: listIdNum };
      if (dueDate) payload.dueDate = dueDate;
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

  async function handleDelete(id) {
    setError(null);
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося видалити задачу");
    }
  }

  return (
    <div className="px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-ms-text">{listTitle || "Задачі"}</h1>
      <p className="mt-1 text-sm text-ms-muted">
        Термін у форматі дати; список сортується за дедлайном (без дати — в кінці). Прострочені підсвічуються.
      </p>

      <AddTaskForm onAdd={handleAdd} disabled={loading || !Number.isFinite(listIdNum) || listIdNum <= 0} />

      {loading ? (
        <p className="mt-6 text-sm text-ms-muted">Завантаження…</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {tasks.length === 0 ? (
            <li className="rounded-lg border border-dashed border-ms-border bg-ms-white px-4 py-8 text-center text-sm text-ms-muted shadow-card">
              Поки немає задач у цьому списку. Додайте першу вище.
            </li>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => handleToggleDone(task)}
                onSaveTitle={(title) => handleSaveTitle(task, title)}
                onSaveDueDate={(due) => handleSaveDueDate(task, due)}
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
