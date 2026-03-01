import { Schema, model } from 'mongoose';
import crypto from 'crypto';

const generateGroupCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        code += chars[randomIndex];
    }
    return code;
};


const groupSchema = new Schema({

    groupCode: { 
        type: String, 
        required: true, 
        unique: true,
        default: generateGroupCode
    },

    name: { type: String, required: true },
    description: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },

    owner: [{ type: String, required: true }],
    nicknames: { type: Map, of: String, default: {} },
    lastRead: { type: Map, of: Date, default: {} },
    permissions: {
        membersCanEditGroupInfo: { type: Boolean, default: false }
    },

    admins: [{ type: String }],
    members: [{ type: String }],
    joinRequests: [{ type: String }]

}, { timestamps: true });


const Group = model('groups', groupSchema);

export default Group;