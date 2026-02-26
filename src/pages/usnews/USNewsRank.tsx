import { AutoCenter, Card, Ellipsis, ErrorBlock, Grid, NoticeBar, Space, Toast } from "antd-mobile";
import { AppOutline, FireFill, LinkOutline } from "antd-mobile-icons";
import { useLocation, useParams } from "wouter";
import { useUniversityStore } from "../../store";
import { usnewsCountries } from "../../constant";
import { getUSNewsWorldRankings, type USNewsWorldRanking } from "../../api";
import { Header, Score, SkeletonWrapper } from "../../components";
import { formatUSNewsRank, getCnNameFromTranslation } from "../../utils";
import { useEffect, useMemo, useState } from "react";

const statsTitle = {
  "Global Score": "综合得分",
  Enrollment: "入学人数",
} as Record<string, string>;

export function USNewsRank() {
  const [usnewsWorldRankings, setUSNewsWorldRankings] = useState<USNewsWorldRanking[]>([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const rankDetails = usnewsWorldRankings.find((u) => u.id.toString() === id);
  const univList = useUniversityStore((state) => state.univList);
  const cnName = useMemo(() => {
    const u = univList.find((u) => u?.nameEn?.toLowerCase() === rankDetails?.name);
    return u?.nameCn;
  }, [rankDetails?.name, univList]);

  useEffect(() => {
    setLoading(true);
    getUSNewsWorldRankings()
      .then((res) => {
        setUSNewsWorldRankings(res.data);
      })
      .catch((err) => {
        Toast.show({
          icon: "fail",
          content: "获取 USNEWS 排名数据失败了...",
        });
      })

      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ overflowY: "auto" }}>
      <Header title="排名详情" />
      <NoticeBar color="info" content="暂时无法通过接口获取到足够多的 U.S.News 排名详情, 请前往官网查看" />

      <Card
        style={{ margin: 12 }}
        title="基本信息"
        icon={
          <LinkOutline
            style={{ color: "var(--adm-color-primary)" }}
            fontSize={24}
            onClick={() => {
              window.open(rankDetails?.url, "_blank");
            }}
          />
        }
        extra={
          <Space style={{ "--gap-horizontal": "4px", fontSize: 16, color: "var(--adm-color-primary)" }}>
            <FireFill />
            {formatUSNewsRank(rankDetails?.ranks)}
          </Space>
        }
      >
        <SkeletonWrapper loading={loading} showTitle lineCount={2}>
          <Space direction="vertical" style={{ "--gap-horizontal": "4px" }}>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>
              {cnName ?? getCnNameFromTranslation(rankDetails?.name)}
            </div>
            <Space style={{ fontSize: 14, color: "var(--adm-color-weak)", "--gap-horizontal": "4px" }}>
              {usnewsCountries?.[rankDetails?.country_name ?? "China"]}·{rankDetails?.city}
            </Space>
            <Ellipsis expandText="展开" collapseText="收起" content={rankDetails?.blurb ?? ""} />
          </Space>
        </SkeletonWrapper>
      </Card>

      <Card style={{ margin: 12 }} title="统计数据">
        <SkeletonWrapper loading={loading} showTitle lineCount={2}>
          <Grid columns={2}>
            {rankDetails?.stats?.map((stat) => (
              <Grid.Item key={stat.label}>
                <AutoCenter>
                  <Score title={statsTitle[stat.label]} score={stat.value} color="var(--adm-color-primary)" />
                </AutoCenter>
              </Grid.Item>
            ))}
          </Grid>
        </SkeletonWrapper>
      </Card>

      <Card style={{ margin: 12 }} title="历年排名">
        <ErrorBlock title="暂无历年排名信息" status="empty" description="U.S.News 并没有提供历年排名数据, 去骂他吧" />
      </Card>
    </div>
  );
}
