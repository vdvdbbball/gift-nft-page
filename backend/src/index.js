const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./database/connection');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config({ path: path.join(__dirname, '../../config/.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Initialize database
db.initialize().then(() => {
  console.log('✓ Database initialized');
}).catch(err => {
  console.error('✗ Database initialization failed:', err);
  process.exit(1);
});

// API Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Admin URL: ${process.env.ADMIN_URL}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}\n`);
});

module.exports = app;
