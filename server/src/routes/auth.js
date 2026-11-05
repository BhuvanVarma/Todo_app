const router = require('express').Router();
const { register, login, logout, me } = require('../controllers/auth');
const { registerValidators, loginValidators } = require('../validators/auth');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

router.post('/register', registerValidators, validate, register);
router.post('/login',    loginValidators,    validate, login);
router.post('/logout',   logout);
router.get('/me',        authMiddleware,     me);

module.exports = router;

