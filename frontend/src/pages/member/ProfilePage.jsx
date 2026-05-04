import { Alert, Button, Card, Col, Descriptions, Form, Input, InputNumber, Row, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageTitle from "../../components/PageTitle.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { studentsApi } from "../../services/api.js";
import { formatDate, getId } from "../../utils/format.js";

export default function MemberProfilePage() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [form, setForm] = useState({
    phone: '',
    email: '',
    cccd: '',
    bloodGroup: '',
    yearStudy: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const all = await studentsApi.getAll();
        if (!mounted) return;
        setAllStudents(Array.isArray(all) ? all : []);
        const mine = (all || []).find((item) => item.studentId === user?.studentId);
        if (!mine) return;
        setStudent(mine);
        setForm({
          phone: mine.phone || '',
          email: mine.email || '',
          bloodGroup: mine.bloodGroup || '',
          yearStudy: mine.yearStudy || '',
          cccd: mine.cccd || ''
        });
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || 'Không tải được hồ sơ cá nhân');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user?.studentId]);

  const validateField = (fieldName, value) => {
    if (!student) return null;
    const others = allStudents.filter(s => getId(s) !== getId(student));
    
    if (fieldName === 'email' && value) {
      if (others.some(s => s.email === value)) return 'Email này đã được sử dụng';
    }
    if (fieldName === 'phone' && value) {
      if (others.some(s => s.phone === value)) return 'Số điện thoại này đã được sử dụng';
    }
    if (fieldName === 'cccd' && value) {
      if (others.some(s => s.cccd === value)) return 'CCCD này đã được sử dụng';
    }
    return null;
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    const err = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: err
    }));
  };

  const hasErrors = useMemo(() => Object.values(fieldErrors).some(err => err), [fieldErrors]);

  if (loading) {
    return <LoadingScreen message="Đang tải hồ sơ cá nhân..." />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!student || hasErrors) return;
    setError('');
    setNotice('');
    try {
      await studentsApi.updateInfo(getId(student), {
        phone: form.phone,
        email: form.email,
        bloodGroup: form.bloodGroup,
        yearStudy: Number(form.yearStudy),
        cccd: form.cccd
      });
      setNotice('Cập nhật thông tin thành công.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <PageTitle title="Hồ sơ cá nhân" description="Thông tin cá nhân của bạn" />
      <Card className="surface-card">
        <Descriptions column={{ xs: 1, md: 2 }} size="small">
          <Descriptions.Item label="Họ tên">{student?.name || "-"}</Descriptions.Item>
          <Descriptions.Item label="MSSV">{student?.studentId || "-"}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">{formatDate(student?.birthDate)}</Descriptions.Item>
          <Descriptions.Item label="Ngày tham gia">{formatDate(student?.joinDate)}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card className="surface-card">
        <Form layout="vertical" onSubmitCapture={onSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item label="Email" validateStatus={fieldErrors.email ? "error" : ""} help={fieldErrors.email}><Input name="email" value={form.email} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Số điện thoại" validateStatus={fieldErrors.phone ? "error" : ""} help={fieldErrors.phone}><Input name="phone" value={form.phone} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Nhóm máu"><Input name="bloodGroup" value={form.bloodGroup} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="CCCD" validateStatus={fieldErrors.cccd ? "error" : ""} help={fieldErrors.cccd}><Input name="cccd" value={form.cccd} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Năm học"><InputNumber min={1} max={6} name="yearStudy" value={form.yearStudy} onChange={(value) => setForm((prev) => ({ ...prev, yearStudy: Number(value || 1) }))} style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit" disabled={hasErrors}>Lưu thay đổi</Button>
        </Form>
      </Card>
      {notice ? <Alert type="success" showIcon message={notice} /> : null}
      {error ? <Alert type="error" showIcon message={error} /> : null}
    </Space>
  );
}
