import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Row,
  Space,
  Statistic,
  Table,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle.jsx";
import { registersApi, programsApi } from "../../services/api.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import { formatDateTime, getId, mapRegisterStatus } from "../../utils/format.js";

const LOOKUP_PAGE_SIZE = 10;

export default function LookupPage() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: LOOKUP_PAGE_SIZE, totalItems: 0, totalPages: 1 });
  const [summary, setSummary] = useState({ TongSoLanHien: 0 });
  const [programs, setPrograms] = useState([]);

  const canCancelRegister = (row) => {
    const result = String(row?.result || '').toLowerCase();
    return !['cancelled', 'approved', 'rejected'].includes(result);
  };

  const getProgramName = (bloodProgramId) => {
    const program = programs.find(p => String(p._id || p.id) === String(bloodProgramId));
    return program?.name || "-";
  };

  const renderBlankIfNullText = (value) => {
    const text = String(value ?? "").trim();
    return !text || text.toLowerCase() === "null" ? " " : text;
  };

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const data = await programsApi.getAll();
        setPrograms(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Lỗi khi load danh sách chương trình:', e);
        setPrograms([]);
      }
    };

    loadPrograms();
  }, []);

  const refreshLookup = async (keyword, currentPage) => {
    const response = await registersApi.searchPaginated(keyword, {
      page: currentPage,
      limit: LOOKUP_PAGE_SIZE,
    });
    const data = response?.data || {};
    const listBloodRegisters = Array.isArray(data.listBloodRegisters) ? data.listBloodRegisters : [];
    console.log('Mảng đăng ký máu được gọi về:', listBloodRegisters);
    setRows(listBloodRegisters);
    setSummary({
      TongSoLanHien: Number(data.TongSoLanHien || 0),
    });
    setPagination(
      response?.pagination || {
        page: currentPage,
        limit: LOOKUP_PAGE_SIZE,
        totalItems: Array.isArray(data.listBloodRegisters) ? data.listBloodRegisters.length : 0,
        totalPages: 1,
      },
    );
  };

  useEffect(() => {
    const load = async () => {
      if (!activeQuery) {
        return;
      }

      setLoading(true);
      setError('');
      try {
        await refreshLookup(activeQuery, page);
      } catch (e) {
        setRows([]);
        setSummary({ TongSoLanHien: 0 });
        setPagination({ page: 1, limit: LOOKUP_PAGE_SIZE, totalItems: 0, totalPages: 1 });
        setError(e?.response?.data?.message || 'Không thể tra cứu. Hãy đăng nhập nếu API yêu cầu xác thực.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeQuery, page]);

  const onSearch = async (event) => {
    event.preventDefault();
    setNotice('');
    const keyword = query.trim();
    if (!keyword) {
      setRows([]);
      setSummary({ TongSoLanHien: 0 });
      setPagination({ page: 1, limit: LOOKUP_PAGE_SIZE, totalItems: 0, totalPages: 1 });
      setActiveQuery('');
      setError('Vui lòng nhập thông tin cần tìm kiếm');
      return;
    }

    setPage(1);
    setActiveQuery(keyword);
  };

  const onCancelRegister = async (row) => {
    const registerId = getId(row);
    if (!registerId) {
      return;
    }

    setCancelingId(registerId);
    setNotice('');
    setError('');
    try {
      await registersApi.cancel(registerId, { reason: cancelReason.trim() });
      await refreshLookup(activeQuery, page);
      setNotice('Hủy đăng ký thành công.');
      setCancelModalOpen(false);
      setCancelTarget(null);
      setCancelReason('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể hủy đăng ký. Vui lòng thử lại.');
    } finally {
      setCancelingId('');
    }
  };

  const onOpenCancelModal = (row) => {
    setCancelTarget(row);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const onOpenDetailModal = (row) => {
    setDetailTarget(row);
    setDetailOpen(true);
  };

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <PageTitle
        title="Tra cứu lịch sử hiến máu"
        description="Nhập CCCD, SĐT hoặc MSSV để truy vấn"
      />
      <Card className="surface-card">
        <Form layout="inline" onSubmitCapture={onSearch} style={{ width: "100%" }}>
          <Form.Item style={{ flex: 1, minWidth: 220 }}>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nhập CCCD / SĐT / MSSV"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tra cứu
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="surface-card stat-card"><Statistic title="Kết quả" value={pagination.totalItems || rows.length} /></Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="surface-card stat-card"><Statistic title="Đã hiến thành công" value={summary.TongSoLanHien} /></Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="surface-card stat-card"><Statistic title="Từ khóa" value={query || "-"} formatter={(value) => String(value)} /></Card>
        </Col>
      </Row>
      {notice ? <Alert type="success" showIcon message={notice} /> : null}
      {error ? <Alert type="error" showIcon message={error} /> : null}
      <Card className="surface-card">
        <Spin spinning={loading}>
          <Table
            rowKey={(row) => getId(row)}
            pagination={false}
            locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
            dataSource={rows}
            columns={[
              { title: "Người đăng ký", dataIndex: "name", render: (value) => value || "-" },
              { title: "MSSV", dataIndex: "studentId", render: (value) => value || "-" },
              {
                title: "Kết quả",
                dataIndex: "result",
                render: (result) => {
                  const mapped = mapRegisterStatus(result);
                  return <StatusBadge tone={mapped.tone}>{mapped.label}</StatusBadge>;
                },
              },
              { title: "Ngày đăng ký", dataIndex: "createdAt", render: (value) => formatDateTime(value) },
              {
                title: "Thao tác",
                key: "actions",
                width: 220,
                render: (_, row) => {
                  return (
                    <Space size={8}>
                      <Button size="small" onClick={() => onOpenDetailModal(row)}>
                        Chi tiết
                      </Button>
                      {canCancelRegister(row) ? (
                        <Button size="small" danger onClick={() => onOpenCancelModal(row)}>
                          Hủy
                        </Button>
                      ) : null}
                    </Space>
                  );
                },
              },
            ]}
          />
        </Spin>
        {pagination.totalItems > LOOKUP_PAGE_SIZE ? (
          <Space direction="vertical" size={12} style={{ width: "100%", marginTop: 16 }}>
            <Pagination
              align="center"
              current={page}
              pageSize={LOOKUP_PAGE_SIZE}
              total={pagination.totalItems}
              showSizeChanger={false}
              onChange={(nextPage) => setPage(nextPage)}
            />
            <div style={{ textAlign: "center", color: "#64748b" }}>
              Trang {page}/{pagination.totalPages || 1} · {pagination.totalItems} kết quả
            </div>
          </Space>
        ) : null}
      </Card>

      <Modal
        title="Xác nhận hủy đăng ký"
        open={cancelModalOpen}
        onCancel={() => {
          if (!cancelingId) {
            setCancelModalOpen(false);
            setCancelTarget(null);
            setCancelReason('');
          }
        }}
        onOk={() => onCancelRegister(cancelTarget)}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{
          danger: true,
          loading: Boolean(cancelingId),
          disabled: !cancelReason.trim(),
        }}
        cancelButtonProps={{ disabled: Boolean(cancelingId) }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div>Bạn chắc chắn muốn hủy đơn đăng ký này?</div>
          <Input.TextArea
            rows={4}
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Nhập lý do hủy (bắt buộc)"
            maxLength={300}
            showCount
          />
        </Space>
      </Modal>

      <Modal
        title="Chi tiết đăng ký"
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setDetailTarget(null);
        }}
        footer={[
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
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <div><strong>Người đăng ký:</strong> {detailTarget?.name || "-"}</div>
          <div><strong>MSSV:</strong> {detailTarget?.studentId || "-"}</div>
          <div><strong>Chương trình:</strong> {getProgramName(detailTarget?.bloodProgramId)}</div>
          <div><strong>Kết quả:</strong> {mapRegisterStatus(detailTarget?.result).label}</div>
          <div><strong>Ngày xác nhận:</strong> {detailTarget?.updatedAt ? formatDateTime(detailTarget.updatedAt) : "-"}</div>
          <div><strong>Lý do:</strong> {renderBlankIfNullText(detailTarget?.reason)}</div>
        </Space>
      </Modal>
    </Space>
  );
}
