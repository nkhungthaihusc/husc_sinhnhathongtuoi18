import mongoose from "mongoose";
import moment from "moment-timezone";

const NotificationSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    content: { type: String, required: true },
    url: { type: String, required: false },
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);