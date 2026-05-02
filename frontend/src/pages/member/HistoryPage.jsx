import { Alert, Button, Card, Col, Empty, Modal, Row, Space, Statistic, Table } from 'antd';
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [registerData, programData] = await Promise.all([
          registersApi.search(user?.studentId),
          programsApi.getAllPaginated({ page: 1, limit: 100 }),
        ]);
        const mine = registerData?.listBloodRegisters;
        setRows(Array.isArray(mine) ? mine : []);
        const mapped = Object.fromEntries((programData?.data || []).map((program) => [getId(program), program]));
        setProgramMap(mapped);
      } catch (e) {
        setError(e?.response?.data?.message || 'Không tải được lịch sử hiến máu');
      }
    };
    load();
  }, [user?.studentId]);

  const load = async () => {
    try {
      const [registerData, programData] = await Promise.all([
        registersApi.search(user?.studentId),
        programsApi.getAllPaginated({ page: 1, limit: 100 }),
      ]);
      const mine = registerData?.listBloodRegisters;
      setRows(Array.isArray(mine) ? mine : []);
      const mapped = Object.fromEntries((programData?.data || []).map((program) => [getId(program), program]));
      setProgramMap(mapped);
    } catch (e) {
      setError(e?.response?.data?.message || 'Không tải được lịch sử hiến máu');
    }
  };

  const onCancelRegistration = async (registerId) => {
    setCancelLoading(true);
    setError('');
    try {
      await registersApi.update(registerId, { result: 'cancelled', reason: 'Người dùng hủy' });
      await load();
      setDetailOpen(false);
      setDetailTarget(null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể hủy đơn đăng ký');
    } finally {
      setCancelLoading(false);
    }
  };

  const donatedCount = useMemo(
    () => rows.filter((item) => String(item.result || '').toLowerCase() === 'approved').length,
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
      title: 'Kết quả',
      key: 'result',
      width: 140,
      render: (_, row) => {
        const status = mapRegisterStatus(row.result);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (value) => formatDate(value, true),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      render: (_, row) => (
        <Space wrap>
          <Button
            size="small"
            onClick={() => {
              setDetailTarget(row);
              setDetailOpen(true);
            }}
          >
            Chi tiết
          </Button>
          {String(row.result || '').toLowerCase() === 'pending' && (
            <Button size="small" danger onClick={() => onCancelRegistration(getId(row))} loading={cancelLoading}>
              Hủy
            </Button>
          )}
        </Space>
      ),
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
            <Statistic title="Đơn thành công" value={donatedCount} />
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

      <Modal
        title="Chi tiết đăng ký"
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setDetailTarget(null);
        }}
        footer={[
          String(detailTarget?.result || '').toLowerCase() === 'pending' ? (
            <Button key="cancel" danger onClick={() => onCancelRegistration(getId(detailTarget))} loading={cancelLoading}>
              Hủy đơn
            </Button>
          ) : null,
          <Button
            key="close"
            onClick={() => {
              setDetailOpen(false);
              setDetailTarget(null);
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <div><strong>Chương trình:</strong> {detailTarget ? (programMap[detailTarget.bloodProgramId]?.name || detailTarget.bloodProgramId || '-') : '-'}</div>
          <div><strong>Kết quả:</strong> {mapRegisterStatus(detailTarget?.result).label}</div>
          <div><strong>Lý do:</strong> {detailTarget?.reason || 'Không có lý do'}</div>
          <div><strong>Ngày đăng ký:</strong> {formatDate(detailTarget?.createdAt, true)}</div>
        </Space>
      </Modal>
    </div>
  );
}
