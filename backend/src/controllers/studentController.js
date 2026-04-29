import User from "../models/User.js";
import Student from "../models/Student.js";
import { convertObjectDatesToUTC7 } from "../utils/timezoneHelper.js";


class studentController {
    // GET /students
    getAllStudents = async (req, res) => {
        try {
            const students = await Student.find();
            return res.status(200).json({
                data: students,
                code: 200,
                message: "Lấy danh sách sinh viên thành công",
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: "Lỗi khi lấy danh sách sinh viên",
            });
        }
    }
    // POST /students (Đã xử lý trong userController để tạo đồng thời User và Student)
    // PATCH /students/:id/info
    updateStudentInfo = async (req, res) => {
        try {
            const { id } = req.params;
            let updateData = { ...req.body };
            
            // Convert date fields to UTC+7 if they exist
            const dateFields = ['birthDate', 'joinDate'];
            updateData = convertObjectDatesToUTC7(updateData, dateFields);
            
            const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true });
            if (!updatedStudent) {
                return res.status(404).json({
                    code: 404,
                    message: "Không tìm thấy sinh viên",
                });
            }
            return res.status(200).json({
                data: updatedStudent,
                code: 200,
                message: "Cập nhật thông tin sinh viên thành công",
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: "Lỗi khi cập nhật thông tin sinh viên",
            });
        }
    }


    // GET /search?query (Tìm kiếm sinh viên theo tên hoặc mã sinh viên)
    searchStudents = async (req, res) => {
        try {
            const { query } = req.query;

            if (!query){
                return res.status(400).json({message: "Vui lòng nhập thông tin cần tìm kiếm"});
            }

            const searchRegex = new RegExp(query, 'i');

            const students = await Student.find({
            $or: [
                { studentId: { $regex: searchRegex } },
                { name: { $regex: searchRegex } },
                { phone: { $regex: searchRegex } }
            ]
        }).limit(10)

        return res.status(200).json({
            data: students,
            code: 200,
            message: "Tìm kiếm sinh viên thành công",
        });

        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: "Lỗi khi tìm kiếm sinh viên",
            });
        }
    }

};

export default new studentController();