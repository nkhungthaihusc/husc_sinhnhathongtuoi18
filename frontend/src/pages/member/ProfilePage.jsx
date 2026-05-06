import { Alert, Button, Card, Col, Descriptions, Form, Input, InputNumber, Row, Select, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageTitle from "../../components/PageTitle.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { studentsApi } from "../../services/api.js";
import { formatDate, getId } from "../../utils/format.js";
import { BLOOD_GROUPS, validatePhone, validateEmail, validateCCCD } from "../../utils/constants.js";

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
  const [submitting, setSubmitting] = useState(false);

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
          phone: (mine.phone || '').trim(),
          email: (mine.email || '').trim(),
          bloodGroup: mine.bloodGroup || '',
          yearStudy: mine.yearStudy || '',
          cccd: (mine.cccd || '').trim()
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
    
    let err = null;
    
    // Validate using specific validators
    if (fieldName === 'email') {
      err = validateEmail(value);
      if (!err && value) {
        const normalizedValue = value.trim().toLowerCase();
        if (others.some(s => (s.email || '').trim().toLowerCase() === normalizedValue)) {
          err = 'Email này đã được sử dụng';
        }
      }
    } else if (fieldName === 'phone') {
      err = validatePhone(value);
      if (!err && value) {
        const normalizedValue = value.trim();
        if (others.some(s => (s.phone || '').trim() === normalizedValue)) {
          err = 'Số điện thoại này đã được sử dụng';
        }
      }
    } else if (fieldName === 'cccd') {
      err = validateCCCD(value);
      if (!err && value) {
        const normalizedValue = value.trim();
        if (others.some(s => (s.cccd || '').trim() === normalizedValue)) {
          err = 'CCCD này đã được sử dụng';
        }
      }
    }
    
    return err;
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    let finalValue = value;
    
    // Trim whitespace for email, phone, cccd
    if (['email', 'phone', 'cccd'].includes(name)) {
      finalValue = value.trim();
    }
    
    setForm((prev) => ({ ...prev, [name]: finalValue }));
    
    const err = validateField(name, finalValue);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: err
    }));
  };

  const hasErrors = useMemo(() => {
    // Check if any field has validation error
    if (Object.values(fieldErrors).some(err => err)) return true;
    
    // Check required fields
    if (!form.email || !form.phone) return true;
    
    return false;
  }, [fieldErrors, form]);

  if (loading) {
    return <LoadingScreen message="Đang tải hồ sơ cá nhân..." />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!student || hasErrors) return;
    setError('');
    setNotice('');
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
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
          <Descriptions.Item label="Thuộc ban">{student?.group}</Descriptions.Item>
          <Descriptions.Item label="Chức vụ">{student?.position}</Descriptions.Item>
          <Descriptions.Item label="Ngành học">{student?.category}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card className="surface-card">
        <Form layout="vertical" onSubmitCapture={onSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item label="Email" validateStatus={fieldErrors.email ? "error" : ""} help={fieldErrors.email}><Input name="email" type="email" value={form.email} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Số điện thoại" validateStatus={fieldErrors.phone ? "error" : ""} help={fieldErrors.phone}><Input name="phone" value={form.phone} onChange={onChange} placeholder="0xxxxxxxxx" /></Form.Item></Col>
            <Col xs={24} md={12}>
              <Form.Item label="Nhóm máu">
                <Select
                  value={form.bloodGroup || undefined}
                  onChange={(value) => setForm((prev) => ({ ...prev, bloodGroup: value || '' }))}
                  allowClear
                  placeholder="Chọn nhóm máu"
                  options={BLOOD_GROUPS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}><Form.Item label="CCCD" validateStatus={fieldErrors.cccd ? "error" : ""} help={fieldErrors.cccd}><Input name="cccd" value={form.cccd} onChange={onChange} placeholder="12 chữ số" maxLength="12" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Năm học"><InputNumber min={1} max={8} name="yearStudy" value={form.yearStudy ? Number(form.yearStudy) : 1} onChange={(value) => setForm((prev) => ({ ...prev, yearStudy: Number(value || 1) }))} style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit" disabled={hasErrors || submitting} loading={submitting}>Lưu thay đổi</Button>
        </Form>
      </Card>
      {notice ? <Alert type="success" showIcon message={notice} /> : null}
      {error ? <Alert type="error" showIcon message={error} /> : null}
    </Space>
  );
}
