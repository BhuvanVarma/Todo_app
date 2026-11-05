import { useState } from 'react';
import { validateTodo } from '../utils/validators';
import { getApiError, getFieldErrors } from '../utils/errors';
import { updateTodo } from '../api/todos';

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing]     = useState(false);
  const [title, setTitle]         = useState(todo.title);
  const [description, setDesc]    = useState(todo.description || '');
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving]       = useState(false);

  function startEdit() {
    setTitle(todo.title);
    setDesc(todo.description || '');
    setErrors({});
    setServerError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setErrors({});
    setServerError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    const clientErrors = validateTodo({ title, description });
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});
    setServerError('');
    setSaving(true);
    try {
      const res = await updateTodo(todo.id, { title: title.trim(), description: description.trim() || null });
      onUpdate(res.data.todo);
      setEditing(false);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setServerError(getApiError(err));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
      <div className="todo-header">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.is_completed}
          onChange={() => onToggle(todo.id)}
          aria-label="Toggle complete"
        />
        <div className="todo-body">
          <div className="todo-title">{todo.title}</div>
          {todo.description && <div className="todo-desc">{todo.description}</div>}
        </div>
        <div className="todo-actions">
          <button className="btn btn-ghost btn-sm" onClick={startEdit} aria-label="Edit">
            ✏️
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(todo.id)} aria-label="Delete">
            🗑️
          </button>
        </div>
      </div>

      {editing && (
        <form className="edit-form" onSubmit={handleSave} noValidate>
          {serverError && <div className="alert alert-error">{serverError}</div>}

          <div className="form-group">
            <label htmlFor={`edit-title-${todo.id}`}>Title</label>
            <input
              id={`edit-title-${todo.id}`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'error' : ''}
              maxLength={100}
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label htmlFor={`edit-desc-${todo.id}`}>Description (optional)</label>
            <textarea
              id={`edit-desc-${todo.id}`}
              rows={2}
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className={errors.description ? 'error' : ''}
              maxLength={500}
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>

          <div className="edit-form-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving && <span className="spinner" />}
              Save
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

