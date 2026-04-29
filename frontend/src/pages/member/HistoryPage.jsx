import { Alert, Card, Col, Empty, Row, Space, Statistic, Table, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import PageTitle from '../../components/PageTitle.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { programsApi, registersApi } from '../../services/api.js';
import { formatDate, getId, mapRegisterStatus } from '../../utils/format.js';

export default function MemberHistoryPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [programMap, setProgramMap] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [registerData, programData] = await Promise.all([
          registersApi.search(user?.studentId),
          programsApi.getAllPaginated({ page: 1, limit: 100 }),
        ]);
        const mine = registerData?.listBloodRegisters;
        console.log("Lịch sử hiến máu của bạn:",  user?.studentId, mine);
        setRows(mine);
        const mapped = Object.fromEntries((programData?.data || []).map((program) => [getId(program), program]));
        setProgramMap(mapped);
      } catch (e) {
        setError(e?.response?.data?.message || 'Không tải được lịch sử hiến máu');
      }
    };
    load();
  }, [user?.studentId]);

  const donatedCount = useMemo(
    () => rows.filter((item) => String(item.result || '').toLowerCase() === 'success').length,
    [rows],
  );

  const latest = useMemo(
    () => [...rows].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0],
    [rows],
  );

  const columns = [
    {
      title: 'Chương trình',
      key: 'program',
      render: (_, row) => programMap[row.bloodProgramId]?.name || row.bloodProgramId || '-',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      render: (_, row) => {
        const status = mapRegisterStatus(row.status);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
    },
    {
      title: 'Kết quả',
      dataIndex: 'result',
      key: 'result',
      width: 120,
      render: (value) => <Tag>{value || '-'}</Tag>,
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (value) => formatDate(value, true),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PageTitle title="Lịch sử hiến máu" description="Theo dõi các đơn đã đăng ký và kết quả xét duyệt." />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="surface-card">
            <Statistic title="Tổng đăng ký" value={rows.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="surface-card">
            <Statistic title="Đã hiến thành công" value={donatedCount} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="surface-card">
            <Statistic title="Cập nhật gần nhất" value={formatDate(latest?.updatedAt || latest?.createdAt, true)} />
          </Card>
        </Col>
      </Row>

      {error ? <Alert type="error" showIcon message={error} /> : null}

      <Card className="surface-card" title="Danh sách đăng ký của bạn">
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Table
            rowKey={getId}
            columns={columns}
            dataSource={rows}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            locale={{ emptyText: <Empty description="Chưa có dữ liệu đăng ký" /> }}
            scroll={{ x: 760 }}
          />
        </Space>
      </Card>
    </div>
  );
}
