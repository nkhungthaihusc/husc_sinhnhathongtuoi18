import User from "../models/User.js";
import Student from "../models/Student.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { convertObjectDatesToUTC7 } from "../utils/timezoneHelper.js";

class userController {
  // GET /users
  getAllUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json({
        data: users,
        code: 200,
        message: "Lấy danh sách người dùng thành công",
      });
    } catch (err) {
      res.status(500).json({
        data: null,
        code: 500,
        message: err.message,
      });
    }
  };

  // POST /users
  createUser = async (req, res) => {
    // Bắt đầu một Session để chạy Transaction
    // const session = await mongoose.startSession();
    const { studentId, name, email, phone, password, ...rest } = req.body;
    console.log("Received data for new user:", req.body); // Debug: In dữ liệu nhận được ra console
    
    
    try {
      // session.startTransaction();
      // 1. Tạo User (Tài khoản đăng nhập)
      const newUser = new User({
        username: studentId,
        password,
        studentId,
        ...rest,
      });
      console.log("New User object created:", newUser); // Debug: In đối tượng User mới tạo ra console

      // 2. Tạo Student (Thông tin chi tiết)
      // Convert date fields to UTC+7
      const convertedStudentData = convertObjectDatesToUTC7(
        rest,
        ['birthDate', 'joinDate']
      );
      
      const newStudent = new Student({
        studentId,
        name,
        email,
        phone,
        ...convertedStudentData,
      });
      console.log("New Student object created:", newStudent); // Debug: In đối tượng Student mới tạo ra console

      // Lưu cả hai vào DB trong cùng một transaction
      // const savedUser = await newUser.save({ session });
      // const savedStudent = await newStudent.save({ session });
      const savedUser = await newUser.save();
      const savedStudent = await newStudent.save();
      console.log("Saved User:", savedUser); // Debug: In thông tin User đã lưu ra console
      console.log("Saved Student:", savedStudent); // Debug: In thông tin Student đã lưu ra console
      // Nếu mọi thứ ok, xác nhận thay đổi vào DB
      // await session.commitTransaction();
      // session.endSession();

      return res.status(201).json({
        data: { user: savedUser, student: savedStudent },
        code: 201,
        message: "Tạo tài khoản và thông tin sinh viên thành công",
      });
    } catch (err) {
      // Nếu có bất kỳ lỗi nào, hủy bỏ toàn bộ quá trình (Rollback)
      // await session.abortTransaction();
      // session.endSession();

      let errorMsg = err.message;
      if (err.code === 11000) {
        errorMsg = "Mã sinh viên, Email, Số điện thoại hoặc CCCD đã tồn tại!";
      }

      return res.status(400).json({
        data: null,
        code: 400,
        message: errorMsg,
      });
    }
  };
  // PATCH /users/:id
  leaveUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updateUser = await User.findByIdAndUpdate(
        id,
        { status: "inactive" },
        { new: true },
      );
      if (!updateUser) {
        return res.status(404).json({
          data: null,
          code: 404,
          message: "Không tìm thấy người dùng",
        });
      }
      res.status(200).json({
        data: updateUser,
        code: 200,
        message: "Thành viên đã rời CLB (đã chuyển trạng thái thành inactive)",
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        code: 500,
        message: error.message,
      });
    }
  };
  // PATCH /users/:id/change-role or password
  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      let updateData = { ...req.body };

      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      // Convert date fields to UTC+7 if they exist
      const dateFields = ['birthDate', 'joinDate'];
      updateData = convertObjectDatesToUTC7(updateData, dateFields);

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!updatedUser) {
        return res.status(404).json({
          data: null,
          code: 404,
          message: "Không tìm thấy người dùng",
        });
      } else {
        return res.status(200).json({
          data: updatedUser,
          code: 200,
          message: "Cập nhật thông tin người dùng thành công",
        });
      }
    } catch (error) {
      return res.status(500).json({
        data: null,
        code: 500,
        message: error.message,
      });
    }
  };
}

export default new userController();
