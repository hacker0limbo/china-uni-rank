import { List, Space, Image, Tag } from "antd-mobile";
import { ARWU_BASE_URL, type HMTUniversityARWU } from "../api";
import { EnvironmentOutline, FireFill } from "antd-mobile-icons";
import { useLocation } from "wouter";
import { getCnNameFromTranslation } from "../utils";

export type HMTUnivListItemProps = {
  univ: HMTUniversityARWU;
};

// 港澳台高校的列表项组件
export function HMTUnivListItem({ univ }: HMTUnivListItemProps) {
  const navigate = useLocation()[1];

  return (
    <List.Item
      prefix={<Image lazy src={`${ARWU_BASE_URL}/_uni/${univ.univLogo}`} fit="cover" width={40} height={40} />}
      extra={
        <Space style={{ "--gap-horizontal": "4px" }}>
          <EnvironmentOutline />
          {univ.region}
        </Space>
      }
      title={
        <Space style={{ color: "var(--adm-color-danger)", "--gap-horizontal": "2px" }}>
          <FireFill />
          {univ.ranking || "暂无排名"}
        </Space>
      }
      clickable
      onClick={() => {
        navigate(`/hmt/universities/${univ.univUp}`);
      }}
    >
      {getCnNameFromTranslation(univ.nameEn)}
    </List.Item>
  );
}
