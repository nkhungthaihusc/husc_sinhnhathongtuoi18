# Frontend - CLB Hiến Máu

Ứng dụng frontend cho hệ thống quản lý CLB hiến máu, xây dựng bằng **React + Vite + Ant Design**.

## 1. Công nghệ sử dụng

- React 19
- Vite 8
- React Router DOM 7
- Ant Design 6 + `@ant-design/icons`
- Axios
- Dayjs

## 2. Yêu cầu môi trường

- Node.js >= 18
- pnpm >= 8

## 3. Cài đặt và chạy dự án

Từ thư mục `frontend`:

```bash
pnpm install
pnpm dev
```

Mặc định Vite chạy ở:

- `http://localhost:5173`

## 4. Biến môi trường

Frontend sử dụng biến sau:

- `VITE_API_BASE_URL`: URL backend API

Tạo file `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Nếu không khai báo, hệ thống dùng mặc định: `http://localhost:3000`.

## 5. Scripts

Trong `frontend/package.json`:

- `pnpm dev`: chạy môi trường phát triển
- `pnpm build`: build production
- `pnpm preview`: chạy bản build local
- `pnpm lint`: kiểm tra ESLint

## 6. Cấu trúc thư mục chính

```text
frontend/
  src/
    app/            # App root, router
    components/     # Component dùng chung
    contexts/       # Context (Auth)
    hooks/          # Custom hooks
    layouts/        # Public/Admin/Member layouts
    pages/          # Trang public, member, admin
    services/       # API client, token storage, api modules
    utils/          # Hàm tiện ích
    main.jsx        # Entry point + ConfigProvider AntD
    index.css       # Global styles
```

## 7. Luồng xác thực

Frontend lưu phiên đăng nhập trong `localStorage` qua `tokenStorage`:

- `accessToken`
- `refreshToken`
- `user`

Axios interceptor tự động:

1. Gắn `Authorization: Bearer <accessToken>` vào request.
2. Khi gặp `401`, gọi `/auth/refresh-token` bằng `refreshToken`.
3. Cập nhật token mới và gửi lại request cũ.
4. Nếu refresh thất bại, xóa session local.

## 8. Điều hướng chính

- Public:
  - `/`
  - `/programs`
  - `/lookup`
  - `/register`
  - `/login`
- Member (yêu cầu role `member`):
  - `/member/dashboard`
  - `/member/profile`
  - `/member/notifications`
  - `/member/history`
- Admin (yêu cầu role `admin`):
  - `/admin/dashboard`
  - `/admin/members`
  - `/admin/programs`
  - `/admin/registrations`
  - `/admin/notifications`

## 9. Kết nối API

Frontend gọi backend qua các module trong `src/services/api.js`:

- `authApi`
- `usersApi`
- `studentsApi`
- `programsApi`
- `registersApi`
- `notificationsApi`

Các endpoint đang bám theo tài liệu ở file gốc `api.md`.

## 10. Build production

```bash
pnpm build
pnpm preview
```

Lưu ý: cảnh báo bundle lớn từ Vite không phải lỗi build, ứng dụng vẫn chạy bình thường.

## 11. Ghi chú phát triển

- UI thống nhất theo Ant Design (theme đỏ hiến máu).
- Khi chỉnh UI, ưu tiên giữ nguyên logic xử lý/API/auth/routing/state.
- Không sửa backend trong phạm vi frontend.
