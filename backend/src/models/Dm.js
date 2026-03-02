import { Schema, model } from 'mongoose';

const dmSchema = new Schema({
    participants: [{ type: String, required: true }], 

    blockedBy: [{ type: String }], // Array of usernames who initiated a block

    lastRead: { type: Map, of: Date, default: {} }

}, { timestamps: true });

const Dm = model('dms', dmSchema);

export default Dm;