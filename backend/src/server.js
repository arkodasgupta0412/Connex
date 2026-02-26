import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import connectDB from './config/db.js';

import { UPLOAD_DIR, DB_USERS, DB_GROUPS } from './config/paths.js';
import setupMiddleware from './api/middleware/setup.js';
import authRoutes from './api/routes/auth.js';
import groupRoutes from './api/routes/groups.js';
import uploadRoutes from './api/routes/upload.js';
import setupChatSocket from './services/chatSocket.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

connectDB();

setupMiddleware(app);

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(DB_USERS)) fs.writeFileSync(DB_USERS, "[]");
if (!fs.existsSync(DB_GROUPS)) fs.writeFileSync(DB_GROUPS, "[]");

app.use("/", authRoutes);
app.use("/groups", groupRoutes(io));
app.use("/upload", uploadRoutes);

setupChatSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});