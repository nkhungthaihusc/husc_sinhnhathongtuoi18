import mongoose from "mongoose";
import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import notificationController from "../controllers/notificationController.js";

const Nrouter = express.Router();    

Nrouter.get("/", protect, authorize("admin", "member"), notificationController.getAllNotifications);
Nrouter.post("/", protect, authorize("admin"), notificationController.createNotification);
Nrouter.patch("/:id", protect, authorize("admin"), notificationController.updateNotification);
Nrouter.delete("/:id", protect, authorize("admin"), notificationController.deleteNotification);

export default Nrouter;