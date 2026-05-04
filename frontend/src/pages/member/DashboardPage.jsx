import { Button, Card, Col, List, Row, Space, Statistic } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageTitle from "../../components/PageTitle.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { notificationsApi, programsApi, registersApi, studentsApi } from "../../services/api.js";
import { formatDateTime } from "../../utils/format.js";

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [registers, setRegisters] = useState({ TongSoLanHien: 0, approved: 0 });
  const [notifications, setNotifications] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [programData, registerData, notificationData, studentData] = await Promise.all([
          programsApi.getAllPaginated({ page: 1, limit: 100 }),
          registersApi.search(user?.studentId ),
          notificationsApi.getAll(),
          studentsApi.getAll()
        ]);
        if (!mounted) return;
        setPrograms(Array.isArray(programData?.data) ? programData.data : []);
        setRegisters(registerData || { TongSoLanHien: 0, approved: 0 });
        setNotifications(Array.isArray(notificationData) ? notificationData : []);
        setStudent((studentData || []).find((item) => item.studentId === user?.studentId) || null);
      } catch {
        if (mounted) setPrograms([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user?.studentId]);

  // const mine = useMemo(
  //   () => registers.filter((item) => item.studentId === user?.studentId),
  //   [registers, user?.studentId]
  // );

  const upcomingPrograms = useMemo(
    () => [...programs].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5),
    [programs]
  );

  if (loading) {
    return <LoadingScreen message="Đang tải bảng điều khiển thành viên..." />;
  }


  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <PageTitle title={`Xin chào ${student?.name || user?.username || ''}`} description="Khu vực quản lý cá nhân thành viên." />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card className="surface-card stat-card"><Statistic title="Lượt đăng ký" value={registers.TongSoLanHien} /></Card></Col>
        <Col xs={24} md={8}><Card className="surface-card stat-card"><Statistic title="Đã hiến thành công" value={registers.approved} /></Card></Col>
        <Col xs={24} md={8}><Card className="surface-card" style={{ background: "#b91c1c" }}><Statistic title={<span style={{ color: "rgba(255,255,255,0.8)" }}>Thông báo</span>} value={notifications.length} valueStyle={{ color: "#fff" }} /></Card></Col>
      </Row>
      <Card className="surface-card" title="Hành động nhanh">
        <Space wrap>
          <Button type="primary"><Link to="/register">Đăng ký hiến máu</Link></Button>
          <Button><Link to="/member/history">Xem lịch sử</Link></Button>
          <Button><Link to="/member/notifications">Xem thông báo</Link></Button>
        </Space>
      </Card>
      <Card className="surface-card" title="Sự kiện sắp tới">
        <List
          dataSource={upcomingPrograms}
          locale={{ emptyText: "Không có chương trình sắp tới." }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.name} description={`${formatDateTime(item.date)} - ${item.location}`} />
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}
