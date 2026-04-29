import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

const { Paragraph, Title } = Typography;

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = location.state?.from || '/';

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      const role = String(user?.role || '').toLowerCase();
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'member') {
        navigate('/member/dashboard', { replace: true });
      } else {
        navigate(nextPath, { replace: true });
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <Card className="surface-card">
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0, color: "#7f1d1d" }}>
            Đăng nhập hệ thống
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 8 }}>
            Sử dụng tài khoản được backend cấp để truy cập phần member/admin.
          </Paragraph>
          <Form layout="vertical" onSubmitCapture={onSubmit}>
            <Form.Item label="Tên đăng nhập" required>
              <Input value={username} onChange={(event) => setUsername(event.target.value)} />
            </Form.Item>
            <Form.Item label="Mật khẩu" required>
              <Input.Password value={password} onChange={(event) => setPassword(event.target.value)} />
            </Form.Item>
            <Button loading={loading} type="primary" htmlType="submit" block size="large">
              Đăng nhập
            </Button>
          </Form>
          {error ? <Alert showIcon type="error" message={error} /> : null}
        </Space>
      </Card>
    </div>
  );
}
