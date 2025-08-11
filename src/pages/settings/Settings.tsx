import { List } from "antd-mobile";
import { useLocation } from "wouter";
import { useSettingsStore } from "../../store";
import { Header } from "../../components";

export function Settings() {
  const navigate = useLocation()[1];
  const theme = useSettingsStore((state) => state.theme);

  return (
    <>
      <Header title="设置" showBack={false} />
      <List header="外观" mode="card">
        <List.Item
          clickable
          onClick={() => {
            navigate("/settings/theme");
          }}
          extra={theme === "dark" ? "深色" : "浅色"}
        >
          主题
        </List.Item>
      </List>
    </>
  );
}
