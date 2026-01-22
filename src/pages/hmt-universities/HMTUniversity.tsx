import { useEffect, useMemo, useState } from "react";
import { Header, RankLogo, Score, SkeletonWrapper } from "../../components";
import { useLocation, useParams } from "wouter";
import { useFavoriteUnivStore, useSettingsStore, useUniversityStore } from "../../store";
import {
  ARWU_BASE_URL,
  ARWU_EN_BASE_URL,
  type HMTUniversityARWUDetail,
  type QSWorldRanking,
  type THEWorldRanking,
  type USNewsWorldRanking,
  getHMTUnivDetailsFromARWU,
  getQSWorldRankings,
  getTHEWorldRankings,
} from "../../api";
import { Card, Rate, Space, Toast, Image, Divider, Grid, Tabs, AutoCenter } from "antd-mobile";
import { GlobalOutline, LinkOutline, LocationOutline, RightOutline, StarOutline } from "antd-mobile-icons";
import queryString from "query-string";
import { arwuYears, qsLatestYearNid, qsNidToYear, theLatestYear } from "../../constant";
import { ListTable } from "@visactor/react-vtable";
import { type ColumnDefine } from "@visactor/vtable";
import { formatUSNewsRank, getAliasesFromEnName, getCnNameFromTranslation, getTableOption } from "../../utils";
import { useTableTheme } from "../../hooks";
import usnews from "../../store/usnews.json";

// 软科世界一流学科排名
const globalSubjectColumns: ColumnDefine[] = [
  {
    field: "code",
    title: "学科代码",
  },
  {
    field: "name",
    title: "学科名称",
  },
  {
    field: "ranking",
    title: "学科排名",
  },
];

export function HMTUniversity() {
  const navigate = useLocation()[1];
  const { up } = useParams<{ up: string }>();
  const [loadingHMTDetailsARWU, setLoadingHMTDetailsARWU] = useState(false);
  const [hmtDetailsARWU, setHMTDetailsARWU] = useState<HMTUniversityARWUDetail | null>(null);
  const favoriteUps = useFavoriteUnivStore((state) => state.favoriteUps);
  const addFavorite = useFavoriteUnivStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteUnivStore((state) => state.removeFavorite);
  const isFavorite = useMemo(() => favoriteUps?.map((u) => u.up)?.includes(up), [favoriteUps, up]);
  const tableTheme = useTableTheme();
  const [qsRankDetails, setQSRankDetails] = useState<QSWorldRanking>();
  const [loadingQSRankDetails, setLoadingQSRankDetails] = useState(false);
  const [theRankDetails, setTheRankDetails] = useState<THEWorldRanking>();
  const [loadingTheRankDetails, setLoadingTheRankDetails] = useState(false);
  const usnewsDetails = usnews.find((u) =>
    getAliasesFromEnName(hmtDetailsARWU?.nameEn)
      ?.map((a) => a?.toLowerCase())
      ?.includes(u.name?.toLowerCase()),
  ) as USNewsWorldRanking | undefined;

  useEffect(() => {
    if (up) {
      setLoadingHMTDetailsARWU(true);
      getHMTUnivDetailsFromARWU(up)
        .then((res) => {
          setHMTDetailsARWU(res?.data?.[0]?.univData);
        })
        .catch((error) => {
          Toast.show({
            icon: "fail",
            content: "获取软科港澳台高校详情数据失败了...",
          });
        })

        .finally(() => {
          setLoadingHMTDetailsARWU(false);
        });
    }
  }, [up]);

  useEffect(() => {
    // 只有在查找到对应英文名的情况下才去查 qs 的信息
    if (hmtDetailsARWU?.nameEn) {
      setLoadingQSRankDetails(true);
      getQSWorldRankings({
        nid: qsLatestYearNid,
        items_per_page: 1,
        search: hmtDetailsARWU.nameEn,
      })
        .then((res) => {
          if (res.data.score_nodes?.length) {
            // 搜索到学校, 直接拿第一所因为是最相关的
            setQSRankDetails(res.data.score_nodes[0]);
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
          setLoadingQSRankDetails(false);
        });
    }
  }, [hmtDetailsARWU?.nameEn]);

  useEffect(() => {
    setLoadingTheRankDetails(true);
    getTHEWorldRankings(theLatestYear)
      .then((res) => {
        const details = res.data.data?.find((u) =>
          getAliasesFromEnName(hmtDetailsARWU?.nameEn)
            ?.map((a) => a?.toLowerCase())
            ?.includes(u.name?.toLowerCase()),
        );
        setTheRankDetails(details);
      })
      .catch(() => {
        Toast.show({
          icon: "fail",
          content: "获取该学校泰晤士排名详情失败了...",
        });
      })
      .finally(() => {
        setLoadingTheRankDetails(false);
      });
  }, [hmtDetailsARWU?.nameEn]);

  return (
    <div style={{ overflowY: "auto" }}>
      <Header title="港澳台高校详情" />

      <Card
        style={{ margin: 12 }}
        title="基本信息"
        icon={
          <LinkOutline
            style={{ color: "var(--adm-color-primary)" }}
            fontSize={24}
            onClick={() => {
              window.open(`${ARWU_EN_BASE_URL}/institution/${hmtDetailsARWU?.univUp}`, "_blank");
            }}
          />
        }
        extra={
          <Rate
            value={isFavorite ? 1 : 0}
            count={1}
            onChange={(value) => {
              if (value) {
                addFavorite(up, true);
              } else {
                removeFavorite(up);
              }
              Toast.show({
                icon: <StarOutline />,
                content: value ? "收藏成功" : "取消收藏成功",
              });
            }}
          />
        }
      >
        <SkeletonWrapper loading={loadingHMTDetailsARWU} showTitle>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space direction="vertical" style={{ "--gap-vertical": "4px" }}>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{getCnNameFromTranslation(hmtDetailsARWU?.nameEn)}</div>
              <div style={{ fontSize: 14, color: "var(--adm-color-weak)" }}>{hmtDetailsARWU?.nameEn}</div>
              <Space style={{ fontSize: 14, color: "var(--adm-color-weak)", "--gap-horizontal": "4px" }}>
                {hmtDetailsARWU?.region}
              </Space>
              <div style={{ fontSize: 14, color: "var(--adm-color-weak)" }}>建校日期: {hmtDetailsARWU?.foundYear}</div>
            </Space>
            <Image src={`${ARWU_BASE_URL}/_uni/${hmtDetailsARWU?.univLogo}`} fit="cover" width={64} height={64} />
          </div>
          <Divider />
          <Grid columns={2} style={{ placeItems: "center" }}>
            <Grid.Item
              onClick={() => {
                if (hmtDetailsARWU?.address) {
                  window.location.href = `maps://?q=${hmtDetailsARWU.address}`;
                } else {
                  Toast.show({
                    icon: "fail",
                    content: "暂无详细地址",
                  });
                }
              }}
            >
              <Space align="center" style={{ "--gap-horizontal": "4px", fontSize: 14 }}>
                <LocationOutline />
                地址
              </Space>
            </Grid.Item>
            <Grid.Item
              onClick={() => {
                if (hmtDetailsARWU?.website) {
                  window.open(hmtDetailsARWU.website, "_blank");
                } else {
                  Toast.show({
                    icon: "fail",
                    content: "暂无官网地址",
                  });
                }
              }}
            >
              <Space align="center" style={{ "--gap-horizontal": "4px", fontSize: 14 }}>
                <GlobalOutline />
                官网
              </Space>
            </Grid.Item>
          </Grid>
        </SkeletonWrapper>
      </Card>

      <Card style={{ margin: 12 }} title="四大最新排名">
        <Tabs>
          <Tabs.Tab title="软科" key="arwu">
            <SkeletonWrapper loading={loadingHMTDetailsARWU}>
              <AutoCenter>
                <div
                  style={{ fontSize: 20, fontWeight: "bold", margin: "12px 0" }}
                  onClick={() => {
                    const params = queryString.stringify({
                      up: hmtDetailsARWU?.univUp,
                      year: arwuYears[0],
                      // 带上标识标识是港澳台的学校
                      hmt: true,
                    });
                    window.location.hash = `/arwu/rank?${params}`;
                  }}
                >
                  {arwuYears[0]} 软科世界大学排名 <RightOutline fontSize={16} />
                </div>
              </AutoCenter>
              <RankLogo color="var(--adm-color-danger)" rankInfo={hmtDetailsARWU?.detail?.arwu?.rkLatest?.ranking} />
            </SkeletonWrapper>
          </Tabs.Tab>

          <Tabs.Tab title="QS" key="qs">
            <SkeletonWrapper loading={loadingQSRankDetails}>
              <AutoCenter>
                <div
                  style={{ fontSize: 20, fontWeight: "bold", margin: "12px 0" }}
                  onClick={() => {
                    const params = queryString.stringify({
                      coreId: qsRankDetails?.core_id,
                      title: qsRankDetails?.title,
                      yearNid: qsLatestYearNid,
                    });
                    if (qsRankDetails?.rank_display) {
                      window.location.hash = `/qs/rank?${params}`;
                    }
                  }}
                >
                  {qsNidToYear[qsLatestYearNid]} QS世界大学排名 <RightOutline fontSize={16} />
                </div>
              </AutoCenter>
              <RankLogo color="var(--adm-color-yellow)" rankInfo={qsRankDetails?.rank} />
            </SkeletonWrapper>
          </Tabs.Tab>

          <Tabs.Tab title="泰晤士" key="the">
            <SkeletonWrapper loading={loadingTheRankDetails}>
              <AutoCenter>
                <div
                  style={{ fontSize: 20, fontWeight: "bold", margin: "12px 0" }}
                  onClick={() => {
                    const params = queryString.stringify({
                      year: theLatestYear,
                      nid: theRankDetails?.nid,
                    });
                    if (theRankDetails?.rank) {
                      window.location.hash = `/the/rank?${params}`;
                    }
                  }}
                >
                  {theLatestYear} 泰晤士世界大学排名 <RightOutline fontSize={16} />
                </div>
              </AutoCenter>
              <RankLogo color="#b70d7f" rankInfo={theRankDetails?.rank} />
            </SkeletonWrapper>
          </Tabs.Tab>

          <Tabs.Tab title="USNews" key="usnews">
            <AutoCenter>
              <div
                style={{ fontSize: 20, fontWeight: "bold", margin: "12px 0" }}
                onClick={() => {
                  if (usnewsDetails?.ranks?.length) {
                    navigate(`/usnews/${usnewsDetails?.id}`);
                  }
                }}
              >
                USNews 世界大学排名 <RightOutline fontSize={16} />
              </div>
            </AutoCenter>
            <RankLogo color="var(--adm-color-primary)" rankInfo={formatUSNewsRank(usnewsDetails?.ranks)} />
          </Tabs.Tab>
        </Tabs>
      </Card>

      <Card
        style={{ margin: 12 }}
        title="软科世界一流学科排名"
        extra={`更新时间: ${hmtDetailsARWU?.detail?.gras?.latestVerNo}`}
      >
        <Tabs>
          <Tabs.Tab title="所有学科" key="grasAll">
            <ListTable
              option={getTableOption({
                columns: globalSubjectColumns,
                records: hmtDetailsARWU?.detail?.gras?.subjCategory?.map((c) => c.subj)?.flat(),
                theme: tableTheme,
              })}
              height="300px"
            />
          </Tabs.Tab>
          <Tabs.Tab title="优势学科" key="grasAdv">
            <ListTable
              option={getTableOption({
                columns: globalSubjectColumns,
                records: hmtDetailsARWU?.detail?.gras?.subjAdva,
                theme: tableTheme,
              })}
              height="300px"
            />
          </Tabs.Tab>
        </Tabs>
      </Card>
    </div>
  );
}
