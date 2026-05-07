import { ArrowUpOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Progress, Row, Space, Statistic, Table, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import PageTitle from '../../components/PageTitle.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { programsApi, registersApi, studentsApi } from '../../services/api.js';
import { formatDateTime, getId, mapRegisterStatus, getStatusDisplay, getResultDisplay, isCancelled } from '../../utils/format.js';


const { Text } = Typography;

export default function AdminDashboardPage() {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [programTotal, setProgramTotal] = useState(0);
  const [registers, setRegisters] = useState([]);
  const [registerStats, setRegisterStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [studentData, programData, registerData] = await Promise.all([
          studentsApi.getAll(),
          programsApi.getAllPaginated({ page: 1, limit: 100 }),
          registersApi.getAll(),
        ]);
        if (!mounted) return;
        setStudents(Array.isArray(studentData) ? studentData : []);
        const programList = Array.isArray(programData?.data) ? programData.data : [];
        setPrograms(programList);
        setProgramTotal(programData?.pagination?.totalItems || 0);
        setRegisters(Array.isArray(registerData["bloodRegisters"]) ? registerData["bloodRegisters"] : []);
        setRegisterStats({
          total: registerData?.total || 0,
          approved: registerData?.approved || 0,
          rejected: registerData?.rejected || 0,
          cancelled: registerData?.cancelled || 0,
          pending: registerData?.pending || 0
        });
      } catch {
        if (mounted) {
          setStudents([]);
          setPrograms([]);
          setProgramTotal(0);
          setRegisters([]);
          setRegisterStats({ total: 0, approved: 0, rejected: 0, cancelled: 0, pending: 0 });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const approvedRate = useMemo(() => {
    if (registerStats.total === 0) return 0;
    return Math.round((registerStats.approved / registerStats.total) * 100);
  }, [registerStats]);

  const latestRegisters = useMemo(
    () => {
      // Create program map for easy lookup
      const programMap = programs.reduce((acc, program) => {
        acc[getId(program)] = program;
        return acc;
      }, {});

      return [...registers]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 6)
        .map((item) => {
          const program = programMap[item.bloodProgramId];
          return {
            ...item,
            key: getId(item),
            bloodProgramName: program?.name || '-',
            bloodProgramDate: program?.date || null,
          };
        });
    },
    [registers, programs],
  );

  if (loading) {
    return <LoadingScreen message="Đang tải tổng quan quản trị..." />;
  }

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
      title: 'Tên chương trình',
      key: 'bloodProgramName',
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{row.bloodProgramName || '-'}</Text>
          {row.bloodProgramDate && (
            <Text type="secondary">{formatDateTime(row.bloodProgramDate)}</Text>
          )}
        </Space>
      ),
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
        return <Text>{status.label}</Text>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value) => formatDateTime(value),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PageTitle title="Bảng điều khiển quản trị" description="Tổng hợp dữ liệu toàn hệ thống hiến máu." />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="surface-card admin-stat-card">
            <Statistic title="Thành viên" value={students.length} prefix={<TeamOutlined />} />
            <Text type="secondary">Tổng số tài khoản thành viên trong hệ thống.</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="surface-card admin-stat-card">
            <Statistic title="Chương trình" value={programTotal} />
            <Text type="secondary">Số chương trình hiến máu đã tạo.</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="surface-card admin-stat-card">
            <Statistic title="Đăng ký" value={registerStats.total} />
            <Text type="secondary">Tổng đơn đăng ký đang được quản lý.</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="surface-card admin-stat-card">
            <Statistic title="Tỷ lệ duyệt" value={approvedRate} suffix="%" prefix={<ArrowUpOutlined />} />
            <Progress percent={approvedRate} strokeColor="#c1121f" trailColor="#fee2e2" style={{ marginTop: 10 }} />
          </Card>
        </Col>
      </Row>

      <Card className="surface-card" title="Đăng ký gần đây" extra={<Text type="secondary">{latestRegisters.length} bản ghi mới nhất</Text>}>
        <Table
          columns={columns}
          dataSource={latestRegisters}
          pagination={false}
          locale={{ emptyText: <Empty description="Chưa có dữ liệu đăng ký" /> }}
          scroll={{ x: 720 }}
        />
      </Card>
    </div>
  );
}
