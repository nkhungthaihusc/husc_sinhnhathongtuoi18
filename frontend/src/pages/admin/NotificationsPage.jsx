import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Space,
  Statistic,
  Table,
  Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import PageTitle from '../../components/PageTitle.jsx';
import { notificationsApi } from '../../services/api.js';
import { formatDateTime, getId } from '../../utils/format.js';

const { Text } = Typography;

const initialForm = { title: '', content: '', url: '' };

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState('');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await notificationsApi.getAll();
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        await load();
      } catch {
        if (mounted) setError('Không tải được thông báo');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((item) => `${item.title || ''} ${item.content || ''}`.toLowerCase().includes(q));
  }, [rows, search]);

  if (loading) {
    return <LoadingScreen message="Đang tải danh sách thông báo..." />;
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditId('');
    setForm(initialForm);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      if (editId) {
        await notificationsApi.update(editId, form);
        setNotice('Cập nhật thông báo thành công.');
      } else {
        await notificationsApi.create(form);
        setNotice('Tạo thông báo thành công.');
      }
      await load();
      resetForm();
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể lưu thông báo');
    }
  };

  const onEdit = (item) => {
    setEditId(getId(item));
    setForm({ title: item.title || '', content: item.content || '', url: item.url || '' });
  };

  const onDelete = async (id) => {
    setError('');
    setNotice('');
    try {
      await notificationsApi.remove(id);
      await load();
      setNotice('Đã xóa thông báo.');
      if (editId === id) resetForm();
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể xóa thông báo');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (value) => <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 2, expandable: false }}>{value}</Typography.Paragraph>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      responsive: ['md'],
      render: (value) => formatDateTime(value),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => onEdit(row)}>Sửa</Button>
          <Popconfirm title="Xóa thông báo" description="Bạn chắc chắn muốn xóa thông báo này?" okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => onDelete(getId(row))}>
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PageTitle title="Quản lý thông báo" description="Quản lý thông báo, hoạt động của CLB" />

      <Card className="surface-card admin-stat-card">
        <Statistic title="Tổng thông báo" value={rows.length} />
      </Card>

      <Card className="surface-card" title={editId ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}>
        <Form layout="vertical" onSubmitCapture={onSubmit}>
          <Form.Item label="Tiêu đề" required><Input name="title" value={form.title} onChange={onChange} /></Form.Item>
          <Form.Item label="Nội dung" required><Input.TextArea rows={4} name="content" value={form.content} onChange={onChange} /></Form.Item>
          <Form.Item label="Liên kết đính kèm (tùy chọn)"><Input name="url" value={form.url} onChange={onChange} placeholder="https://..." /></Form.Item>
          <Space wrap>
            <Button type="primary" htmlType="submit">{editId ? 'Lưu cập nhật' : 'Tạo thông báo'}</Button>
            {editId ? <Button onClick={resetForm}>Hủy sửa</Button> : null}
          </Space>
        </Form>
      </Card>

      <Card className="surface-card" title="Danh sách thông báo" extra={<Input.Search allowClear value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tiêu đề hoặc nội dung" style={{ width: 280 }} />}>
        <Table rowKey={getId} columns={columns} dataSource={filteredRows} pagination={{ pageSize: 8, showSizeChanger: false }} scroll={{ x: 900 }} />
      </Card>

      {notice ? <Alert type="success" showIcon message={notice} /> : null}
      {error ? <Alert type="error" showIcon message={error} /> : null}
    </div>
  );
}
