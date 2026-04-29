# API Documentation - CLB Hiến Máu (Blood Donation Club Management)

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Endpoints](#api-endpoints)
   - [Authentication Routes](#1-authentication-routes)
   - [User Routes](#2-user-routes)
   - [Student Routes](#3-student-routes)
   - [Blood Program Routes](#4-blood-program-routes)
   - [Blood Register Routes](#5-blood-register-routes)
   - [Notification Routes](#6-notification-routes)
5. [Data Models](#data-models--structures)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Setup & Configuration](#setup--configuration)

---

## Project Overview

**CLB Hiến Máu** (Blood Donation Club Management System) is a comprehensive backend API built with **Express.js** and **MongoDB** that enables:

- ✅ User authentication and authorization
- ✅ Blood donation program management
- ✅ Student profile management
- ✅ Blood donation registration & tracking
- ✅ Real-time notifications
- ✅ Program statistics and reporting

**Tech Stack:**

- Framework: Express.js
- Database: MongoDB
- Authentication: JWT (JSON Web Tokens)
- Password Hashing: bcryptjs
- Environment: Node.js

---

## Quick Start

### Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

### Required Headers

All API requests must include:

```http
Content-Type: application/json
Authorization: Bearer <access_token>  // Required for protected endpoints
```

### Authentication Header Format

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Authentication & Authorization

### JWT Token System

| Token Type        | Validity   | Purpose                    | Use Case                  |
| ----------------- | ---------- | -------------------------- | ------------------------- |
| **Access Token**  | 15 minutes | API request authentication | Every protected API call  |
| **Refresh Token** | 7 days     | Generate new access token  | When access token expires |

### User Roles & Permissions

| Role       | Permission Level   | Can Manage                                    | Can View                          | Can Create    | Can Edit     | Can Delete        |
| ---------- | ------------------ | --------------------------------------------- | --------------------------------- | ------------- | ------------ | ----------------- |
| **admin**  | Full System Access | Users, Programs, Registrations, Notifications | All                               | All           | All          | All               |
| **member** | Limited Access     | Own registrations                             | Students, Programs, Registrations | Registrations | Student info | Own registrations |

### Authorization Levels by Resource

| Resource            | Create                 | Read | Update | Delete | Required Roles                            |
| ------------------- | ---------------------- | ---- | ------ | ------ | ----------------------------------------- |
| **Users**           | ✅                     | ✅   | ✅     | ✅     | admin                                     |
| **Students**        | ✅ (via user creation) | ✅   | ✅     | ✅     | admin, member (read/update own)           |
| **Blood Programs**  | ✅                     | ✅   | ✅     | ✅     | admin (create/edit/delete), all (read)    |
| **Blood Registers** | ✅                     | ✅   | ✅     | ✅     | admin, member (can register & cancel own) |
| **Notifications**   | ✅                     | ✅   | ✅     | ✅     | admin                                     |

### How JWT Authentication Works

1. User logs in with username & password → receives `accessToken` & `refreshToken`
2. Client stores both tokens (typically in secure storage/httpOnly cookies)
3. For each API request, include `Authorization: Bearer <accessToken>` header
4. When `accessToken` expires, use `refreshToken` to get a new `accessToken`
5. If `refreshToken` also expires, user must log in again

### Authorization Middleware

All protected endpoints validate:

- ✅ Token format (Bearer token)
- ✅ Token signature (JWT_SECRET)
- ✅ Token expiration
- ✅ User role (if required)

---

## API Endpoints

### 1. Authentication Routes

**Base Path:** `/auth`

| Method | Endpoint              | Auth | Rate Limit | Description          |
| ------ | --------------------- | ---- | ---------- | -------------------- |
| POST   | `/auth/login`         | ❌   | 5/10min    | User login           |
| POST   | `/auth/logout`        | ❌   | ❌         | User logout          |
| POST   | `/auth/refresh-token` | ❌   | ❌         | Refresh access token |

#### POST `/auth/login`

**Login with username and password**

```http
POST /auth/login
Content-Type: application/json

{
  "username": "SV001",
  "password": "password123"
}
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "SV001",
      "studentId": "SV001",
      "role": "member",
      "status": "active"
    }
  }
}
```

**Error Response (401 Unauthorized)**

```json
{
  "code": 401,
  "message": "Tên đăng nhập hoặc mật khẩu không đúng",
  "data": null
}
```

#### POST `/auth/logout`

**Invalidate refresh token and logout**

```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Đăng xuất thành công",
  "data": null
}
```

#### POST `/auth/refresh-token`

**Get new access token using refresh token**

```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Làm mới token thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized)**

```json
{
  "code": 401,
  "message": "Refresh token không hợp lệ hoặc hết hạn",
  "data": null
}
```

---

### 2. User Routes

**Base Path:** `/users`  
**Required Role:** `admin`  
**Authentication:** ✅ Required

| Method | Endpoint            | Description      |
| ------ | ------------------- | ---------------- |
| GET    | `/users`            | Get all users    |
| POST   | `/users`            | Create new user  |
| PATCH  | `/users/:id/change` | Update user info |
| PATCH  | `/users/:id/leave`  | Deactivate user  |

#### GET `/users`

**Retrieve all users in the system**

```http
GET /users
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Lấy danh sách tài khoản thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "SV001",
      "studentId": "SV001",
      "role": "member",
      "status": "active",
      "createdAt": "2025-04-25T10:30:00Z",
      "updatedAt": "2025-04-25T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "username": "SV002",
      "studentId": "SV002",
      "role": "admin",
      "status": "active",
      "createdAt": "2025-04-20T09:15:00Z",
      "updatedAt": "2025-04-20T09:15:00Z"
    }
  ]
}
```

#### POST `/users`

**Create new user account and associated student profile**

```http
POST /users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "studentId": "SV001",
  "name": "Nguyễn Văn A",
  "email": "nguyena@university.edu.vn",
  "phone": "0901234567",
  "password": "securePass123",
  "birthDate": "2003-05-15",
  "joinDate": "2022-09-01",
  "cccd": "123456789012",
  "bloodGroup": "O+",
  "group": "DA17A1",
  "category": "CNTT",
  "yearStudy": 3,
  "position": "Thành viên"
}
```

**Success Response (201 Created)**

```json
{
  "code": 201,
  "message": "Tạo tài khoản và thông tin sinh viên thành công",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "SV001",
      "studentId": "SV001",
      "role": "member",
      "status": "active",
      "createdAt": "2025-04-25T10:30:00Z"
    },
    "student": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Nguyễn Văn A",
      "studentId": "SV001",
      "birthDate": "2003-05-15",
      "joinDate": "2022-09-01",
      "phone": "0901234567",
      "email": "nguyena@university.edu.vn",
      "cccd": "123456789012",
      "bloodGroup": "O+",
      "group": "DA17A1",
      "category": "CNTT",
      "yearStudy": 3,
      "position": "Thành viên",
      "createdAt": "2025-04-25T10:30:00Z"
    }
  }
}
```

#### PATCH `/users/:id/change`

**Update user information (password, role, status)**

```http
PATCH /users/507f1f77bcf86cd799439011/change
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "newPassword456",
  "role": "admin"
}
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Cập nhật tài khoản thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "SV001",
    "studentId": "SV001",
    "role": "admin",
    "status": "active",
    "updatedAt": "2025-04-25T11:00:00Z"
  }
}
```

#### PATCH `/users/:id/leave`

**Deactivate user account**

```http
PATCH /users/507f1f77bcf86cd799439011/leave
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Người dùng đã rời CLB",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "SV001",
    "status": "inactive",
    "updatedAt": "2025-04-25T11:00:00Z"
  }
}
```

---

### 3. Student Routes

**Base Path:** `/students`  
**Required Roles:** `admin`, `member`  
**Authentication:** ✅ Required

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/students`          | Get all students    |
| GET    | `/students/search`   | Search students     |
| PATCH  | `/students/:id/info` | Update student info |

#### GET `/students`

**Retrieve all students**

```http
GET /students
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Lấy danh sách sinh viên thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Nguyễn Văn A",
      "studentId": "SV001",
      "birthDate": "2003-05-15T00:00:00Z",
      "joinDate": "2022-09-01T00:00:00Z",
      "phone": "0901234567",
      "email": "nguyena@university.edu.vn",
      "cccd": "123456789012",
      "bloodGroup": "O+",
      "group": "DA17A1",
      "category": "CNTT",
      "yearStudy": 3,
      "position": "Thành viên",
      "createdAt": "2025-04-25T10:30:00Z",
      "updatedAt": "2025-04-25T10:30:00Z"
    }
  ]
}
```

#### GET `/students/search`

**Search students by ID, name, phone, or email**

```http
GET /students/search?query=SV001
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search term (student ID, name, phone, or email) |

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Tìm kiếm sinh viên thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Nguyễn Văn A",
      "studentId": "SV001",
      "phone": "0901234567",
      "email": "nguyena@university.edu.vn",
      "bloodGroup": "O+",
      "group": "DA17A1"
    }
  ]
}
```

#### PATCH `/students/:id/info`

**Update student information**

```http
PATCH /students/507f1f77bcf86cd799439012/info
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phone": "0912345678",
  "email": "newemail@university.edu.vn",
  "bloodGroup": "A+",
  "yearStudy": 4
}
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Cập nhật thông tin sinh viên thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Nguyễn Văn A",
    "studentId": "SV001",
    "phone": "0912345678",
    "email": "newemail@university.edu.vn",
    "bloodGroup": "A+",
    "yearStudy": 4,
    "updatedAt": "2025-04-25T11:00:00Z"
  }
}
```

---

### 4. Blood Program Routes

**Base Path:** `/blood-programs`  
**Required Roles:** `admin` (create/edit/delete), `admin`/`member` (read)  
**Authentication:** ✅ Required

| Method | Endpoint                        | Description            |
| ------ | ------------------------------- | ---------------------- |
| GET    | `/blood-programs`               | Get all programs       |
| GET    | `/blood-programs/search`        | Search programs        |
| GET    | `/blood-programs/:id/statistic` | Get program statistics |
| POST   | `/blood-programs`               | Create program         |
| PATCH  | `/blood-programs/:id`           | Update program         |
| DELETE | `/blood-programs/:id`           | Delete program         |

#### GET `/blood-programs`

**Retrieve all blood donation programs**

```http
GET /blood-programs
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Lấy danh sách chương trình hiến máu thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Chương trình hiến máu tháng 5/2025",
      "description": "Chương trình hiến máu nhân tạo điều kiện sinh viên",
      "date": "2025-05-10T00:00:00Z",
      "location": "Phòng y tế trường đại học XYZ",
      "image": "https://example.com/image.jpg",
      "count": 50,
      "createdAt": "2025-04-25T10:30:00Z",
      "updatedAt": "2025-04-25T10:30:00Z"
    }
  ]
}
```

#### GET `/blood-programs/search`

**Search programs by name, location, or date**

```http
GET /blood-programs/search?query=tháng 5
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search term (program name, location, or date) |

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Tìm kiếm chương trình hiến máu thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Chương trình hiến máu tháng 5/2025",
      "date": "2025-05-10T00:00:00Z",
      "location": "Phòng y tế trường đại học XYZ"
    }
  ]
}
```

#### GET `/blood-programs/:id/statistic`

**Get detailed statistics for a specific blood program**

```http
GET /blood-programs/507f1f77bcf86cd799439013/statistic
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Lấy thống kê chương trình hiến máu thành công",
  "data": {
    "summary": {
      "_id": "507f1f77bcf86cd799439013",
      "total": 45,
      "success": 40,
      "reject": 3,
      "pending": 2
    },
    "bloodDetails": [
      {
        "_id": "O+",
        "count": 15
      },
      {
        "_id": "A+",
        "count": 12
      },
      {
        "_id": "B+",
        "count": 8
      },
      {
        "_id": "AB+",
        "count": 5
      }
    ]
  }
}
```

#### POST `/blood-programs`

**Create a new blood donation program** (Admin only)

```http
POST /blood-programs
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Chương trình hiến máu tháng 5/2025",
  "description": "Chương trình hiến máu nhân tạo điều kiện sinh viên",
  "date": "2025-05-10",
  "location": "Phòng y tế trường đại học XYZ",
  "image": "https://example.com/image.jpg",
  "count": 50
}
```

**Success Response (201 Created)**

```json
{
  "code": 201,
  "message": "Đã thêm thành công sự kiện mới",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Chương trình hiến máu tháng 5/2025",
    "description": "Chương trình hiến máu nhân tạo điều kiện sinh viên",
    "date": "2025-05-10T00:00:00Z",
    "location": "Phòng y tế trường đại học XYZ",
    "image": "https://example.com/image.jpg",
    "count": 50,
    "createdAt": "2025-04-25T10:30:00Z"
  }
}
```

#### PATCH `/blood-programs/:id`

**Update blood program details** (Admin only)

```http
PATCH /blood-programs/507f1f77bcf86cd799439013
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Chương trình hiến máu tháng 5/2025 - Cập nhật",
  "count": 60,
  "location": "Phòng y tế trường đại học ABC"
}
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Cập nhật chương trình hiến máu thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Chương trình hiến máu tháng 5/2025 - Cập nhật",
    "count": 60,
    "location": "Phòng y tế trường đại học ABC",
    "updatedAt": "2025-04-25T11:00:00Z"
  }
}
```

#### DELETE `/blood-programs/:id`

**Delete blood program** (Admin only)

```http
DELETE /blood-programs/507f1f77bcf86cd799439013
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Xóa chương trình hiến máu thành công",
  "data": null
}
```

---

### 5. Blood Register Routes

**Base Path:** `/blood-registers`  
**Required Roles:** `admin` (full), `admin`/`member` (create/cancel own)  
**Authentication:** ✅ Required

| Method | Endpoint                      | Description           |
| ------ | ----------------------------- | --------------------- |
| GET    | `/blood-registers`            | Get all registrations |
| GET    | `/blood-registers/search`     | Search registrations  |
| POST   | `/blood-registers`            | Register for donation |
| PATCH  | `/blood-registers/:id`        | Update registration   |
| PATCH  | `/blood-registers/:id/cancel` | Cancel registration   |
| DELETE | `/blood-registers/:id`        | Delete registration   |

#### GET `/blood-registers`

**Retrieve all blood donation registrations**

```http
GET /blood-registers
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Lấy danh sách đăng ký hiến máu thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Nguyễn Văn A",
      "studentId": "SV001",
      "bloodProgramId": "507f1f77bcf86cd799439013",
      "phone": "0901234567",
      "email": "nguyena@university.edu.vn",
      "CCCD": "123456789012",
      "bloodGroup": "O+",
      "address": "123 Đường ABC, Quận 1, TP HCM",
      "lastDateDonate": "2024-12-15T00:00:00Z",
      "status": "pending",
      "result": "pending",
      "reason": null,
      "createdAt": "2025-04-25T10:30:00Z",
      "updatedAt": "2025-04-25T10:30:00Z"
    }
  ]
}
```

#### GET `/blood-registers/search`

**Search registrations by student ID, phone, email, or CCCD**

```http
GET /blood-registers/search?query=SV001
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search term (student ID, phone, email, or CCCD) |

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Tìm kiếm đăng ký hiến máu thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Nguyễn Văn A",
      "studentId": "SV001",
      "phone": "0901234567",
      "status": "pending"
    }
  ]
}
```

#### POST `/blood-registers`

**Register for blood donation program**

```http
POST /blood-registers
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "studentId": "SV001",
  "name": "Nguyễn Văn A",
  "email": "nguyena@university.edu.vn",
  "phone": "0901234567",
  "bloodProgramId": "507f1f77bcf86cd799439013",
  "CCCD": "123456789012",
  "bloodGroup": "O+",
  "address": "123 Đường ABC, Quận 1, TP HCM",
  "lastDateDonate": "2024-12-15"
}
```

**Success Response (201 Created)**

```json
{
  "code": 201,
  "message": "Đăng ký hiến máu thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Nguyễn Văn A",
    "studentId": "SV001",
    "bloodProgramId": "507f1f77bcf86cd799439013",
    "phone": "0901234567",
    "email": "nguyena@university.edu.vn",
    "CCCD": "123456789012",
    "bloodGroup": "O+",
    "address": "123 Đường ABC, Quận 1, TP HCM",
    "lastDateDonate": "2024-12-15T00:00:00Z",
    "status": "pending",
    "result": "pending",
    "reason": null,
    "createdAt": "2025-04-25T10:30:00Z"
  }
}
```

#### PATCH `/blood-registers/:id`

**Update blood registration (update status/result)** (Admin only)

```http
PATCH /blood-registers/507f1f77bcf86cd799439014
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "approved",
  "result": "success",
  "reason": null
}
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Cập nhật đăng ký hiến máu thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "approved",
    "result": "success",
    "updatedAt": "2025-04-25T11:00:00Z"
  }
}
```

#### PATCH `/blood-registers/:id/cancel`

**Cancel blood registration**

```http
PATCH /blood-registers/507f1f77bcf86cd799439014/cancel
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Hủy đăng ký hiến máu thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "cancelled",
    "updatedAt": "2025-04-25T11:00:00Z"
  }
}
```

#### DELETE `/blood-registers/:id`

**Delete blood registration** (Admin only)

```http
DELETE /blood-registers/507f1f77bcf86cd799439014
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Xóa đăng ký hiến máu thành công",
  "data": null
}
```

---

### 6. Notification Routes

**Base Path:** `/notifications`  
**Required Roles:** `admin` (create/edit/delete), `admin`/`member` (read)  
**Authentication:** ✅ Required

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| GET    | `/notifications`     | Get all notifications |
| POST   | `/notifications`     | Create notification   |
| PATCH  | `/notifications/:id` | Update notification   |
| DELETE | `/notifications/:id` | Delete notification   |

#### GET `/notifications`

**Retrieve all notifications**

```http
GET /notifications
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Lấy danh sách thông báo thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Chương trình hiến máu mới",
      "content": "CLB thông báo chương trình hiến máu tháng 5",
      "url": "https://example.com/program/123",
      "createdAt": "2025-04-25T10:30:00Z",
      "updatedAt": "2025-04-25T10:30:00Z"
    }
  ]
}
```

#### POST `/notifications`

**Create new notification** (Admin only)

```http
POST /notifications
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Chương trình hiến máu mới",
  "content": "CLB thông báo chương trình hiến máu tháng 5",
  "url": "https://example.com/program/123"
}
```

**Success Response (201 Created)**

```json
{
  "code": 201,
  "message": "Tạo thông báo thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Chương trình hiến máu mới",
    "content": "CLB thông báo chương trình hiến máu tháng 5",
    "url": "https://example.com/program/123",
    "createdAt": "2025-04-25T10:30:00Z"
  }
}
```

#### PATCH `/notifications/:id`

**Update notification** (Admin only)

```http
PATCH /notifications/507f1f77bcf86cd799439015
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Cập nhật: Chương trình hiến máu tháng 5",
  "content": "Thông báo cập nhật lịch hiến máu"
}
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Cập nhật thông báo thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Cập nhật: Chương trình hiến máu tháng 5",
    "content": "Thông báo cập nhật lịch hiến máu",
    "updatedAt": "2025-04-25T11:00:00Z"
  }
}
```

#### DELETE `/notifications/:id`

**Delete notification** (Admin only)

```http
DELETE /notifications/507f1f77bcf86cd799439015
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "code": 200,
  "message": "Xóa thông báo thành công",
  "data": null
}
```

---

## Data Models & Structures

### User Model

Represents an authenticated user account in the system.

```javascript
{
  _id: ObjectId,                          // MongoDB document ID
  username: String,                       // Login username (unique, required)
  password: String,                       // Hashed password (bcryptjs)
  role: String,                           // User role: 'admin' or 'member'
  studentId: String,                      // Associated student ID (unique, required)
  status: String,                         // 'active' or 'inactive'
  createdAt: Date,                        // Account creation timestamp
  updatedAt: Date                         // Last update timestamp
}
```

**Example Document:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "SV001",
  "password": "$2b$10$encrypted_password_hash",
  "role": "member",
  "studentId": "SV001",
  "status": "active",
  "createdAt": "2025-04-25T10:30:00Z",
  "updatedAt": "2025-04-25T10:30:00Z"
}
```

---

### Student Model

Represents student profile information.

```javascript
{
  _id: ObjectId,                          // MongoDB document ID
  name: String,                           // Full name (required)
  studentId: String,                      // Student ID (unique, required)
  birthDate: Date,                        // Date of birth (required)
  joinDate: Date,                         // Club join date (required)
  phone: String,                          // Phone number (unique, required)
  email: String,                          // Email address (unique, required)
  cccd: String,                           // ID card number (unique, required)
  bloodGroup: String,                     // Blood type (O+, O-, A+, A-, B+, B-, AB+, AB-)
  group: String,                          // Class/Study group (required)
  category: String,                       // Major/Category (required)
  yearStudy: Number,                      // Academic year (1-4)
  position: String,                       // Club position (required)
  createdAt: Date,                        // Profile creation timestamp
  updatedAt: Date                         // Last update timestamp
}
```

**Example Document:**

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Nguyễn Văn A",
  "studentId": "SV001",
  "birthDate": "2003-05-15T00:00:00Z",
  "joinDate": "2022-09-01T00:00:00Z",
  "phone": "0901234567",
  "email": "nguyena@university.edu.vn",
  "cccd": "123456789012",
  "bloodGroup": "O+",
  "group": "DA17A1",
  "category": "CNTT",
  "yearStudy": 3,
  "position": "Thành viên",
  "createdAt": "2025-04-25T10:30:00Z",
  "updatedAt": "2025-04-25T10:30:00Z"
}
```

---

### BloodProgram Model

Represents a blood donation program event.

```javascript
{
  _id: ObjectId,                          // MongoDB document ID
  name: String,                           // Program name (required)
  description: String,                    // Program description (required)
  date: Date,                             // Event date (required)
  location: String,                       // Event location (required)
  image: String,                          // Image URL (required)
  count: Number,                          // Expected donor count (optional)
  createdAt: Date,                        // Program creation timestamp
  updatedAt: Date                         // Last update timestamp
}
```

**Example Document:**

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Chương trình hiến máu tháng 5/2025",
  "description": "Chương trình hiến máu nhân tạo điều kiện sinh viên",
  "date": "2025-05-10T00:00:00Z",
  "location": "Phòng y tế trường đại học XYZ",
  "image": "https://example.com/image.jpg",
  "count": 50,
  "createdAt": "2025-04-25T10:30:00Z",
  "updatedAt": "2025-04-25T10:30:00Z"
}
```

---

### BloodRegister Model

Represents a student's registration for a blood donation program.

```javascript
{
  _id: ObjectId,                          // MongoDB document ID
  name: String,                           // Donor name (required)
  studentId: String,                      // Student ID (required)
  bloodProgramId: ObjectId,               // Reference to BloodProgram (required)
  phone: String,                          // Phone number (required)
  email: String,                          // Email address (required)
  CCCD: String,                           // ID card number (required)
  bloodGroup: String,                     // Blood type (default: "null")
  address: String,                        // Full address (required)
  lastDateDonate: Date,                   // Last donation date (default: null)
  status: String,                         // 'pending', 'approved', 'rejected', 'cancelled'
  result: String,                         // 'pending', 'success', 'reject'
  reason: String,                         // Rejection/cancellation reason (default: "null")
  createdAt: Date,                        // Registration creation timestamp
  updatedAt: Date                         // Last update timestamp
}
```

**Example Document:**

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "Nguyễn Văn A",
  "studentId": "SV001",
  "bloodProgramId": "507f1f77bcf86cd799439013",
  "phone": "0901234567",
  "email": "nguyena@university.edu.vn",
  "CCCD": "123456789012",
  "bloodGroup": "O+",
  "address": "123 Đường ABC, Quận 1, TP HCM",
  "lastDateDonate": "2024-12-15T00:00:00Z",
  "status": "pending",
  "result": "pending",
  "reason": null,
  "createdAt": "2025-04-25T10:30:00Z",
  "updatedAt": "2025-04-25T10:30:00Z"
}
```

---

### Notification Model

Represents a system notification.

```javascript
{
  _id: ObjectId,                          // MongoDB document ID
  title: String,                          // Notification title (required)
  content: String,                        // Notification content (required)
  url: String,                            // Related URL (optional)
  createdAt: Date,                        // Creation timestamp
  updatedAt: Date                         // Last update timestamp
}
```

**Example Document:**

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "title": "Chương trình hiến máu mới",
  "content": "CLB thông báo chương trình hiến máu tháng 5",
  "url": "https://example.com/program/123",
  "createdAt": "2025-04-25T10:30:00Z",
  "updatedAt": "2025-04-25T10:30:00Z"
}
```

---

### RefreshToken Model

Stores refresh tokens for maintaining user sessions.

```javascript
{
  _id: ObjectId,                          // MongoDB document ID
  token: String,                          // Refresh token (required)
  userId: ObjectId,                       // Reference to User (required)
  expiresAt: Date,                        // Token expiration time (required)
  createdAt: Date,                        // Token creation timestamp
  updatedAt: Date                         // Last update timestamp
}
```

---

## Error Handling

### HTTP Status Codes

| Code    | Status                 | Description            | Common Causes                                                |
| ------- | ---------------------- | ---------------------- | ------------------------------------------------------------ |
| **200** | OK                     | Request successful     | GET, PATCH, DELETE successful                                |
| **201** | Created                | Resource created       | POST successful                                              |
| **400** | Bad Request            | Invalid request format | Missing required fields, invalid data type, validation error |
| **401** | Unauthorized           | Authentication failed  | Missing/invalid/expired token, invalid credentials           |
| **403** | Forbidden              | Access denied          | Insufficient permissions, wrong role                         |
| **404** | Not Found              | Resource not found     | Non-existent user/student/program/registration               |
| **409** | Conflict               | Resource conflict      | Duplicate username/email/studentId/CCCD                      |
| **415** | Unsupported Media Type | Wrong content type     | Not using `application/json`                                 |
| **429** | Too Many Requests      | Rate limit exceeded    | Exceeded login rate limit (5/10min)                          |
| **500** | Server Error           | Internal server error  | Database error, unexpected exception                         |

### Error Response Format

All error responses follow this format:

```json
{
  "code": 400,
  "message": "Descriptive error message in Vietnamese or English",
  "data": null
}
```

### Common Error Scenarios

#### Missing Authorization Header

```json
{
  "code": 401,
  "message": "Vui lòng cung cấp token",
  "data": null
}
```

#### Invalid Token

```json
{
  "code": 401,
  "message": "Token không hợp lệ",
  "data": null
}
```

#### Token Expired

```json
{
  "code": 401,
  "message": "Token hết hạn, vui lòng làm mới",
  "data": null
}
```

#### Insufficient Permissions

```json
{
  "code": 403,
  "message": "Bạn không có quyền truy cập tài nguyên này",
  "data": null
}
```

#### Resource Not Found

```json
{
  "code": 404,
  "message": "Không tìm thấy tài khoản",
  "data": null
}
```

#### Duplicate Entry

```json
{
  "code": 409,
  "message": "Tên người dùng đã tồn tại",
  "data": null
}
```

#### Validation Error

```json
{
  "code": 400,
  "message": "Vui lòng cung cấp đầy đủ thông tin bắt buộc",
  "data": null
}
```

---

## Rate Limiting

### Login Endpoint Rate Limit

**Endpoint:** `POST /auth/login`

| Parameter         | Value                   |
| ----------------- | ----------------------- |
| **Window**        | 10 minutes              |
| **Max Requests**  | 5 attempts              |
| **Response Code** | 429 (Too Many Requests) |

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "code": 429,
  "message": "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau",
  "data": null
}
```

### Recommendation

- Implement exponential backoff on client
- Lock UI after 3 failed attempts
- Show warning after 2 failed attempts
- Display countdown timer for cooldown period

---

## Setup & Configuration

### Environment Variables

Create a `.env` file in project root with the following variables:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blood-donation-club
MONGODB_NAME=blood-donation-club

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Email Configuration (if needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application URL
APP_URL=http://localhost:3000
```

### Installation & Setup

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd husc_clbhienmau_be-main
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

5. **Start production server**
   ```bash
   pnpm start
   ```

### MongoDB Connection

Ensure MongoDB is running:

```bash
# Local MongoDB
mongod --dbpath /path/to/data

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### API Testing

#### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"SV001","password":"password123"}'

# Get all students (with token)
curl -X GET http://localhost:3000/students \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Using Postman

1. Set request method and URL
2. Add header: `Content-Type: application/json`
3. Add header: `Authorization: Bearer <your_token>`
4. Add request body (JSON)
5. Send request

#### Using JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch("http://localhost:3000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "SV001",
    password: "password123",
  }),
});

const { data } = await loginResponse.json();
const accessToken = data.accessToken;

// Get students with token
const studentsResponse = await fetch("http://localhost:3000/students", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

const students = await studentsResponse.json();
console.log(students);
```

---

## Quick Reference

### Login Flow

1. User submits username & password to `POST /auth/login`
2. Server validates credentials
3. Server returns `accessToken` (15 min) & `refreshToken` (7 days)
4. Client stores both tokens
5. Client includes `Authorization: Bearer <accessToken>` in all subsequent requests

### Token Refresh Flow

1. Access token expires (HTTP 401)
2. Client sends `refreshToken` to `POST /auth/refresh-token`
3. Server validates refresh token
4. Server returns new `accessToken`
5. Client uses new token for requests

### Common API Workflows

#### Register New User (Admin)

```
1. POST /auth/login          → Get admin token
2. POST /users               → Create user + student
3. POST /blood-programs      → Create blood program
4. GET /blood-programs       → View all programs
```

#### Student Registration for Blood Donation

```
1. POST /auth/login          → Get member token
2. GET /blood-programs       → View available programs
3. POST /blood-registers     → Register for program
4. GET /blood-registers      → Track registration status
```

#### Manage Blood Program (Admin)

```
1. POST /blood-programs              → Create program
2. GET /blood-programs/:id/statistic → View statistics
3. GET /blood-registers/search       → Search registrations
4. PATCH /blood-registers/:id        → Update registration result
```

---

## Support & Issues

For API issues or questions:

1. Check error response message and HTTP status code
2. Verify token validity (not expired)
3. Ensure user has required role/permissions
4. Check MongoDB connection
5. Review server logs for detailed error information

---

**Last Updated:** April 25, 2025  
**API Version:** 1.0  
**Project:** CLB Hiến Máu (Blood Donation Club Management System)
