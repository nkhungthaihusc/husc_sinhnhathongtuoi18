import mongoose from "mongoose";
import moment from "moment-timezone";

const BloodRegisterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    studentId: { type: String, required: false, default: null, index: true },
    bloodProgramId: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    CCCD: { type: String, required: true, index: true },
    bloodGroup: { type: String, required: false, default: "null" },
    address: { type: String, required: true },
    lastDateDonate: { type: Date, required: false, default: null },
    note: { type: String, required: false, default: '' },
    result: { type: String, required: true, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: "pending" },
    reason: { type: String, required: true, default: "null" },

}, { timestamps: true });

export default mongoose.model('BloodRegister', BloodRegisterSchema);