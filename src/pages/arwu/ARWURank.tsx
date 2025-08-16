import queryString from "query-string";
import { Header, RankLogo, RankTrendLineChart, Score, ScoreBarChart, SkeletonWrapper } from "../../components";
import { useEffect, useState } from "react";
import {
  ARWU_BASE_URL,
  type ARWUWoldRanking,
  type ARWUWoldRankingsResponse,
  getARWUWoldRankings,
  getHMTUnivDetailsFromARWU,
  getUnivDetailsFromARWU,
  type UniversityARWUDetail,
} from "../../api";
import { useSettingsStore, useUniversityStore } from "../../store";
import { Card, Space, Toast, Image, Grid, AutoCenter, Tabs, Steps, Segmented } from "antd-mobile";
import { FireFill, HistogramOutline, LinkOutline, UnorderedListOutline } from "antd-mobile-icons";
import { isEmpty } from "lodash-es";
import ReactECharts from "echarts-for-react";
import { getChartOption, getColorFromADM, parseRank } from "../../utils";

type ARWURankParams = {
  up: string;
  year: string;
  hmt: string;
};

export function ARWURank() {
  const {
    up,
    year,
    hmt = false,
  } = queryString.parse(window.location.hash.split("?")[1], { parseBooleans: true }) as ARWURankParams;
  const [rankDetails, setRankDetails] = useState<ARWUWoldRanking>();
  const [indicators, setIndicators] = useState<ARWUWoldRankingsResponse["data"][0]["indList"]>([]);
  const initialized = useUniversityStore((state) => state.initialized);
  const [rankTrends, setRankTrends] = useState<Partial<Pick<UniversityARWUDetail["details"], "arwu" | "bcur">>>();
  const theme = useSettingsStore((state) => state.theme);
  // 展示形式, 默认使用 steps 展示, 枚举为 steps/chart
  const [rankTrendMode, setRankTrendMode] = useState<string>("steps");
  const [yearScoreMode, setYearScoreMode] = useState<string>("circles");

  useEffect(() => {
    if (initialized) {
      getARWUWoldRankings(year)
        .then((res) => {
          const data = res.data?.[0];
          // 只存储中国内地和港澳台的高校
          setRankDetails(data?.univData?.find((u) => u.univUp === up || u.univUpEn === up));
          setIndicators(data?.indList ?? []);
        })
        .catch((err) => {
          console.error("报错了", err);
          Toast.show({
            icon: "fail",
            content: "获取该学校软科排名数据失败了...",
          });
        });
    }
  }, [year, initialized, up]);

  useEffect(() => {
    // 获取到 rankDetails 以后再去获取这个学校的 trend 数据
    if (!isEmpty(rankDetails)) {
      if (hmt) {
        getHMTUnivDetailsFromARWU(up)
          .then((res) => {
            const { arwu } = res?.data?.[0]?.univData?.detail ?? {};
            setRankTrends({ arwu });
          })
          .catch((error) => {
            Toast.show({
              icon: "fail",
              content: "获取软科排名趋势数据失败了...",
            });
          });
      } else {
        getUnivDetailsFromARWU(up)
          .then((res) => {
            const { arwu, bcur } = res?.data?.[0]?.univData?.details ?? {};
            setRankTrends({ arwu, bcur });
          })
          .catch((error) => {
            Toast.show({
              icon: "fail",
              content: "获取软科排名趋势数据失败了...",
            });
          });
      }
    }
  }, [rankDetails, up, hmt]);

  return (
    <div style={{ overflowY: "auto" }}>
      <Header title={`${year ?? ""} 软科排名详情`} />

      <Card
        style={{ margin: 12 }}
        title="基本信息"
        icon={
          <LinkOutline
            style={{ color: "var(--adm-color-primary)" }}
            fontSize={24}
            onClick={() => {
              window.open(`${ARWU_BASE_URL}/institution/${up}`, "_blank");
            }}
          />
        }
        extra={
          <Space style={{ "--gap-horizontal": "4px", fontSize: 16, color: "var(--adm-color-danger)" }}>
            <FireFill />
            {rankDetails?.ranking}
          </Space>
        }
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Space direction="vertical" style={{ "--gap-horizontal": "4px" }}>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>{rankDetails?.univNameCn}</div>
            <Space
              align="center"
              style={{
                fontSize: 14,
                color: "var(--adm-color-weak)",
                "--gap-horizontal": "4px",
              }}
            >
              {rankDetails?.region}
            </Space>
          </Space>
          <Image lazy src={`${ARWU_BASE_URL}/_uni/${rankDetails?.univLogo}`} fit="cover" width={40} height={40} />
        </div>
      </Card>

      <Card
        style={{ margin: 12 }}
        title="该年评分"
        extra={
          <Segmented
            value={yearScoreMode}
            onChange={(value) => {
              setYearScoreMode(value as string);
            }}
            options={[
              {
                value: "circles",
                icon: <UnorderedListOutline />,
              },
              {
                value: "chart",
                icon: <HistogramOutline />,
              },
            ]}
          />
        }
      >
        {yearScoreMode === "circles" ? (
          <Grid columns={4} style={{ "--gap-vertical": "12px" }}>
            <Grid.Item>
              <AutoCenter>
                <Score score={rankDetails?.score} title="综合得分" color="var(--adm-color-danger)" />
              </AutoCenter>
            </Grid.Item>
            {Object.entries(rankDetails?.indData ?? {}).map(([indKey, value], index) => (
              <Grid.Item key={index}>
                <AutoCenter>
                  <Score
                    color="var(--adm-color-danger)"
                    score={value}
                    title={indicators.find((ind) => ind.code === indKey)?.nameCn ?? indKey}
                  />
                </AutoCenter>
              </Grid.Item>
            ))}
          </Grid>
        ) : (
          <ScoreBarChart
            categories={[
              "综合得分",
              ...Object.keys(rankDetails?.indData ?? {}).map(
                (ind) => indicators.find((i) => i.code === ind)?.nameCn || ind
              ),
            ]}
            values={[rankDetails?.score, ...Object.values(rankDetails?.indData ?? {})]}
            color={getColorFromADM("--adm-color-danger")}
          />
        )}
      </Card>

      <Card
        style={{ margin: 12 }}
        title="历年排名"
        extra={
          <Segmented
            value={rankTrendMode}
            onChange={(value) => {
              setRankTrendMode(value as string);
            }}
            options={[
              {
                value: "steps",
                icon: <UnorderedListOutline />,
              },
              {
                value: "chart",
                icon: <HistogramOutline />,
              },
            ]}
          />
        }
      >
        <Tabs>
          <Tabs.Tab title="软科世界排名" key="arwu">
            {rankTrendMode === "steps" ? (
              <>
                <RankLogo color="var(--adm-color-danger)" rankInfo={rankTrends?.arwu?.rkLatest?.ranking} />
                <Steps>
                  {rankTrends?.arwu?.rkHistory?.map((history) => (
                    <Steps.Step
                      key={history.yr}
                      title={history?.ranking}
                      description={history?.yr}
                      status={history?.yr?.toString() === year ? "error" : "process"}
                    />
                  ))}
                </Steps>
              </>
            ) : (
              <RankTrendLineChart
                highlightYear={year}
                years={rankTrends?.arwu?.rkHistory?.map((h) => h.yr)}
                values={rankTrends?.arwu?.rkHistory?.map((h) => h.ranking)}
              />
            )}
          </Tabs.Tab>
          {/* 港澳台地区高校无国内排名 */}
          {hmt ? null : (
            <Tabs.Tab title="软科中国排名" key="bcur">
              {rankTrendMode === "steps" ? (
                <>
                  <RankLogo color="var(--adm-color-danger)" rankInfo={rankTrends?.bcur?.rkCategory?.ranking} />
                  <Steps>
                    {rankTrends?.bcur?.rkHistory?.map((history) => (
                      <Steps.Step
                        key={history.yr}
                        title={history?.ranking}
                        description={history?.yr}
                        status={history?.yr?.toString() === year ? "error" : "process"}
                      />
                    ))}
                  </Steps>
                </>
              ) : (
                <RankTrendLineChart
                  years={rankTrends?.bcur?.rkHistory?.map((h) => h.yr?.toString())}
                  values={rankTrends?.bcur?.rkHistory?.map((h) => h.ranking)}
                  highlightYear={year}
                />
              )}
            </Tabs.Tab>
          )}
        </Tabs>
      </Card>
    </div>
  );
}
