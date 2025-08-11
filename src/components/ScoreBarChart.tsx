import ReactECharts from "echarts-for-react";
import { useSettingsStore } from "../store";
import { getChartOption, parseScore } from "../utils";

export type ScoreBarChartProps = {
  categories?: (string | number)[];
  values?: (number | null | undefined | string)[];
  color?: string;
  height?: number;
};

// 展示得分的柱状图
export function ScoreBarChart({ categories, values, color, height = 200 }: ScoreBarChartProps) {
  const theme = useSettingsStore((state) => state.theme);

  return (
    <ReactECharts
      style={{ height }}
      theme={theme === "dark" ? "dark" : "default"}
      option={getChartOption({
        xAxis: {
          type: "value",
          min: 0,
          max: 100,
        },
        yAxis: {
          inverse: true,
          type: "category",
          data: categories,
        },
        series: [
          {
            data: values?.map((v) => parseScore(v)),
            type: "bar",
            itemStyle: {
              color,
            },
          },
        ],
      })}
    />
  );
}
