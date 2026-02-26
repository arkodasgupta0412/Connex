import { Schema, model } from 'mongoose';


const groupSchema = new Schema({

    groupCode: { type: String, required: true, unique: true },

    name: { type: String, required: true },
    description: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },

    admins: [{ type: String }],
    members: [{ type: String }],
    joinRequests: [{ type: String }]

}, { timestamps: true });


const Group = model('groups', groupSchema);

export default Group;