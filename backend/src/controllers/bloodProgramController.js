import mongoose from "mongoose";

import BloodProgram from "../models/bloodProgram.js";
import BloodRegister from "../models/bloodRegister.js";
import { convertObjectDatesToUTC7 } from "../utils/timezoneHelper.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 100;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

class BloodProgramController {
  // GET /blood-programs
  getAllBloodPrograms = async (req, res) => {
    try {
      const page = toPositiveInt(req.query.page, DEFAULT_PAGE);
      const rawLimit = toPositiveInt(req.query.limit, DEFAULT_LIMIT);
      const limit = Math.min(rawLimit, MAX_LIMIT);
      const skip = (page - 1) * limit;

      const [bloodPrograms, totalItems] = await Promise.all([
        BloodProgram.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        BloodProgram.countDocuments(),
      ]);

      const totalPages = Math.max(1, Math.ceil(totalItems / limit));

      return res.status(200).json({
        data: bloodPrograms,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        code: 200,
        message: "Lấy danh sách chương trình hiến máu thành công",
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: error.message });
    }
  };

  // GET /blood-programs/:id/statistic
  getBloodProgramStatistic = async (req, res) => {
  try {
    const { id } = req.params;
    const programObjectId = new mongoose.Types.ObjectId(id);

    const stats = await BloodRegister.aggregate([
      { $match: { bloodProgramId: programObjectId } },
      {
        $facet: {
          // Nhóm 1: Tính các con số tổng quát
          overall: [
            {
              $group: {
                _id: programObjectId,
                total: { $sum: 1 },
                success: { $sum: { $cond: [{ $eq: ["$result", "success"] }, 1, 0] } },
                reject: { $sum: { $cond: [{ $eq: ["$result", "reject"] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ["$result", "pending"] }, 1, 0] } }
              }
            }
          ],
          // Nhóm 2: Thống kê theo nhóm máu
          bloodGroups: [
            { $match: { result: "success" } }, // Chỉ đếm nhóm máu của những ca thành công
            { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    // Format lại dữ liệu cho đẹp để Front-end dễ dùng
    const result = {
      summary: stats[0].overall[0] || { total: 0, success: 0, reject: 0, pending: 0 },
      bloodDetails: stats[0].bloodGroups
    };

    return res.status(200).json({ code: 200, data: result });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

  // POST /blood-programs
  createBloodProgram = async (req, res) => {
    try {
      const { name, description, date, registrationDeadline, location, image, ...rest } = req.body;
      
      // Convert dates to UTC+7
      const convertedData = convertObjectDatesToUTC7(
        { date, registrationDeadline },
        ['date', 'registrationDeadline']
      );
      
      const newBloodProgram = new BloodProgram({
        name,
        description,
        date: convertedData.date,
        registrationDeadline: convertedData.registrationDeadline || null,
        location,
        image,
        ...rest,
      });

      const saveBloodProgram = await newBloodProgram.save();

      return res.status(201).json({
        data: saveBloodProgram,
        code: 201,
        message: "Đã thêm thành công sự kiến mới",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  // PATCH/blood-program/:id
  updateBloodProgram = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Convert date fields to UTC+7 if they exist
      const dateFields = ['date', 'registrationDeadline'];
      const convertedData = convertObjectDatesToUTC7(updateData, dateFields);
      
      if (Object.prototype.hasOwnProperty.call(convertedData, "registrationDeadline") && !convertedData.registrationDeadline) {
        convertedData.registrationDeadline = null;
      }
      
      const updateBloodProgram = await BloodProgram.findByIdAndUpdate(
        id,
        convertedData,
        { new: true },
      );
      if (!updateBloodProgram) {
        return res.status(404).json({
          data: null,
          code: 404,
          message: "Không tìm thấy chương trình này",
        });
      }
      return res.status(200).json({
        data: updateBloodProgram,
        code: 200,
        message: "Cập nhật thông báo thành công !",
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: error.message });
    }
  };

  // DELETE /blood-program/:id
  deleteBloodProgram = async (req, res) => {
    try {
      const { id } = req.params;
      const deleteBloodProgram = await BloodProgram.findByIdAndDelete(id);
      if (!deleteBloodProgram) {
        return res.status(404).json({
          data: null,
          code: 404,
          message: "Không tìm thấy chương trình này !",
        });
      }
      return res.status(200).json({
        data: deleteBloodProgram,
        code: 200,
        message: "Đã xóa thành công chương trình này !",
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: error.message });
    }
  };

  // GET /blood-program/search?query={searchValue}
  searchBloodProgram = async (req, res) => {
    try {
      const { query } = req.query;
      const page = toPositiveInt(req.query.page, DEFAULT_PAGE);
      const rawLimit = toPositiveInt(req.query.limit, DEFAULT_LIMIT);
      const limit = Math.min(rawLimit, MAX_LIMIT);
      const skip = (page - 1) * limit;

      if (!query) {
        return res
          .status(400)
          .json({ code: 400, message: "Vui lòng nhập thông tin cần tìm kiếm" });
      }

      const searchRegex = new RegExp(query, "i");

      const programs = await BloodProgram.aggregate([
        {
          // Tạo một trường tạm thời dateStr chuyển từ Date sang String định dạng DD-MM-YYYY hoặc YYYY-MM-DD
          $addFields: {
            dateStr: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
          },
        },
        {
          $match: {
            $or: [
              { name: { $regex: searchRegex } },
              { location: { $regex: searchRegex } },
              { dateStr: { $regex: searchRegex } }, // So khớp Regex với chuỗi ngày đã chuyển đổi
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            items: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);

      const items = programs?.[0]?.items || [];
      const totalItems = programs?.[0]?.totalCount?.[0]?.count || 0;
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));

      return res.status(200).json({
        data: items,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        code: 200,
        message: "Tìm kiếm thành công !",
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: error.message });
    }
  };
}

export default new BloodProgramController();
