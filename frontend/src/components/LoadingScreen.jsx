import { Spin, Typography } from "antd";

export default function LoadingScreen({ message = "Đang tải dữ liệu..." }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-screen-card">
        <div className="loading-screen-orb" />
        <Spin size="large" />
        <Typography.Text className="loading-screen-text">{message}</Typography.Text>
      </div>
    </div>
  );
}