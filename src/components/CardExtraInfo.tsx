import { Popover } from "antd-mobile";
import { InformationCircleOutline } from "antd-mobile-icons";
import { useSettingsStore } from "../store";

export type CardExtraInfoProps = {
  content: React.ReactNode;
};

// 用于显示在卡片右上角的额外信息
export function CardExtraInfo({ content }: CardExtraInfoProps) {
  const theme = useSettingsStore((state) => state.theme);

  return (
    <Popover
      content={content}
      placement="left"
      trigger="click"
      // 需要手动切换主题
      mode={theme}
    >
      <InformationCircleOutline fontSize={24} />
    </Popover>
  );
}
