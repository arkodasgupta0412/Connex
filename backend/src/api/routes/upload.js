import express from 'express';
import multer from 'multer';
import { UPLOAD_DIR } from '../../config/paths.js';


const router = express.Router();
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

export default router;