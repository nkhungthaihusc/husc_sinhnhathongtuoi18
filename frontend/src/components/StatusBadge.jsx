import { Tag } from "antd";

export default function StatusBadge({ tone = "pending", children }) {
  const colorMap = {
    ok: "success",
    danger: "error",
    warn: "warning",
    pending: "default",
  };
  return <Tag color={colorMap[tone] || "default"}>{children}</Tag>;
}
