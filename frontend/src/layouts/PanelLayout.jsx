import {
  BellOutlined,
  CalendarOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  NotificationOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  Space,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

function iconByPath(path) {
  if (path.includes("/dashboard")) return <DashboardOutlined />;
  if (path.includes("/members")) return <TeamOutlined />;
  if (path.includes("/programs")) return <CalendarOutlined />;
  if (path.includes("/registrations")) return <BellOutlined />;
  if (path.includes("/notifications")) return <NotificationOutlined />;
  return <DashboardOutlined />;
}

export default function PanelLayout({ title, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);

  const menuItems = useMemo(
    () =>
      links.map((link) => ({
        key: link.to,
        icon: iconByPath(link.to),
        label: link.label,
      })),
    [links],
  );

  const selected = useMemo(() => {
    const exact = links.find((item) => location.pathname === item.to);
    return exact ? exact.to : links[0]?.to;
  }, [links, location.pathname]);

  const selectedLabel = useMemo(
    () => links.find((item) => item.to === selected)?.label || title,
    [links, selected, title],
  );

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const onMenuClick = ({ key }) => {
    setOpenDrawer(false);
    navigate(key);
  };

  const userMenuItems = [
    {
      key: "logout",
      label: "Đăng xuất",
      danger: true,
      icon: <LogoutOutlined />,
      onClick: onLogout,
    },
  ];

  return (
    <Layout className="app-shell">
      <Sider
        width={272}
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        className="desktop-sider"
        style={{
          borderRight: "1px solid #fecaca",
          background: "#ffffff",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div className="admin-sider-wrap">
          <Space direction="vertical" size={6} style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: "#b91c1c",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              PANEL
            </Text>
            <Title level={4} style={{ margin: 0, color: "#7f1d1d" }}>
              {title}
            </Title>
            <Space size={10} align="center">
              <Badge dot color="#ef4444">
                <Avatar
                  icon={<UserOutlined />}
                  style={{ background: "#fee2e2", color: "#991b1b" }}
                />
              </Badge>
              <Text type="secondary">{user?.username || user?.studentId}</Text>
            </Space>
          </Space>

          <Menu
            mode="inline"
            selectedKeys={[selected]}
            onClick={onMenuClick}
            items={menuItems}
            style={{ borderInlineEnd: "none" }}
          />

          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={onLogout}
            style={{ marginTop: 16, width: "100%" }}
          >
            Đăng xuất
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header className="admin-topbar">
          <Space align="center" size={12}>
            <Button
              className="mobile-menu-btn"
              icon={<MenuOutlined />}
              onClick={() => setOpenDrawer(true)}
            />
            <div>
              <Title level={5} style={{ margin: 0, color: "#7f1d1d" }}>
                {selectedLabel}
              </Title>
              <Breadcrumb
                items={[{ title: title }, { title: selectedLabel }]}
                style={{ marginTop: 4 }}
              />
            </div>
          </Space>

          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
            <Button type="text" style={{ height: 40 }}>
              <Space>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ background: "#fee2e2", color: "#991b1b" }}
                />
                <Text>{user?.username || user?.studentId}</Text>
              </Space>
            </Button>
          </Dropdown>
        </Header>

        <Content>
          <main className="app-content" style={{ maxWidth: 1400 }}>
            <Outlet />
          </main>
        </Content>
      </Layout>

      <Drawer
        title={title}
        placement="left"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          onClick={onMenuClick}
          items={menuItems}
        />
        <div style={{ padding: 16 }}>
          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={onLogout}
            style={{ width: "100%" }}
          >
            Đăng xuất
          </Button>
        </div>
      </Drawer>
    </Layout>
  );
}
