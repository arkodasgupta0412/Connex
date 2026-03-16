import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';


import setupMiddleware from './api/middleware/setup.js';
import authRoutes from './api/routes/auth.js';
import groupRoutes from './api/routes/groups.js';
import dmRoutes from './api/routes/dms.js';
import uploadRoutes from './api/routes/uploads.js';
import setupChatSocket from './services/chatSocket.js';
import userRoutes from './api/routes/users.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

connectDB();

setupMiddleware(app);

app.use("/", authRoutes);
app.use("/groups", groupRoutes(io));
app.use('/dms', dmRoutes(io));
app.use("/upload", uploadRoutes);
app.use("/users", userRoutes);

setupChatSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});