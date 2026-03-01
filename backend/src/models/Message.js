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

    reactions: { type: Map, of: [String], default: {} },
    comments: [commentSchema],
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },


    timestamp: { type: Date, default: Date.now }

}, { timestamps: true });


const Message = model('messages', messageSchema);

export default Message;