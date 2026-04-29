import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PageTitle from '../../components/PageTitle.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { programsApi, registersApi } from '../../services/api.js';
import { formatDate, formatTime, getId, mapRegisterStatus } from '../../utils/format.js';

const { Text } = Typography;

export default function AdminRegistrationsPage() {
  const [programs, setPrograms] = useState([]);
  const [rows, setRows] = useState([]);
  const [programMap, setProgramMap] = useState({});
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [payload, setPayload] = useState({ status: 'pending', result: 'pending', reason: '' });
  const [search, setSearch] = useState('');
  const [tableLoading, setTableLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadRegistersByProgram = useCallback(async (programId) => {
    if (!programId) {
      setRows([]);
      return;
    }
    setTableLoading(true);
    try {
      const registerData = await registersApi.searchByProgramId(programId);
      setRows(Array.isArray(registerData?.bloodRegisters) ? registerData.bloodRegisters : []);
    } catch {
      setRows([]);
      setError('Không thể tải danh sách đăng ký theo sự kiện đã chọn');
    } finally {
      setTableLoading(false);
    }
  }, []);

  const loadPrograms = useCallback(async () => {
    try {
      const programData = await programsApi.getAllPaginated({ page: 1, limit: 100 });
      const nextPrograms = Array.isArray(programData?.data) ? programData.data : [];
      const sortedPrograms = [...nextPrograms].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPrograms(sortedPrograms);
      setProgramMap(Object.fromEntries(sortedPrograms.map((item) => [getId(item), item])));

      const initialProgramId = sortedPrograms[0] ? getId(sortedPrograms[0]) : '';
      setSelectedProgramId(initialProgramId);
      await loadRegistersByProgram(initialProgramId);
    } catch {
      setPrograms([]);
      setRows([]);
      setError('Không thể tải danh sách sự kiện hiến máu');
    }
  }, [loadRegistersByProgram]);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        await loadPrograms();
      } catch {
        if (mounted) setError('Không tải được danh sách đăng ký');
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [loadPrograms]);

  const onChangeProgram = async (programId) => {
    setError('');
    setSelectedProgramId(programId || '');
    await loadRegistersByProgram(programId || '');
  };

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      `${row.name || ''} ${row.studentId || ''} ${programMap[row.bloodProgramId]?.name || ''}`.toLowerCase().includes(q),
    );
  }, [rows, search, programMap]);

  const stats = useMemo(() => {
    const total = rows.length;
    const approved = rows.filter((item) => String(item.status || '').toLowerCase() === 'approved').length;
    const rejected = rows.filter((item) => String(item.status || '').toLowerCase() === 'rejected').length;
    const success = rows.filter((item) => String(item.result || '').toLowerCase() === 'success').length;
    return {
      total,
      approvedRate: total ? Math.round((approved / total) * 100) : 0,
      rejectedRate: total ? Math.round((rejected / total) * 100) : 0,
      success,
    };
  }, [rows]);

  const onStartEdit = (row) => {
    setEditingId(getId(row));
    setPayload({
      status: row.status || 'pending',
      result: row.result || 'pending',
      reason: row.reason || '',
      note: row.note || '',
    });
  };

  const onSave = async () => {
    setError('');
    setNotice('');
    try {
      await registersApi.update(editingId, payload);
      await loadRegistersByProgram(selectedProgramId);
      setEditingId('');
      setNotice('Cập nhật đăng ký thành công.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể cập nhật đăng ký');
    }
  };

  const columns = [
    {
      title: 'Người đăng ký',
      key: 'name',
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{row.name || '-'}</Text>
          <Text type="secondary">MSSV: {row.studentId || '-'}</Text>
        </Space>
      ),
    },
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
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 150,
      responsive: ['lg'],
      render: (value) => (
        <Text type="secondary" ellipsis={{ tooltip: value || '-' }}>
          {value || '-'}
        </Text>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      responsive: ['lg'],
      render: (value) => formatDate(value, true),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      render: (_, row) => <Button size="small" onClick={() => onStartEdit(row)}>Cập nhật</Button>,
    },
  ];

  const selectedProgram = selectedProgramId ? programMap[selectedProgramId] : null;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PageTitle title="Duyệt đăng ký hiến máu" description="Xử lý trạng thái đơn đăng ký hiến máu trong đợt hiến máu hiện tại" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}><Card className="surface-card admin-stat-card"><Statistic title="Tổng đơn" value={stats.total} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="surface-card admin-stat-card"><Statistic title="Tỷ lệ duyệt" value={stats.approvedRate} suffix="%" /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="surface-card admin-stat-card"><Statistic title="Tỷ lệ từ chối" value={stats.rejectedRate} suffix="%" /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="surface-card admin-stat-card"><Statistic title="Hiến thành công" value={stats.success} /></Card></Col>
      </Row>

      <Card
        className="surface-card"
        title="Danh sách đăng ký"
        extra={(
          <Space wrap>
            <Select
              value={selectedProgramId || undefined}
              onChange={onChangeProgram}
              allowClear
              showSearch
              placeholder="Chọn sự kiện hiến máu"
              style={{ width: 360 }}
              optionFilterProp="label"
              options={programs.map((item) => ({
                value: getId(item),
                label: `${item.name} - ${formatDate(item.date)} ${formatTime(item.date)}`,
              }))}
            />
            <Input.Search
              allowClear
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, MSSV, chương trình"
              style={{ width: 280 }}
            />
          </Space>
        )}
      >
        {selectedProgram ? (
          <Alert
            type="success"
            showIcon
            style={{
              marginBottom: 16,
              background: '#f6ffed',
              borderColor: '#b7eb8f',
            }}
            message={`Đang hiển thị danh sách đăng ký của sự kiện: ${selectedProgram.name} (${formatDate(selectedProgram.date)} ${formatTime(selectedProgram.date)})`}
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="Hãy chọn một sự kiện để xem danh sách người đăng ký."
          />
        )}
        <Table
          rowKey={getId}
          columns={columns}
          dataSource={filteredRows}
          loading={tableLoading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 980 }}
        />
      </Card>

      <Modal open={Boolean(editingId)} title="Cập nhật trạng thái đơn" onCancel={() => setEditingId('')} onOk={onSave} okText="Lưu trạng thái" cancelText="Hủy">
        <Form layout="vertical">
          {payload.note && (
            <Form.Item label="Ghi chú từ người đăng ký">
              <Input.TextArea value={payload.note} readOnly rows={3} />
            </Form.Item>
          )}
          <Form.Item label="Trạng thái đơn">
            <Select value={payload.status} onChange={(value) => setPayload((prev) => ({ ...prev, status: value }))} options={[{ value: 'pending', label: 'pending' }, { value: 'approved', label: 'approved' }, { value: 'rejected', label: 'rejected' }, { value: 'cancelled', label: 'cancelled' }]} />
          </Form.Item>
          <Form.Item label="Kết quả hiến máu">
            <Select value={payload.result} onChange={(value) => setPayload((prev) => ({ ...prev, result: value }))} options={[{ value: 'pending', label: 'pending' }, { value: 'success', label: 'success' }, { value: 'reject', label: 'reject' }]} />
          </Form.Item>
          <Form.Item label="Lý do (nếu có)">
            <Input value={payload.reason} onChange={(event) => setPayload((prev) => ({ ...prev, reason: event.target.value }))} placeholder="Nhập lý do" />
          </Form.Item>
        </Form>
      </Modal>

      {notice ? <Alert type="success" showIcon message={notice} /> : null}
      {error ? <Alert type="error" showIcon message={error} /> : null}
    </div>
  );
}
