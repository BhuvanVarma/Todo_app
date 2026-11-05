const router = require('express').Router();
const { getTodos, createTodo, updateTodo, toggleTodo, deleteTodo } = require('../controllers/todos');
const { todoIdValidator, createTodoValidators, updateTodoValidators } = require('../validators/todos');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

// All todo routes require auth
router.use(authMiddleware);

router.get('/',              getTodos);
router.post('/',             createTodoValidators, validate, createTodo);
router.put('/:id',           updateTodoValidators, validate, updateTodo);
router.patch('/:id/toggle',  todoIdValidator,      validate, toggleTodo);
router.delete('/:id',        todoIdValidator,      validate, deleteTodo);

module.exports = router;

