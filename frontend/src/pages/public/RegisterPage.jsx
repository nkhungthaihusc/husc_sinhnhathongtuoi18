import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageTitle from "../../components/PageTitle.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { programsApi, registersApi, studentsApi } from "../../services/api.js";
import { formatDateTime, getId, isProgramRegistrationOpen } from "../../utils/format.js";

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function RegisterPage() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedProgramId = searchParams.get('programId') || '';
  const [programs, setPrograms] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    studentId: '',
    phone: '',
    email: '',
    CCCD: '',
    bloodGroup: '',
    address: '',
    lastDateDonate: '',
    bloodProgramId: selectedProgramId,
    note: ''
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [data, students] = await Promise.all([
          programsApi.getAll(),
          isAuthenticated && user?.studentId ? studentsApi.getAll() : Promise.resolve([]),
        ]);
        if (!mounted) return;
        setPrograms(Array.isArray(data) ? data : []);
        if (isAuthenticated && user?.studentId) {
          const me = (students || []).find((item) => item.studentId === user.studentId);
          if (me) {
            setForm((prev) => ({
              ...prev,
              name: me.name || prev.name,
              studentId: me.studentId || prev.studentId,
              phone: me.phone || prev.phone,
              email: me.email || prev.email,
              CCCD: me.cccd || prev.CCCD,
              bloodGroup: me.bloodGroup || prev.bloodGroup
            }));
          }
        }
      } catch {
        if (mounted) setPrograms([]);
      } finally {
        if (mounted) setInitialLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const selectablePrograms = useMemo(
    () =>
      programs
        .filter((program) => isProgramRegistrationOpen(program))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [programs]
  );

  const expiredSelectedProgram = useMemo(() => {
    if (!selectedProgramId) return null;
    const program = programs.find((item) => getId(item) === selectedProgramId);
    if (!program) return null;
    return isProgramRegistrationOpen(program) ? null : program;
  }, [programs, selectedProgramId]);

  if (initialLoading) {
    return <LoadingScreen message="Đang tải form đăng ký..." />;
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setNotice('');
    setError('');
    const programId = form.bloodProgramId || selectedProgramId;
    const selectedProgram = programs.find((item) => getId(item) === programId);
    if (selectedProgram && !isProgramRegistrationOpen(selectedProgram)) {
      setError('Chương trình đã hết hạn đăng ký. Vui lòng chọn chương trình khác.');
      return;
    }
    // if (!isAuthenticated) {
    //   setError('Bạn cần đăng nhập trước khi gửi đăng ký hiến máu.');
    //   return;
    // }

    setLoading(true);
    try {
      await registersApi.create({
        name: form.name,
        studentId: form.studentId,
        bloodProgramId: programId,
        phone: form.phone,
        email: form.email,
        CCCD: form.CCCD,
        bloodGroup: form.bloodGroup || null,
        address: form.address,
        lastDateDonate: form.lastDateDonate || null,
        note: form.note || ''
      });
      setNotice('Đăng ký thành công. Đơn của bạn đang ở trạng thái chờ duyệt.');
      setForm((prev) => ({ ...prev, address: '', lastDateDonate: '', note: '' }));
    } catch (e) {
      setError(e?.response?.data?.message || 'Gửi đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <PageTitle
        title="Đăng ký hiến máu"
        description="Điền thông tin chính xác để CLB xác nhận nhanh. Chọn đúng chương trình bạn muốn tham gia để tránh nhầm lẫn."
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card className="surface-card"><Typography.Text strong>1. Điền biểu mẫu</Typography.Text><div>Nhập đủ thông tin và chọn chương trình phù hợp.</div></Card></Col>
        <Col xs={24} md={8}><Card className="surface-card"><Typography.Text strong>2. Chờ xác nhận</Typography.Text><div>Admin sẽ duyệt đơn và cập nhật trạng thái.</div></Card></Col>
        <Col xs={24} md={8}><Card className="surface-card"><Typography.Text strong>3. Theo dõi lịch sử</Typography.Text><div>Tra cứu lại kết quả hiến máu bất cứ lúc nào.</div></Card></Col>
      </Row>
      {/* {!isAuthenticated ? (
        <Alert
          type="warning"
          showIcon
          message={
            <span>
              Bạn chưa đăng nhập. Vui lòng <Link to="/login">đăng nhập</Link> để gửi biểu mẫu.
            </span>
          }
        />
      ) : null} */}
      <Card className="surface-card">
        {expiredSelectedProgram ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message={`Chương trình "${expiredSelectedProgram.name}" đã hết hạn đăng ký. Vui lòng chọn chương trình khác.`}
          />
        ) : null}
        <Form layout="vertical" onSubmitCapture={onSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item label="Họ và tên" required><Input name="name" value={form.name} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="MSSV"><Input name="studentId" value={form.studentId} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Số điện thoại" required><Input name="phone" value={form.phone} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Email" required><Input type="email" name="email" value={form.email} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="CCCD" required><Input name="CCCD" value={form.CCCD} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}>
              <Form.Item label="Nhóm máu">
                <Select
                  value={form.bloodGroup || undefined}
                  onChange={(value) => setForm((prev) => ({ ...prev, bloodGroup: value || "" }))}
                  options={BLOOD_GROUPS.map((group) => ({ label: group, value: group }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Chương trình" required>
                <Select
                  value={form.bloodProgramId || undefined}
                  onChange={(value) => setForm((prev) => ({ ...prev, bloodProgramId: value || "" }))}
                  options={selectablePrograms.map((item) => ({ label: `${item.name} - ${formatDateTime(item.date)}`, value: getId(item) }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}><Form.Item label="Địa chỉ" required><Input name="address" value={form.address} onChange={onChange} /></Form.Item></Col>
            <Col xs={24} md={12}>
              <Form.Item label="Lần hiến gần nhất">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  value={form.lastDateDonate ? dayjs(form.lastDateDonate) : null}
                  onChange={(date) =>
                    setForm((prev) => ({ ...prev, lastDateDonate: date ? date.format("YYYY-MM-DD") : "" }))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={24}><Form.Item label="Ghi chú"><Input.TextArea rows={3} name="note" value={form.note} onChange={onChange} /></Form.Item></Col>
            <Col span={24}>
              <Space wrap>
                <Button loading={loading} type="primary" htmlType="submit">Gửi đăng ký</Button>
                <Button onClick={() => navigate("/programs")}>Xem chương trình</Button>
              </Space>
            </Col>
          </Row>
        </Form>
        <Space direction="vertical" size={8} style={{ width: "100%", marginTop: 12 }}>
          {notice ? <Alert type="success" showIcon message={notice} /> : null}
          {error ? <Alert type="error" showIcon message={error} /> : null}
        </Space>
      </Card>
    </Space>
  );
}
