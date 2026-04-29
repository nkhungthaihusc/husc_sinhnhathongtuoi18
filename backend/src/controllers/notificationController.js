import Notification from "../models/Notification.js";

class NotificationController {
  // GET /notifications
  getAllNotifications = async (req, res) => {
    try {
      const notifications = await Notification.find().sort({ createdAt: -1 });
      if (!notifications) {
        return res.status(200).json({
          data: [],
          code: 200,
          message: "Không có thông báo nào",
        });
      }
      return res.status(200).json({
        data: notifications,
        code: 200,
        message: "Lấy danh sách thông báo thành công",
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        code: 500,
        message: "Lỗi khi lấy danh sách thông báo",
      });
    }
  };
  // POST /notifications
  createNotification = async (req, res) => {
    try {
      const { title, content, ...rest } = req.body;
      const newNotification = new Notification({
        title,
        content,
        ...rest,
      });
      const savedNotification = await newNotification.save();
      return res.status(201).json({
        data: savedNotification,
        code: 201,
        message: "Tạo thông báo thành công",
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        code: 500,
        message: "Lỗi khi tạo thông báo",
      });
    }
  };
  // DELETE /notifications/:id
  deleteNotification = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedNotification = await Notification.findByIdAndDelete(id);
      if (!deletedNotification) {
        return res.status(404).json({
          data: null,
          code: 404,
          message: "Thông báo không tồn tại",
        });
      }
      return res.status(200).json({
        data: null,
        code: 200,
        message: "Xóa thông báo thành công",
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        code: 500,
        message: "Lỗi khi xóa thông báo",
      });
    }
  };

  // PATCH /notifications/:id
  updateNotification = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedNotification = await Notification.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );
      if (!updatedNotification) {
        return res.status(404).json({
          code: 404,
          message: "Không tìm thấy thông báo",
        });
      }
      return res.status(200).json({
        data: updatedNotification,
        code: 200,
        message: "Cập nhật thông báo thành công",
      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: "Lỗi khi cập nhật thông báo",
      });
    }
  };
}

export default new NotificationController();
