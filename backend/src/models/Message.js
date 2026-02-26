import { Schema, model } from 'mongoose';


const commentSchema = new Schema({
    sender: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});


const messageSchema = new Schema({

    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    
    sender: { type: String, required: true },
    type: { type: String, enum: ['text', 'photo', 'system'], default: 'text' },
    content: { type: String, required: true },
    caption: { type: String, default: "" },   

    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    comments: [commentSchema],

    timestamp: { type: Date, default: Date.now }

}, { timestamps: true });


const Message = model('messages', messageSchema);

export default Message;