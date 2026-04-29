import mongoose from "mongoose";
import moment from "moment-timezone";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    studentId: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

// Tự động mã hóa mật khẩu trước khi lưu vào DB
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default mongoose.model('User', UserSchema);