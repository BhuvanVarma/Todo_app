const pool = require('../db/pool');

async function getTodos(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, description, is_completed, created_at FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ todos: rows });
  } catch (err) {
    next(err);
  }
}

async function createTodo(req, res, next) {
  try {
    const { title, description } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO todos (user_id, title, description) VALUES ($1, $2, $3) RETURNING id, title, description, is_completed, created_at',
      [req.userId, title.trim(), null]
    );
    res.status(201).json({ todo: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateTodo(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description } = req.body;

    const { rows } = await pool.query(
      `UPDATE todos
       SET title = $1, description = $2
       WHERE id = $3 AND user_id = $4
       RETURNING id, title, description, is_completed, created_at`,
      [title.trim(), description ? description.trim() : null, id, req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ errors: [{ message: 'Todo not found' }] });
    }
    res.json({ todo: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function toggleTodo(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    const { rows } = await pool.query(
      `UPDATE todos
       SET is_completed = NOT is_completed
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, description, is_completed, created_at`,
      [id, req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ errors: [{ message: 'Todo not found' }] });
    }
    res.json({ todo: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteTodo(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    const { rows } = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ errors: [{ message: 'Todo not found' }] });
    }
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTodos, createTodo, updateTodo, toggleTodo, deleteTodo };

