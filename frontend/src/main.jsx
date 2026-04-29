import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import viVN from "antd/locale/vi_VN";
import App from "./app/App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "antd/dist/reset.css";
import "./index.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#b91c1c",
          colorInfo: "#b91c1c",
          colorSuccess: "#15803d",
          colorWarning: "#d97706",
          colorError: "#dc2626",
          colorBgBase: "#fffefe",
          colorTextBase: "#0f172a",
          borderRadius: 14,
          fontSize: 14
        },
        components: {
          Card: {
            borderRadiusLG: 18
          },
          Layout: {
            bodyBg: "#fff7f7",
            headerBg: "#ffffff",
            siderBg: "#ffffff"
          },
          Button: {
            primaryShadow: "none",
            borderRadius: 12
          }
        }
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>
);
