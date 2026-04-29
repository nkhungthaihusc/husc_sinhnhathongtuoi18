import express from "express";
import mongoose from "mongoose";
import { protect, authorize } from "../middleware/auth.js";


const studentRoute = express.Router();
import studentController from "../controllers/studentController.js";

studentRoute.get("/search", protect,authorize('admin', 'member'), studentController.searchStudents);
studentRoute.patch("/:id/info", protect,authorize('admin', 'member'), studentController.updateStudentInfo);
studentRoute.get("/", protect, authorize('admin', 'member'), studentController.getAllStudents);

export default studentRoute;