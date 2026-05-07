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
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import PageTitle from '../../components/PageTitle.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { programsApi, registersApi } from '../../services/api.js';
import { formatDate, formatDateTime, getId, mapRegisterStatus, getStatusDisplay, getResultDisplay, isCancelled } from '../../utils/format.js';
import { getErrorMessage } from '../../utils/errorHelper.js';

const { Text } = Typography;

export default function AdminRegistrationsPage() {
  const [programs, setPrograms] = useState([]);
  const [rows, setRows] = useState([]);
  const [programMap, setProgramMap] = useState({});
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [payload, setPayload] = useState({ status: 'pending', result: 'pending', reason: '' });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [tableLoading, setTableLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRegistersByProgram = useCallback(async (programId) => {
    if (!programId) {
      setRows([]);
      return;
    }
    setTableLoading(true);
    try {
      const registerData = await registersApi.searchByProgramId(programId);
      setRows(Array.isArray(registerData?.bloodRegisters) ? registerData.bloodRegisters : []);
    } catch (e) {
      setRows([]);
      setError(getErrorMessage(e, 'Không thể tải danh sách đăng ký theo sự kiện đã chọn'));
    } finally {
      setTableLoading(false);
    }
  }, []);

  const loadPrograms = useCallback(async () => {
    try {
      const programData = await programsApi.getAllPaginated({ page: 1, limit: 100 });
      const nextPrograms = Array.isArray(programData?.data) ? programData.data : [];
      const sortedPrograms = [...nextPrograms].sort((a, b) => new Date(b.date) - new Date(a.date));
      setPrograms(sortedPrograms);
      setProgramMap(Object.fromEntries(sortedPrograms.map((item) => [getId(item), item])));

      const initialProgramId = sortedPrograms[0] ? getId(sortedPrograms[0]) : '';
      setSelectedProgramId(initialProgramId);
      await loadRegistersByProgram(initialProgramId);
    } catch (e) {
      setPrograms([]);
      setRows([]);
      setError(getErrorMessage(e, 'Không thể tải danh sách sự kiện hiến máu'));
    }
  }, [loadRegistersByProgram]);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        await loadPrograms();
      } catch {
        if (mounted) setError('Không tải được danh sách đăng ký');
      } finally {
        if (mounted) setLoading(false);
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
    let filtered = rows;
    if (q) {
      filtered = rows.filter((row) =>
        `${row.name || ''} ${row.studentId || ''} ${programMap[row.bloodProgramId]?.name || ''}`.toLowerCase().includes(q),
      );
    }
    
    const sorted = [...filtered];
    if (sortBy === 'name') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'createdAt') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'result') {
      const resultOrder = { pending: 0, approved: 1, rejected: 2, cancelled: 3 };
      sorted.sort((a, b) => {
        const orderA = resultOrder[String(a.result || '').toLowerCase()] ?? 99;
        const orderB = resultOrder[String(b.result || '').toLowerCase()] ?? 99;
        return orderA - orderB;
      });
    }
    return sorted;
  }, [rows, search, sortBy, programMap]);

  const stats = useMemo(() => {
    const total = rows.length;
    const approved = rows.filter((item) => String(item.result || '').toLowerCase() === 'approved').length;
    const rejected = rows.filter((item) => String(item.result || '').toLowerCase() === 'rejected').length;
    const cancelled = rows.filter((item) => String(item.result || '').toLowerCase() === 'cancelled').length;
    return {
      total,
      successRate: total ? Math.round((approved / total) * 100) : 0,
      rejectedRate: total ? Math.round((rejected / total) * 100) : 0,
      cancelledRate: total ? Math.round((cancelled / total) * 100) : 0,
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

  const renderBlankIfNullText = (value) => {
    const text = String(value ?? '').trim();
    return !text || text.toLowerCase() === 'null' ? ' ' : text;
  };

  const currentRow = editingId ? rows.find(r => getId(r) === editingId) : null;

  const onSave = async () => {
    setError('');
    setNotice('');
    setSaving(true);
    try {
      await registersApi.update(editingId, payload);
      await loadRegistersByProgram(selectedProgramId);
      setEditingId('');
      setNotice('Cập nhật đăng ký thành công.');
    } catch (e) {
      setError(getErrorMessage(e, 'Không thể cập nhật đăng ký'));
    } finally {
      setSaving(false);
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
        const display = getStatusDisplay(row.status, row.result);
        return <StatusBadge tone={display.tone}>{display.label}</StatusBadge>;
      },
    },
    {
      title: 'Kết quả',
      key: 'result',
      width: 140,
      render: (_, row) => {
        const status = getResultDisplay(row.result, row.status);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
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
      render: (value) => formatDateTime(value),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      render: (_, row) => <Button size="small" onClick={() => onStartEdit(row)}>Cập nhật</Button>,
    },
  ];

  const selectedProgram = selectedProgramId ? programMap[selectedProgramId] : null;

  if (loading) {
    return <LoadingScreen message="Đang tải danh sách đăng ký..." />;
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PageTitle title="Duyệt đăng ký hiến máu" description="Xử lý trạng thái đơn đăng ký hiến máu trong đợt hiến máu hiện tại" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}><Card className="surface-card admin-stat-card"><Statistic title="Tổng đơn" value={stats.total} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="surface-card admin-stat-card"><Statistic title="Tỷ lệ thành công" value={stats.successRate} suffix="%" /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="surface-card admin-stat-card"><Statistic title="Tỷ lệ từ chối" value={stats.rejectedRate} suffix="%" /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="surface-card admin-stat-card"><Statistic title="Tỷ lệ hủy" value={stats.cancelledRate} suffix="%" /></Card></Col>
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
                label: `${item.name} - ${formatDateTime(item.date)}`,
              }))}
            />
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 180 }}
              options={[
                { value: 'createdAt', label: 'Mới nhất' },
                { value: 'name', label: 'Họ tên (A-Z)' },
                { value: 'result', label: 'Kết quả' },
              ]}
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
            message={`Đang hiển thị danh sách đăng ký của sự kiện: ${selectedProgram.name} (${formatDateTime(selectedProgram.date)})`}
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

      <Modal open={Boolean(editingId)} title="Cập nhật trạng thái đơn" onCancel={() => setEditingId('')} onOk={onSave} okText="Lưu trạng thái" cancelText="Hủy" okButtonProps={{ loading: saving, disabled: saving || isCancelled(currentRow?.status, currentRow?.result) }} cancelButtonProps={{ disabled: saving }}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {isCancelled(currentRow?.status, currentRow?.result) && (
            <Alert type="warning" showIcon message="Đơn này đã bị hủy và không thể chỉnh sửa." style={{ marginBottom: 8 }} />
          )}
          <div style={{ fontWeight: 600 }}>Thông tin đăng ký</div>
          <div><strong>Người đăng ký:</strong> {currentRow?.name || '-'}</div>
          <div><strong>MSSV:</strong> {currentRow?.studentId || '-'}</div>
          <div><strong>Số điện thoại:</strong> {currentRow?.phone || '-'}</div>
          <div><strong>Email:</strong> {currentRow?.email || '-'}</div>
          <div><strong>CCCD:</strong> {currentRow?.CCCD || '-'}</div>
          <div><strong>Nhóm máu:</strong> {currentRow?.bloodGroup || '-'}</div>
          <div><strong>Địa chỉ:</strong> {currentRow?.address || '-'}</div>
          <div><strong>Ngày hiến trước:</strong> {currentRow?.lastDateDonate ? formatDate(currentRow.lastDateDonate) : '-'}</div>
          <div><strong>Chương trình:</strong> {programMap[currentRow?.bloodProgramId]?.name || currentRow?.bloodProgramId || '-'}</div>
          <div><strong>Ngày xác nhận:</strong> {currentRow?.updatedAt ? formatDateTime(currentRow.updatedAt) : '-'}</div>
          <div><strong>Kết quả:</strong> {getResultDisplay(currentRow?.result, currentRow?.status).label}</div>
          <div><strong>Lý do:</strong> {renderBlankIfNullText(currentRow?.reason)}</div>
          <div><strong>Ghi chú:</strong> {currentRow?.note || '-'}</div>
          <div><strong>Ngày tạo:</strong> {currentRow?.createdAt ? formatDateTime(currentRow.createdAt) : '-'}</div>

          <Form layout="vertical">
            {payload.note && (
              <Form.Item label="Ghi chú từ người đăng ký">
                <Input.TextArea value={payload.note} readOnly rows={3} />
              </Form.Item>
            )}
            <Form.Item label="Trạng thái">
              <Select 
                value={payload.status} 
                disabled={isCancelled(currentRow?.status, currentRow?.result)}
                onChange={(value) => {
                  const newPayload = { ...payload, status: value };
                  if (value === 'rejected') {
                    newPayload.result = 'rejected';
                  }
                  setPayload(newPayload);
                }} 
                options={[
                  { value: 'pending', label: 'Chờ duyệt' },
                  { value: 'approved', label: 'Được phê duyệt' },
                  { value: 'rejected', label: 'Bị từ chối' }
                ]} 
              />
            </Form.Item>
            <Form.Item label="Kết quả đơn">
              <Select 
                value={payload.result} 
                disabled={isCancelled(currentRow?.status, currentRow?.result)}
                onChange={(value) => {
                  const newPayload = { ...payload, result: value };
                  if (value === 'rejected') {
                    newPayload.status = 'rejected';
                  }
                  setPayload(newPayload);
                }} 
                options={[
                  { value: 'pending', label: 'Chờ duyệt' },
                  { value: 'approved', label: 'Được phê duyệt' },
                  { value: 'rejected', label: 'Bị từ chối' }
                ]} 
              />
            </Form.Item>
            <Form.Item label="Lý do (nếu có)">
              <Input value={payload.reason} onChange={(event) => setPayload((prev) => ({ ...prev, reason: event.target.value }))} placeholder="Nhập lý do" />
            </Form.Item>
          </Form>
        </Space>
      </Modal>

      {notice ? <Alert type="success" showIcon message={notice} /> : null}
      {error ? <Alert type="error" showIcon message={error} /> : null}
    </div>
  );
}
