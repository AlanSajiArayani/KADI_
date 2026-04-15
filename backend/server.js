const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Attach socket io to request
app.use((req, res, next) => { req.io = io; next(); });

io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/staff/auth', require('./routes/staffAuth'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/baker', require('./routes/bakerRoutes'));

// Serve Logo from system artifact path for demo purposes:
app.get('/api/logo', (req, res) => {
  res.sendFile('C:\\Users\\ALAN SAJI\\.gemini\\antigravity\\brain\\f66e93ff-1796-454c-8f1d-e651147f3186\\kadi_logo_1776093758195.png');
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kadi')
  .then(async () => {
    console.log('MongoDB Connected');
    
    // Auto-create default Admin if not exists
    const Staff = require('./models/Staff');
    const bcrypt = require('bcryptjs');
    try {
      const adminExists = await Staff.findOne({ role: 'admin' });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await Staff.create({ username: 'admin', password: hashedPassword, role: 'admin' });
        console.log('Default Admin Account Created (username: admin, password: admin123)');
      }
    } catch (e) {
      console.log('Initialization failed', e.message);
    }
  })
  .catch(err => console.log('MongoDB connection error, continuing with mock data. Error:', err.message));

server.listen(PORT, () => console.log(`Backend API running on http://localhost:${PORT}`));
