import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Modal,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { programsApi, registersApi } from "../../services/api.js";
import { formatDate, formatDateTime, getId, isProgramRegistrationOpen, sortProgramsByRegistrationPriority } from "../../utils/format.js";

const { Paragraph, Text, Title } = Typography;

export default function HomePage() {
  const [programs, setPrograms] = useState([]);
  const [registers, setRegisters] = useState({ total: 0, pending: 0 });
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [programData, registerData] = await Promise.all([
          programsApi.getAllPaginated({ page: 1, limit: 100 }),
          registersApi.getAll(),
        ]);
        let items = Array.isArray(programData?.data) ? programData.data : [];
        items = sortProgramsByRegistrationPriority(items);
        if (!mounted) return;
        setPrograms(items);
        setCount(programData?.pagination?.totalItems || 0);
        setRegisters(registerData || { total: 0, pending: 0 });
      } catch {
        if (mounted) {
          setError(
            "Không thể tải hết dữ liệu công khai. Bạn vẫn có thể vào từng trang để thao tác.",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen message="Đang tải dữ liệu công khai..." />;
  }

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Card className="hero-card surface-card" bodyStyle={{ padding: 24 }}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={15}>
            <Text strong style={{ color: "#b91c1c", letterSpacing: 1.5 }}>
              NỀN TẢNG HIẾN MÁU SINH VIÊN
            </Text>
            <Title level={2} style={{ marginTop: 10, marginBottom: 10, color: "#7f1d1d" }}>
              HIẾN GIỌT MÁU ĐÀO - TRAO ĐỜI SỰ SỐNG
            </Title>
            <Paragraph style={{ color: "#334155", marginBottom: 16 }}>
              CLB Hiến Máu Khoa Học giúp bạn đăng ký nhanh, theo dõi trạng thái xét duyệt rõ ràng
              và không bỏ lỡ các chương trình hiến máu quan trọng.
            </Paragraph>
            <Space wrap>
              <Button type="primary" size="large">
                <Link to="/register">Đăng ký hiến máu ngay</Link>
              </Button>
              <Button size="large">
                <Link to="/programs">Xem chương trình gần nhất</Link>
              </Button>
            </Space>
          </Col>
          <Col xs={24} md={9}>
            <Card className="surface-card" bodyStyle={{ padding: 16 }}>
              <Title level={5} style={{ marginTop: 0, color: "#7f1d1d" }}>
                Điểm nổi bật
              </Title>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#334155" }}>
                <li>Đăng ký nhanh với biểu mẫu rõ ràng.</li>
                <li>Theo dõi duyệt đơn theo thời gian thực.</li>
                <li>Tra cứu lịch sử hiến máu minh bạch.</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>

      {error ? <Alert type="warning" showIcon message={error} /> : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="surface-card stat-card">
            <Statistic title="Tổng chương trình" value={count} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="surface-card stat-card">
            <Statistic title="Tổng lượt đăng ký" value={registers.total} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="surface-card" style={{ background: "#b91c1c" }}>
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.8)" }}>Đang chờ duyệt</span>}
              value={registers.pending || 0}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="surface-card"
        title={<span className="section-title">Chương trình sắp tới</span>}
        extra={<Link to="/programs">Xem tất cả</Link>}
      >
        <Row gutter={[16, 16]} className="home-programs-row">
          {programs.slice(0, 3).map((program) => {
            const canRegister = isProgramRegistrationOpen(program);
            return (
              <Col xs={24} md={12} lg={8} key={getId(program)} className="program-card-col">
                <Card
                  hoverable
                  className="surface-card program-card-equal"
                  onClick={() => setSelectedProgram(program)}
                  style={{ cursor: "pointer" }}
                  cover={
                    <img
                      src={program.image || "/images/program_banner_2.webp"}
                      alt={program.name}
                      style={{ height: 150, objectFit: "cover" }}
                    />
                  }
                  actions={canRegister ? [
                    <Link
                      className="home-program-action-link"
                      to={`/register?programId=${getId(program)}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      Đăng ký ngay
                    </Link>,
                  ] : undefined}
                >
                  <Space direction="vertical" size={4} className="program-card-content">
                    <Text type="secondary">{formatDateTime(program.date)}</Text>
                    <Tag color={canRegister ? "green" : "volcano"}>
                      {canRegister ? "Còn hạn đăng ký" : "Hết hạn đăng ký"}
                    </Tag>
                    <Text strong style={{ color: "#7f1d1d" }}>
                      {program.name}
                    </Text>
                    <Text type="secondary">{program.count ?? "-"} người dự kiến</Text>
                    <Text type="secondary">{program.location || "-"}</Text>
                    <Text type="secondary">
                      Hạn đăng ký: {program.registrationDeadline ? formatDateTime(program.registrationDeadline) : "Không giới hạn"}
                    </Text>
                  </Space>
                </Card>
              </Col>
            );
          })}
          {!programs.length ? (
            <Col span={24}>
              <Empty description="Chưa có chương trình sắp tới." />
            </Col>
          ) : null}
        </Row>
      </Card>

      <Modal
        open={Boolean(selectedProgram)}
        title={selectedProgram?.name || "Chi tiết chương trình"}
        onCancel={() => setSelectedProgram(null)}
        footer={null}
        centered
        width={720}
      >
        {selectedProgram ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <img
              src={selectedProgram.image || "/images/program_banner_2.webp"}
              alt={selectedProgram.name}
              style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 16 }}
            />
            <Space wrap>
              <Text type="secondary">Ngày: {formatDateTime(selectedProgram.date)}</Text>
              <Text type="secondary">Số lượng dự kiến: {selectedProgram.count ?? "-"}</Text>
              <Text type="secondary">Địa điểm: {selectedProgram.location || "-"}</Text>
              <Tag color={isProgramRegistrationOpen(selectedProgram) ? "green" : "volcano"}>
                {isProgramRegistrationOpen(selectedProgram) ? "Còn hạn đăng ký" : "Hết hạn đăng ký"}
              </Tag>
              <Text type="secondary">
                Hạn đăng ký: {selectedProgram.registrationDeadline ? formatDateTime(selectedProgram.registrationDeadline) : "Không giới hạn"}
              </Text>
            </Space>
            <Card className="surface-card" bodyStyle={{ padding: 16 }}>
              <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                {selectedProgram.description || "Không có mô tả"}
              </Paragraph>
            </Card>
            <Space>
              {isProgramRegistrationOpen(selectedProgram) ? (
                <Button type="primary">
                  <Link to={`/register?programId=${getId(selectedProgram)}`}>Đăng ký ngay</Link>
                </Button>
              ) : null}
              <Button onClick={() => setSelectedProgram(null)}>Đóng</Button>
            </Space>
          </Space>
        ) : null}
      </Modal>
    </Space>
  );
}
