// Blood groups
export const BLOOD_GROUPS = [
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
];

// Positions
export const POSITIONS = [
  { label: 'Thành viên', value: 'Thành viên' },
  { label: 'Trưởng ban', value: 'Trưởng ban' },
  { label: 'Chủ nhiệm', value: 'Chủ nhiệm' },
  { label: 'Phó chủ nhiệm', value: 'Phó chủ nhiệm' },
];

// Categories (majors)
export const CATEGORIES = [
  'Quản trị và phân tích dữ liệu',
  'Công nghệ thông tin',
  'Kỹ thuật phần mềm',
  'Công nghệ thông tin - Kỹ sư Việt - Nhật',
  'Công nghệ kỹ thuật Điện tử - Viễn thông',
  'Vật lý học',
  'Hóa học',
  'Công nghệ kỹ thuật hóa học',
  'Công nghệ sinh học',
  'Kiến trúc',
  'Kỹ thuật Trắc địa - Bản đồ',
  'Địa kỹ thuật xây dựng',
  'Quản lý tài nguyên và môi trường',
  'Khoa học môi trường',
  'Quản lý an toàn, sức khỏe và môi trường',
  'Hán - Nôm',
  'Văn học',
  'Lịch sử',
  'Đông phương học',
  'Quản lý văn hóa',
  'Triết học',
  'Quản lý nhà nước',
  'Báo chí',
  'Xã hội học',
  'Công tác xã hội',
  'Truyền thông số',
];

// Validation patterns and functions
export const PATTERNS = {
  studentId: /^\d{2}T\d{7}$/, // xxTxxxxxxx
  phone: /^0\d{9}$/, // 0x + 8 more digits = 10 total
  cccd: /^\d{12}$/, // 12 digits
};

export const validateStudentId = (value) => {
  if (!value) return 'MSSV là bắt buộc';
  if (!PATTERNS.studentId.test(value)) {
    return 'MSSV phải có dạng xxTxxxxxxx (ví dụ: 20T1234567)';
  }
  return null;
};

export const validateEmail = (value) => {
  if (!value) return 'Email là bắt buộc';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    return 'Email không hợp lệ';
  }
  return null;
};

export const validatePhone = (value) => {
  if (!value) return 'Số điện thoại là bắt buộc';
  if (!PATTERNS.phone.test(value)) {
    return 'Số điện thoại phải bắt đầu 0x và có 10 chữ số';
  }
  return null;
};

export const validateCCCD = (value) => {
  if (!value) return null; // CCCD không bắt buộc
  if (!PATTERNS.cccd.test(value)) {
    return 'CCCD phải có 12 chữ số';
  }
  return null;
};

export const validateName = (value) => {
  if (!value) return 'Họ tên là bắt buộc';
  return null;
};

export const capitalizeNames = (value) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Normalize MSSV for login/comparison - convert lowercase 't' to uppercase 'T'
export const normalizeStudentIdForLogin = (value) => {
  if (!value) return '';
  return value.replace(/t/gi, 'T');
};
