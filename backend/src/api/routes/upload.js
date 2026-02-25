const express = require('express');
const router = express.Router();
const multer = require('multer');
const { UPLOAD_DIR } = require('../../config/paths')


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });


router.post('/', upload.single('photo'), (req, res) => {
    if (!req.file) return res.json({ success: false });

    const host = req.get('host'); 
    const photoUrl = `http://${host}/uploads/${req.file.filename}`;
    
    res.json({ success: true, photoUrl });
});

module.exports = router;