import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import PageTitle from '../../components/PageTitle.jsx';
import { studentsApi, usersApi } from '../../services/api.js';
import { getId, formatUserStatus } from '../../utils/format.js';

const { Text } = Typography;

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialForm = {
  studentId: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  birthDate: '',
  joinDate: '',
  cccd: '',
  bloodGroup: '',
  group: '',
  category: '',
  yearStudy: 1,
  position: 'Thành viên',
  role: 'member',
};

export default function AdminMembersPage() {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [editUserId, setEditUserId] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [userData, studentData] = await Promise.all([usersApi.getAll(), studentsApi.getAll()]);
    setUsers(Array.isArray(userData) ? userData : []);
    setStudents(Array.isArray(studentData) ? studentData : []);
  };

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        await load();
      } catch {
        if (mounted) setError('Không tải được danh sách thành viên');
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    const mapUserByStudent = Object.fromEntries(users.map((item) => [item.studentId, item]));
    const merged = students.map((student) => ({
      key: getId(student),
      student,
      user: mapUserByStudent[student.studentId] || null,
    }));
    const keyword = search.trim().toLowerCase();
    if (!keyword) return merged;
    return merged.filter(({ student }) =>
      `${student.name} ${student.studentId} ${student.phone} ${student.email} ${student.cccd}`.toLowerCase().includes(keyword),
    );
  }, [search, students, users]);

  const adminCount = useMemo(() => users.filter((item) => item.role === 'admin').length, [users]);
  const activeCount = useMemo(() => users.filter((item) => item.status === 'active').length, [users]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    const others = editStudentId 
      ? students.filter(s => getId(s) !== editStudentId)
      : students;
    
    let err = null;
    
    if (fieldName === 'studentId' && value) {
      if (others.some(s => s.studentId === value)) {
        err = 'MSSV này đã tồn tại';
      }
    }
    if (fieldName === 'email' && value) {
      if (others.some(s => s.email === value)) {
        err = 'Email này đã được sử dụng';
      }
    }
    if (fieldName === 'phone' && value) {
      if (others.some(s => s.phone === value)) {
        err = 'Số điện thoại này đã được sử dụng';
      }
    }
    if (fieldName === 'cccd' && value) {
      if (others.some(s => s.cccd === value)) {
        err = 'CCCD này đã được sử dụng';
      }
    }
    
    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: err
    }));
  };

  const hasErrors = useMemo(() => Object.values(fieldErrors).some(err => err), [fieldErrors]);

  const resetForm = () => {
    setEditUserId('');
    setEditStudentId('');
    setForm(initialForm);
    setFieldErrors({});
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    
    if (hasErrors) {
      setError('Vui lòng sửa các lỗi trước khi lưu');
      return;
    }

    try {
      if (editStudentId) {
        await studentsApi.updateInfo(editStudentId, {
          name: form.name,
          phone: form.phone,
          email: form.email,
          birthDate: form.birthDate || undefined,
          cccd: form.cccd,
          bloodGroup: form.bloodGroup,
          group: form.group,
          category: form.category,
          yearStudy: Number(form.yearStudy),
          position: form.position,
          joinDate: form.joinDate || undefined,
        });

        const changePayload = {};
        if (form.password) changePayload.password = form.password;
        if (form.role) changePayload.role = form.role;
        if (Object.keys(changePayload).length && editUserId) {
          await usersApi.change(editUserId, changePayload);
        }
        setNotice('Cập nhật thành viên thành công.');
      } else {
        await usersApi.create({
          studentId: form.studentId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password || '12345678',
          birthDate: form.birthDate,
          joinDate: form.joinDate,
          cccd: form.cccd,
          bloodGroup: form.bloodGroup,
          group: form.group,
          category: form.category,
          yearStudy: Number(form.yearStudy),
          position: form.position,
        });
        setNotice('Tạo thành viên và tài khoản thành công.');
      }
      await load();
      resetForm();
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể lưu dữ liệu thành viên');
    }
  };

  const onEdit = ({ student, user }) => {
    setEditUserId(user ? getId(user) : '');
    setEditStudentId(getId(student));
    setFieldErrors({});
    setForm({
      studentId: student.studentId || '',
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      password: '',
      birthDate: toDateInputValue(student.birthDate),
      joinDate: toDateInputValue(student.joinDate),
      cccd: student.cccd || '',
      bloodGroup: student.bloodGroup || '',
      group: student.group || '',
      category: student.category || '',
      yearStudy: student.yearStudy || 1,
      position: student.position || 'Thành viên',
      role: user?.role || 'member',
    });
  };

  const onDeactivate = async (userId) => {
    setError('');
    setNotice('');
    try {
      await usersApi.leave(userId);
      await load();
      setNotice('Đã chuyển trạng thái tài khoản sang inactive.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản');
    }
  };

  const columns = [
    {
      title: 'Thành viên',
      key: 'name',
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{row.student.name}</Text>
          <Text type="secondary">{row.student.studentId}</Text>
        </Space>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      responsive: ['md'],
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text>{row.student.email || '-'}</Text>
          <Text type="secondary">{row.student.phone || '-'}</Text>
        </Space>
      ),
    },
    {
      title: 'Nhóm máu',
      dataIndex: ['student', 'bloodGroup'],
      key: 'bloodGroup',
      width: 120,
      render: (value) => value || '-',
    },
    {
      title: 'Role',
      key: 'role',
      width: 100,
      render: (_, row) => <Tag color={row.user?.role === 'admin' ? 'volcano' : 'blue'}>{row.user?.role || '-'}</Tag>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, row) => <Tag color={row.user?.status === 'active' ? 'success' : 'red'}>{formatUserStatus(row.user?.status) || '-'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_, row) => (
        <Space wrap>
          <Button size="small" onClick={() => onEdit(row)}>
            Sửa
          </Button>
          {row.user && row.user.status === 'active' ? (
        <Popconfirm
          title="Cho rời CLB"
          description="Chuyển tài khoản sang inactive?"
          okText="Xác nhận"
          cancelText="Hủy"
          onConfirm={() => onDeactivate(getId(row.user))}
        >
          <Button size="small" danger>
            Rời CLB
          </Button>
        </Popconfirm>
      ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PageTitle title="Quản lý thành viên" description="Quản lý hồ sơ và tài khoảng của các thành viên trong CLB" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="surface-card admin-stat-card">
            <Statistic title="Tổng thành viên" value={students.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="surface-card admin-stat-card">
            <Statistic title="Tài khoản admin" value={adminCount} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="surface-card admin-stat-card">
            <Statistic title="Tài khoản active" value={activeCount} />
          </Card>
        </Col>
      </Row>

      <Card className="surface-card" title={editStudentId ? 'Cập nhật thành viên' : 'Thêm thành viên mới'}>
        <Form layout="vertical" onSubmitCapture={onSubmit}>
          <Row gutter={12}>
            <Col xs={24} md={12} lg={8}><Form.Item label="Họ tên" required><Input name="name" value={form.name} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}><Form.Item label="MSSV" required validateStatus={fieldErrors.studentId ? "error" : ""} help={fieldErrors.studentId}><Input name="studentId" value={form.studentId} onChange={onChange} disabled={Boolean(editStudentId)} /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}><Form.Item label="Email" required validateStatus={fieldErrors.email ? "error" : ""} help={fieldErrors.email}><Input name="email" value={form.email} onChange={onChange} type="email" /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}><Form.Item label="Số điện thoại" required validateStatus={fieldErrors.phone ? "error" : ""} help={fieldErrors.phone}><Input name="phone" value={form.phone} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}><Form.Item label="CCCD" required validateStatus={fieldErrors.cccd ? "error" : ""} help={fieldErrors.cccd}><Input name="cccd" value={form.cccd} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}><Form.Item label="Nhóm máu"><Input name="bloodGroup" value={form.bloodGroup} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item label="Thuộc ban">
                <Select
                  value={form.group || undefined}
                  onChange={(value) => setForm((prev) => ({ ...prev, group: value || '' }))}
                  allowClear
                  placeholder="Chọn ban"
                  options={[
                    { label: 'Ban kỹ năng', value: 'Ban kỹ năng' },
                    { label: 'Ban hậu cần', value: 'Ban hậu cần' },
                    { label: 'Ban chủ nhiệm', value: 'Ban chủ nhiệm' },
                    { label: 'Ban truyền thông', value: 'Ban truyền thông' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}><Form.Item label="Ngành"><Input name="category" value={form.category} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}><Form.Item label="Năm học"><InputNumber min={1} max={8} value={Number(form.yearStudy)} onChange={(value) => setForm((prev) => ({ ...prev, yearStudy: value || 1 }))} style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}><Form.Item label="Chức vụ"><Input name="position" value={form.position} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}><Form.Item label="Ngày sinh"><Input name="birthDate" value={form.birthDate} onChange={onChange} type="date" /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}><Form.Item label="Ngày vào CLB"><Input name="joinDate" value={form.joinDate} onChange={onChange} type="date" /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}><Form.Item label={editStudentId ? 'Mật khẩu mới' : 'Mật khẩu'}><Input.Password name="password" value={form.password} onChange={onChange} placeholder={editStudentId ? 'Không bắt buộc' : ''} /></Form.Item></Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item label="Vai trò tài khoản">
                <Select value={form.role} options={[{ label: 'member', value: 'member' }, { label: 'admin', value: 'admin' }]} onChange={(value) => setForm((prev) => ({ ...prev, role: value || 'member' }))} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Space wrap>
                <Button type="primary" htmlType="submit" disabled={hasErrors}>{editStudentId ? 'Lưu cập nhật' : 'Thêm thành viên'}</Button>
                {editStudentId ? <Button onClick={resetForm}>Hủy sửa</Button> : null}
              </Space>
            </Col>
          </Row>
        </Form>
        <Space direction="vertical" size={8} style={{ width: '100%', marginTop: 12 }}>
          {notice ? <Alert type="success" showIcon message={notice} /> : null}
          {error ? <Alert type="error" showIcon message={error} /> : null}
        </Space>
      </Card>

      <Card className="surface-card" title="Danh sách thành viên">
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Input.Search allowClear value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, MSSV, SĐT, email, CCCD" />
          <Table columns={columns} dataSource={rows} pagination={{ pageSize: 8, showSizeChanger: false }} scroll={{ x: 980 }} />
        </Space>
      </Card>
    </div>
  );
}
