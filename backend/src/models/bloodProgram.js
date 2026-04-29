import mongoose from "mongoose";
import moment from "moment-timezone";

const bloodProgramSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    description: { type: String, required: false },
    date: { type: Date, required: true, index: true },
    registrationDeadline: { type:Date, required: false, default: null },
    location: { type: String, required: false },
    count: { type: Number, required: false },
    image: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('BloodProgram', bloodProgramSchema);