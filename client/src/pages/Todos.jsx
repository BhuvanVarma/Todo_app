import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TodoItem from '../components/TodoItem';
import { getTodos, createTodo, toggleTodo, deleteTodo } from '../api/todos';
import { validateTodo } from '../utils/validators';
import { getApiError, getFieldErrors } from '../utils/errors';

export default function Todos() {
  const [todos, setTodos]           = useState([]);
  const [loadingTodos, setLoading]  = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Add-todo form state
  const [title, setTitle]           = useState('');
  const [description, setDesc]      = useState('');
  const [showDesc, setShowDesc]     = useState(false);
  const [addErrors, setAddErrors]   = useState({});
  const [addServerErr, setAddServerErr] = useState('');
  const [adding, setAdding]         = useState(false);

  // Inline action error (toggle / delete)
  const [actionError, setActionError] = useState('');

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await getTodos();
      setTodos(res.data.todos);
    } catch (err) {
      setFetchError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  async function handleAdd(e) {
    e.preventDefault();
    const clientErrors = validateTodo({ title, description });
    if (Object.keys(clientErrors).length > 0) {
      setAddErrors(clientErrors);
      return;
    }
    setAddErrors({});
    setAddServerErr('');
    setAdding(true);
    try {
      const res = await createTodo({ title: title.trim(), description: description.trim() || null });
      setTodos((prev) => [res.data.todo, ...prev]);
      setTitle('');
      setDesc('');
      setShowDesc(false);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setAddErrors(fieldErrors);
      } else {
        setAddServerErr(getApiError(err));
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id) {
    setActionError('');
    try {
      const res = await toggleTodo(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? res.data.todo : t)));
    } catch (err) {
      setActionError(getApiError(err));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this todo?')) return;
    setActionError('');
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setActionError(getApiError(err));
    }
  }

  function handleUpdate(updated) {
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <>
      <Navbar />
      <div className="container todos-page">
        <h1>My Todos</h1>

        {/* Add todo form */}
        <div className="card add-todo-card">
          <h2>Add a todo</h2>
          {addServerErr && <div className="alert alert-error">{addServerErr}</div>}
          <form onSubmit={handleAdd} noValidate>
            <div className="add-todo-row">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="What do you need to do?"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (addErrors.title) setAddErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  className={addErrors.title ? 'error' : ''}
                  maxLength={100}
                />
                {addErrors.title && <p className="field-error">{addErrors.title}</p>}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={adding}
                style={{ alignSelf: 'flex-start' }}
              >
                {adding && <span className="spinner" />}
                Add
              </button>
            </div>

            <button
              type="button"
              className="add-todo-toggle"
              onClick={() => setShowDesc((v) => !v)}
            >
              {showDesc ? '– Hide description' : '+ Add description'}
            </button>

            {showDesc && (
              <div className="form-group">
                <textarea
                  rows={2}
                  placeholder="Optional description…"
                  value={description}
                  onChange={(e) => {
                    setDesc(e.target.value);
                    if (addErrors.description) setAddErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  className={addErrors.description ? 'error' : ''}
                  maxLength={500}
                />
                {addErrors.description && <p className="field-error">{addErrors.description}</p>}
              </div>
            )}
          </form>
        </div>

        {/* Action error (toggle / delete) */}
        {actionError && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {actionError}
            <button
              onClick={() => setActionError('')}
              style={{ marginLeft: '.75rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Todo list */}
        {loadingTodos ? (
          <div className="state-msg"><span className="spinner" /> Loading todos…</div>
        ) : fetchError ? (
          <div className="state-msg">
            <div className="alert alert-error" style={{ display: 'inline-block' }}>{fetchError}</div>
            <br />
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '.75rem' }} onClick={fetchTodos}>
              Retry
            </button>
          </div>
        ) : todos.length === 0 ? (
          <div className="state-msg">No todos yet — add one above! 👆</div>
        ) : (
          <div className="todo-list">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

