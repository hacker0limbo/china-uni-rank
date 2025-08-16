import { AutoCenter } from "antd-mobile";
import { FireFill } from "antd-mobile-icons";
import React from "react";

export type RankLogoProps = {
  color?: string;
  rankInfo?: React.ReactNode;
};

export function RankLogo({ color, rankInfo }: RankLogoProps) {
  return (
    <AutoCenter>
      <div style={{ color, fontSize: 30, margin: "10px 0" }}>
        <FireFill /> {rankInfo ?? "暂无排名"}
      </div>
    </AutoCenter>
  );
}
