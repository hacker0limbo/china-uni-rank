import { ProgressCircle, Space } from "antd-mobile";

export type ScoreProps = {
  score?: number | string;
  title: string;
  size?: number;
  color?: string;
};
// qs 得分环形图

export function Score({ score, title, size = 60, color = "var(--adm-color-yellow)" }: ScoreProps) {
  const percent =
    typeof score === "number" ? Math.min(score, 100) : Math.min(Number(score?.replace(/,/g, "")) || 0, 100);

  return (
    <Space direction="vertical" align="center">
      <ProgressCircle style={{ "--size": `${size}px`, "--fill-color": color }} percent={percent}>
        {score || "n/a"}
      </ProgressCircle>
      {title}
    </Space>
  );
}
