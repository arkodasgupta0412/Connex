app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) return res.json({ success: false });

    const host = req.hostname;
    const port = 3000;
    const photoUrl = `http://${host}:${port}/uploads/${req.file.filename}`;
    
    res.json({ success: true, photoUrl });
});