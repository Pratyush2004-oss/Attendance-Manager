import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['teacher', 'student'],
        required: true
    },
    Organization: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    }],
    guardian: {
        name: {
            type: String,
        },
        number: {
            type: String
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    otp: {
        type: Number
    }
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;