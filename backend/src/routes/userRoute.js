import express from "express";
import mongoose from "mongoose";

const router = express.Router();
import userController from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";


router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.post('/', protect, authorize('admin'), userController.createUser);
router.patch('/:id/leave', protect, authorize('admin'), userController.leaveUser);
router.patch('/:id/change', protect, authorize('admin'), userController.updateUser);

export default router;