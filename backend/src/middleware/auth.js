import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export const protect = async (req, res, next) => {
  let token;

  // 1. Kiểm tra xem Header có chứa Authorization và bắt đầu bằng Bearer không
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const methodsWithBody = ["POST", "PUT", "PATCH"];
      if (methodsWithBody.includes(req.method)) {
        const contentType = req.headers["content-type"];
        if (!contentType || !contentType.includes("application/json")) {
          return res.status(415).json({
            code: 415,
            message: "Server yêu cầu định dạng dữ liệu là application/json",
          });
        }
      }
      // 2. Lấy token từ chuỗi "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];
      console.log("Secret Key check:", process.env.JWT_SECRET);
      console.log("Received token:", token); // Debug: In token nhận được ra console

      // 3. Giải mã token bằng Secret Key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded); // Debug: In thông tin giải mã ra console

      // 4. Lưu thông tin user vào request để các hàm sau (như createUser) có thể dùng
      req.user = decoded;

      next(); // Cho phép đi tiếp
    } catch (error) {
      return res
        .status(401)
        .json({
          message: "Token không hợp lệ hoặc đã hết hạn!",
          code: 401,
          data: null,
        });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({
        message: "Bạn không có quyền, không tìm thấy token!",
        code: 401,
        data: null,
      });
  }
};

// Middleware phân quyền
export const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user được tạo ra từ middleware protect phía trên
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 403,
        message: `Quyền hạn '${req.user.role}' không được phép thực hiện hành động này!`,
      });
    }
    next();
  };
};
