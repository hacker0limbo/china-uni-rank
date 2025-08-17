import {
  Card,
  Space,
  Toast,
  Image,
  AutoCenter,
  ProgressCircle,
  Grid,
  Steps,
  Tabs,
  Rate,
  Popover,
  Segmented,
} from "antd-mobile";
import {
  AppOutline,
  FireFill,
  HistogramOutline,
  InformationCircleOutline,
  LinkOutline,
  StarOutline,
  UnorderedListOutline,
} from "antd-mobile-icons";
import { useLocation } from "wouter";
import {
  getQSWorldRankings,
  type QSWorldRanking,
  getQSUnivRankTrend,
  type QSUnivRankByYear,
  getQSUnivRankTrendAsian,
  QS_BASE_URL,
} from "../../api";
import { useEffect, useMemo, useState } from "react";
import queryString from "query-string";
import { qsNidToYear, qsCountryLabels } from "../../constant";
import { Header, RankTrendLineChart, ScoreBarChart, SkeletonWrapper } from "../../components";
import { useSettingsStore, useUniversityStore } from "../../store";
import { Score, QSRankStepsWithLogo } from "../../components";
import { getCnNameFromTranslation, getColorFromADM } from "../../utils";

type QSRankParams = {
  coreId: string;
  yearNid: keyof typeof qsNidToYear;
  title: string;
};

const scoreTitles = {
  "Academic Reputation": "学术声誉",
  "Citations per Faculty": "每教员引用率",
  "Faculty Student Ratio": "师生比",
  "Employer Reputation": "雇主声誉",
  "Employment Outcomes": "就业结果",
  "International Student Ratio": "国际学生比例",
  "International Student Diversity": "国际学生构成",
  "International Research Network": "国际研究网络",
  "International Faculty Ratio": "国际教员比例",
  "Sustainability Score": "可持续性",
} as Record<string, string>;

export function QSRank() {
  const { coreId, yearNid, title } = queryString.parse(window.location.hash.split("?")[1]) as QSRankParams;
  const [rankDetails, setRankDetails] = useState<QSWorldRanking>();
  const [loadingRankDetails, setLoadingRankDetails] = useState(false);
  const univList = useUniversityStore((state) => state.univList);
  // 高校中文名字
  const univCnName = useMemo(
    () => univList.find((u) => u?.nameEn?.toLowerCase() === title?.toLowerCase())?.nameCn,
    [univList, title]
  );
  const [rankTrend, setRankTrend] = useState<QSUnivRankByYear[]>([]);
  const [loadingRankTrend, setLoadingRankTrend] = useState(false);
  const [rankTrendAsian, setRankTrendAsian] = useState<QSUnivRankByYear[]>([]);
  const [loadingRankTrendAsian, setLoadingRankTrendAsian] = useState(false);
  const theme = useSettingsStore((state) => state.theme);
  const [rankTrendMode, setRankTrendMode] = useState<string>("steps");
  const [yearScoreMode, setYearScoreMode] = useState<string>("circles");

  // 拿到所有得分的数组
  const scoreDetails = useMemo(() => Object.values(rankDetails?.scores ?? {}).flat(), [rankDetails]);

  useEffect(() => {
    if (title && yearNid) {
      setLoadingRankDetails(true);
      // 通过 search 精准匹配到唯一的学校
      getQSWorldRankings({
        nid: yearNid,
        items_per_page: 1,
        search: title,
      })
        .then((res) => {
          if (res.data.score_nodes?.length) {
            // 搜索到学校, 直接拿第一所因为是最相关的
            setRankDetails(res.data.score_nodes[0]);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Toast.show({
            icon: "fail",
            content: "获取该学校 QS 排名详情失败了...",
          });
        })
        .finally(() => {
          setLoadingRankDetails(false);
        });
    }
  }, [title, yearNid]);

  useEffect(() => {
    if (coreId) {
      setLoadingRankTrend(true);
      getQSUnivRankTrend(coreId)
        .then((res) => {
          const trend = res.data?.[1]?.settings?.qs_profiles?.json_data ?? [];
          setRankTrend(trend);
        })
        .catch((err) => {
          Toast.show({
            icon: "fail",
            content: "获取该学校历年QS排名趋势失败了...",
          });
        })
        .finally(() => {
          setLoadingRankTrend(false);
        });
    }
  }, [coreId]);

  useEffect(() => {
    if (coreId) {
      setLoadingRankTrendAsian(true);
      getQSUnivRankTrendAsian(coreId)
        .then((res) => {
          const trend = res.data?.[1]?.settings?.qs_profiles?.json_data ?? [];
          setRankTrendAsian(trend);
        })
        .catch((err) => {
          Toast.show({
            icon: "fail",
            content: "获取该学校亚洲历年QS排名趋势失败了...",
          });
        })
        .finally(() => {
          setLoadingRankTrendAsian(false);
        });
    }
  }, [coreId]);

  return (
    <div style={{ overflowY: "auto" }}>
      <Header title={`${qsNidToYear[yearNid] ?? ""} QS 排名详情`} />

      <Card
        style={{ margin: 12 }}
        title="基本信息"
        icon={
          <LinkOutline
            style={{ color: "var(--adm-color-primary)" }}
            fontSize={24}
            onClick={() => {
              window.open(`${QS_BASE_URL}${rankDetails?.path}`, "_blank");
            }}
          />
        }
        extra={
          <Space style={{ "--gap-horizontal": "4px", fontSize: 16, color: "var(--adm-color-yellow)" }}>
            <FireFill />
            {rankDetails?.rank_display}
          </Space>
        }
      >
        <SkeletonWrapper loading={loadingRankDetails} showTitle>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Space direction="vertical" style={{ "--gap-horizontal": "4px" }}>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{univCnName ?? getCnNameFromTranslation(title)}</div>
              <Space
                align="center"
                style={{
                  fontSize: 14,
                  color: "var(--adm-color-weak)",
                  "--gap-horizontal": "4px",
                }}
              >
                {qsCountryLabels.find((l) => l.value === rankDetails?.country)?.label}·{rankDetails?.city}
              </Space>
            </Space>
            <Image lazy referrerPolicy="no-referrer" src={rankDetails?.logo} fit="cover" width={64} height={64} />
          </div>
        </SkeletonWrapper>
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
        <SkeletonWrapper loading={loadingRankDetails || loadingRankTrendAsian}>
          {yearScoreMode === "circles" ? (
            <Grid columns={4} style={{ "--gap-vertical": "12px" }}>
              <Grid.Item>
                <AutoCenter>
                  <Score score={rankDetails?.overall_score} title="综合得分" />
                </AutoCenter>
              </Grid.Item>
              {scoreDetails.map((scoreDetail, index) => (
                <Grid.Item key={index}>
                  <AutoCenter>
                    <Score
                      score={scoreDetail.score}
                      title={scoreTitles[scoreDetail.indicator_name] ?? scoreDetail.indicator_name}
                    />
                  </AutoCenter>
                </Grid.Item>
              ))}
            </Grid>
          ) : (
            <ScoreBarChart
              color={getColorFromADM("--adm-color-yellow")}
              height={280}
              categories={["综合得分", ...scoreDetails.map((d) => scoreTitles[d.indicator_name] ?? d.indicator_name)]}
              values={[rankDetails?.overall_score, ...scoreDetails.map((d) => d.score)]}
            />
          )}
        </SkeletonWrapper>
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
        <SkeletonWrapper loading={loadingRankTrend}>
          <Tabs>
            <Tabs.Tab title="QS世界排名" key="world">
              {rankTrendMode === "steps" ? (
                <QSRankStepsWithLogo rankTrend={rankTrend} yearNid={yearNid} />
              ) : (
                <RankTrendLineChart
                  years={rankTrend?.map((t) => t.x)}
                  values={rankTrend?.map((t) => t.y)}
                  highlightYear={qsNidToYear[yearNid]}
                />
              )}
            </Tabs.Tab>
            <Tabs.Tab title="QS亚洲排名" key="asian">
              {rankTrendMode === "steps" ? (
                <QSRankStepsWithLogo rankTrend={rankTrendAsian} yearNid={yearNid} />
              ) : (
                <RankTrendLineChart
                  years={rankTrendAsian?.map((t) => t.x)}
                  values={rankTrendAsian?.map((t) => t.y)}
                  highlightYear={qsNidToYear[yearNid]}
                />
              )}
            </Tabs.Tab>
          </Tabs>
        </SkeletonWrapper>
      </Card>
    </div>
  );
}
