import { Button, Card, Col, Empty, Input, Modal, Pagination, Row, Space, Spin, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle.jsx";
import { programsApi } from "../../services/api.js";
import { formatDate, formatTime, getId, isProgramRegistrationOpen } from "../../utils/format.js";

const { Paragraph, Text, Title } = Typography;
const PROGRAMS_PER_PAGE = 9;

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PROGRAMS_PER_PAGE, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const focusId = params.get("focusProgramId");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const keyword = search.trim();
        const response = keyword
          ? await programsApi.searchPaginated(keyword, { page, limit: PROGRAMS_PER_PAGE })
          : await programsApi.getAllPaginated({ page, limit: PROGRAMS_PER_PAGE });

        let items = Array.isArray(response?.data) ? response.data : [];
        // --- BẮT ĐẦU LOGIC SẮP XẾP ---
      const now = new Date().getTime();
      items = items.sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        
        // Tính toán khoảng cách tuyệt đối đến thời điểm hiện tại
        const diffA = Math.abs(timeA - now);
        const diffB = Math.abs(timeB - now);
        
        return diffA - diffB; // Khoảng cách nhỏ nhất (gần nhất) lên đầu
      });
      console.log("Danh sách chương trình sau khi sắp xếp:", items);
        setPrograms(items);
        setPagination(
          response?.pagination || {
            page,
            limit: PROGRAMS_PER_PAGE,
            totalItems: items.length,
            totalPages: 1,
          },
        );
      } catch (e) {
        setPrograms([]);
        setPagination({ page: 1, limit: PROGRAMS_PER_PAGE, totalItems: 0, totalPages: 1 });
        setError(e?.response?.data?.message || "Không tải được danh sách chương trình");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search]);

  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems || 0;
  const isEmpty = !loading && programs.length === 0;

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <PageTitle title="Chương trình hiến máu" description="Danh sách toàn bộ chương trình hiến máu" />

      <Card className="surface-card">
        <Space style={{ width: "100%" }} wrap>
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên chương trình hoặc địa điểm"
            style={{ minWidth: 280, flex: 1 }}
          />
          <Button type="primary" onClick={() => navigate("/register")}>
            Đăng ký hiến máu
          </Button>
        </Space>
      </Card>

      {error ? (
        <Card className="surface-card">
          <Text type="danger">{error}</Text>
        </Card>
      ) : null}

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {programs.map((program) => {
            const canRegister = isProgramRegistrationOpen(program);
            return (
              <Col xs={24} md={12} xl={8} key={getId(program)} className="program-card-col">
                <Card
                  hoverable
                  className="surface-card program-card-equal"
                  onClick={() => setSelectedProgram(program)}
                  style={{
                    cursor: "pointer",
                    ...(focusId && focusId === getId(program) ? { borderColor: "#b91c1c" } : {}),
                  }}
                  cover={
                    <img
                      src={program.image || "/images/program_banner_2.webp"}
                      alt={program.name}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                  }
                  actions={canRegister ? [
                    <Link
                      className="home-program-action-link"
                      key="register"
                      to={`/register?programId=${getId(program)}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      Đăng ký ngay
                    </Link>,
                  ] : undefined}
                >
                  <Space direction="vertical" size={8} className="program-card-content">
                    <Space wrap>
                      <Tag color="red">{formatDate(program.date)} - {formatTime(program.date)}</Tag>
                      <Tag>{program.count ?? "-"} người dự kiến</Tag>
                      <Tag color={canRegister ? "green" : "volcano"}>
                        {canRegister ? "Còn hạn đăng ký" : "Hết hạn đăng ký"}
                      </Tag>
                    </Space>
                    <Title level={5} style={{ margin: 0, color: "#7f1d1d" }}>
                      {program.name}
                    </Title>
                    <Text type="secondary">Địa điểm: {program.location || "-"}</Text>
                    <Text type="secondary">
                      Hạn đăng ký: {program.registrationDeadline ? formatDate(program.registrationDeadline, true) : "Không giới hạn"}
                    </Text>
                  </Space>
                </Card>
              </Col>
            );
          })}
          {isEmpty ? (
            <Col span={24}>
              <Card className="surface-card">
                <Empty description={search.trim() ? "Không tìm thấy chương trình." : "Chưa có chương trình."} />
              </Card>
            </Col>
          ) : null}
        </Row>

        {totalItems > PROGRAMS_PER_PAGE ? (
          <Card className="surface-card">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Pagination
                align="center"
                current={page}
                pageSize={PROGRAMS_PER_PAGE}
                total={totalItems}
                showSizeChanger={false}
                onChange={setPage}
              />
              <Text type="secondary" style={{ textAlign: "center", display: "block" }}>
                Trang {page}/{totalPages} · {totalItems} chương trình
              </Text>
            </Space>
          </Card>
        ) : null}
      </Spin>

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
              <Text type="secondary">Ngày: {formatDate(selectedProgram.date)}</Text>
              <Text type="secondary">Số lượng dự kiến: {selectedProgram.count ?? "-"}</Text>
              <Text type="secondary">Địa điểm: {selectedProgram.location || "-"}</Text>
              <Tag color={isProgramRegistrationOpen(selectedProgram) ? "green" : "volcano"}>
                {isProgramRegistrationOpen(selectedProgram) ? "Còn hạn đăng ký" : "Hết hạn đăng ký"}
              </Tag>
              <Text type="secondary">
                Hạn đăng ký: {selectedProgram.registrationDeadline ? formatDate(selectedProgram.registrationDeadline, true) : "Không giới hạn"}
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

