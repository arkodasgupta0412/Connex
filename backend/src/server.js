const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const multer = require("multer");

const { UPLOAD_DIR, DB_USERS, DB_GROUPS } = require("./config/paths");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

require("./api/middleware/setup")(app);

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(DB_USERS)) fs.writeFileSync(DB_USERS, "[]");
if (!fs.existsSync(DB_GROUPS)) fs.writeFileSync(DB_GROUPS, "[]");

const authRoutes = require("./api/routes/auth");
const groupRoutes = require("./api/routes/groups");

app.use("/", authRoutes);
app.use("/groups", groupRoutes(io));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

app.post("/upload", upload.single("photo"), (req, res) => {
    if (!req.file) return res.json({ success: false });
    
    const host = req.headers.host; 
    const photoUrl = `http://${host}/uploads/${req.file.filename}`;
    
    res.json({ success: true, photoUrl });
});

require("./services/chatSocket")(io);

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});