import mongoose from "mongoose";
import moment from "moment-timezone";

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    studentId: { type: String, required: true, unique: true, index: true },
    birthDate: { type: Date, required: true },
    joinDate: { type: Date, required: true },
    phone: { type: String, required: true, unique: true ,index: true},
    email: { type: String, required: true, unique: true, index: true},
    cccd: { type: String, required: false, unique: true, index: true },
    bloodGroup: { type: String, required: true },
    group: { type: String, required: false }, // Thuoc bang 
    category: { type: String, required: true }, // Nganh hoc
    yearStudy: { type: Number, required: true }, // Nien khoa
    position: { type: String, required: true }, // Chuc vu trong CLB
}, { timestamps: true });

export default mongoose.model('Student', StudentSchema);
