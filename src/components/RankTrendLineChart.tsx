import ReactECharts from "echarts-for-react";
import { useSettingsStore } from "../store";
import { getChartOption, getColorFromADM, parseRank } from "../utils";

export type RankTrendLineChartProps = {
  years?: number[] | string[];
  values?: number[] | string[];
  highlightYear?: string | number;
};

export function RankTrendLineChart({
  years = [],
  values = [],
  // 默认为今年
  highlightYear = new Date().getFullYear()?.toString(),
}: RankTrendLineChartProps) {
  const theme = useSettingsStore((state) => state.theme);
  // 如果高亮的年份大于最后一个年份, 则高亮最后一个年份
  const displayedYear =
    Number(highlightYear) > Number(years[years.length - 1]) ? years[years.length - 1] : highlightYear;

  return (
    <ReactECharts
      style={{ height: 200 }}
      theme={theme === "dark" ? "dark" : "default"}
      option={getChartOption({
        xAxis: {
          type: "category",
          data: years,
        },
        yAxis: {
          type: "value",
          // 排名小的在上面, 反转一下
          inverse: true,
          scale: true,
        },
        series: [
          {
            data: values?.map((v, i) => {
              const isMatchedYear = years[i]?.toString() === displayedYear?.toString();
              return {
                value: parseRank(v),
                itemStyle: isMatchedYear ? { color: getColorFromADM("--adm-color-danger") } : undefined,
                symbolSize: isMatchedYear ? 8 : 4,
              };
            }),
            type: "line",
          },
        ],
      })}
    />
  );
}
