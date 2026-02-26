import { Schema, model } from 'mongoose';


const userSchema = new Schema({

    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    securityAnswer: { type: String, required: true },
    profileName: { type: String, required: true },


    avatarUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    status: {
        type: String,
        enum: ['online', 'idle', 'dnd', 'invisible'],
        default: 'online' 
    }

}, { timestamps: true });


const User = model('users', userSchema);

export default User;