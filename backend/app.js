const express = require('express');
const cors = require('cors');

const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.get('/api/health', async (req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ success: true, message: 'Server is running' });
  } catch (error) {
    next(error);
  }
});
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});
app.use(errorHandler);

module.exports = app;
