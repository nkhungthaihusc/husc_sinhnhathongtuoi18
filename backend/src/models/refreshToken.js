import mongoose from "mongoose";
import moment from "moment-timezone";

const RefreshTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });



export default mongoose.model('RefreshToken', RefreshTokenSchema);