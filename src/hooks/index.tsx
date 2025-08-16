import { useMemo } from "react";
import { useSettingsStore } from "../store";
import { themes } from "@visactor/vtable";

export function useTableTheme() {
  const theme = useSettingsStore((state) => state.theme);
  const tableTheme = useMemo(() => (theme === "dark" ? themes.DARK : themes.DEFAULT), [theme]);
  return tableTheme;
}
