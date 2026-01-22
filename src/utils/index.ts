import { type USNewsWorldRanking } from "../api";
import { isNil, merge } from "lodash-es";
import { type EChartsOption } from "echarts";
import { type ListTableConstructorOptions } from "@visactor/vtable";
import hmt from "../translations/hmt.json";

export const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

// 由于 USNews 排名接口不直观, 这里处理一下
export function formatUSNewsRank(ranks?: USNewsWorldRanking["ranks"]): string {
  if (ranks?.[0]?.is_ranked) {
    return ranks?.[0]?.is_tied ? "=" + ranks?.[0]?.value : ranks?.[0]?.value;
  }
  return "暂无排名";
}

/**
 * 给定一个排名, 返回数字或者 null/undefined
 * 如果中间存在 -, 则取平均, 例如 100-300 返回 200
 */
export function parseRank(rank: string | number | null | undefined): number | null | undefined {
  // 1. null/undefined 直接返回
  if (isNil(rank)) return rank;

  // 2. 数字直接返回
  if (typeof rank === "number") return rank;

  // 3. 确保是字符串
  if (typeof rank === "string") {
    // 去掉空格, 逗号, 等号和加号
    const str = rank.trim()?.replace(/[=,+]/g, "");

    // 3.1 如果是纯数字
    if (/^\d+$/.test(str)) {
      return Number(str);
    }

    // 3.3 区间形式，例如 200-500
    if (/^\d+\s*-\s*\d+$/.test(str)) {
      const [min, max] = str.split("-").map((n) => Number(n.trim()));
      return (min + max) / 2;
    }

    // 3.5 完全没有数字 → 返回 null
    return null;
  }

  // 4. 其他类型直接返回 null
  return null;
}

/**
 * 给定一个分数, 返回数字或者 null/undefined
 * 如果分数大于 100, 则返回 100
 */
export function parseScore(score: number | string | null | undefined): number | null | undefined {
  // 1. null/undefined 直接返回
  if (isNil(score)) return score;

  // 2. 数字返回最小值为 100
  if (typeof score === "number") return Math.min(score, 100);

  // 3. 确保是字符串
  if (typeof score === "string") {
    const str = score.trim();

    // 3.2 包含逗号 → 去掉逗号再转数字
    if (str.includes(",")) {
      return Math.min(Number(str.replace(/,/g, "")), 100);
    }

    // 3.3 完全没有数字 → 返回 null
    if (/^\D*$/.test(str)) {
      return null;
    }

    // 直接转换为数字
    return Math.min(Number(str), 100);
  }
  // 4. 其他类型直接返回 null
  return null;
}

// 基于基本的图表配置，生成最终的图表配置
export function getChartOption(option: EChartsOption): EChartsOption {
  const baseOption: EChartsOption = {
    grid: {
      left: 0,
      right: 0,
      top: 12,
      bottom: 0,
    },
    tooltip: {
      trigger: "axis",
    },
  };
  return merge({}, baseOption, option);
}

// 由于 echarts 无法获取到 css 变量，这里手动从 antd-mobile 获取颜色值
export function getColorFromADM(colorName: string) {
  const rootStyle = getComputedStyle(document.documentElement);
  return rootStyle.getPropertyValue(colorName).trim();
}

// 基于 vtable 的基本配置, 生成图表配置
export function getTableOption(option: ListTableConstructorOptions): ListTableConstructorOptions {
  const defaultTableOption: ListTableConstructorOptions = {
    widthMode: "adaptive",
    heightMode: "autoHeight",
    autoWrapText: true,
    select: {
      disableSelect: true,
      disableHeaderSelect: true,
    },
    // 当列数较少时自动撑满容器
    autoFillWidth: true,
  };

  return merge({}, defaultTableOption, option);
}

// 根据英文名和翻译配置得到高校的中文名
export function getCnNameFromTranslation(nameEn?: string) {
  return hmt.find((item) => item.nameEn.toLowerCase() === nameEn?.toLowerCase())?.nameCn || nameEn;
}

// 根据学校的英文名获取可能存在的所有别名, 包括传过来的英文名
export function getAliasesFromEnName(nameEn?: string) {
  const aliases = hmt.find((item) => item.nameEn.toLowerCase() === nameEn?.toLowerCase())?.nameEnAliases;
  return [nameEn, ...(aliases || [])];
}
