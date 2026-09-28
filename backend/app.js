const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db')

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

module.exports = app;