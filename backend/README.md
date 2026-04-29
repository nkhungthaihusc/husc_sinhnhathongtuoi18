<div align="center">
  <img src="https://media.tenor.com/vHq8sRjO9Y0AAAAi/genshin-impact-paimon.gif" width="120" />
  <img src="https://readme-typing-svg.herokuapp.com/?font=Fira+Code&weight=900&size=40&pause=1000&color=F700FF&center=true&vCenter=true&width=600&lines=HUSC+BLOOD+CLUB+API" alt="Typing SVG" />
  <img src="https://media.tenor.com/2s_w-GEX6S0AAAAi/hu-tao-hutao.gif" width="120" />
  <p><strong>🔥 Dự án Back-end quản lý Câu Lạc Bộ Hiến máu - Đại học Khoa học Huế (HUSC) 🔥</strong></p>
  <p>
    <a href="#"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="NodeJS" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="ExpressJS" /></a>
    <a href="#"><img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  </p>
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</div>

---

## 🌟 Giới thiệu tổng quan

<p align="center">
  <img src="https://media.tenor.com/_q17n23H75YAAAAi/raiden-shogun-genshin.gif" width="150" align="right" />
</p>

**HUSC Blood Club API** là hệ thống máy chủ cốt lõi xử lý các nghiệp vụ toàn diện cho câu lạc bộ hiến máu. API này giúp tự động hoá quy trình quản lý thông tin sinh viên, lên lịch các chương trình truyền máu, duyệt và lưu trữ lượt đăng ký nhận/hiến máu, cũng như thông báo tin tức đến các thành viên trong câu lạc bộ một cách an toàn và tối ưu. Mọi thứ được thiết kế với chuẩn mực cao, đảm bảo tốc độ nhanh và bảo mật tuyệt đối giống như một CyberNinja lướt qua màn đêm! 🌃✨

## 🛠️ Công nghệ & Thư viện sử dụng

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%" />
</p>

Để chuẩn bị khởi chạy máy chủ Back-end này tại local, bạn có thể thực thi câu lệnh:
```bash
# Sử dụng npm hoặc pnpm
npm install
```

### 📦 Môi trường Sản xuất (Production Dependencies)
Dự án được xây dựng dựa trên các module mạnh mẽ và phổ biến nhất của Node ecosystem:
- 🌐 **[Express](https://expressjs.com/)**: RESTful API framework mạnh mẽ.
- 🗄️ **[Mongoose](https://mongoosejs.com/)**: Giao tiếp và tương tác linh hoạt với database MongoDB.
- 🔐 **[Bcryptjs](https://www.npmjs.com/package/bcryptjs) & [JSONWebToken](https://jwt.io/)**: Mã hóa mật khẩu và phân quyền/xác thực bảo mật thông qua JWT.
- 🛡️ **[Express-rate-limit](https://www.npmjs.com/package/express-rate-limit) & [Cors](https://www.npmjs.com/package/cors)**: Chống spam request và cấu hình bảo mật tên miền.
- 🪧 **[Morgan](https://www.npmjs.com/package/morgan)**: Ghi chú lịch sử truy cập (Logging) chi tiết.
- ⏱️ **[Moment-timezone](https://momentjs.com/timezone/)**: Xử lý, tính toán thời gian và múi giờ.
- 🎨 **[Express-handlebars](https://www.npmjs.com/package/express-handlebars)**: Render các template nhanh chóng.
- ⚙️ **[Dotenv](https://www.npmjs.com/package/dotenv)**: Bảo mật biến môi trường.

### 🧪 Công cụ Phát triển (Development Dependencies)
- 🚀 **Nodemon**: Auto-reload máy chủ khi có thay đổi code.
- 🧹 **Husky, Lint-staged & Prettier**: Xây dựng luồng commit chuẩn chỉ, clean code trước khi đẩy lên repo.

---

## 🚀 Danh sách API Routes (`{{baseURL}}`)
Dưới đây là một số API chính trong dự án, được ủy quyền bởi JWT phân theo `Role (admin/member)`:

### 🏠 1. Hệ thống chung (General)
- 🟢 `GET /` — Lấy thông báo mặc định kiểm tra tình trạng kết nối.

### 🔑 2. Xác thực (Authentication) - `/auth`
- 🟡 `POST /auth/login` — Cấp quyền truy cập hệ thống (Rate limit: 5 requests / 10 phút).
- 🟡 `POST /auth/logout` — Hủy bỏ phiên bản hoạt động hiện tại.
- 🟡 `POST /auth/refresh-token` — Làm mới và lấy Token mới cho hệ thống.

### 🎓 3. Quản lý Sinh viên (Student Mgmt) - `/students`
- 🟢 `GET /students/` — Tra cứu toàn bộ hồ sơ sinh viên `(admin, member)`.
- 🟢 `GET /students/search` — Tìm kiếm sinh viên theo từ khóa `(admin, member)`.
- 🟠 `PATCH /students/:id/info` — Chỉnh sửa hồ sơ cá nhân sinh viên `(admin, member)`.

### 👥 4. Quản trị Người dùng (User Mgmt) - `/users`
- 🟢 `GET /users/` — Lấy danh sách tài khoản thành viên `(admin)`.
- 🟡 `POST /users/` — Cấp mới một tài khoản vào cục bộ `(admin)`.
- 🟠 `PATCH /users/:id/change` — Thay đổi thông tin của bất kỳ người dùng nào `(admin)`.
- 🟠 `PATCH /users/:id/leave` — Giáng cấp / đánh dấu một thành viên đã rời CLB `(admin)`.

### 🔔 5. Trung tâm Thông báo (Notifications) - `/notifications`
- 🟢 `GET /notifications/` — Truy xuất bảng tin nội bộ `(admin, member)`.
- 🟡 `POST /notifications/` — Phát hành bản tin mới mới `(admin)`.
- 🟠 `PATCH /notifications/:id` — Chỉnh sửa thời gian/nội dung thông báo `(admin)`.
- 🔴 `DELETE /notifications/:id` — Gỡ bỏ thông báo `(admin)`.

### 💖 6. Sự kiện Hiến Máu (Blood Programs) - `/blood-programs`
- 🟢 `GET /blood-programs/` — Liệt kê chiến dịch hiến máu đang hoạt động `(admin, member)`.
- 🟢 `GET /blood-programs/search` — Tra cứu thông tin chiến dịch `(admin, member)`.
- 🟢 `GET /blood-programs/:id/statistic` — Dashboard lấy báo cáo tổng quan kỳ hiến máu `(admin)`.
- 🟡 `POST /blood-programs/` — Lập kế hoạch hiến máu mới `(admin)`.
- 🟠 `PATCH /blood-programs/:id` — Thay đổi nội dung, deadline một kế hoạch `(admin)`.
- 🔴 `DELETE /blood-programs/:id` — Hủy bỏ kế hoạch khỏi hệ thống `(admin)`.

### 📝 7. Đăng ký Máu (Blood Registers) - `/blood-registers`
- 🟢 `GET /blood-registers/` — Danh sách yêu cầu xin/hiến máu `(admin, member)`.
- 🟢 `GET /blood-registers/search` — Tìm đơn nhận/phát máu `(admin, member)`.
- 🟡 `POST /blood-registers/` — Gửi đơn đăng ký mới `(admin, member)`.
- 🟠 `PATCH /blood-registers/:id` — Quản trị viên cập nhật trạng thái hồ sơ `(admin)`.
- 🟠 `PATCH /blood-registers/:id/cancel` — Hủy đơn đã nộp nhưng chưa xử lý `(admin, member)`.
- 🔴 `DELETE /blood-registers/:id` — Xóa thủ công một lượt đăng ký trong Data `(admin)`.

---
<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
  <img src="https://media.tenor.com/PZcZ8rB5jC4AAAAi/furina-genshin.gif" width="150" />
  <br/>
  <b>🔥 Author <i>by</i> Thái Nguyễn và Nhóm 8 - Kỹ nghệ phần mềm 🔥</b>
</div>
