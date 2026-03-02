import { Schema, model } from 'mongoose';


const commentSchema = new Schema({
    sender: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});


const dmMessageSchema = new Schema({
    dmId: { type: Schema.Types.ObjectId, ref: 'Dm', required: true },
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


const DmMessage = model('dmmessages', dmMessageSchema);

export default DmMessage;