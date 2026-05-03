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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // giới hạn mỗi IP 100 request
  standardHeaders: true,
  legacyHeaders: false,
  // Thêm dòng dưới đây để tắt cảnh báo validate header của thư viện
  validate: { xForwardedForHeader: false }, 
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
