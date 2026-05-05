import mongoose from "mongoose";

import BloodRegister from "../models/bloodRegister.js";
import BloodProgram from "../models/bloodProgram.js";
import { convertObjectDatesToUTC7 } from "../utils/timezoneHelper.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

class BloodRegisterController {
  // GET /blood-registers
  getAllBloodRegisters = async (req, res) => {
    try {
      const page = toPositiveInt(req.query.page, DEFAULT_PAGE);
      const rawLimit = toPositiveInt(req.query.limit, DEFAULT_LIMIT);
      const limit = Math.min(rawLimit, MAX_LIMIT);
      const skip = (page - 1) * limit;

      const [bloodRegisters, summary] = await Promise.all([
        BloodRegister.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        BloodRegister.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              approved: { $sum: { $cond: [{ $eq: ["$result", "approved"] }, 1, 0] } },
              rejected: { $sum: { $cond: [{ $eq: ["$result", "rejected"] }, 1, 0] } },
              cancelled: { $sum: { $cond: [{ $eq: ["$result", "cancelled"] }, 1, 0] } },
              pending: { $sum: { $cond: [{ $eq: ["$result", "pending"] }, 1, 0] } },
            },
          },
        ]),
      ]);

      const summaryStats = summary?.[0] || { total: 0, approved: 0, rejected: 0, cancelled: 0, pending: 0 };
      const totalPages = Math.max(1, Math.ceil(summaryStats.total / limit));

      return res.status(200).json({
        data: {
          bloodRegisters,
          total: summaryStats.total,
          approved: summaryStats.approved,
          rejected: summaryStats.rejected,
          cancelled: summaryStats.cancelled,
          pending: summaryStats.pending,
        },
        pagination: {
          page,
          limit,
          totalItems: summaryStats.total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        code: 200,
        message: "Lấy danh sách đăng ký hiến máu thành công",
      });
    } catch (error) {
      return res.status(500).json({code: 500, message: error.message });
    }
  };

  // GET /blood-registers/:bloodProgramId
  getBloodRegistersByProgram = async (req, res) => {
    try {
      const { bloodProgramId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(bloodProgramId)) {
        return res.status(400).json({ code: 400, message: "ID chương trình hiến máu không hợp lệ" });
      }
      console.log("bloodProgramId:", bloodProgramId);
      const bloodRegisters = await BloodRegister.find({ bloodProgramId: bloodProgramId }).sort({ createdAt: -1 });
      const total = bloodRegisters.length;
      const approved = bloodRegisters.filter(register => register.result === "approved").length;
      const rejected = bloodRegisters.filter(register => register.result === "rejected").length;
      const cancelled = bloodRegisters.filter(register => register.result === "cancelled").length;
      const pending = bloodRegisters.filter(register => register.result === "pending").length;
      const successfulRate = total ? Math.round((approved / total) * 100) : 0;
      const rejectedRate = total ? Math.round((rejected / total) * 100) : 0;
      const cancelledRate = total ? Math.round((cancelled / total) * 100) : 0;
      return res.status(200).json({
        data: { bloodRegisters, total, approved, rejected, cancelled, pending, successfulRate, rejectedRate, cancelledRate },
        code: 200,
        message: "Lấy danh sách đăng ký hiến máu theo chương trình thành công",
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: error.message });
    }
  }

  // GET /blood-registers/query?
  searchBloodRegisters = async (req, res) => {
    try {
      const { query } = req.query;
      const normalizedQuery = String(query || '').trim().toLowerCase();
      const page = toPositiveInt(req.query.page, DEFAULT_PAGE);
      const rawLimit = toPositiveInt(req.query.limit, DEFAULT_LIMIT);
      const limit = Math.min(rawLimit, MAX_LIMIT);
      const skip = (page - 1) * limit;

      if (!normalizedQuery) {
        return res
          .status(400)
          .json({ code: 400, message: "Vui lòng nhập thông tin cần tìm kiếm" });
      }

      const aggregated = await BloodRegister.aggregate([
        {
          $match: {
            $expr: {
              $or: [
                { $eq: [{ $toLower: { $trim: { input: "$studentId" } } }, normalizedQuery] },
                { $eq: [{ $toLower: { $trim: { input: "$phone" } } }, normalizedQuery] },
                { $eq: [{ $toLower: { $trim: { input: "$email" } } }, normalizedQuery] },
                { $eq: [{ $toLower: { $trim: { input: "$CCCD" } } }, normalizedQuery] },
              ],
            },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            listBloodRegisters: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: "count" }],
            summary: [
              {
                $group: {
                  _id: null,
                  TongSoLanHien: { $sum: { $cond: [{ $eq: ["$result", "approved"] }, 1, 0] } },
                  approved: { $sum: { $cond: [{ $eq: ["$result", "approved"] }, 1, 0] } },
                  rejected: { $sum: { $cond: [{ $eq: ["$result", "rejected"] }, 1, 0] } },
                  cancelled: { $sum: { $cond: [{ $eq: ["$result", "cancelled"] }, 1, 0] } },
                  pending: { $sum: { $cond: [{ $eq: ["$result", "pending"] }, 1, 0] } },
                  LanHienDangKyGanNhat: { $first: "$createdAt" },
                  KetQuaLanDangKyGanNhat: { $first: "$result" },
                },
              },
            ],
          },
        },
      ]);

      const listBloodRegisters = aggregated?.[0]?.listBloodRegisters || [];
      const totalItems = aggregated?.[0]?.totalCount?.[0]?.count || 0;
      const summary = aggregated?.[0]?.summary?.[0] || {
        TongSoLanHien: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        pending: 0,
        LanHienDangKyGanNhat: null,
        KetQuaLanDangKyGanNhat: null,
      };
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));

      if (totalItems === 0) {
        return res.status(200).json({
          data: {
            listBloodRegisters: [],
            TongSoLanHien: 0,
            LanHienDangKyGanNhat: null,
            KetQuaLanDangKyGanNhat: null,
            total: 0,
            approved: 0,
            rejected: 0,
            cancelled: 0,
            pending: 0,
          },
          code: 200,
          message:
            "Không tìm thấy đăng ký hiến máu nào phù hợp với thông tin đã nhập",
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }

      return res.status(200).json({
        data: {
          listBloodRegisters,
          TongSoLanHien: summary.TongSoLanHien,
          LanHienDangKyGanNhat: summary.LanHienDangKyGanNhat,
          KetQuaLanDangKyGanNhat: summary.KetQuaLanDangKyGanNhat,
          total: totalItems,
          approved: summary.approved,
          rejected: summary.rejected,
          cancelled: summary.cancelled,
          pending: summary.pending,
        },
        code: 200,
        message: "Tìm kiếm đăng ký hiến máu thành công",
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: error.message });
    }
  };
  // POST /blood-registers
  createBloodRegister = async (req, res) => {
    try {
      const {
        studentId,
        name,
        email,
        phone,
        bloodGroup,
        address,
        lastDateDonate,
        bloodProgramId,
        reason,
        ...rest
      } = req.body;

      if (!bloodProgramId || !mongoose.Types.ObjectId.isValid(bloodProgramId)) {
        return res.status(400).json({
          code: 400,
          message: "Chương trình hiến máu không hợp lệ",
        });
      }

      const bloodProgram = await BloodProgram.findById(bloodProgramId).select("name registrationDeadline");
      if (!bloodProgram) {
        return res.status(404).json({
          code: 404,
          message: "Không tìm thấy chương trình hiến máu",
        });
      }

      if (bloodProgram.registrationDeadline) {
        const deadline = new Date(bloodProgram.registrationDeadline);
        if (!Number.isNaN(deadline.getTime()) && Date.now() > deadline.getTime()) {
          return res.status(409).json({
            code: 409,
            message: `Chương trình \"${bloodProgram.name}\" đã hết hạn đăng ký`,
          });
        }
      }

      // Convert dates to UTC+7
      const convertedData = convertObjectDatesToUTC7(
        { lastDateDonate },
        ['lastDateDonate']
      );

      const registerData = {
        studentId: studentId || null,
        name,
        email,
        phone,
        bloodGroup,
        address,
        lastDateDonate: convertedData.lastDateDonate,
        bloodProgramId,
        ...rest,
      };

      const newBloodRegister = new BloodRegister(registerData);
      const saveBloodRegister = await newBloodRegister.save();
      return res.status(201).json({
        data: saveBloodRegister,
        code: 201,
        message: "Đăng ký hiến máu thành công",
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: error.message });
    }
  };
  // PATCH /blood-registers/:id
  updateBloodRegister = async (req, res) => {
    try {
      const { id } = req.params;
      let updateData = { ...req.body };
      
      // Convert date fields to UTC+7 if they exist
      const dateFields = ['lastDateDonate'];
      updateData = convertObjectDatesToUTC7(updateData, dateFields);
      
      const updatedBloodRegister = await BloodRegister.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );
      return res.status(200).json({
        data: updatedBloodRegister,
        code: 200,
        message: "Cập nhật đăng ký hiến máu thành công",
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: error.message });
    }
  };

  // PATCH /blood-registers/:id/cancel
  cancelBloodRegister = async (req, res) => {
    try {
      const { id } = req.params;
      const reason = String(req.body?.reason || '').trim();
      const canceledBloodRegister = await BloodRegister.findByIdAndUpdate(
        id,
        {
          result: "cancelled",
          reason: reason || "Người dùng tự hủy đăng ký",
        },
        { new: true },
      );
      return res.status(200).json({
        data: canceledBloodRegister,
        code: 200,
        message: "Hủy đăng ký hiến máu thành công",
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: error.message });
    }
  };

  // DELETE /blood-registers/:id
  deleteBloodRegister = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedBloodRegister = await BloodRegister.findByIdAndDelete(id);
      return res.status(200).json({
        data: deletedBloodRegister,
        code: 200,
        message: "Xóa đăng ký hiến máu thành công",
      });
    } catch (error) {
      return res.status(500).json({ code: 500, message: error.message });
    }
  };
}

export default new BloodRegisterController();
