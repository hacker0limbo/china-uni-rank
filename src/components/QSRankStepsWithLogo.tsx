import React, { useMemo } from "react";
import { type QSUnivRankByYear } from "../api";
import { qsNidToYear, qsLatestYearNid } from "../constant";
import { RankLogo } from "./RankLogo";
import { Steps } from "antd-mobile";

export type QSRankStepsWithLogoProps = {
  rankTrend: QSUnivRankByYear[];
  yearNid: keyof typeof qsNidToYear;
};

// 用于渲染 QS 排名趋势, 因为三个 tab 下的数据结构一致
export function QSRankStepsWithLogo({ rankTrend, yearNid }: QSRankStepsWithLogoProps) {
  // 如果排名趋势最后一年的年份小于给定的当前年份, 那么把最后一年的年份改为当前年份
  const displayedYear = useMemo(() => {
    if (rankTrend.length) {
      const lastYearOfRankTrend = rankTrend[rankTrend.length - 1].x;
      return lastYearOfRankTrend < qsNidToYear[yearNid] ? lastYearOfRankTrend : qsNidToYear[yearNid];
    }
    return qsNidToYear[yearNid];
  }, [rankTrend, yearNid]);

  return (
    <>
      <RankLogo color="var(--adm-color-yellow)" rankInfo={rankTrend.find((r) => r.x === displayedYear)?.r} />

      <Steps style={{ overflowX: "auto" }}>
        {rankTrend?.map((rankInfo) => (
          <Steps.Step
            key={rankInfo.x}
            title={rankInfo.r}
            description={rankInfo.x}
            status={displayedYear === rankInfo.x ? "error" : "process"}
          />
        ))}
      </Steps>
    </>
  );
}
