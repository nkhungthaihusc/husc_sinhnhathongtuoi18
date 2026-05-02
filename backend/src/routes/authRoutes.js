import mongoose from "mongoose";
import express from "express";
import rateLimit from "express-rate-limit";

import { login, logout, refreshToken } from "../controllers/authController.js";


const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 20, // Giới hạn 5 lần thử
  message: {
    code: 429,
    message: "Bạn đã thử quá nhiều lần, vui lòng quay lại sau 10 phút!"
  },
  standardHeaders: true, // Trả về thông tin giới hạn trong header RateLimit-*
  legacyHeaders: false,
});
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user and return access/refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login",loginLimiter, login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;