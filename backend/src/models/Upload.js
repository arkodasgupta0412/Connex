import { Schema, model } from 'mongoose';

const uploadSchema = new Schema({
    uploader: { 
        type: String, 
        required: true 
    }, 
    
    groupId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Group', 
        required: false 
    },
    
    context: { 
        type: String, 
        enum: ['chat_media', 'group_avatar', 'user_avatar'], 
        default: 'chat_media' 
    },

    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { 
        type: String, 
        enum: ['image', 'video', 'audio', 'document', 'link', 'other'], 
        default: 'image' 
    },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }

}, { timestamps: true });

export default model('Upload', uploadSchema);