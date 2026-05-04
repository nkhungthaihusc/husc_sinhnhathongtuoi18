import { Alert, Card, Col, Empty, List, Row, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import PageTitle from "../../components/PageTitle.jsx";
import { notificationsApi } from "../../services/api.js";
import { formatDateTime, getId } from "../../utils/format.js";

const { Paragraph, Text, Title } = Typography;

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await notificationsApi.getAll();
        const list = Array.isArray(data) ? data : [];
        if (!mounted) return;
        setNotifications(list);
        setSelectedId(getId(list[0]));
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || 'Không tải được thông báo');
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
    return <LoadingScreen message="Đang tải thông báo..." />;
  }

  const current = notifications.find((item) => getId(item) === selectedId) || notifications[0];

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <PageTitle title="Thông báo thành viên" description="Các thông báo được gửi đến bạn" />
      {error ? <Alert type="error" showIcon message={error} /> : null}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={9}>
          <Card className="surface-card">
            <List
              dataSource={notifications}
              locale={{ emptyText: <Empty description="Chưa có thông báo." /> }}
              renderItem={(item) => {
                const selected = getId(item) === getId(current);
                return (
                  <List.Item
                    onClick={() => setSelectedId(getId(item))}
                    style={{
                      cursor: "pointer",
                      borderRadius: 10,
                      padding: 10,
                      background: selected ? "#fef2f2" : "transparent",
                      border: selected ? "1px solid #fca5a5" : "1px solid transparent",
                    }}
                  >
                    <List.Item.Meta title={item.title} description={<Text type="secondary">{formatDateTime(item.createdAt)}</Text>} />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
        <Col xs={24} md={15}>
          <Card className="surface-card" style={{ minHeight: 280 }}>
            {current ? (
              <Space direction="vertical" size={12}>
                <Text type="secondary">{formatDateTime(current.createdAt)}</Text>
                <Title level={4} style={{ margin: 0, color: "#7f1d1d" }}>{current.title}</Title>
                <Paragraph style={{ whiteSpace: "pre-wrap" }}>{current.content}</Paragraph>
                {current.url ? <a href={current.url} target="_blank" rel="noreferrer">Mở liên kết</a> : null}
              </Space>
            ) : (
              <Empty description="Chọn thông báo để xem chi tiết." />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
