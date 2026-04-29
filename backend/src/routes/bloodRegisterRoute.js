import mongoose from "mongoose";
import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import bloodRegisterController from "../controllers/bloodRegisterController.js";    
const bloodRegisterRoute = express.Router();


bloodRegisterRoute.get("/", bloodRegisterController.getAllBloodRegisters);
bloodRegisterRoute.post("/", bloodRegisterController.createBloodRegister);
bloodRegisterRoute.patch("/:id", protect, authorize("admin"), bloodRegisterController.updateBloodRegister);
bloodRegisterRoute.delete("/:id", protect, authorize("admin"), bloodRegisterController.deleteBloodRegister);
bloodRegisterRoute.patch("/:id/cancel", bloodRegisterController.cancelBloodRegister);
bloodRegisterRoute.get("/search", bloodRegisterController.searchBloodRegisters);
bloodRegisterRoute.get("/:bloodProgramId", protect, authorize("admin", "member"), bloodRegisterController.getBloodRegistersByProgram);

export default bloodRegisterRoute;