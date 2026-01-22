import {
  Card,
  Divider,
  ErrorBlock,
  Grid,
  List,
  Popover,
  ProgressBar,
  Segmented,
  Space,
  Steps,
  Tabs,
  Toast,
} from "antd-mobile";
import {
  AppOutline,
  FireFill,
  HistogramOutline,
  InformationCircleOutline,
  LinkOutline,
  UnorderedListOutline,
} from "antd-mobile-icons";
import queryString from "query-string";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  getTHEWorldRankings,
  type THEWorldRanking,
  THE_BASE_URL,
  getTHEUnivRankTrend,
  type THEUnivRankTrendItem,
} from "../../api";
import { theYears } from "../../constant";
import { CardExtraInfo, Header, RankLogo, Score, ScoreBarChart, SkeletonWrapper } from "../../components";
import { pickBy } from "lodash-es";
import { useUniversityStore } from "../../store";
import { getCnNameFromTranslation } from "../../utils";

type TheRankParams = {
  year: (typeof theYears)[number];
  nid: string;
};

const scoreTitles = {
  scores_overall: "总得分",
  scores_teaching: "教学",
  scores_research: "研究环境",
  scores_citations: "研究质量",
  scores_industry_income: "产业",
  scores_international_outlook: "国际展望",
} as Record<string, string>;

const statTitles = {
  stats_number_students: "全职学生数量",
  stats_student_staff_ratio: "每位教职员对学生的数量",
  stats_pc_intl_students: "国际学生比例",
  stats_female_male_ratio: "女生对男生比例",
} as Record<string, string>;

const trendTitles = {
  "World University Rankings": "世界大学排名",
  "Asia University Rankings": "亚洲大学排名",
  "World Reputation Rankings": "世界声誉排名",
  "Arts & humanities": "艺术与人文学科",
  "Clinical, pre-clinical & health": "临床、前临床与健康",
  "Engineering & technology": "工程与技术",
  "Life sciences": "生命科学",
  "Physical sciences": "物理科学",
  "Social sciences": "社会科学",
  "Business & Economics": "商学与经济学",
  "Computer Science": "计算机科学",
  Law: "法学",
  Education: "教育学",
  Psychology: "心理学",
  "Emerging Economies": "新兴经济体",
} as Record<string, string>;

export function THERank() {
  const navigate = useLocation()[1];
  const { year, nid } = queryString.parse(window.location.hash.split("?")[1]) as TheRankParams;
  const [rankDetails, setRankDetails] = useState<THEWorldRanking>();
  const [loadingRankDetails, setLoadingRankDetails] = useState(false);
  // 基于 rankDetails 的属性形如 scores_teaching 但不包含 _rank 的为得分, 总得分单独拿出来
  const currentYearScores = useMemo(
    () =>
      pickBy(
        rankDetails,
        (_value, key) => key.startsWith("scores_") && !key.endsWith("_rank") && key !== "scores_overall",
      ) as Record<string, string>,
    [rankDetails],
  );
  // 形如 stats_number_students 的属性为统计数据
  const currentYearStats = useMemo(
    () => pickBy(rankDetails, (_value, key) => key.startsWith("stats_")) as Record<string, string>,
    [rankDetails],
  );
  // 获取不同类型的排名趋势
  const [rankTrends, setRankTrends] = useState<THEUnivRankTrendItem[]>([]);
  const [loadingRankTrends, setLoadingRankTrends] = useState(false);
  // 在趋势 steps 选中的年份
  const [selectedRankTrendYear, setSelectedRankTrendYear] = useState<string>(year);
  const [yearScoreMode, setYearScoreMode] = useState<string>("circles");
  const univList = useUniversityStore((state) => state.univList);

  // 学校中文名
  const nameCn = useMemo(() => {
    return (
      univList?.find((u) => u.nameEn?.toLowerCase() === rankDetails?.name?.toLowerCase())?.nameCn ??
      getCnNameFromTranslation(rankDetails?.name)
    );
  }, [rankDetails?.name, univList]);

  useEffect(() => {
    if (year && nid) {
      setLoadingRankDetails(true);
      getTHEWorldRankings(year)
        .then((res) => {
          const details = res.data.data?.find((u) => u.nid === Number(nid));
          setRankDetails(details);
        })
        .catch(() => {
          Toast.show({
            icon: "fail",
            content: "获取该学校泰晤士排名详情失败了...",
          });
        })
        .finally(() => {
          setLoadingRankDetails(false);
        });
    }
  }, [year, nid]);

  useEffect(() => {
    if (nid) {
      setLoadingRankTrends(true);
      getTHEUnivRankTrend(nid)
        .then((res) => {
          setRankTrends(res.data.data || []);
        })
        .catch(() => {
          Toast.show({
            icon: "fail",
            content: "获取该学校历年泰晤士排名趋势失败了...",
          });
        })
        .finally(() => {
          setLoadingRankTrends(false);
        });
    }
  }, [nid]);

  return (
    <div style={{ overflowY: "auto" }}>
      <Header title={`${year} 泰晤士排名详情`} />

      <Card
        style={{ margin: 12 }}
        title="基本信息"
        icon={
          <LinkOutline
            style={{ color: "var(--adm-color-primary)" }}
            fontSize={24}
            onClick={() => {
              window.open(`${THE_BASE_URL}${rankDetails?.url}`, "_blank");
            }}
          />
        }
        extra={
          <Space style={{ "--gap-horizontal": "4px", fontSize: 16, color: "#b70d7f" }}>
            <FireFill />
            {rankDetails?.rank}
          </Space>
        }
      >
        <SkeletonWrapper loading={loadingRankDetails} showTitle lineCount={2}>
          <Space direction="vertical" style={{ "--gap-horizontal": "4px" }}>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>{nameCn}</div>
            <div style={{ fontSize: 14, color: "var(--adm-color-weak)" }}>{rankDetails?.location}</div>
          </Space>
        </SkeletonWrapper>
      </Card>

      <Card
        style={{ margin: 12 }}
        title="该年评分和统计"
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
        <SkeletonWrapper loading={loadingRankDetails} showTitle>
          <Tabs>
            <Tabs.Tab title="评分" key="scores">
              {yearScoreMode === "circles" ? (
                <Grid columns={4} style={{ "--gap-vertical": "12px", marginTop: 12 }}>
                  <Grid.Item>
                    <Score title="总得分" score={rankDetails?.scores_overall} color="#b70d7f" />
                  </Grid.Item>
                  {Object.entries(currentYearScores).map(([key, value]) => (
                    <Grid.Item key={key}>
                      <Score title={scoreTitles[key]} score={value} color="#b70d7f" />
                    </Grid.Item>
                  ))}
                </Grid>
              ) : (
                <ScoreBarChart
                  categories={["总得分", ...Object.keys(currentYearScores).map((key) => scoreTitles[key])]}
                  values={[rankDetails?.scores_overall, ...Object.values(currentYearScores)]}
                  color="#b70d7f"
                />
              )}
            </Tabs.Tab>
            <Tabs.Tab title="统计" key="stats">
              <List>
                {Object.entries(currentYearStats).map(([key, value]) => (
                  <List.Item key={key} extra={<span style={{ color: "#b70d7f" }}>{value || "n/a"}</span>}>
                    {statTitles[key]}
                  </List.Item>
                ))}
              </List>
            </Tabs.Tab>
          </Tabs>
        </SkeletonWrapper>
      </Card>

      <Card
        style={{ margin: 12 }}
        title="历年排名"
        extra={<CardExtraInfo content="可以点击下面不同的年份查看对应排名和得分" />}
      >
        <SkeletonWrapper loading={loadingRankTrends}>
          {rankTrends?.length ? (
            <Tabs
              onChange={() => {
                // 切换 tab 的时候重置选择的年份
                setSelectedRankTrendYear(year);
              }}
            >
              {rankTrends.map((trend) => {
                // 由于不同类型的 trend 年份可能不同, 导致例如不存在最新年份的排名, 这里会需要取 trend 里最后一位兼容
                const lastYear = Math.max(...Object.keys(trend.rank).map(Number));
                const yearToDisplay =
                  lastYear < Number(selectedRankTrendYear) ? lastYear.toString() : selectedRankTrendYear;

                return (
                  <Tabs.Tab title={trendTitles[trend.ranking] ?? trend.ranking} key={trend.ranking}>
                    <RankLogo color="#b70d7f" rankInfo={trend.rank[yearToDisplay]} />
                    <div
                      onClick={(e) => {
                        // NOTE: 这里需要 hack 一下, 由于 antd-mobile 的 Steps 组件不支持点击事件
                        // 只能通过自定义的 data-* 来获取点击的年份
                        const newYear = ((e.target as HTMLElement).closest("[data-year]") as HTMLElement | null)
                          ?.dataset?.year;
                        if (newYear) {
                          setSelectedRankTrendYear(newYear);
                        }
                      }}
                    >
                      <Steps style={{ overflowX: "auto" }}>
                        {Object.entries(trend.rank).map(([year, r]) => (
                          <Steps.Step
                            data-year={year}
                            key={year}
                            title={r}
                            description={year}
                            status={year === yearToDisplay ? "error" : "process"}
                          />
                        ))}
                      </Steps>
                    </div>

                    <Divider />

                    {trend.scores[yearToDisplay]?.map((score, index) => (
                      <Space
                        direction="vertical"
                        key={index}
                        style={{ "--gap-vertical": "4px", marginBottom: 8 }}
                        block
                      >
                        {trend.indicators[index]}
                        <ProgressBar percent={score} text={score} style={{ "--fill-color": "#b70d7f" }} />
                      </Space>
                    ))}
                  </Tabs.Tab>
                );
              })}
            </Tabs>
          ) : (
            <ErrorBlock status="empty" title="暂无历年排名数据" />
          )}
        </SkeletonWrapper>
      </Card>
    </div>
  );
}
