import { Card, Space, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function PageTitle({ title, description, actions }) {
  return (
    <Card className="hero-card surface-card" bodyStyle={{ padding: 24 }}>
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Space
          align="start"
          style={{ width: "100%", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
        >
          <div>
            <Title level={2} style={{ margin: 0, color: "#7f1d1d", letterSpacing: "-0.02em" }}>
              {title}
            </Title>
            {description ? (
              <Paragraph style={{ marginTop: 10, marginBottom: 0, color: "#334155", maxWidth: 760 }}>
                {description}
              </Paragraph>
            ) : null}
          </div>
          {actions ? <Space wrap>{actions}</Space> : null}
        </Space>
      </Space>
    </Card>
  );
}
