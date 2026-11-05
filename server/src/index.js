const path = require('path');
// 1. Load local development env from server/.env first
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// 2. Fall back to root .env.local or .env if present
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Trust reverse proxy (Render, Vercel, Heroku, etc.) so secure cookies work properly
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth',  authRoutes);
app.use('/api/todos', todoRoutes);

// 404 & error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
