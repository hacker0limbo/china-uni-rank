import { CheckList } from "antd-mobile";
import { Header } from "../../components";
import { useSettingsStore, type SettingsStore } from "../../store";

export function ThemeSetting() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <>
      <Header title="主题" />
      <CheckList
        mode="card"
        value={[theme]}
        onChange={(newTheme) => {
          setTheme(newTheme[0] as SettingsStore["theme"]);
        }}
      >
        <CheckList.Item value="dark">深色</CheckList.Item>
        <CheckList.Item value="light">浅色</CheckList.Item>
      </CheckList>
    </>
  );
}
