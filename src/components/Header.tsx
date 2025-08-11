import { NavBar, Popover } from "antd-mobile";
import { AppOutline, EyeOutline, MoreOutline, RedoOutline } from "antd-mobile-icons";
import { useLocation } from "wouter";
import { useSettingsStore } from "../store";

export type HeaderProps = {
  title: React.ReactNode;
  showBack?: boolean;
};

// 基于 Navbar 实现统一的 Header 组件
export function Header({ title, showBack = true }: HeaderProps) {
  const navigate = useLocation()[1];
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <NavBar
      back={showBack ? "返回" : null}
      onBack={() => {
        history.back();
      }}
      style={{ backgroundColor: "var(--adm-color-background)" }}
      right={
        <Popover.Menu
          mode={theme}
          onAction={(action) => {
            if (action.key === "home") {
              navigate("/");
            } else if (action.key === "refresh") {
              window.location.reload();
            } else if (action.key === "theme") {
              setTheme(theme === "dark" ? "light" : "dark");
            }
          }}
          trigger="click"
          placement="bottom"
          actions={[
            {
              key: "home",
              text: "回到首页",
              icon: <AppOutline />,
            },
            {
              key: "refresh",
              text: "重新加载",
              icon: <RedoOutline />,
            },
            {
              key: "theme",
              text: theme === "dark" ? "浅色模式" : "深色模式",
              icon: <EyeOutline />,
            },
          ]}
        >
          <MoreOutline fontSize={24} />
        </Popover.Menu>
      }
    >
      {title}
    </NavBar>
  );
}
