import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import PageTitle from "../../components/PageTitle.jsx";
import { programsApi } from "../../services/api.js";
import { formatDate, formatDateTime, getId } from "../../utils/format.js";

const { Text } = Typography;

const initialForm = {
  name: "",
  description: "",
  date: "",
  registrationDeadline: "",
  location: "",
  image: "",
  count: 0,
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [programTotal, setProgramTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const data = await programsApi.getAllPaginated({ page: 1, limit: 100 });
    setPrograms(Array.isArray(data?.data) ? data.data : []);
    setProgramTotal(data?.pagination?.totalItems || 0);
  };

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        await load();
      } catch {
        if (mounted) setError("Không tải được danh sách chương trình");
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return programs.filter((item) =>
      `${item.name} ${item.location}`.toLowerCase().includes(keyword),
    );
  }, [programs, search]);

  const upcomingCount = useMemo(
    () =>
      programs.filter(
        (item) => new Date(item.date || 0).getTime() >= Date.now(),
      ).length,
    [programs],
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditId("");
    setForm(initialForm);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setNotice("");
    setError("");
    try {
      if (editId) {
        await programsApi.update(editId, {
          ...form,
          date: form.date ? new Date(form.date).toISOString() : null,
          registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline).toISOString() : null,
          count: Number(form.count) || 0,
        });
        setNotice("Cập nhật chương trình thành công.");
      } else {
        await programsApi.create({
          ...form,
          date: form.date ? new Date(form.date).toISOString() : null,
          registrationDeadline: form.registrationDeadline
            ? new Date(form.registrationDeadline).toISOString()
            : null,
          count: Number(form.count) || 0,
        });
        setNotice("Tạo chương trình thành công.");
      }
      await load();
      resetForm();
    } catch (e) {
      setError(e?.response?.data?.message || "Lưu chương trình thất bại");
    }
  };

  const onEdit = (program) => {
    setEditId(getId(program));
    setForm({
      name: program.name || "",
      description: program.description || "",
      date: program.date || "",
      registrationDeadline: program.registrationDeadline || "",
      location: program.location || "",
      image: program.image || "",
      count: program.count || 0,
    });
  };

  const onDelete = async (id) => {
    setNotice("");
    setError("");
    try {
      await programsApi.remove(id);
      await load();
      setNotice("Đã xóa chương trình.");
      if (editId === id) resetForm();
    } catch (e) {
      setError(e?.response?.data?.message || "Xóa chương trình thất bại");
    }
  };

  const columns = [
    {
      title: "Chương trình",
      key: "name",
      render: (_, row) => (
        <Space size={10} align="start">
          {row.image ? (
            <Image
              src={row.image}
              alt={row.name}
              width={72}
              height={50}
              style={{ objectFit: "cover", borderRadius: 10 }}
              fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='50'%3E%3Crect width='72' height='50' fill='%23fee2e2'/%3E%3C/svg%3E"
              preview={false}
            />
          ) : null}
          <Space direction="vertical" size={0}>
            <Text strong>{row.name}</Text>
            <Text type="secondary">{row.location}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Ngày diễn ra",
      dataIndex: "date",
      key: "date",
      width: 140,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Hạn đăng ký",
      dataIndex: "registrationDeadline",
      key: "registrationDeadline",
      width: 160,
      render: (value) => (value ? formatDateTime(value) : "-"),
    },
    {
      title: "Số lượng",
      dataIndex: "count",
      key: "count",
      width: 100,
      render: (value) => <Tag color="red">{value ?? 0}</Tag>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      responsive: ["lg"],
      render: (value) => value || "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 170,
      render: (_, row) => (
        <Space wrap>
          <Button size="small" onClick={() => onEdit(row)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa chương trình"
            description="Bạn chắc chắn muốn xóa chương trình này?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(getId(row))}
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageTitle
        title="Quản lý chương trình"
        description="Quản lý các chương trình hiến máu của CLB"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card className="surface-card admin-stat-card">
            <Statistic title="Tổng chương trình" value={programTotal} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="surface-card admin-stat-card">
            <Statistic title="Sắp diễn ra" value={upcomingCount} />
          </Card>
        </Col>
      </Row>

      <Card
        className="surface-card"
        title={editId ? "Chỉnh sửa chương trình" : "Tạo chương trình mới"}
      >
        <Form layout="vertical" onSubmitCapture={onSubmit}>
          <Row gutter={12}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item label="Tên chương trình" required>
                <Input name="name" value={form.name} onChange={onChange} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item label="Ngày tổ chức" required>
                <DatePicker
                  style={{ width: '100%' }}
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                  value={form.date ? dayjs(form.date) : null}
                  onChange={(date) => setForm((prev) => ({ ...prev, date: date ? date.toISOString() : '' }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item label="Địa điểm">
                <Input
                  name="location"
                  value={form.location}
                  onChange={onChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item label="Hạn đăng ký">
                <DatePicker
                  style={{ width: '100%' }}
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                  value={form.registrationDeadline ? dayjs(form.registrationDeadline) : null}
                  onChange={(date) => setForm((prev) => ({ ...prev, registrationDeadline: date ? date.toISOString() : '' }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item label="Số lượng dự kiến">
                <InputNumber
                  min={0}
                  value={Number(form.count) || 0}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, count: value || 0 }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={16}>
              <Form.Item label="URL hình ảnh">
                <Input
                  name="image"
                  value={form.image}
                  onChange={onChange}
                  placeholder="https://..."
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Mô tả">
                <Input.TextArea
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={onChange}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Space wrap>
                <Button type="primary" htmlType="submit">
                  {editId ? "Cập nhật chương trình" : "Tạo chương trình"}
                </Button>
                {editId ? <Button onClick={resetForm}>Hủy sửa</Button> : null}
              </Space>
            </Col>
          </Row>
        </Form>
        <Space direction="vertical" size={8} style={{ width: "100%", marginTop: 12 }}>
          {notice ? <Alert type="success" showIcon message={notice} /> : null}
          {error ? <Alert type="error" showIcon message={error} /> : null}
        </Space>
      </Card>

      <Card className="surface-card" title="Danh sách chương trình">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Input.Search
            allowClear
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên hoặc địa điểm"
          />
          <Table
            rowKey={getId}
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 900 }}
          />
        </Space>
      </Card>
    </div>
  );
}
