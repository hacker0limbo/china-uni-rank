import { List, Space, Image, Tag } from "antd-mobile";
import { ARWU_BASE_URL, type UniversityARWU } from "../api";
import { EnvironmentOutline, FireFill } from "antd-mobile-icons";
import { useUniversityStore } from "../store";
import { useLocation } from "wouter";

export type UnivListItemProps = {
  univ: UniversityARWU;
};

// 再 universities 和 favorites 页面都会用到
export function UnivListItem({ univ }: UnivListItemProps) {
  const categoryData = useUniversityStore((state) => state.categoryData);
  const navigate = useLocation()[1];

  return (
    <List.Item
      prefix={<Image lazy src={`${ARWU_BASE_URL}/_uni/${univ.logo}`} fit="cover" width={40} height={40} />}
      extra={
        <Space style={{ "--gap-horizontal": "4px" }}>
          <EnvironmentOutline />
          {univ.provinceShort}
        </Space>
      }
      title={
        <Space style={{ color: "var(--adm-color-danger)", "--gap-horizontal": "2px" }}>
          <FireFill />
          {univ.rankBcur}
        </Space>
      }
      clickable
      description={
        <Space>
          {univ?.charCode?.map((c) => (
            <Tag color="primary" fill="outline" key={c} round>
              {categoryData?.univLevels?.find((level) => level.code === c)?.name}
            </Tag>
          ))}
        </Space>
      }
      onClick={() => {
        navigate(`/universities/${univ.up}`);
      }}
    >
      {univ.nameCn}
    </List.Item>
  );
}
