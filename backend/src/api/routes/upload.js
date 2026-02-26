import express from 'express';
import multer from 'multer';
import { UPLOAD_DIR } from '../../config/paths.js';
import Upload from '../../models/Upload.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

const determineFileType = (mimeType) => {
    if (!mimeType) return 'other';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    
    if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) {
        if (mimeType === 'text/uri-list') return 'link'; 
        return 'document';
    }
    
    return 'other';
};

router.post('/', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ 
                success: false, 
                message: "No file provided"
            });
        }

        const { username = 'System', groupId = null, context = 'chat_media' } = req.body;

        const { filename, originalname, mimetype, size } = req.file;

        const host = req.get('host'); 
        const photoUrl = `${req.protocol}://${host}/uploads/${filename}`;
        
        const category = determineFileType(mimetype);

        const newUpload = new Upload({
            uploader: username,
            groupId: groupId,
            context: context,
            filename: filename,
            originalName: originalname,
            fileUrl: photoUrl,
            fileType: category,
            mimeType: mimetype,
            size: size
        });

        await newUpload.save();
        
        res.json({ 
            success: true, 
            photoUrl: newUpload.fileUrl, 
            uploadId: newUpload._id 
        });

    } catch (err) {
        console.error("Upload DB Error:", err);
        res.status(500).json({ success: false, message: "Server error during upload" });
    }
});

export default router;