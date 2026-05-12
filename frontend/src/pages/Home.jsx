import { useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, fetchTasks, patchTask } from "../api/tasks.js";
import { AddTaskForm } from "../components/AddTaskForm.jsx";
import { TaskItem } from "../components/TaskItem.jsx";

export function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося завантажити задачі");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleAdd(title) {
    setError(null);
    try {
      const task = await createTask({ title });
      setTasks((prev) => [...prev, task]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося створити задачу");
    }
  }

  async function handleToggleDone(task) {
    setError(null);
    try {
      const updated = await patchTask(task.id, { is_done: !task.is_done });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося оновити задачу");
    }
  }

  async function handleSaveTitle(task, title) {
    setError(null);
    try {
      const updated = await patchTask(task.id, { title });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося зберегти назву");
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ms-text">Мої задачі</h1>
      <p className="mt-1 text-sm text-ms-muted">Створюйте, позначайте виконані та видаляйте.</p>

      <AddTaskForm onAdd={handleAdd} disabled={loading} />

      {error ? (
        <div
          className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-ms-muted">Завантаження…</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {tasks.length === 0 ? (
            <li className="rounded-lg border border-dashed border-ms-border bg-ms-white px-4 py-8 text-center text-sm text-ms-muted shadow-card">
              Поки немає задач. Додайте першу вище.
            </li>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => handleToggleDone(task)}
                onSaveTitle={(title) => handleSaveTitle(task, title)}
                onDelete={() => handleDelete(task.id)}
              />
            ))
          )}
        </ul>
      )}
    </div>
  );
}
