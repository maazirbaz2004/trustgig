require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

connectDB();

const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./socketHandler');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

setupSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
