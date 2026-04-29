import { Alert, Button, Card, Col, Descriptions, Form, Input, InputNumber, Row, Space } from "antd";
import { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { studentsApi } from "../../services/api.js";
import { getId } from "../../utils/format.js";

export default function MemberProfilePage() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({
    phone: '',
    email: '',
    bloodGroup: '',
    yearStudy: 1
  });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const all = await studentsApi.getAll();
        const mine = (all || []).find((item) => item.studentId === user?.studentId);
        if (!mine) return;
        setStudent(mine);
        setForm({
          phone: mine.phone || '',
          email: mine.email || '',
          bloodGroup: mine.bloodGroup || '',
          yearStudy: mine.yearStudy || 1
        });
      } catch (e) {
        setError(e?.response?.data?.message || 'Không tải được hồ sơ cá nhân');
      }
    };
    load();
  }, [user?.studentId]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!student) return;
    setError('');
    setNotice('');
    try {
      await studentsApi.updateInfo(getId(student), {
        phone: form.phone,
        email: form.email,
        bloodGroup: form.bloodGroup,
        yearStudy: Number(form.yearStudy)
      });
      setNotice('Cập nhật thông tin thành công.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <PageTitle title="Hồ sơ cá nhân" description="Dữ liệu cập nhật qua endpoint /students/:id/info." />
      <Card className="surface-card">
        <Descriptions column={{ xs: 1, md: 2 }} size="small">
          <Descriptions.Item label="Họ tên">{student?.name || "-"}</Descriptions.Item>
          <Descriptions.Item label="MSSV">{student?.studentId || "-"}</Descriptions.Item>
          <Descriptions.Item label="CCCD">{student?.cccd || "-"}</Descriptions.Item>
          <Descriptions.Item label="Ngày tham gia">{student?.joinDate?.slice(0, 10) || "-"}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card className="surface-card">
        <Form layout="vertical" onSubmitCapture={onSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item label="Email"><Input name="email" value={form.email} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Số điện thoại"><Input name="phone" value={form.phone} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Nhóm máu"><Input name="bloodGroup" value={form.bloodGroup} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Năm học"><InputNumber min={1} max={6} name="yearStudy" value={form.yearStudy} onChange={(value) => setForm((prev) => ({ ...prev, yearStudy: Number(value || 1) }))} style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
        </Form>
      </Card>
      {notice ? <Alert type="success" showIcon message={notice} /> : null}
      {error ? <Alert type="error" showIcon message={error} /> : null}
    </Space>
  );
}
