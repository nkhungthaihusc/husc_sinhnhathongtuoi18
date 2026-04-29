import { FacebookFilled, MailOutlined, MenuOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Drawer, Layout, Menu, Space, Tooltip, Typography } from "antd";
import { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const FACEBOOK_CONTACT_URL = import.meta.env.VITE_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/sinhnhathongtuoi18";
const GMAIL_CONTACT_ADDRESS = import.meta.env.VITE_PUBLIC_GMAIL_ADDRESS || "hienmauclbdaihockhoahoc@gmail.com";
const PHONE_CONTACT_NUMBER = import.meta.env.VITE_PUBLIC_PHONE_NUMBER || "0962649883";
const BRAND_IMAGE_URL = import.meta.env.VITE_PUBLIC_BRAND_IMAGE_URL || "https://scontent.fdad1-3.fna.fbcdn.net/v/t1.15752-9/679992441_1302992675275148_2552346508518685248_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=110&ccb=1-7&_nc_sid=0024fc&_nc_ohc=t_fX8_ERm-gQ7kNvwGr3zlW&_nc_oc=Adoow6ye2Ebl9_JrNom_0V-JXnp4jnEePKXhuW7CfyO_Z_AMvmarKYzjIWMqB94fNfY&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fdad1-3.fna&_nc_ss=7a22e&oh=03_Q7cD5AErGXPqSPK7Zjt3zYaM-ISvSETAU_uJd0cJbdaQopDiGg&oe=6A1559A9";
const PHONE_CONTACT_URL = `tel:${PHONE_CONTACT_NUMBER}`;

export default function PublicLayout() {
  const { isAuthenticated, user } = useAuth();
  const [openNav, setOpenNav] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = String(user?.role || "").toLowerCase();

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith("/programs")) return "/programs";
    if (location.pathname.startsWith("/lookup")) return "/lookup";
    return "/";
  }, [location.pathname]);

  const menuItems = [
    { key: "/", label: "Trang chủ" },
    { key: "/programs", label: "Chương trình" },
    { key: "/lookup", label: "Tra cứu" },
  ];

  const onMenuClick = ({ key }) => {
    setOpenNav(false);
    navigate(key);
  };

  return (
    <Layout className="app-shell">
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid #fecaca",
          paddingInline: 16,
          height: 72,
          lineHeight: "72px",
        }}
      >
        <div className="public-header-wrap">
          <Link to="/" style={{ textDecoration: "none" }} className="public-header-brand">
            <span className="public-header-brand-logo-wrap" aria-hidden="true">
              {BRAND_IMAGE_URL ? (
                <img src={BRAND_IMAGE_URL} alt="Logo CLB" className="public-header-brand-logo" />
              ) : (
                <span className="public-header-brand-logo-fallback">HM</span>
              )}
            </span>
            <Title level={4} style={{ margin: 0, color: "#7f1d1d", letterSpacing: "-0.02em" }}>
              CLB Hiến Máu Khoa Học
            </Title>
          </Link>

          <div className="public-header-center desktop-menu-wrap">
            <div className="public-header-menu">
              <Menu
                mode="horizontal"
                selectedKeys={[selectedKey]}
                onClick={onMenuClick}
                items={menuItems}
                style={{ borderBottom: "none" }}
              />
            </div>
          </div>

          <Space size={10} className="public-header-actions">
            {isAuthenticated ? (
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() => navigate(role === "admin" ? "/admin/dashboard" : "/member/dashboard")}
              >
                Vào hệ thống
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate("/login")}>Đăng nhập</Button>
                <Button type="primary" onClick={() => navigate("/register")} className="desktop-register-btn">
                  Đăng ký hiến máu
                </Button>
              </>
            )}
            <Button
              className="mobile-menu-btn"
              icon={<MenuOutlined />}
              onClick={() => setOpenNav(true)}
            />
          </Space>
        </div>
      </Header>

      <Content>
        <main className="app-content">
          <Outlet />
        </main>
      </Content>

      <div className="public-contact-fab" aria-label="Liên hệ nhanh">
        <Tooltip title="Liên hệ Gmail" placement="left">
          <a
            className="public-contact-fab-btn public-contact-fab-gmail"
            href={`mailto:${GMAIL_CONTACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Liên hệ Gmail"
          >
            <MailOutlined />
            <span>Gmail</span>
          </a>
        </Tooltip>

        <Tooltip title="Liên hệ số điện thoại" placement="left">
          <a
            className="public-contact-fab-btn public-contact-fab-phone"
            href={PHONE_CONTACT_URL}
            aria-label="Liên hệ số điện thoại"
          >
            <PhoneOutlined />
            <span>Gọi</span>
          </a>
        </Tooltip>

        <Tooltip title="Liên hệ Facebook" placement="left">
          <a
            className="public-contact-fab-btn public-contact-fab-facebook"
            href={FACEBOOK_CONTACT_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Liên hệ Facebook"
          >
            <FacebookFilled />
            <span>FB</span>
          </a>
        </Tooltip>
      </div>

      <Footer style={{ borderTop: "1px solid #fecaca", background: "#fff", textAlign: "center" }}>
        <Text type="secondary">© {new Date().getFullYear()} CLB Hiến Máu Khoa Học</Text>
      </Footer>

      <Drawer
        title="Điều hướng"
        placement="right"
        onClose={() => setOpenNav(false)}
        open={openNav}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
          items={[
            ...menuItems,
            ...(isAuthenticated
              ? [{ key: role === "admin" ? "/admin/dashboard" : "/member/dashboard", label: "Vào hệ thống" }]
              : [
                  { key: "/login", label: "Đăng nhập" },
                  { key: "/register", label: "Đăng ký hiến máu" },
                ]),
          ]}
        />
      </Drawer>
    </Layout>
  );
}
