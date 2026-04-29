import mongoose from "mongoose";
import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import bloodProgramController from "../controllers/bloodProgramController.js";

const bloodProgramRoute = express.Router();

bloodProgramRoute.get('/', bloodProgramController.getAllBloodPrograms);
bloodProgramRoute.post('/', protect, authorize("admin"), bloodProgramController.createBloodProgram);
bloodProgramRoute.delete('/:id', protect, authorize("admin"), bloodProgramController.deleteBloodProgram);
bloodProgramRoute.patch('/:id', protect, authorize("admin"), bloodProgramController.updateBloodProgram);
bloodProgramRoute.get('/search', bloodProgramController.searchBloodProgram);
bloodProgramRoute.get('/:id/statistic', bloodProgramController.getBloodProgramStatistic);


export default bloodProgramRoute;