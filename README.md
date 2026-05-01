# CLB Hiến Máu

Hệ thống quản lý Câu lạc bộ hiến máu gồm:

- `frontend`: ứng dụng web React + Vite + Ant Design.
- `backend`: REST API Node.js + Express + MongoDB.

## 1. Cấu trúc project

```text
clb-hien-mau/
  backend/        # API server (Express + MongoDB)
  frontend/       # Client app (React + Vite)
  api.md          # Tài liệu API chi tiết
  package.json    # Script chạy đồng thời frontend + backend
```

## 2. Yêu cầu môi trường

- Node.js >= 18
- pnpm >= 8 (project đang dùng pnpm 10)
- MongoDB (local hoặc cloud)

## 3. Cài đặt dependencies

Tại thư mục root:

```bash
pnpm install
```

Cài thêm dependencies con (nếu cần):

```bash
cd backend && pnpm install
cd ../frontend && pnpm install
```

## 4. Chạy dự án ở môi trường dev

Từ root (chạy cả frontend + backend cùng lúc):

```bash
pnpm dev
```

Script này gọi:

- `pnpm dev:client` -> `frontend` (Vite)
- `pnpm dev:server` -> `backend` (nodemon)

## 5. Chạy riêng từng phần

### Frontend

```bash
cd frontend
pnpm dev
pnpm build
pnpm preview
```

### Backend

```bash
cd backend
pnpm dev
pnpm start
```

## 6. Cấu hình môi trường

### Backend

Tạo file `backend/.env` với các biến tối thiểu:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/clb-hien-mau
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_secret_refresh
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

Lưu ý: tên biến thực tế có thể mở rộng tùy theo cấu hình server.

### Frontend

Tạo file `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Nếu không khai báo, frontend dùng mặc định `http://localhost:3000`.

## 7. Điều hướng chính

### Public

- `/`
- `/programs`
- `/lookup`
- `/register`
- `/login`

### Member

- `/member/dashboard`
- `/member/profile`
- `/member/notifications`
- `/member/history`

### Admin

- `/admin/dashboard`
- `/admin/members`
- `/admin/programs`
- `/admin/registrations`
- `/admin/notifications`

## 8. API

- Tài liệu API chi tiết: [api.md](./api.md)
- Backend cung cấp các nhóm endpoint chính:
  - `auth`
  - `users`
  - `students`
  - `blood-programs`
  - `blood-registers`
  - `notifications`

## 9. Ghi chú phát triển

- Frontend đang dùng theme Ant Design tông đỏ hiến máu.
- Cơ chế auth ở frontend dùng `accessToken` + `refreshToken` qua Axios interceptor.
- Khi chỉnh sửa UI, nên giữ nguyên logic nghiệp vụ/API flow trừ khi có yêu cầu khác.

## 10. Tài liệu liên quan

- README frontend: [frontend/README.md](./frontend/README.md)
- API spec: [api.md](./api.md)
