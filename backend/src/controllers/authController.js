import User from "../models/User.js";
import RefreshToken from "../models/refreshToken.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtHelper.js";
import moment from "moment-timezone";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({data: null, code: 404,  message: "Không tìm thấy người dùng"});
    }

    if (user.status !== 'active') {
            return res.status(403).json({ 
                data: null,
                code: 403,
                message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!",
            });
        }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({data: null,code: 401,  message: "Mật khẩu không đúng", });
        
    }


    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: moment().add(7, "days").toDate(),
    });

    return res.status(200).json({
      
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          studentId: user.studentId,
          status: user.status,
        },
      },
      code: 200,
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Front-end gửi Refresh Token lên để hủy
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ code: 400, message: "Refresh Token là bắt buộc!" });
    }

    // Xóa token này trong DB
    const deletedToken = await RefreshToken.findOneAndDelete({
      token: refreshToken,
    });

    if (!deletedToken) {
      return res
        .status(404)
        .json({ code: 404, message: "Token không tồn tại hoặc đã hết hạn!" });
    }

    res.status(200).json({ code: 200, message: "Đăng xuất thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, message: "Lỗi khi đăng xuất", error: error.message });
  }
};
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body; // Hoặc lấy từ Cookie httpOnly
  console.log("Received Refresh Token:", refreshToken); // Debug: In token nhận được ra console

  if (!refreshToken) return res.status(401).json({ message: "Không tìm thấy Refresh Token" });

  try {
    // 1. Xác thực token (Phải dùng REFRESH_SECRET riêng)
    console.log(process.env.JWT_REFRESH_SECRET);
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 2. Tìm User trong DB (Để đảm bảo user không bị khóa/xóa)
    console.log("Đã giải mã thành công, đang tìm user với ID:", decoded.id);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // 3. Tạo AccessToken mới (Hạn 15 phút)
    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Chi tiết lỗi Verify:", err.message);
    
    // Nếu lỗi là do hết hạn, trả về mã riêng để Front-end biết mà bắt người dùng Login lại
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
            code: 401,
            message: "Refresh Token đã hết hạn, vui lòng đăng nhập lại!" 
        });
    }

    return res.status(403).json({ 
        code: 403,
        message: "Refresh Token không hợp lệ!",
        error: err.message 
    });
  }
};
